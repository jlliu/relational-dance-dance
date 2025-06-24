let arrowCanvas;
let canvasWidth = 640;
let canvasHeight = 480;

let track = document.querySelector("audio");

let relevantNotes = [];

let songData;

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

    // drawImageToScale(hitArrowImgs.left, hitPos.x, hitPos.y);
    // drawImageToScale(hitArrowImgs.down, hitPos.x + 80, hitPos.y);
    // drawImageToScale(hitArrowImgs.up, hitPos.x + 160, hitPos.y);
    // drawImageToScale(hitArrowImgs.right, hitPos.x + 240, hitPos.y);
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

    let beats = t / secondsPerBeat;

    let thisMeasure = Math.floor(beats / 4);
    if (thisMeasure > currentMeasure) {
      console.log("switched measure!");
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
  function drawArrows() {
    // console.log(relevantNotes);
    relevantNotes.forEach(function (note) {
      let direction = note.direction;
      let pixelsPerBeat = 100;

      // Get current y position

      let pixelsElapsed = (t / secondsPerBeat) * pixelsPerBeat;
      let yPos = hitPos.y + pixelsPerBeat * note.startBeat - pixelsElapsed;
      drawImageToScale(arrowImgs[direction], arrow_xPos[direction], yPos);
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
      }
      if (e.code == "ArrowRight") {
        hitArrowObjs["right"].pressed = true;
      }
      if (e.code == "ArrowUp") {
        hitArrowObjs["up"].pressed = true;
      }
      if (e.code == "ArrowDown") {
        hitArrowObjs["down"].pressed = true;
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
