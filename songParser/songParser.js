const testSong = `0000
0000
0000
0000
,
0000
0000
0000
0000
,
0000
0000
0000
0000
,
0000
0000
0000
0000
,
0000
0000
0000
0000
,
0010
0000
0000
0000
,
1000
0000
0000
0000
,
0010
0010
0010
0000
,
1000
0000
0000
0000
,
0010
0000
0000
0000
,
0001
0000
0000
0000
,
0010
0010
0010
0000
,
0001
0000
0000
0000
,
0100
0100
0000
0000
,
1000
0000
0001
0000
,
1000
0000
0000
0000
,
0100
0000
0000
0000
,
1001
0000
0000
0000
,
1000
0000
0001
0000
,
0100
0000
0000
0000
,
0001
0000
1000
0000
,
0010
0000
0010
0000
,
0100
0000
0000
0000
,
0010
0000
0000
0000
,
0220
0000
0000
0330
,
0000
0000
0000
0000
,
1000
0000
1000
0000
,
0010
0000
0000
0000
,
1000
1000
1000
0000
,
0010
0000
0000
0000
,
0001
0000
0001
0000
,
0010
0000
0000
0000
,
0001
0001
0001
0000
,
0010
0000
0000
0000
,
0100
0100
0000
0000
,
1000
0000
0001
0000
,
1000
0000
1000
0000
,
1001
0000
0000
0000
,
1001
0000
0000
0000
,
0001
0000
1000
0000
,
0100
0000
0000
0000
,
1000
0000
0001
0000
,
0010
0000
0010
0000
,
0100
0000
0000
0000
,
0010
0000
0100
0000
,
0110
0000
0000
0000
,
1001
0000
0000
0000
,
1000
0000
0001
0000
,
0100
0000
0000
0000
,
0001
0000
1000
0000
,
0010
0010
0000
0000
,
0100
0100
0000
0000
,
0001
0000
1000
0000
,
1001
0000
0000
0000
,
0110
0000
0000
0000
,
1001
0000
0000
0000
`;

let getDirection = function (arrowIndex) {
  if (arrowIndex == 0) {
    return "left";
  }
  //Down
  if (arrowIndex == 1) {
    return "down";
  }
  //Up
  if (arrowIndex == 2) {
    return "up";
  }
  //Right
  if (arrowIndex == 3) {
    return "right";
  }
};

let parseSong = function (songText, offsetId, bpm, delay) {
  console.log(songText);
  let measures = songText.split(/\s+,\s+/);
  console.log(measures);

  let testBPM = 139;

  let noteData = [];

  let totalBeats = measures.length * 4;
  let beatsPerSecond = testBPM / 60;
  let secondsPerBeat = 1 / beatsPerSecond;
  let secondsPerMeasure = secondsPerBeat * 4;
  let lastHoldIndices = [null, null, null, null];

  let totalNotes = 0;

  measures.forEach(function (measure, measureIndex) {
    let split = measure.split("\n");
    console.log("measureIndex: " + measureIndex);

    let filteredMeasure = split.filter((line) => line.length);

    //How much is this measure subdivided by?
    let subdivisionNum = filteredMeasure.length;
    //Then go into each subdivision...
    filteredMeasure.forEach(function (subdivision, subdivisionIndex) {
      let subdivisionSplit = subdivision.split("");

      //Create a new note for the lines that we see, based on the length of the note....

      subdivisionSplit.forEach(function (arrowElement, arrowIndex) {
        console.log(arrowElement);
        let secondsPerSubdivision = secondsPerMeasure / subdivisionNum;
        let startTime =
          measureIndex * secondsPerMeasure +
          subdivisionIndex * secondsPerSubdivision;

        let startBeat =
          measureIndex * 4 + (subdivisionIndex / subdivisionNum) * 4;

        if (parseInt(arrowElement)) {
          //DETERMINE START TIME

          // Create a new note if applicable

          if (parseInt(arrowElement) == 1) {
            // console.log(startTime);
            let thisNoteData = {
              id: noteData.length + offsetId,
              startBeat: startBeat,
              startTime: startTime,
              noteType: "instant",
              measure: measureIndex,
            };

            //DETERMINE DIRECTION

            thisNoteData.direction = getDirection(arrowIndex);

            noteData.push(thisNoteData);
            totalNotes++;
          } else if (parseInt(arrowElement) == 2) {
            //Otherwise account for holds

            let thisNoteData = {
              id: noteData.length + offsetId,
              startBeat: startBeat,
              startTime: startTime,
              noteType: "hold",
              measure: measureIndex,
            };

            //DETERMINE DIRECTION
            //Left
            thisNoteData.direction = getDirection(arrowIndex);

            noteData.push(thisNoteData);
            totalNotes++;
            lastHoldIndices[arrowIndex] = noteData.length - 1;
          } else if (parseInt(arrowElement) == 3) {
            // need to record end time for a previous hold...
            // How are we supposed to find this????
            // This is always gonna match up with the last "2" / hold we saw in this arrow direction.... maybe we can just store this as an array
            let lastHoldNote = noteData[lastHoldIndices[arrowIndex]];

            lastHoldNote.endTime = startTime;
            //not sure if end measure is accurate
            lastHoldNote.endBeat = startBeat;
            lastHoldNote.endMeasure = Math.floor(startBeat / 4);
          }

          //DETERMINE END TIME AND TYPE (if hold)

          //CHANGE THIS. 2 means the start, and 3 means the end of a previous one...
          // if (parseInt(arrowElement) > 1) {
          //   let holdFor = parseInt(arrowElement) - 1;
          //   let holdLength = holdFor * secondsPerSubdivision;
          //   thisNoteData.noteType = "hold";
          //   thisNoteData.endTime = thisNoteData.startTime + holdLength;
          //   //not sure if end measure is accurate
          //   thisNoteData.endBeat = thisNoteData.startBeat + holdFor;
          //   thisNoteData.endMeasure = Math.floor(thisNoteData.endBeat / 4);
          // }
        } else if (arrowElement == "M") {
          console.log("THIS IS A MINE!!!");

          let thisNoteData = {
            id: noteData.length + offsetId,
            startBeat: startBeat,
            startTime: startTime,
            noteType: "mine",
            measure: measureIndex,
          };

          //DETERMINE DIRECTION

          thisNoteData.direction = getDirection(arrowIndex);
          noteData.push(thisNoteData);
          // totalNotes++; // Don't affect total notes
        } else {
          // This is a zero
        }
        // console.log("this is zero");
      });
    });
  });

  console.log(noteData);

  //Create notes by measures

  let measureData = new Array(measures.length);

  console.log(measureData);

  noteData.forEach(function (note) {
    if (measureData[note.measure] != null) {
      measureData[note.measure].push(note);
    } else {
      measureData[note.measure] = [note];
    }
  });

  // console.log(measureData);
  // return measureData;
  console.log(JSON.stringify(measureData));
  let songData = {
    measureData: measureData,
    bpm: bpm,
    delay: delay,
    totalNotes: totalNotes,
  };
  return JSON.stringify(songData);
};

let parseButton = document.querySelector("#parseButton");
let inputSong = document.querySelector("#inputSong");
let numberInput = document.querySelector("#number");
let bpmInput = document.querySelector("#bpm");
let delayInput = document.querySelector("#delay");
let resultTextarea = document.querySelector("#results");
parseButton.addEventListener("click", function () {
  let offsetVal = parseInt(numberInput.value);
  let bpmVal = parseFloat(bpmInput.value);
  let delayVal = parseFloat(delay.value);
  let results = parseSong(inputSong.value, offsetVal, bpmVal, delayVal);
  resultTextarea.innerHTML = results;
});
