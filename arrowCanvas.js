let arrowCanvas;

let canvasSizeOriginal = { width: 640, height: 480 };
let canvasWidth = 640;
let canvasHeight = 480;

let track = document.querySelector("audio");
let relevantNotes = [];
let songData;

let scoreSpan = document.querySelector("#score");
// let scoreCount = 0;

let feedback = document.querySelector("#feedback");

let feedbackObj;
let comboObj;

let scoreData;

let healthBar;

// let showingFeedback = false;
// let feedbackText = "";
// let feedbackScale = 1;
// let feedbackTimeout;
// let feedbackAnimationIndex = 0;
// let feedbackAnimationInterval;

var arrowScene = function (p) {
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

  let holdMiddleImg;
  let holdEndImgs;

  let comboTextImg;

  let healthBarFrameImg;
  let greenGradientImg;
  let rainbowGradientImg;

  let hitGlowImg;

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

    fonts.mainYellow.imgObj = p.loadImage(fonts.mainYellow.src);
    fonts.pinkDigits.imgObj = p.loadImage(fonts.pinkDigits.src);
    comboTextImg = p.loadImage("assets/comboText.png");
    healthBarFrameImg = p.loadImage("assets/healthBarFrame.png");
    greenGradientImg = p.loadImage("assets/greenGradient.png");
    rainbowGradientImg = p.loadImage("assets/rainbowGradient.png");
    hitGlowImg = p.loadImage("assets/hit-glow.png");
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

    hitArrowObjs = {
      left: new HitArrow("left", hitPos.x, hitPos.y),
      down: new HitArrow("down", hitPos.x + 80, hitPos.y),
      up: new HitArrow("up", hitPos.x + 160, hitPos.y),
      right: new HitArrow("right", hitPos.x + 240, hitPos.y),
    };

    feedbackObj = new FeedbackText();
    comboObj = new ComboText();

    scoreData = new Score();
    healthBar = new HealthBar();

    // setupNavigation();

    // cursor = new Cursor();

    //Initialize Game N Sprites

    //Initialize the font sprites!!

    // Get and store image object for character
    setupFont("mainYellow");

    // Get and store image object for digits
    setupFont("pinkDigits");
  };

  let startDrawingArrows = false;

  p.draw = function () {
    p.background("pink");

    Object.values(hitArrowObjs).forEach(function (arrowObj) {
      arrowObj.displayGlow();
    });
    Object.values(hitArrowObjs).forEach(function (arrowObj) {
      arrowObj.display();
    });

    if (startDrawingArrows) {
      drawArrows();
    }
    // drawText("PERFECT!");
    // if (showingFeedback) {

    feedbackObj.display();
    comboObj.display();
    healthBar.display();
  };

  let batchSize = 2;

  // current batch num is the measure of the current batch
  let currentBatchStartMeasure = 0;
  let bpm = 138;
  let currentMeasure = -1;

  let t = 0;
  let secondsPerBeat = 1 / (bpm / 60);
  let currentBeat = 0;

  let pixelsElapsed = 0;

  function updateNotes() {
    //Keep a queue of relevantNotes
    t = track.currentTime - 1.147;

    //Given current time, what is the current measure?

    currentBeat = t / secondsPerBeat;
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

    setTimeout(function () {
      setInterval(function () {
        updateNotes();
      }, 10);
      startDrawingArrows = true;
    }, 1.147 * 1000);
  });

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

      // Should this arrow be considered as a hit candidate?
      if (
        yPos > hitArrowObjs["left"].yPos - margin &&
        yPos < hitArrowObjs["left"].yPos + margin
      ) {
        //Note within our hit window!
        note.isHitCandidate = true;
      } else if (yPos < hitArrowObjs["left"].yPos - margin) {
        passedOver = true;

        //The note is passed over for the first time! THIS IS A MISS....
        if (note.hasPassedOver == null) {
          note.hasPassedOver = true;
          //If it's first time passing over a NOT hit note, reset combo
          if (!note.isHit) {
            updateMiss("miss", note);
          }
        }
        note.isHitCandidate = false;
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
        updateHit("ok", note);
      }

      drawArrow(note, yPos, passedOver);
    });
  }

  // Note type
  function drawArrow(note, yPos, passedOver) {
    // Draw instant notes
    if (note.noteType == "instant" && !note.isHit) {
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
        // console.log("CASE 2");

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

  function setupFont(fontName) {
    fonts[fontName].charSet.forEach(function (character, index) {
      let size = fonts[fontName].size;
      let imgObj = fonts[fontName].imgObj;
      let columns = imgObj.width / size.width;
      let rows = imgObj.height / size.height;
      let startingX = (index % columns) * size.width;
      let startingY = Math.floor(index / columns) * size.height;
      let charImg = imgObj.get(startingX, startingY, size.width, size.height);
      fonts[fontName].charsToImgs[character] = charImg;
    });
  }

  // Draw text centered on the screen or at a certain position if specified
  function drawText(textToDraw, fontName, scaleFactor, start_xPos, start_yPos) {
    if (scaleFactor == null) {
      scaleFactor = 1;
    }
    //Automatically center if position not specified
    let charsToDraw = textToDraw.split("");
    let wordWidth = charsToDraw.length * fonts[fontName].size.width;
    let wordHeight = fonts[fontName].size.height;
    if (start_xPos == null) {
      start_xPos = (canvasSizeOriginal.width - wordWidth * scaleFactor) / 2;
    } else {
      let dx = ((scaleFactor - 1) * wordWidth) / 2;
      start_xPos -= dx;
    }
    if (start_yPos == null) {
      start_yPos = (canvasSizeOriginal.height - wordHeight * scaleFactor) / 2;
    } else {
      let dy = ((scaleFactor - 1) * wordHeight) / 2;
      start_yPos -= dy;
    }
    charsToDraw.forEach(function (char, index) {
      let xPos = start_xPos + index * fonts[fontName].size.width * scaleFactor;
      drawImageToScale(
        fonts[fontName].charsToImgs[char],
        xPos,
        start_yPos,
        scaleFactor
      );
    });
  }
  function updateMiss(score, note) {
    feedbackObj.updateState(score);
    comboObj.resetCombo();
    scoreData.update("miss");
  }
  function updateHit(score, note) {
    //Is this the first time hitting this note?
    if (!note.isHit) {
      comboObj.incrementCombo();
      note.isHit = true;
      let scoreScale = 1;
      if (score === "ok") {
        feedbackObj.updateState("ok", true);
      } else if (score === "great") {
        feedbackObj.updateState("great", true);
      } else if (score === "perfect") {
        feedbackObj.updateState("perfect", true);
      }
      scoreData.update(score);
    }

    //Add logic for hitting holds in particular
    if (note.noteType == "hold" && !note.isHolding) {
      note.isHolding = true;
      note.completedHold = false;
    } else {
      note.isHolding = false;
      note.completedHold = true;
    }
  }

  function assessHit(direction, hitType) {
    let hitSuccessful = false;
    relevantNotes.forEach(function (note) {
      //Assess notes that are the START of either instant or holds
      if (
        hitType == "press" &&
        note.isHitCandidate &&
        note.direction == direction &&
        !note.isHit
      ) {
        let yPos = note.currentY;

        //Determine quality of hit
        //TOO LATE - failed
        if (
          yPos > hitArrowObjs["left"].yPos - 50 &&
          yPos < hitArrowObjs["left"].yPos - 40
        ) {
          updateMiss("late", note);
        }
        // A little late - Ok - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos - 40 &&
          yPos < hitArrowObjs["left"].yPos - 20
        ) {
          updateHit("ok", note);
          hitSuccessful = true;
        }
        // Almost perfect - late
        else if (
          yPos >= hitArrowObjs["left"].yPos - 20 &&
          yPos < hitArrowObjs["left"].yPos - 10
        ) {
          updateHit("great", note);
          hitSuccessful = true;
        }
        // Perfect - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos - 10 &&
          yPos < hitArrowObjs["left"].yPos + 10
        ) {
          updateHit("perfect", note);
          hitSuccessful = true;
        }
        // Almost perfect - late - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos + 10 &&
          yPos < hitArrowObjs["left"].yPos + 20
        ) {
          updateHit("great", note);
          hitSuccessful = true;
        }
        // A little early - OK - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos + 20 &&
          yPos < hitArrowObjs["left"].yPos + 40
        ) {
          updateHit("ok", note);
          hitSuccessful = true;
        }
        // TOO EARLY - Failed
        else if (
          yPos >= hitArrowObjs["left"].yPos + 40 &&
          yPos < hitArrowObjs["left"].yPos + 50
        ) {
          updateMiss("early", note);
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
          updateHit("ok", note);
        }

        // Lift is TOO EARLY - Failed
        else if (
          yPos >= hitArrowObjs["left"].yPos + 40 &&
          yPos < hitArrowObjs["left"].yPos + Infinity
        ) {
          feedbackObj.updateState("early");
          note.isHolding = false;
          note.completedHold = false;
        }
      }
    });
    return hitSuccessful;
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
        let hitSuccessful = assessHit("left", "press");
        hitArrowObjs["left"].press(hitSuccessful);
      }
      if (e.code == "ArrowRight") {
        let hitSuccessful = assessHit("right", "press");
        hitArrowObjs["right"].press(hitSuccessful);
      }
      if (e.code == "ArrowUp") {
        let hitSuccessful = assessHit("up", "press");
        hitArrowObjs["up"].press(hitSuccessful);
      }
      if (e.code == "ArrowDown") {
        let hitSuccessful = assessHit("down", "press");
        hitArrowObjs["down"].press(hitSuccessful);
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
        hitArrowObjs["left"].release();
        assessHit("left", "lift");
      }
      if (e.code == "ArrowRight") {
        hitArrowObjs["right"].release();
        assessHit("right", "lift");
      }
      if (e.code == "ArrowUp") {
        hitArrowObjs["up"].release();
        assessHit("up", "lift");
      }
      if (e.code == "ArrowDown") {
        hitArrowObjs["down"].release();
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

  class Score {
    constructor() {
      this.miss = 0;
      this.perfect = 0;
      this.ok = 0;
      this.great = 0;
      this.scoreCount = 0;
    }
    update(scoreType) {
      if (scoreType == "miss") {
        this.miss++;
        healthBar.decrement();
      } else {
        if (scoreType == "ok") {
          this.ok++;
          this.scoreCount += 1;
          healthBar.increment(1);
        }
        if (scoreType == "great") {
          this.great++;
          this.scoreCount += 3;
          healthBar.increment(3);
        }
        if (scoreType == "perfect") {
          this.perfect++;
          this.scoreCount += 5;
          healthBar.increment(5);
        }
      }
      scoreSpan.innerHTML = JSON.stringify(this);
    }
  }

  class HealthBar {
    constructor() {
      this.amountFilled = 0.5;
      this.xPos = 165;
      this.yPos = 0;
      this.tick = 0;
      this.animate = true;
      this.gradientColor = "green";
    }
    display() {
      let gradientImg;
      if (this.gradientColor == "green") {
        gradientImg = greenGradientImg;
      } else if (this.gradientColor == "rainbow") {
        gradientImg = rainbowGradientImg;
      }
      // first draw underlying bar
      p.fill("black");
      drawRectToScale(193, 5, 254, 32);

      p.fill("lime");
      // drawRectToScale(193, 5, 254 * this.amountFilled, 32);
      let gradientToDraw = gradientImg.get(
        this.tick % 254,
        0,
        254 * this.amountFilled,
        32
      );
      let dw = this.animate ? Math.sin(this.tick * 0.05) * 3 : 0;
      drawImageToScaleWithWidth(
        gradientToDraw,
        193,
        5,
        gradientToDraw.width + dw
      );

      //Draw frame over
      drawImageToScale(healthBarFrameImg, this.xPos, this.yPos);
      this.tick++;
    }
    increment(scaleFactor) {
      if (this.amountFilled < 1) {
        this.animate = true;
        this.amountFilled += 0.01;
        this.gradientColor = "green";
      } else if (this.amountFilled >= 1) {
        this.animate = false;
        this.gradientColor = "rainbow";
      }
    }
    decrement() {
      if (this.amountFilled > 0) {
        this.amountFilled -= 0.01;
        this.gradientColor = "green";
      }
    }
  }

  //Add functionality to animate when hit
  class HitArrow {
    constructor(direction, xPos, yPos) {
      this.direction = direction;
      this.imgToDraw = hitArrowImgs[direction];
      this.xPos = xPos;
      this.yPos = yPos;
      this.pressed = false;
      this.glowing = false;
      this.scale = 1;
      this.gradientOpacity = 0;
      this.animationIndex = 0;
      this.animationInterval;
      this.animationTimeout;
    }
    press(successfulHit) {
      this.pressed = true;
      this.scale = 1;
      this.animationIndex = 0;
      this.gradientOpacity = 0;
      let _this = this;
      clearInterval(this.animationInterval);
      clearTimeout(this.animationTimeout);
      this.animationInterval = setInterval(function () {
        _this.animationIndex++;
        let newScale = arrowHitSizeTimings[_this.animationIndex];
        if (newScale == null) {
          newScale = 1;
        }
        _this.scale = newScale;
        if (successfulHit) {
          _this.glowing = true;
          let gradientOpacity = arrowHitGradientTimings[_this.animationIndex];
          if (gradientOpacity == null) {
            gradientOpacity = 0;
            _this.glowing = false;
          }
          _this.gradientOpacity = gradientOpacity;
        }
      }, 10);

      this.animationTimeout = setTimeout(function () {
        clearInterval(_this.animationInterval);
      }, 500);
    }
    release() {
      this.pressed = false;
    }
    display() {
      //Draw arrow at scale
      let d = (this.imgToDraw.width * (1 - this.scale)) / 2;
      drawImageToScale(
        this.imgToDraw,
        this.xPos + d,
        this.yPos + d,
        this.scale
      );
    }
    displayGlow() {
      if (this.glowing) {
        let arrowMargin = 20;
        p.tint(255, this.gradientOpacity * 255);
        drawImageToScale(
          hitGlowImg,
          this.xPos - arrowMargin,
          this.yPos - arrowMargin
        );
        p.tint(255, 255);
      }
    }
  }

  class ComboText {
    constructor() {
      this.count = 0;
      this.showing = false;
      this.scale = 1;
      this.animationIndex = 0;
      this.animationInterval;
      this.hideTimeout;
    }
    incrementCombo() {
      this.count++;

      if (this.count >= 2) {
        this.showing = true;
        clearTimeout(this.hideTimeout);
        clearInterval(this.animationInterval);
        this.showing = true;
        this.animationIndex = 0;
        this.scale = 1;
        let _this = this;
        this.animationInterval = setInterval(function () {
          _this.animationIndex++;
          let newScale = hitAnimationTimings[_this.animationIndex];
          if (newScale == null) {
            newScale = 1;
          }
          _this.scale = newScale;
        }, 10);

        this.hideTimeout = setTimeout(function () {
          _this.showing = false;
          clearInterval(_this.animationInterval);
        }, 500);
      }
    }
    resetCombo() {
      this.count = 0;
      this.showing = false;
    }
    display() {
      //Calculate offset between number and comboTextImg
      let numberWidth;
      if (this.count < 10) {
        numberWidth = fonts.pinkDigits.size.width;
      } else if (this.count < 100) {
        numberWidth = fonts.pinkDigits.size.width * 2;
      }
      let xPos =
        (canvasSizeOriginal.width - (numberWidth + comboTextImg.width + 5)) / 2;
      if (this.showing && this.count >= 2) {
        drawImageToScale(comboTextImg, xPos + numberWidth + 5, 267, this.scale);
        drawText(this.count.toString(), "pinkDigits", this.scale, xPos, 240);
      }
    }
  }

  class FeedbackText {
    constructor() {
      this.showing = false;
      this.text = "OK";
      this.state = "ok";
      this.scale = 1;
      this.animationIndex = 0;
      this.animationInterval;
      this.hideTimeout;
    }
    updateState(newState, animate) {
      clearTimeout(this.hideTimeout);
      clearInterval(this.animationInterval);
      this.showing = true;
      this.animationIndex = 0;
      this.scale = 1;
      this.state = newState;
      if (this.state == "ok") {
        this.text = "OK";
      } else if (this.state == "great") {
        this.text = "GREAT";
      } else if (this.state == "perfect") {
        this.text = "PERFECT!";
      } else if (this.state == "early") {
        this.text = "Too early!";
      } else if (this.state == "late") {
        this.text = "Too late!";
      } else if (this.state == "miss") {
        this.text = "Miss";
      }
      let _this = this;
      if (animate) {
        this.animationInterval = setInterval(function () {
          _this.animationIndex++;
          let newScale = hitAnimationTimings[_this.animationIndex];
          if (newScale == null) {
            newScale = 1;
          }
          _this.scale = newScale;
        }, 10);
      }

      this.hideTimeout = setTimeout(function () {
        _this.showing = false;
        clearInterval(_this.animationInterval);
      }, 500);
    }
    display() {
      if (this.showing) {
        drawText(this.text, "mainYellow", this.scale, null, 150);
      }
    }
  }

  //////////////////////////
  // General Helpers      //
  //////////////////////////

  function hideCanvas() {
    //Add things we want to do when we leave this scene
    // gameEntered = false;
    // gameStarted = false;
  }

  p.windowResized = function () {
    calculateCanvasDimensions();
    p.resizeCanvas(canvasWidth, canvasHeight);
  };

  function drawRectToScale(x, y, width, height) {
    p.rect(
      x * scaleRatio,
      y * scaleRatio,
      width * scaleRatio,
      height * scaleRatio
    );
  }
  function drawImageToScale(img, x, y, scaleFactor) {
    if (scaleFactor) {
      p.image(
        img,
        x * scaleRatio,
        y * scaleRatio,
        img.width * scaleRatio * scaleFactor,
        img.height * scaleRatio * scaleFactor
      );
    } else {
      p.image(
        img,
        x * scaleRatio,
        y * scaleRatio,
        img.width * scaleRatio,
        img.height * scaleRatio
      );
    }
  }

  function drawImageToScaleWithWidth(img, x, y, width) {
    p.image(
      img,
      x * scaleRatio,
      y * scaleRatio,
      width * scaleRatio,
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

new p5(arrowScene, "arrow-canvas");
