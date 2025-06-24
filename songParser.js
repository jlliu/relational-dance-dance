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
let measures = testSong.split("\n,\n");
console.log(measures);

let testBPM = 139;

let noteData = [];

let totalBeats = measures.length * 4;
let beatsPerSecond = testBPM / 60;
let secondsPerBeat = 1 / beatsPerSecond;
let secondsPerMeasure = secondsPerBeat * 4;

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
      if (parseInt(arrowElement)) {
        //DETERMINE START TIME
        let secondsPerSubdivision = secondsPerMeasure / subdivisionNum;
        let startTime =
          measureIndex * secondsPerMeasure +
          subdivisionIndex * secondsPerSubdivision;
        // console.log(startTime);
        let thisNoteData = {
          startBeat: measureIndex * 4 + (subdivisionIndex / subdivisionNum) * 4,
          startTime: startTime,
          noteType: "instant",
          measure: measureIndex,
        };

        //DETERMINE DIRECTION
        //Left
        if (arrowIndex == 0) {
          thisNoteData.direction = "left";
        }
        //Down
        if (arrowIndex == 1) {
          thisNoteData.direction = "down";
        }
        //Up
        if (arrowIndex == 2) {
          thisNoteData.direction = "up";
        }
        //Right
        if (arrowIndex == 3) {
          thisNoteData.direction = "right";
        }

        //DETERMINE END TIME AND TYPE (if hold)

        if (parseInt(arrowElement) > 1) {
          let holdFor = parseInt(arrowElement) - 1;
          let holdLength = holdFor * secondsPerSubdivision;
          thisNoteData.noteType = "hold";
          thisNoteData.endTime = thisNoteData.startTime + holdLength;
          //not sure if end measure is accurate
          thisNoteData.endBeat = thisNoteData.startBeat + holdFor;
          thisNoteData.endMeasure = Math.floor(thisNoteData.endBeat / 4);
        }

        noteData.push(thisNoteData);
      } else {
        // console.log("this is zero");
      }
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

console.log(measureData);
console.log(JSON.stringify(measureData));
