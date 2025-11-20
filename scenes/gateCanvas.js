var gate = function (p) {
  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;

  let gateCanvas;
  let isCurrentScene = false;

  let gateSpritesheet;
  let gateImgs = [];

  let numCanvasesLoaded = 0;
  let allCanvasesLoaded = false;

  let menuItems = [];
  let gateId = 0;

  //Store x position of left and right gates
  let gatePositions = { left: -320, right: 640 };

  p.preload = function () {
    gateSpritesheet = p.loadImage("/assets/gatesSpritesheet.png");
  };

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);

    gateCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    gateCanvas.classList.add("gameCanvas");
    gateCanvas.id = "gateCanvas";

    //Initialize gate images from spritesheet
    for (var i = 0; i < 6; i++) {
      let thisGateL = gateSpritesheet.get(0, 480 * i, 320, 480);
      let thisGateR = gateSpritesheet.get(320, 480 * i, 320, 480);
      gateImgs.push({ left: thisGateL, right: thisGateR });
    }

    p.noSmooth();

    p.noStroke();

    window.dispatchEvent(canvasLoadedEvent);

    setupNavigation(gateCanvas);
  };

  p.draw = function () {
    p.clear();

    // Start drawing things if all canvases have loaded
    if (allCanvasesLoaded) {
      let thisGate = gateImgs[gateId];
      drawImageToScale(thisGate.left, gatePositions.left, 0);

      drawImageToScale(thisGate.right, gatePositions.right, 0);
    }
  };

  function animateGates() {
    console.log("animating gates");
    let transitionTime = gateId == 5 ? 3000 : 4000;
    let closingInterval = setInterval(function () {
      //If we've reached the end
      if (gatePositions.left + 15 >= 0 || gatePositions.right - 15 <= 320) {
        gatePositions.left = 0;
        gatePositions.right = 320;
        clearInterval(closingInterval);
      } else {
        gatePositions.left += 15;
        gatePositions.right -= 15;
      }
    }, 20);

    setTimeout(function () {
      let openingInterval = setInterval(function () {
        if (
          gatePositions.left + -15 <= -320 ||
          gatePositions.right + 15 >= 640
        ) {
          gatePositions.left = -320;
          gatePositions.right = 640;
          clearInterval(openingInterval);
          gateCanvas.dispatchEvent(hideSceneEvent);
        } else {
          gatePositions.left -= 10;
          gatePositions.right += 10;
        }
      }, 20);
    }, transitionTime);
  }

  function setupNavigation(thisCanvas) {
    p.noLoop();
    thisCanvas.addEventListener("showScene", (e) => {
      gateId = e.detail.gateId;
      p.loop();

      thisCanvas.style.visibility = "visible";
      thisCanvas.style.opacity = 1;
      animateGates();
      isCurrentScene = true;
    });
    thisCanvas.addEventListener("hideScene", (e) => {
      p.noLoop();
      isCurrentScene = false;
      thisCanvas.style.opacity = 0;
      setTimeout(function () {
        thisCanvas.style.visibility = "hidden";
      }, sceneTransitionTime);
    });
  }

  ////////////////////////////////////////////
  // -------------- SCENES --------------- //
  //////////////////////////////////////////

  //Listen if all canvases in the game have been loaded
  window.addEventListener("canvasLoaded", function () {
    numCanvasesLoaded++;
    if (numCanvasesLoaded == totalCanvases) {
      allCanvasesLoaded = true;
    }
  });

  //Create a class for menu items
  // Create each one has an animation timer to calculate the offset

  // Draw text centered on the screen or at a certain position if specified

  p.windowResized = function () {
    calculateCanvasDimensions();
    p.resizeCanvas(canvasWidth, canvasHeight);
  };

  function drawImageToScale(img, x, y) {
    p.image(
      img,
      x * scaleRatio,
      y * scaleRatio,
      img.width * scaleRatio,
      img.height * scaleRatio
    );
  }

  function calculateCanvasDimensions() {
    if (p.windowWidth / p.windowHeight > canvasRatio) {
      canvasWidth = p.windowHeight * canvasRatio;
      canvasHeight = p.windowHeight;
    } else {
      canvasWidth = p.windowWidth;
      canvasHeight = p.windowWidth / canvasRatio;
    }
    scaleRatio = canvasWidth / 640;
  }
};

new p5(gate, "gate-canvas-container");
