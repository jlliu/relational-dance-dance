let arrowCanvas;
let canvasWidth = 640;
let canvasHeight = 480;

// let ambientBreeze_track = document.querySelector("#ambientBreeze");
// ambientBreeze_track.loop = true;

const ambientPlayer = new Tone.Player(
  "assets/audio/RDD_p1_ambience_loop.mp3"
).toDestination();
ambientPlayer.loop = true;

// let euroBeat_track = document.querySelector("#euroBeat");
// euroBeat_track.loop = true;

const beatPlayer = new Tone.Player(
  "assets/audio/RDD_p2_drum_loop.mp3"
).toDestination();
beatPlayer.loop = true;

const kickPlayer = new Tone.Player("assets/audio/kick.wav").toDestination();

let relevantNotes = [];
let songData;

let songData2;

let scoreSpan = document.querySelector("#score");
let scoreCount = 0;

// let feedback = document.querySelector("#feedback");

let moveHitArrows = false;

let waitForHit = true;
// waitForHit = false;

let part1HoldsDone = false;

let part2Started = false;

var arrows = function (p) {
  let thisCanvas;
  let canvasRatio = canvasWidth / canvasHeight;
  let mouse_x;
  let mouse_y;

  let hitArrowImgs;

  let hitPos = { x: 160, y: 200 };

  let hitPosFinal = { x: 160, y: 50 };

  let arrow_xPos = {
    left: 160,
    down: 160 + 80,
    up: 160 + 80 * 2,
    right: 160 + 80 * 3,
  };

  let hitArrowObjs = {};

  let holdMiddleImg;
  let holdEndImgs;

  p.preload = function () {
    //Preload a background here
    //Preload whatever needs to be preloaded
    hitArrowImgs = {
      left: p.loadImage("assets/hit-arrow-left.png"),
      up: p.loadImage("assets/hit-arrow-up.png"),
      right: p.loadImage("assets/hit-arrow-right.png"),
      down: p.loadImage("assets/hit-arrow-down.png"),
    };
    holdMiddleImg = p.loadImage("assets/hold-middle.png");
    holdEndImgs = {
      left: p.loadImage("assets/left-hold-end.png"),
      up: p.loadImage("assets/up-hold-end.png"),
      right: p.loadImage("assets/right-hold-end.png"),
      down: p.loadImage("assets/down-hold-end.png"),
    };
    arrowImgs = {
      left: p.loadImage("assets/arrow-left.png"),
      up: p.loadImage("assets/arrow-up.png"),
      right: p.loadImage("assets/arrow-right.png"),
      down: p.loadImage("assets/arrow-down.png"),
    };
  };

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);
    arrowCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    arrowCanvas.classList.add("gameCanvas");
    arrowCanvas.classList.add("arrowCanvas");
    arrowCanvas.id = "arrows";
    thisCanvas = arrowCanvas;
    p.noSmooth();

    songData = JSON.parse(part1);
    songData2 = JSON.parse(part2);

    hitArrowObjs = {
      left: new HitArrow("left", hitPos.x, hitPos.y),
      down: new HitArrow("down", hitPos.x + 80, hitPos.y),
      up: new HitArrow("up", hitPos.x + 160, hitPos.y),
      right: new HitArrow("right", hitPos.x + 240, hitPos.y),
    };

    // setupNavigation();

    // cursor = new Cursor();

    //Initialize Game N Sprites
  };

  let startDrawingArrows = false;

  p.draw = function () {
    p.background("white");

    Object.values(hitArrowObjs).forEach(function (arrowObj) {
      // Move arrowObjs up until it reaches hit pos final
      // console.log(moveHitArrows);
      if (moveHitArrows) {
        if (arrowObj.yPos > hitPosFinal.y) {
          arrowObj.yPos--;
        } else {
          moveHitArrows = false;
        }
      }

      arrowObj.display();
    });

    if (startDrawingArrows) {
      drawArrows();
    }
  };

  let batchSize = 4;

  // current batch num is the measure of the current batch
  let currentBatchStartMeasure = 0;
  // let bpm = 20;
  let bpm = 130;
  let currentMeasure = -1;

  let t = 0;

  let secondsPerBeat = 1 / (bpm / 60);
  let currentBeat = 0;

  let pixelsElapsed = 0;

  let cueCount = 0;

  function pauseTimer() {
    timerPaused = true;
    clock.pause();
  }

  function unpauseTimer() {
    timerPaused = false;
    clock.start();
  }
  function updateNotes(songData) {
    if (!timerPaused) {
      t = clock.seconds;
      // console.log(t);
      //Keep a queue of relevantNotes

      // t = ambientBreeze_track.currentTime;
      // console.log(ambientPlayer.now());

      // but we still need this T to pause...
      // t = ambientPlayer.now();
      // console.log(Tone.Transport.now());
      // t = Tone.Transport.now();

      // t should be how much time passed... when the timer is not pausing...

      //Given current time, what is the current measure?

      currentBeat = t / secondsPerBeat;
      let thisMeasure = Math.floor(currentBeat / 4);
      if (thisMeasure > currentMeasure) {
        console.log("Measure: " + thisMeasure);
        currentMeasure = thisMeasure;

        //Initialize
        if (currentMeasure == 0) {
          let measuresInBatch = songData.measureData.slice(
            currentBatchStartMeasure,
            currentBatchStartMeasure + batchSize
          );
          measuresInBatch.forEach(function (measure) {
            if (measure) {
              relevantNotes = relevantNotes.concat(measure);
            }
          });
        }
        //Are we ALMOST at a new batch? Update the batch data!
        else if (currentMeasure % batchSize == batchSize - 1) {
          //Discard old ones BEFORE 1 measure ago....
          let remainingNotes = relevantNotes.filter(function (note) {
            //Keep only if this note is a hold and it's done...
            if (
              note.noteType == "hold" &&
              note.endMeasure >= currentMeasure - 1
            ) {
              return true;
            } else if (
              note.noteType == "instant" &&
              note.measure >= currentMeasure - 1
            ) {
              return true;
            } else {
              return false;
            }
          });
          relevantNotes = remainingNotes;
          //Load in next batch notes
          currentBatchStartMeasure += batchSize;
          let measuresInBatch = songData.measureData.slice(
            currentBatchStartMeasure,
            currentBatchStartMeasure + batchSize
          );
          measuresInBatch.forEach(function (measure) {
            if (measure) {
              relevantNotes = relevantNotes.concat(measure);
            }
          });
        }
      }
    }
  }

  let timer;
  let timerPaused = false;

  let beatStarted = false;

  let t_part1Complete = 0;

  let clock = new Tone.Clock((time) => {
    // console.log("this is a clock");
    // updateNotes();
  }, 1);

  document.body.addEventListener("click", function () {
    ambientPlayer.start();
    // beatPlayer.start();

    timer = setInterval(function () {
      if (part2Started) {
        updateNotes(songData2);
      } else {
        updateNotes(songData);
      }
    }, 10);

    //Start a tone.js clock to keep time
    clock.start();

    startDrawingArrows = true;
  });

  //What needs to happen in Part 1 of experimental scene, if we are no longer doing the traditional game play?

  // Play baseline sound in background.....
  // Notes drift up.... but then STAY in the hit zone until hit... When it reaches hit zone, pause timer...

  //Create arrows takes the relevant notes array and then creates objects for them
  function createArrows() {}

  let margin = 50;

  let pixelsPerBeat = 100;
  function drawArrows() {
    relevantNotes.forEach(function (note) {
      let direction = note.direction;
      let passedOver = false;

      // Get current y position: yPos is where the start of the note is currently on the p5 canvas
      pixelsElapsed = (t / secondsPerBeat) * pixelsPerBeat;
      let yPos =
        hitArrowObjs["left"].yPos +
        pixelsPerBeat * note.startBeat -
        pixelsElapsed;
      note.currentY = yPos;

      //Pause timer if note has reached hit zone before hit
      // Should this arrow be considered as a hit candidate? Different for waiting and not waiting modes
      if (waitForHit) {
        if (yPos < hitArrowObjs["left"].yPos && !note.isHit) {
          pauseTimer();
        }
        // For experimental... note is a hit candidate only if it's within range and UNHIT
        if (
          yPos > -Infinity &&
          yPos < hitArrowObjs["left"].yPos + margin &&
          !note.isHit
        ) {
          //Note within our hit window!
          note.isHitCandidate = true;
        } else {
          note.isHitCandidate = false;
        }
      } else {
        if (
          yPos > hitArrowObjs["left"].yPos - margin &&
          yPos < hitArrowObjs["left"].yPos + margin
        ) {
          //Note within our hit window!
          note.isHitCandidate = true;
        } else if (yPos < hitArrowObjs["left"].yPos - margin) {
          passedOver = true;
          note.isHitCandidate = false;
        }
      }

      //Should this arrow, if a hold, be considered completed if we're still holding?
      let end_yPos =
        hitArrowObjs["left"].yPos +
        pixelsPerBeat * note.endBeat -
        pixelsElapsed;
      if (
        end_yPos < hitArrowObjs["left"].yPos &&
        note.isHolding &&
        !note.completedHold
      ) {
        updateScore("ok", note);
      }

      drawArrow(note, yPos, passedOver);
    });
  }

  // Note type
  function drawArrow(note, yPos, passedOver) {
    // Draw instant notes
    if (note.noteType == "instant" && !note.isHit) {
      //Adjust for experimental
      if (waitForHit) {
        drawImageToScale(
          arrowImgs[note.direction],
          arrow_xPos[note.direction],
          Math.max(hitArrowObjs["left"].yPos, yPos)
        );
      } else {
        if (passedOver) {
          p.tint(255, 127);
        }
        drawImageToScale(
          arrowImgs[note.direction],
          arrow_xPos[note.direction],
          yPos
        );
        if (passedOver) {
          p.tint(255, 255);
        }
      }
    } else if (note.noteType == "hold") {
      // Draw holds
      let rectangleHeight;
      if (note.isHit && note.isHolding && !note.completedHold) {
        // hit first note, is currently holding in the middle of hold
        rectangleHeight = pixelsPerBeat * (note.endBeat - currentBeat);
        // Draw rectangle
        drawImageToScaleWithHeight(
          holdMiddleImg,
          arrow_xPos[note.direction],
          hitArrowObjs["left"].yPos + 40,
          rectangleHeight
        );
        // Draw arrow at end of rectangle
        drawImageToScale(
          holdEndImgs[note.direction],
          arrow_xPos[note.direction],
          hitArrowObjs["left"].yPos + rectangleHeight
        );
        // Draw arrow at hit pos
        drawImageToScale(
          arrowImgs[note.direction],
          arrow_xPos[note.direction],
          hitArrowObjs["left"].yPos
        );
      } else if (note.isHit && !note.isHolding && !note.completedHold) {
        //   case 2: hit first note, lifted up before end
        //   What happens? need to grey out and keep on going
        p.tint(255, 127);
        rectangleHeight = pixelsPerBeat * (note.endBeat - note.releasedBeat);
        let yPosReleased =
          hitArrowObjs["left"].yPos +
          pixelsPerBeat * note.releasedBeat -
          pixelsElapsed;
        // Draw rectangle
        drawImageToScaleWithHeight(
          holdMiddleImg,
          arrow_xPos[note.direction],
          yPosReleased + 40,
          rectangleHeight
        );
        // Draw arrow at end of rectangle
        drawImageToScale(
          holdEndImgs[note.direction],
          arrow_xPos[note.direction],
          yPosReleased + rectangleHeight
        );
        // Draw arrow at hit pos
        drawImageToScale(
          arrowImgs[note.direction],
          arrow_xPos[note.direction],
          yPosReleased
        );
        p.tint(255, 255);
        // If you're still holding down...
      } else if (note.isHit && note.completedHold) {
        // case 3: hit first note, held to completion... show nothing!

        // Here is the case where the holds will start to be done
        // AKA, the first moment when holds are complete... and the cue count is 46
        if (!part1HoldsDone && cueCount == 46) {
          part1HoldsDone = true;
          waitForHit = false;
          t_part1Complete = t;
          // Can we set a timer for the beat to start?
          resetForPart2();
        }
      } else if (!note.isHit) {
        // last case: the note is not hit, either passed over or upcoming...
        if (passedOver) {
          p.tint(255, 127);
        }
        rectangleHeight = pixelsPerBeat * (note.endBeat - note.startBeat);
        drawImageToScaleWithHeight(
          holdMiddleImg,
          arrow_xPos[note.direction],
          yPos + 40,
          rectangleHeight
        );
        drawImageToScale(
          arrowImgs[note.direction],
          arrow_xPos[note.direction],
          yPos
        );
        drawImageToScale(
          holdEndImgs[note.direction],
          arrow_xPos[note.direction],
          yPos + rectangleHeight
        );
        if (passedOver) {
          p.tint(255, 255);
        }
      }
    }
  }

  function resetForPart2() {
    let measuresUntilBeat = 1;
    let delayForBeat = measuresUntilBeat * 4 * secondsPerBeat;
    // console.log(delayForBeat);
    ambientPlayer.stop();
    clock.stop();

    // Lets try resetting everything here!
    relevantNotes = [];
    currentBatchStartMeasure = 0;
    currentMeasure = -1;
    currentBeat = 0;
    pixelsElapsed = 0;
    part2Started = true;
    console.log("part 2 started!");
    clock.start();
    setTimeout(function () {
      beatPlayer.start();
    }, delayForBeat * 1000);

    // setTimeout(function () {
    //   // Lets try resetting everything here!
    //   relevantNotes = [];
    //   currentBatchStartMeasure = 0;
    //   currentMeasure = -1;
    //   currentBeat = 0;
    //   pixelsElapsed = 0;
    //   part2Started = true;
    //   console.log("part 2 started!");
    //   clock.start();
    //   setTimeout(function () {
    //     beatPlayer.start();
    //   }, delayForBeat * 1000);
    // }, delayForBeat * 1000);
  }

  function updateFeedback(feedbackText) {
    feedback.innerHTML = feedbackText;
  }

  function updateScore(score, note) {
    if (!note.isHit) {
      scoreCount++;
      scoreSpan.innerHTML = scoreCount;
      note.isHit = true;
      if (timerPaused) {
        unpauseTimer();
      }
      // cueCount++;
      cueCount = parseInt(note.id) + 1;
      triggerNarrative(cueCount);

      if (score === "ok") {
        // updateFeedback("OKAY");
      } else if (score === "great") {
        // updateFeedback("GREAT");
      } else if (score === "perfect") {
        // updateFeedback("PERFECT!!");
      }
    }

    if (note.noteType == "hold" && !note.isHolding) {
      note.isHolding = true;
      note.completedHold = false;
    } else {
      note.isHolding = false;
      note.completedHold = true;
    }

    // if (!waitForHit && note.noteType !== "hold") {
    //   kickPlayer.start();
    // }
  }

  function allHoldsUnpaused() {
    let isAnyHoldPaused = false;
    relevantNotes.forEach(function (note) {
      if (
        note.noteType == "hold" &&
        note.isHolding == true &&
        !note.completedHold &&
        note.holdPaused == true
      ) {
        isAnyHoldPaused = true;
      }
    });
    return !isAnyHoldPaused;
  }

  function assessHit(direction, hitType) {
    relevantNotes.forEach(function (note) {
      //Assess notes that are the START of either instant or holds
      if (
        hitType == "press" &&
        note.isHitCandidate &&
        note.direction == direction
      ) {
        console.log("assess hit");
        let yPos = note.currentY;

        //Determine quality of hit
        //TOO LATE - failed

        //Case for wait for hit (helps prevent getting stuck)
        if (
          yPos > -Infinity &&
          yPos < hitArrowObjs["left"].yPos - 40 &&
          waitForHit
        ) {
          // updateFeedback("TOO LATE!");
          // console.log("wait for hit too late");
          updateScore("ok", note);
        } else if (
          yPos > hitArrowObjs["left"].yPos - 50 &&
          yPos < hitArrowObjs["left"].yPos - 40 &&
          !waitForHit
        ) {
          // updateFeedback("TOO LATE!");
          // updateScore("ok", note);
        }
        // A little late - Ok - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos - 40 &&
          yPos < hitArrowObjs["left"].yPos - 20
        ) {
          updateScore("ok", note);
        }
        // Almost perfect - late
        else if (
          yPos >= hitArrowObjs["left"].yPos - 20 &&
          yPos < hitArrowObjs["left"].yPos - 5
        ) {
          updateScore("great", note);
        }
        // Perfect - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos - 5 &&
          yPos < hitArrowObjs["left"].yPos + 5
        ) {
          updateScore("perfect", note);
        }
        // Almost perfect - late - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos + 5 &&
          yPos < hitArrowObjs["left"].yPos + 20
        ) {
          updateScore("great", note);
        }
        // A little early - OK - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos + 20 &&
          yPos < hitArrowObjs["left"].yPos + 40
        ) {
          updateScore("ok", note);
        }
        // TOO EARLY - Failed
        else if (
          yPos >= hitArrowObjs["left"].yPos + 40 &&
          yPos < hitArrowObjs["left"].yPos + 50
        ) {
          // updateFeedback("TOO EARLY!");
        }
      }
      //Assess notes that are currently being held. Did we lift before it's over or not?
      // AKA did we lift before the END beat for the held note is here or not....
      else if (
        hitType == "lift" &&
        note.noteType == "hold" &&
        note.isHolding &&
        note.direction == direction
      ) {
        // get the y pos of the end of the note
        let yPos =
          note.currentY + (note.endBeat - note.startBeat) * pixelsPerBeat;
        note.releasedBeat = currentBeat;

        // Lift is in range PASS
        if (
          yPos >= hitArrowObjs["left"].yPos - Infinity &&
          yPos < hitArrowObjs["left"].yPos + 40
        ) {
          updateScore("ok", note);
        }

        // Lift is TOO EARLY - Failed
        else if (
          yPos >= hitArrowObjs["left"].yPos + 40 &&
          yPos < hitArrowObjs["left"].yPos + Infinity
        ) {
          // updateFeedback("TOO EARLY!");

          //Adjust for experimental scene
          //Actually, we can't pause timer because there can be two at the same time...
          // Well, we can pause it if there's only one hold at the time
          // Once there's two, it requires BOTH to be lifted to be paused
          if (waitForHit) {
            pauseTimer();
            note.holdPaused = true;
          } else {
            note.isHolding = false;
            note.completedHold = false;
          }
        }
      }
      // add another case for re-pressing a hold
      else if (
        hitType == "press" &&
        note.noteType == "hold" &&
        note.isHolding &&
        note.direction == direction
      ) {
        //unpause timer if BOTH holds are holding...
        // timerPaused = false;
        note.holdPaused = false;
        if (allHoldsUnpaused()) {
          unpauseTimer();
        }
      }
    });
  }

  window.addEventListener("keydown", function (e) {
    //Ignore repeated keydown
    if (e.repeat) {
      return;
    }
    if (
      e.code == "ArrowLeft" ||
      e.code == "ArrowRight" ||
      e.code == "ArrowUp" ||
      e.code == "ArrowDown"
    ) {
      if (e.code == "ArrowLeft") {
        hitArrowObjs["left"].pressed = true;
        assessHit("left", "press");
      }
      if (e.code == "ArrowRight") {
        hitArrowObjs["right"].pressed = true;
        assessHit("right", "press");
      }
      if (e.code == "ArrowUp") {
        hitArrowObjs["up"].pressed = true;
        assessHit("up", "press");
      }
      if (e.code == "ArrowDown") {
        hitArrowObjs["down"].pressed = true;
        assessHit("down", "press");
      }
    }
  });

  window.addEventListener("keyup", function (e) {
    if (
      e.code == "ArrowLeft" ||
      e.code == "ArrowRight" ||
      e.code == "ArrowUp" ||
      e.code == "ArrowDown"
    ) {
      if (e.code == "ArrowLeft") {
        hitArrowObjs["left"].pressed = false;
        assessHit("left", "lift");
      }
      if (e.code == "ArrowRight") {
        hitArrowObjs["right"].pressed = false;
        assessHit("right", "lift");
      }
      if (e.code == "ArrowUp") {
        hitArrowObjs["up"].pressed = false;
        assessHit("up", "lift");
      }
      if (e.code == "ArrowDown") {
        hitArrowObjs["down"].pressed = false;
        assessHit("down", "lift");
      }
    }
  });

  // track.addEventListener("timeupdate", updateNotes);

  ////////////////////////////////////////////
  // -------------- SCENES --------------- //
  //////////////////////////////////////////

  // Game 1
  function displayGame() {
    //Do things we need to do when entered minigame
    if (gameEntered && !gameStarted) {
      console.log("GAME ENTERED!");
      gameStarted = true;
    }
    p.image(bg, 0, 0, canvasWidth, canvasHeight);

    // Display Sprites

    // Navigation
    rightButton.display();
    leftButton.display();
  }

  // CLASSES

  class HitArrow {
    constructor(direction, xPos, yPos) {
      this.direction = direction;
      this.imgToDraw = hitArrowImgs[direction];
      this.xPos = xPos;
      this.yPos = yPos;
      this.pressed = false;
    }
    display() {
      if (this.pressed) {
        p.tint(255, 127);
        drawImageToScale(this.imgToDraw, this.xPos, this.yPos);
        p.tint(255, 255);
      } else {
        drawImageToScale(this.imgToDraw, this.xPos, this.yPos);
      }
    }
  }

  function hideCanvas() {
    //Add things we want to do when we leave this scene
    // gameEntered = false;
    // gameStarted = false;
  }

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

  function drawImageToScaleWithHeight(img, x, y, height) {
    p.image(
      img,
      x * scaleRatio,
      y * scaleRatio,
      img.width * scaleRatio,
      height * scaleRatio
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

new p5(arrows, "arrow-canvas");

////////////////////////
// NARRATIVE CUES     //
////////////////////////

function showElement(el) {
  el.style.display = "inline";
}

function hideElement(el) {
  el.style.display = "none";
}

function getCueEl(cueCount) {
  return document.querySelector(`.narrativeScene span[data-cue='${cueCount}']`);
}

function getSceneEl(sceneNum) {
  return document.querySelector(`.scene${sceneNum}`);
}

function switchScene(newSceneNum) {
  // hideElement(getSceneEl(newSceneNum - 1));
  console.log("switchScene");
  let allScenes = document.querySelectorAll(".narrativeScene");
  allScenes.forEach(function (scene) {
    hideElement(scene);
  });
  showElement(getSceneEl(newSceneNum));
}

function triggerNarrative(cueCount) {
  // Define special moments like start of scene
  if (cueCount == 1) {
    showElement(getSceneEl(1));
    showElement(getCueEl(cueCount));
  } else if (cueCount == 9) {
    switchScene(2);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 13) {
    switchScene(3);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 17) {
    switchScene(4);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 29) {
    switchScene(5);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 37) {
    switchScene(6);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 45) {
    switchScene(7);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 46) {
    // "IS TO BE HELD PRESSED"
    // Move hit position up gradually
    showElement(getCueEl(cueCount));
    moveHitArrows = true;
  } else if (cueCount == 47) {
    switchScene(8);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 57) {
    switchScene(9);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 67) {
    switchScene(10);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 77) {
    switchScene(11);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 87) {
    switchScene(12);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 97) {
    switchScene(13);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 99) {
    switchScene(14);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 107) {
    switchScene(15);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 109) {
    switchScene(16);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 111) {
    switchScene(17);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 131) {
    switchScene(18);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 135) {
    switchScene(19);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 139) {
    switchScene(20);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 143) {
    switchScene(21);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 147) {
    switchScene(22);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 151) {
    switchScene(23);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 155) {
    switchScene(24);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 159) {
    switchScene(25);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 163) {
    switchScene(26);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 167) {
    switchScene(27);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 171) {
    switchScene(28);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 175) {
    switchScene(29);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 179) {
    switchScene(30);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 183) {
    switchScene(31);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 187) {
    switchScene(32);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 191) {
    switchScene(33);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 195) {
    switchScene(34);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 199) {
    switchScene(35);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 201) {
    switchScene(36);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 203) {
    switchScene(37);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 205) {
    switchScene(38);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 207) {
    switchScene(39);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 211) {
    switchScene(40);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 215) {
    switchScene(41);
    showElement(getCueEl(cueCount));
  } else if (cueCount == 219) {
    switchScene(42);
    showElement(getCueEl(cueCount));
  } else {
    //We are within a scene, and showing the element for that cue
    showElement(getCueEl(cueCount));
    // Also show the previous elements for that cue that were missed
  }
}
