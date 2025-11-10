let arrowCanvas;

let canvasSizeOriginal = { width: 640, height: 480 };
let canvasWidth = 640;
let canvasHeight = 480;

let track = document.querySelector("audio");
let startSongButton = document.querySelector("#startSong");

const songPlayer = new Tone.Player("assets/audio/Heaven.OGG").toDestination();
// const songPlayer = new Tone.Player("assets/audio/Curry Up.mp3").toDestination();

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

  let holdMiddleImg;
  let holdEndImgs;
  let comboTextImg;
  let healthBarFrameImg;
  let greenGradientImg;
  let rainbowGradientImg;
  let hitGlowImg;

  //relevantNotes stores an array of note objects
  let relevantNotes = [];
  let hitMargin = 70;
  let measureData;
  let songBpm;
  let songDelay;
  let secondsPerBeat;

  let hitArrowObjs = {};
  let feedbackObj;
  let comboObj;
  let scoreData;
  let healthBar;
  let scoreSpan = document.querySelector("#score");

  // current batch num is the measure of the current batch
  let batchSize = 2;
  let currentBatchStartMeasure = 0;
  let currentMeasure = -1;
  let t = 0;
  let currentBeat = 0;
  let pixelsElapsed = 0;
  let pixelsPerBeat = 100;

  let clock = new Tone.Clock((time) => {}, 1);

  let fontsToLoad = ["mainYellow", "pink"];

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

    fontsToLoad.forEach(function (fontName) {
      fonts[fontName].sets.forEach(function (fontSet) {
        fontSet.imgObj = p.loadImage(fontSet.src);
      });
    });
    // fonts.mainYellow.imgObj = p.loadImage(fonts.mainYellow.src);
    // fonts.pinkDigits.imgObj = p.loadImage(fonts.pinkDigits.src);
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

    // let songData = JSON.parse(heavenSongData);
    let songData = JSON.parse(heaven);
    measureData = songData.measureData;
    songBpm = songData.bpm;
    songDelay = songData.delay;
    secondsPerBeat = 1 / (songBpm / 60);

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

    holdMiddleImg.loadPixels();
    Object.values(arrowImgs).forEach(function (imgObj) {
      imgObj.loadPixels();
    });
    Object.values(holdEndImgs).forEach(function (imgObj) {
      imgObj.loadPixels();
    });

    // Setup fonts
    setupFont("mainYellow");
    setupFont("pink");
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

    feedbackObj.display();
    comboObj.display();
    healthBar.display();
  };

  function updateNotes() {
    //Keep a queue of relevantNotes
    t = clock.seconds;
    //Given current time, what is the current measure?
    currentBeat = t / secondsPerBeat;
    let thisMeasure = Math.floor(currentBeat / 4);
    if (thisMeasure > currentMeasure) {
      console.log("Measure: " + thisMeasure);
      currentMeasure = thisMeasure;

      //Initialize start of song
      if (currentMeasure == 0) {
        let measuresInBatch = measureData.slice(
          currentBatchStartMeasure,
          currentBatchStartMeasure + batchSize
        );
        measuresInBatch.forEach(function (measure) {
          //If measure has notes, add contents into relevantNotes
          if (measure) {
            measure.forEach(function (note) {
              let newNote = new Note(note);
              relevantNotes.push(newNote);
            });
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
        let measuresInBatch = measureData.slice(
          currentBatchStartMeasure,
          currentBatchStartMeasure + batchSize
        );
        measuresInBatch.forEach(function (measure) {
          if (measure) {
            //If measure has notes, add contents into relevantNotes
            measure.forEach(function (note) {
              let newNote = new Note(note);
              relevantNotes.push(newNote);
            });
          }
        });
      }
    }
  }

  startSongButton.addEventListener("click", function () {
    //For negative songDelays, start song before notes
    if (songDelay < 0) {
      songPlayer.start();
      setTimeout(function () {
        setInterval(function () {
          updateNotes();
          updateArrowRainbow();
        }, 10);
        startDrawingArrows = true;
        //Start a tone.js clock to keep time
        clock.start();
      }, -songDelay * 1000);
    } else {
      // For positive songDelays, startNotes before song
      setInterval(function () {
        updateNotes();
        updateArrowRainbow();
      }, 10);
      startDrawingArrows = true;
      //Start a tone.js clock to keep time
      clock.start();

      setTimeout(function () {
        songPlayer.start();
      }, songDelay * 1000);
    }
  });

  //Create arrows takes the relevant notes array and then creates objects for them

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
        yPos > hitArrowObjs["left"].yPos - hitMargin &&
        yPos < hitArrowObjs["left"].yPos + hitMargin
      ) {
        //Note within our hit window!
        note.isHitCandidate = true;
      } else if (yPos < hitArrowObjs["left"].yPos - hitMargin) {
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
      note.display(yPos, passedOver);
    });
  }

  function updateArrowRainbow() {
    convertArrowImgToRainbow(holdMiddleImg);
    Object.values(arrowImgs).forEach(function (arrowImg) {
      convertArrowImgToRainbow(arrowImg);
    });
    Object.values(holdEndImgs).forEach(function (arrowImg) {
      convertArrowImgToRainbow(arrowImg);
    });
  }

  function convertArrowImgToRainbow(imgObj) {
    // Iterates across each pixel in the canvas
    // let arrowImg = arrowImgs["left"];
    let currentHue = (t * 50) % 360;
    let rgb = hsl2rgb(currentHue, 0.97, 0.6);
    for (let y = 0; y < imgObj.height; y++) {
      for (let x = 0; x < imgObj.width; x++) {
        // Gets the index of the red value for this pixel
        let redIndex = (x + y * imgObj.width) * 4;
        let greenIndex = redIndex + 1;
        let blueIndex = redIndex + 2;
        let alphaIndex = redIndex + 3;
        let isWhite =
          imgObj.pixels[redIndex] == 255 &&
          imgObj.pixels[greenIndex] == 255 &&
          imgObj.pixels[blueIndex] == 255 &&
          imgObj.pixels[alphaIndex] == 255;
        let isTransparent =
          imgObj.pixels[redIndex] == 0 &&
          imgObj.pixels[greenIndex] == 0 &&
          imgObj.pixels[blueIndex] == 0 &&
          imgObj.pixels[alphaIndex] == 0;
        if (!isWhite && !isTransparent) {
          imgObj.pixels[redIndex] = rgb[0] * 255; // Red value
          imgObj.pixels[greenIndex] = rgb[1] * 255; // Green value
          imgObj.pixels[blueIndex] = rgb[2] * 255; // Blue value
          imgObj.pixels[alphaIndex] = 255; // Alpha value
        }
      }
    }
    // console.log("updating pixels");
    imgObj.updatePixels();
  }

  function setupFont(fontName) {
    let fontSets = fonts[fontName].sets;
    fontSets.forEach(function (fontSet) {
      let size = fontSet.size;
      let imgObj = fontSet.imgObj;
      let columns = imgObj.width / size.width;
      let rows = imgObj.height / size.height;
      fontSet.charSet.forEach(function (character, index) {
        let startingX = (index % columns) * size.width;
        let startingY = Math.floor(index / columns) * size.height;
        let charImg = imgObj.get(startingX, startingY, size.width, size.height);
        fonts[fontName].charsToImgs[character] = charImg;
        fonts[fontName].charsToImgs[character].size = {
          width: size.width,
          height: size.height,
        };
      });
    });
  }

  // Draw text centered on the screen or at a certain position if specified
  function drawText(textToDraw, fontName, scaleFactor, start_xPos, start_yPos) {
    if (scaleFactor == null) {
      scaleFactor = 1;
    }
    //Automatically center if position not specified
    let charsToDraw = textToDraw.split("");
    //Calculate width based on width of each char
    // let wordWidth = charsToDraw.length * fonts[fontName].size.width;
    let wordWidth = 0;
    let wordHeight = 0;
    let char_xPositions = [];
    charsToDraw.forEach(function (char) {
      char_xPositions.push(wordWidth);
      wordWidth += fonts[fontName].charsToImgs[char].size.width;
      wordHeight = fonts[fontName].charsToImgs[char].size.height;
    });

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
      let xPos = start_xPos + char_xPositions[index] * scaleFactor;
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
          yPos > hitArrowObjs["left"].yPos - hitMargin &&
          yPos < hitArrowObjs["left"].yPos - 50
        ) {
          updateMiss("late", note);
        }
        // A little late - Ok - PASS
        else if (
          yPos >= hitArrowObjs["left"].yPos - 50 &&
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
          yPos < hitArrowObjs["left"].yPos + 50
        ) {
          updateHit("ok", note);
          hitSuccessful = true;
        }
        // TOO EARLY - Failed
        else if (
          yPos >= hitArrowObjs["left"].yPos + 60 &&
          yPos < hitArrowObjs["left"].yPos + hitMargin
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

  function padOrKeypress(direction) {
    let hitSuccessful = assessHit(direction, "press");
    hitArrowObjs[direction].press(hitSuccessful);
  }
  function padOrKeyrelease(direction) {
    hitArrowObjs[direction].release();
    assessHit(direction, "lift");
  }
  window.addEventListener("padPress", function (e) {
    let direction = e.detail.direction;
    padOrKeypress(direction);
  });
  window.addEventListener("padRelease", function (e) {
    let direction = e.detail.direction;
    padOrKeyrelease(direction);
  });

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
        padOrKeypress("left");
      }
      if (e.code == "ArrowRight") {
        padOrKeypress("right");
      }
      if (e.code == "ArrowUp") {
        padOrKeypress("up");
      }
      if (e.code == "ArrowDown") {
        padOrKeypress("down");
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
        padOrKeyrelease("left");
      }
      if (e.code == "ArrowRight") {
        padOrKeyrelease("right");
      }
      if (e.code == "ArrowUp") {
        padOrKeyrelease("up");
      }
      if (e.code == "ArrowDown") {
        padOrKeyrelease("down");
      }
    }
  });

  // track.addEventListener("timeupdate", updateNotes);

  ////////////////////////////////////////////
  // -------------- SCENES --------------- //
  //////////////////////////////////////////

  // // Game 1
  // function displayGame() {
  //   //Do things we need to do when entered minigame
  //   if (gameEntered && !gameStarted) {
  //     console.log("GAME ENTERED!");
  //     gameStarted = true;
  //   }
  //   p.image(bg, 0, 0, canvasWidth, canvasHeight);

  //   // Display Sprites

  //   // Navigation
  //   rightButton.display();
  //   leftButton.display();
  // }

  // CLASSES

  class Note {
    constructor(noteData) {
      this.id = noteData.id;
      this.direction = noteData.direction;
      this.startBeat = noteData.startBeat;
      this.startTime = noteData.startTime;
      this.noteType = noteData.noteType;
      this.measure = noteData.measure;
      this.endTime = noteData.endTime;
      this.endBeat = noteData.endBeat;
      this.endMeasure = noteData.endMeasure;
    }
    display(yPos, passedOver) {
      // Draw instant notes
      if (this.noteType == "instant" && !this.isHit) {
        if (passedOver) {
          //Draw passed over notes greyed out
          p.tint(255, 127);
          drawImageToScale(
            arrowImgs[this.direction],
            arrow_xPos[this.direction],
            yPos
          );
          p.tint(255, 255);
        } else {
          //Draw upcoming notes iwth rainbow
          // p.tint(255, 0, 0);
          // arrowImgs[note.direction].filter(p.INVERT);
          drawImageToScale(
            arrowImgs[this.direction],
            arrow_xPos[this.direction],
            yPos
          );
          // p.tint(255, 255, 255);
        }
      } else if (this.noteType == "hold") {
        // Draw holds
        let rectangleHeight;
        if (this.isHit && this.isHolding && !this.completedHold) {
          // hit first note, is currently holding in the middle of hold
          rectangleHeight = pixelsPerBeat * (this.endBeat - currentBeat);
          // Draw rectangle
          drawImageToScaleWithHeight(
            holdMiddleImg,
            arrow_xPos[this.direction],
            hitArrowObjs["left"].yPos + 40,
            rectangleHeight
          );
          // Draw arrow at end of rectangle
          drawImageToScale(
            holdEndImgs[this.direction],
            arrow_xPos[this.direction],
            hitArrowObjs["left"].yPos + rectangleHeight
          );
          // Draw arrow at hit pos
          drawImageToScale(
            arrowImgs[this.direction],
            arrow_xPos[this.direction],
            hitArrowObjs["left"].yPos
          );
        } else if (this.isHit && !this.isHolding && !this.completedHold) {
          //   case 2: hit first note, lifted up before end
          //   What happens? need to grey out and keep on going
          p.tint(255, 127);
          rectangleHeight = pixelsPerBeat * (this.endBeat - this.releasedBeat);
          let yPosReleased =
            hitArrowObjs["left"].yPos +
            pixelsPerBeat * this.releasedBeat -
            pixelsElapsed;
          // Draw rectangle
          drawImageToScaleWithHeight(
            holdMiddleImg,
            arrow_xPos[this.direction],
            yPosReleased + 40,
            rectangleHeight
          );
          // Draw arrow at end of rectangle
          drawImageToScale(
            holdEndImgs[this.direction],
            arrow_xPos[this.direction],
            yPosReleased + rectangleHeight
          );
          // Draw arrow at hit pos
          drawImageToScale(
            arrowImgs[this.direction],
            arrow_xPos[this.direction],
            yPosReleased
          );
          p.tint(255, 255);
          // If you're still holding down...
        } else if (this.isHit && this.completedHold) {
          // case 3: hit first note, held to completion... show nothing!
        } else if (!this.isHit) {
          // last case: the note is not hit, either passed over or upcoming...
          if (passedOver) {
            p.tint(255, 127);
          }
          rectangleHeight = pixelsPerBeat * (this.endBeat - this.startBeat);
          drawImageToScaleWithHeight(
            holdMiddleImg,
            arrow_xPos[this.direction],
            yPos + 40,
            rectangleHeight
          );
          drawImageToScale(
            arrowImgs[this.direction],
            arrow_xPos[this.direction],
            yPos
          );
          drawImageToScale(
            holdEndImgs[this.direction],
            arrow_xPos[this.direction],
            yPos + rectangleHeight
          );
          if (passedOver) {
            p.tint(255, 255);
          }
        }
      }
    }
  }

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
        Math.max(1, 254 * this.amountFilled),
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
        _this.glowing = false;
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
      let digitWidth = fonts.pink.charsToImgs["1"].size.width;
      if (this.count < 10) {
        numberWidth = digitWidth;
      } else if (this.count < 100) {
        numberWidth = digitWidth * 2;
      } else if (this.count >= 100) {
        numberWidth = digitWidth * 3;
      }
      let xPos =
        (canvasSizeOriginal.width - (numberWidth + comboTextImg.width + 5)) / 2;
      if (this.showing && this.count >= 2) {
        drawImageToScale(comboTextImg, xPos + numberWidth + 5, 267, this.scale);
        drawText(this.count.toString(), "pink", this.scale, xPos, 240);
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
