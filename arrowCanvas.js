let arrowCanvas;
let canvasWidth = 640;
let canvasHeight = 480;

let track = document.querySelector("audio");

let relevantNotes = [];

let songData;

let scoreSpan = document.querySelector("#score");
let scoreCount = 0;

let feedback = document.querySelector("#feedback");

var arrows = function (p) {
  let thisCanvas;
  let canvasRatio = canvasWidth / canvasHeight;
  let mouse_x;
  let mouse_y;

  let hitArrowImgs;

  let hitPos = { x: 160, y: 50 };

  let arrow_xPos = {
    left: 160,
    down: 160 + 80,
    up: 160 + 80 * 2,
    right: 160 + 80 * 3,
  };

  let hitArrowObjs = {};

  p.preload = function () {
    //Preload a background here
    //Preload whatever needs to be preloaded
    hitArrowImgs = {
      left: p.loadImage("assets/hit-arrow-left.png"),
      up: p.loadImage("assets/hit-arrow-up.png"),
      right: p.loadImage("assets/hit-arrow-right.png"),
      down: p.loadImage("assets/hit-arrow-down.png"),
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

    songData = JSON.parse(songJson);
    console.log("song data");
    console.log(songData);

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

  p.draw = function () {
    p.background("green");

    Object.values(hitArrowObjs).forEach(function (arrowObj) {
      arrowObj.display();
    });

    drawArrows();
  };

  let batchSize = 2;

  // current batch num is the measure of the current batch
  let currentBatchStartMeasure = 0;
  let bpm = 139;
  let currentMeasure = -1;

  function timeToMeasure() {}

  let t = 0;
  let secondsPerBeat = 1 / (bpm / 60);

  function updateNotes() {
    //Keep a queue of relevantNotes
    t = track.currentTime;

    //Given current time, what is the current measure?

    let currentBeat = t / secondsPerBeat;
    let thisMeasure = Math.floor(currentBeat / 4);
    if (thisMeasure > currentMeasure) {
      console.log("Measure: " + thisMeasure);
      currentMeasure = thisMeasure;

      //Initialize
      if (currentMeasure == 0) {
        let measuresInBatch = songData.slice(
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
        let measuresInBatch = songData.slice(
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

  document.body.addEventListener("click", function () {
    track.play();
    setInterval(function () {
      updateNotes();
    }, 10);
  });

  //Create arrows takes the relevant notes array and then creates objects for them
  function createArrows() {}

  let margin = 25;
  function drawArrows() {
    // console.log(relevantNotes);
    relevantNotes.forEach(function (note) {
      let direction = note.direction;
      let pixelsPerBeat = 100;

      let passedOver = false;

      // Get current y position

      let pixelsElapsed = (t / secondsPerBeat) * pixelsPerBeat;
      let yPos = hitPos.y + pixelsPerBeat * note.startBeat - pixelsElapsed;
      note.currentY = yPos;

      // Should this arrow be considered as a hit candidate?

      if (yPos > hitPos.y - margin && yPos < hitPos.y + margin) {
        //Note within our hit window!
        note.isHitCandidate = true;
      } else if (yPos < hitPos.y - margin) {
        passedOver = true;
        note.isHitCandidate = false;
      }

      // Draw at partial opacity if passed over
      if (note.isHit) {
        // Display nothing if it's hit
      } else if (passedOver) {
        p.tint(255, 127);
        drawImageToScale(arrowImgs[direction], arrow_xPos[direction], yPos);
        p.tint(255, 255);
      } else {
        drawImageToScale(arrowImgs[direction], arrow_xPos[direction], yPos);
      }
    });
  }

  function updateFeedback(feedbackText) {
    console.log(feedbackText);
    feedback.innerHTML = feedbackText;
  }

  function updateScore(score, note) {
    console.log("updateScore");
    console.log(score);

    scoreCount++;
    scoreSpan.innerHTML = scoreCount;
    note.isHit = true;

    if (score === "ok") {
      updateFeedback("OKAY");
    } else if (score === "great") {
      updateFeedback("GREAT");
    } else if (score === "perfect") {
      updateFeedback("PERFECT!!");
    }
  }

  function assessHit(direction) {
    relevantNotes.forEach(function (note) {
      if (note.isHitCandidate && note.direction == direction) {
        let yPos = note.currentY;
        console.log(yPos);

        //Determine quality of hit
        //TOO LATE - failed
        if (yPos > hitPos.y - margin && yPos < hitPos.y - margin + 10) {
          updateFeedback("TOO LATE!");
        }
        // A little late - Ok - PASS
        else if (
          yPos >= hitPos.y - margin + 10 &&
          yPos < hitPos.y - margin + 17
        ) {
          updateScore("ok", note);
        }
        // Almost perfect - late
        else if (
          yPos >= hitPos.y - margin + 17 &&
          yPos < hitPos.y - margin + 22
        ) {
          updateScore("great", note);
        }
        // Perfect - PASS
        else if (yPos >= hitPos.y - 3 && yPos < hitPos.y + 3) {
          updateScore("perfect", note);
        }
        // Almost perfect - late - PASS
        else if (yPos >= hitPos.y + 3 && yPos < hitPos.y + 8) {
          updateScore("great", note);
        }
        // A little early - OK - PASS
        else if (yPos >= hitPos.y + 8 && yPos < hitPos.y + 15) {
          updateScore("ok", note);
        }
        // TOO EARLY - Failed
        else if (yPos >= hitPos.y + 15 && yPos < hitPos.y + margin) {
          updateFeedback("TOO EARLY!");
        }
      }
    });
  }

  window.addEventListener("keydown", function (e) {
    if (
      e.code == "ArrowLeft" ||
      e.code == "ArrowRight" ||
      e.code == "ArrowUp" ||
      e.code == "ArrowDown"
    ) {
      if (e.code == "ArrowLeft") {
        hitArrowObjs["left"].pressed = true;
        assessHit("left");
      }
      if (e.code == "ArrowRight") {
        hitArrowObjs["right"].pressed = true;
        assessHit("right");
      }
      if (e.code == "ArrowUp") {
        hitArrowObjs["up"].pressed = true;
        assessHit("up");
      }
      if (e.code == "ArrowDown") {
        hitArrowObjs["down"].pressed = true;
        assessHit("down");
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
      }
      if (e.code == "ArrowRight") {
        hitArrowObjs["right"].pressed = false;
      }
      if (e.code == "ArrowUp") {
        hitArrowObjs["up"].pressed = false;
      }
      if (e.code == "ArrowDown") {
        hitArrowObjs["down"].pressed = false;
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
  // class Arrow {
  //   constructor(direction) {
  //     this.direction = direction;
  //     this.imgToDraw = arrowImgs[direction];
  //     this.xPos = arrow_xPos[direction];
  //     this.yPos = 0;
  //   }
  //   display() {
  //     drawImageToScale(this.imgToDraw, this.xPos, simMousePos.y);
  //   }
  // }

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
