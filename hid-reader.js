let connectedDevices = [];
let selectedDevice = null;

// Formats an 8-bit integer |value| in hexadecimal with leading zeros.
const hex8 = (value) => {
  return `00${value.toString(16)}`.substr(-2).toUpperCase();
};

const connectDevice = async () => {
  const devices = await navigator.hid.requestDevice({ filters: [] });
  if (devices.length == 0) return;

  for (let device of devices) await addDevice(device);
};

// Adds |device| to |connectedDevices|. Selects the device if there was no prior
// selection.
const addDevice = async (device) => {
  if (connectedDevices.includes(device)) {
    console.log("device already in connectedDevices");
    return;
  }
  connectedDevices.push(device);
  console.log(`device connected: ${device.productName}`);
  if (selectedDevice === null) await selectDevice(device);
  // updateDeviceMenu();
};

// Removes |device| from |connectedDevices|.
const removeDevice = (device) => {
  if (device === selectedDevice) selectedDevice = null;
  for (let i = connectedDevices.length - 1; i >= 0; --i) {
    if (connectedDevices[i] === device) {
      connectedDevices.splice(i, 1);
      console.log(`device disconnected: ${device.productName}`);
      // updateDeviceMenu();
    }
  }
};

const selectDevice = async (device) => {
  if (selectedDevice) selectedDevice.oninputreport = null;

  if (!device) {
    selectedDevice = null;
  } else {
    let select = document.getElementById("deviceSelect");
    for (let i = 0; i < select.options.length; ++i) {
      if (select.options[i].device === device) {
        select.value = i;
        break;
      }
    }
    selectedDevice = device;
  }

  if (selectedDevice) {
    selectedDevice.oninputreport = handleInputReport;
    if (!selectedDevice.opened) {
      try {
        await selectedDevice.open();
      } catch (e) {
        if (e instanceof DOMException) {
          console.log(
            `Error opening ${selectedDevice.productName}: ${e.message}`
          );
        } else {
          throw e;
        }
      }
    }
  }

  // updateDeviceInfo();
};

let arrowStates = {
  up: false,
  down: false,
  right: false,
  left: false,
};

function press(direction) {
  if (!arrowStates[direction]) {
    arrowStates[direction] = true;
    // padOrKeypress(direction);

    let padPress = new CustomEvent("padPress", {
      detail: {
        direction: direction,
      },
    });
    window.dispatchEvent(padPress);
  }
}

function release(direction) {
  if (arrowStates[direction]) {
    arrowStates[direction] = false;

    let padRelease = new CustomEvent("padRelease", {
      detail: {
        direction: direction,
      },
    });
    window.dispatchEvent(padRelease);
  }
}

const handleInputReport = (event) => {
  // const inputReportTextView = document.getElementById("inputReport");
  // if (!inputReportTextView) return;

  let buffer = hex8(event.reportId);
  const reportData = new Uint8Array(event.data.buffer);
  for (let byte of reportData) buffer += " " + hex8(byte);
  // inputReportTextView.innerHTML = buffer;
  // console.log(buffer);
  //give the buffer results, how do we know when we LIFT up from notes?
  // Nothing / center: 01 00 00
  // Up              : 01 04 00
  // right           : 01 02 00
  // left            : 01 01 00
  // down            : 01 08 00
  // up + right.    : 01 06 00
  // down + right.   : 01 0A 00
  // left + right.   : 01 03 00
  // up + left.      : 01 05 00
  // down + left.    : 01 09 00
  // up + down.      : 01 0C 00

  // Let's have an ongoing state of our arrows, is it pressed or not?
  // on input, we update it based on the buffer
  // We need to have a notion of "lifting"..there is a "lift" when. apreviously pressed arrow is now lifted

  // Nothing / center
  if (buffer == "01 00 00") {
    release("left");
    release("right");
    release("up");
    release("down");
  }
  // Up
  if (buffer == "01 04 00") {
    release("left");
    release("right");
    press("up");
    release("down");
  }

  // Right
  if (buffer == "01 02 00") {
    release("left");
    press("right");
    release("up");
    release("down");
  }

  // Left
  if (buffer == "01 01 00") {
    press("left");
    release("right");
    release("up");
    release("down");
  }

  // Down
  if (buffer == "01 08 00") {
    release("left");
    release("right");
    release("up");
    press("down");
  }

  // Up + Right
  if (buffer == "01 06 00") {
    release("left");
    press("right");
    press("up");
    release("down");
  }
  // Down + Right
  if (buffer == "01 0A 00") {
    release("left");
    press("right");
    release("up");
    press("down");
  }
  // Left + Right
  if (buffer == "01 03 00") {
    press("left");
    press("right");
    release("up");
    release("down");
  }

  // Up + Left
  if (buffer == "01 05 00") {
    press("left");
    release("right");
    press("up");
    release("down");
  }
  // Down + Left
  if (buffer == "01 09 00") {
    press("left");
    release("right");
    release("up");
    press("down");
  }
  // Up+Down
  if (buffer == "01 0C 000") {
    release("left");
    release("right");
    press("up");
    press("down");
  }
};

window.onload = async () => {
  // Register for connection and disconnection events.
  navigator.hid.onconnect = (e) => {
    addDevice(e.device);
  };
  navigator.hid.ondisconnect = (e) => {
    removeDevice(e.device);
  };

  // Fetch the list of connected devices.
  const devices = await navigator.hid.getDevices();
  for (let device of devices) await addDevice(device);
};
