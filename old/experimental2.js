let arrowCanvas;

let canvasSizeOriginal = { width: 640, height: 480 };
let canvasWidth = 640;
let canvasHeight = 480;

let track = document.querySelector("audio");
let startSongButton = document.querySelector("#startSong");

let enableStartButton = function () {
  startSongButton.innerHTML = "Click to start";
  startSongButton.disabled = false;
};

// const songPlayer = new Tone.Player("assets/audio/Heaven.OGG").toDestination();
const part1_bg_player = new Tone.Player(
  "assets/audio/RDD_p1_ambience_loop.mp3",
  enableStartButton
).toDestination();
part1_bg_player.loop = true;

const part2_bg_player = new Tone.Player(
  "assets/audio/RDD_p2_background.mp3"
).toDestination();
part2_bg_player.loop = false;

var arrowScene = function (p) {
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

  let reverseClock = new Tone.Clock((time) => {}, 1);

  let fontsToLoad = ["mainYellow", "pink"];

  //Experimental scene variables
  let waitForHit = true;
  let timerPaused = false;
  let t_holdLeftStart;
  let t_holdRightStart;
  let t_holdsFinished;
  let t_released;
  let attemptedHoldsOnce = false;
  let leftHoldNote;
  let rightHoldNote;

  let cueCount = 0;

  let animationIntervals = 50;

  //Is a list of text objects
  let narrativeTextObjs = [];
  let showingNarrativeHoldText = false;
  let part1HoldsDone = false;
  let part2Started = false;

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
    let songData = JSON.parse(part1);
    measureData = songData.measureData;
    songBpm = songData.bpm;
    // songBpm = 300;
    songDelay = songData.delay;
    secondsPerBeat = 1 / (songBpm / 60);
    t_holdLeftStart = secondsPerBeat * 4 * 26;
    t_holdRightStart = secondsPerBeat * 4 * 27;
    t_holdsFinished = secondsPerBeat * 4 * 34;

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
    if (showingNarrativeHoldText) {
    } else {
      // p.background("white");
      p.clear();
    }

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
    // comboObj.display();
    // healthBar.display();

    //draw narrative text
    narrativeTextObjs.forEach(function (textObj) {
      if (textObj.showing) {
        textObj.display();
      }
    });
  };

  function pauseTimer() {
    timerPaused = true;
    clock.pause();
  }

  function unpauseTimer() {
    timerPaused = false;
    clock.start();
  }

  function startReverseTimer() {
    reverseClock.start();
    t_released = t;
  }

  // we have repressed after originally reversing
  function resetReverseTimer() {
    reverseClock.stop();
  }

  function resetHoldNote(noteObj) {
    noteObj.isHolding = false;
    noteObj.isHit = false;
    noteObj.completedHold = false;
  }

  function updateNotes() {
    //Keep a queue of relevantNotes

    if (!part2Started) {
      if (reverseClock.seconds > 0) {
        t = t_released - reverseClock.seconds;
        if (t < t_holdRightStart) {
          resetHoldNote(rightHoldNote);
        }
        if (t < t_holdLeftStart) {
          resetHoldNote(leftHoldNote);
          t = t_holdLeftStart;
          // We always want to get back to this start position if released early...
          resetReverseTimer();
          clock.stop();
          attemptedHoldsOnce = true;
        }
      } else if (attemptedHoldsOnce) {
        t = clock.seconds + t_holdLeftStart;
      } else {
        t = clock.seconds;
      }
    } else {
      t = clock.seconds;
    }

    //Given current time, what is the current measure?

    currentBeat = t / secondsPerBeat;
    let thisMeasure = Math.floor(currentBeat / 4);
    if (thisMeasure > currentMeasure) {
      console.log("Measure: " + thisMeasure);
      currentMeasure = thisMeasure;

      //Initialize start of song
      if (currentMeasure == 0) {
        console.log("initializing");
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
              if (newNote.id == 44) {
                leftHoldNote = newNote;
              }
              if (newNote.id == 45) {
                rightHoldNote = newNote;
              }
            });
          }
        });
      }
    }
  }

  startSongButton.addEventListener("click", function () {
    //For negative songDelays, start song before notes
    if (songDelay < 0) {
      part1_bg_player.start();
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
        part1_bg_player.start();
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
      if (waitForHit) {
        if (yPos < hitArrowObjs["left"].yPos && !note.isHit) {
          pauseTimer();
        }
        // For experimental... note is a hit candidate only if it's within range and UNHIT
        if (
          yPos > -Infinity &&
          yPos < hitArrowObjs["left"].yPos + hitMargin &&
          !note.isHit
        ) {
          //Note within our hit window!
          note.isHitCandidate = true;
        } else {
          note.isHitCandidate = false;
        }
      } else {
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
        hideHoldTexts(note.id + 1);

        //Add logic for resetting for part 2
        if (!part1HoldsDone && cueCount == 46) {
          // Can we set a timer for the beat to start?
          hideHoldTexts();
          resetForPart2();
        }
      }
      note.display(yPos, passedOver);
    });
  }

  function resetForPart2() {
    part1HoldsDone = true;
    waitForHit = false;
    part2Started = true;

    part1_bg_player.stop();
    clock.stop();

    // Lets try resetting everything here!
    relevantNotes = [];
    currentBatchStartMeasure = 0;
    currentMeasure = -1;
    currentBeat = 0;
    pixelsElapsed = 0;

    let songData = JSON.parse(part2);
    measureData = songData.measureData;
    songBpm = songData.bpm;
    songDelay = songData.delay;
    secondsPerBeat = 1 / (songBpm / 60);
    animationIntervals = 10;
    let measuresUntilBeat = 1;
    let delayForBeat = measuresUntilBeat * 4 * secondsPerBeat;
    clock.start();
    setTimeout(function () {
      part2_bg_player.start();
    }, delayForBeat * 1000);
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
  //if no cue, hides all
  function hideHoldTexts(cue) {
    console.log("hide hold text");

    if (cue) {
      narrativeTextObjs.map(function (textObj) {
        if (
          textObj.cue == cue &&
          textObj.showing &&
          textObj.animationType == "hold"
        ) {
          textObj.hideHoldText();
        }
      });
    } else {
      narrativeTextObjs.map(function (textObj) {
        if (textObj.showing && textObj.animationType == "hold") {
          textObj.hideHoldText();
        }
      });
    }
  }
  function updateMiss(score, note) {
    // feedbackObj.updateState(score);
    comboObj.resetCombo();
    scoreData.update("miss");

    if (note.noteType == "hold") {
      hideHoldTexts(note.id + 1);
    }
  }
  function updateHit(score, note) {
    //Is this the first time hitting this note?
    if (!note.isHit) {
      if (timerPaused) {
        unpauseTimer();
      }
      // comboObj.incrementCombo();
      note.isHit = true;
      let scoreScale = 1;
      cueCount = parseInt(note.id) + 1;
      triggerNarrative(cueCount);
      if (score === "ok") {
        // feedbackObj.updateState("ok", true);
      } else if (score === "great") {
        // feedbackObj.updateState("great", true);
      } else if (score === "perfect") {
        // feedbackObj.updateState("perfect", true);
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

  // move hit arrows gradually over the course of 16s if both holds are being held....

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
          yPos > -Infinity &&
          yPos < hitArrowObjs["left"].yPos - 50 &&
          waitForHit
        ) {
          updateHit("ok", note);
        } else if (
          yPos > hitArrowObjs["left"].yPos - hitMargin &&
          yPos < hitArrowObjs["left"].yPos - 50 &&
          !waitForHit
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
          if (waitForHit) {
            pauseTimer();
            if (reverseClock.seconds == 0) {
              startReverseTimer();
            }
            note.holdPaused = true;
          } else {
            note.isHolding = false;
            note.completedHold = false;
          }
        }
        // Fade out any narrative texts for holds, for this cue
        hideHoldTexts(note.id + 1);
      }
      // add another case for re-pressing a hold
      // else if (
      //   hitType == "press" &&
      //   note.noteType == "hold" &&
      //   note.isHolding &&
      //   note.direction == direction
      // ) {
      //   //unpause timer if BOTH holds are holding...
      //   // timerPaused = false;
      //   note.holdPaused = false;
      //   // if (allHoldsUnpaused()) {
      //   //   unpauseTimer();
      //   // }
      //   unpauseTimer();
      // }
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
        if (waitForHit) {
          drawImageToScale(
            arrowImgs[this.direction],
            arrow_xPos[this.direction],
            Math.max(hitArrowObjs["left"].yPos, yPos)
          );
        } else {
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
            drawImageToScale(
              arrowImgs[this.direction],
              arrow_xPos[this.direction],
              yPos
            );
          }
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
      }, animationIntervals);

      this.animationTimeout = setTimeout(function () {
        clearInterval(_this.animationInterval);
      }, animationIntervals * 10);
    }
    release() {
      this.pressed = false;
    }
    display() {
      // Move hit arrows if time passes in part 2
      if (!part2Started && t > t_holdRightStart && t < t_holdsFinished) {
        let timeElapsed = t - t_holdRightStart;
        let percentageElapsed =
          timeElapsed / (t_holdsFinished - t_holdRightStart);
        let yPos = p.map(percentageElapsed, 0, 1, hitPos.y, hitPosFinal.y);
        this.yPos = yPos;
      }
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
        }, animationIntervals);

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
        }, animationIntervals);
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

  class NarrativeText {
    //Default animation type is bounce
    constructor(cue, text, xPos, yPos, animationType, font) {
      this.cue = cue;
      this.showing = false;
      this.text = text;
      this.scale = 1;
      this.opacity = 1;
      this.animationIndex = 0;
      this.animationInterval;
      this.hideTimeout;
      this.xPos = xPos;
      this.yPos = yPos;
      if (animationType) {
        this.animationType = animationType;
      } else {
        this.animationType = "bounce";
      }
      if (font) {
        this.font = font;
      } else {
        this.font = "mainYellow";
      }
    }

    animate() {
      if (!narrativeTextObjs.includes(this)) {
        narrativeTextObjs.push(this);
      }
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
      }, animationIntervals);

      if (this.animationType == "bounce") {
        let hideAfter = 2000;
        if (part2Started) {
          hideAfter = secondsPerBeat * 1000;
        }
        this.hideTimeout = setTimeout(function () {
          _this.showing = false;
          clearInterval(_this.animationInterval);
        }, hideAfter);
      }
    }
    hideHoldText() {
      clearTimeout(this.hideTimeout);
      clearInterval(this.animationInterval);
      this.showing = true;
      this.animationIndex = 0;
      let _this = this;

      this.animationInterval = setInterval(function () {
        _this.animationIndex++;
        let newScale = fadeOutTiming[_this.animationIndex];
        let newOpacity = fadeOutTiming[_this.animationIndex];
        if (newScale == null) {
          newScale = 1;
          newOpacity = 0;
        }
        _this.scale = newScale;
        _this.opacity = newOpacity;
      }, animationIntervals);

      this.hideTimeout = setTimeout(function () {
        _this.showing = false;
        clearInterval(_this.animationInterval);
      }, animationIntervals * 8);
    }
    display() {
      if (this.showing) {
        p.tint(255, this.opacity * 255);
        drawText(this.text, this.font, this.scale, this.xPos, this.yPos);
        p.tint(255, 255);
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

  function triggerNarrative(cueCount) {
    if (cueCount == 1) {
      let newText = new NarrativeText(cueCount, "I");
      newText.animate();
    }
    if (cueCount == 2) {
      let newText = new NarrativeText(cueCount, "find");
      newText.animate();
    }
    if (cueCount == 3) {
      let newText = new NarrativeText(cueCount, "myself");
      newText.animate();
    }
    if (cueCount == 4) {
      let newText = new NarrativeText(cueCount, "replaying");
      newText.animate();
    }
    if (cueCount == 5) {
      let newText = new NarrativeText(cueCount, "these");
      newText.animate();
    }
    if (cueCount == 6) {
      let newText = new NarrativeText(cueCount, "familiar");
      newText.animate();
    }
    if (cueCount == 7) {
      let newText = new NarrativeText(cueCount, "old");
      newText.animate();
    }
    if (cueCount == 8) {
      let newText = new NarrativeText(cueCount, "stories.");
      newText.animate();
    }
    if (cueCount == 9) {
      let newText = new NarrativeText(cueCount, "My", 100);
      newText.animate();
    }
    if (cueCount == 10) {
      let newText = new NarrativeText(cueCount, "mind", 300);
      newText.animate();
    }
    if (cueCount == 11) {
      let newText = new NarrativeText(cueCount, "for", 110, null, null, "pink");
      newText.animate();
    }
    if (cueCount == 12) {
      let newText = new NarrativeText(
        cueCount,
        "gets",
        290,
        null,
        null,
        "pink"
      );
      newText.animate();
    }
    if (cueCount == 13) {
      let newText = new NarrativeText(cueCount, "My", 200);
      newText.animate();
    }
    if (cueCount == 14) {
      let newText = new NarrativeText(cueCount, "body", 300);
      newText.animate();
    }
    if (cueCount == 15) {
      let newText = new NarrativeText(cueCount, "re", 26, null, null, "pink");
      newText.animate();
    }
    if (cueCount == 16) {
      let newText = new NarrativeText(
        cueCount,
        "members",
        146,
        null,
        null,
        "pink"
      );
      newText.animate();
    }
    if (cueCount == 17) {
      let newText = new NarrativeText(cueCount, "I", 44, 75);
      newText.animate();
    }
    if (cueCount == 18) {
      let newText = new NarrativeText(cueCount, "used", 97, 124);
      newText.animate();
    }
    if (cueCount == 19) {
      let newText = new NarrativeText(cueCount, "to", 284, 88);
      newText.animate();
    }
    if (cueCount == 20) {
      let newText = new NarrativeText(cueCount, "be", 321, 153);
      newText.animate();
    }
    if (cueCount == 21) {
      let newText = new NarrativeText(cueCount, "lieve", 401, 153);
      newText.animate();
    }
    if (cueCount == 22) {
      let newText = new NarrativeText(cueCount, "I", 117, 221);
      newText.animate();
    }
    if (cueCount == 23) {
      let newText = new NarrativeText(cueCount, "was", 177, 259);
      newText.animate();
    }

    if (cueCount == 24) {
      let newText = new NarrativeText(cueCount, "emp", 321, 234);
      newText.animate();
    }
    if (cueCount == 25) {
      let newText = new NarrativeText(cueCount, "ty,", 441, 234);
      newText.animate();
    }

    if (cueCount == 26) {
      let newText = new NarrativeText(cueCount, "a", 86, 355);
      newText.animate();
    }

    if (cueCount == 27) {
      let newText = new NarrativeText(cueCount, "blank", 156, 374);
      newText.animate();
    }

    if (cueCount == 28) {
      let newText = new NarrativeText(cueCount, "slate", 380, 339);
      newText.animate();
    }

    if (cueCount == 29) {
      let newText = new NarrativeText(cueCount, "I", 60, 132);
      newText.animate();
    }

    if (cueCount == 30) {
      let newText = new NarrativeText(cueCount, "was", 140, 132);
      newText.animate();
    }

    if (cueCount == 31) {
      let newText = new NarrativeText(cueCount, "looking", 300, 132);
      newText.animate();
    }
    if (cueCount == 32) {
      let newText = new NarrativeText(cueCount, "for", 60, 210);
      newText.animate();
    }
    if (cueCount == 33) {
      let newText = new NarrativeText(cueCount, "a", 220, 210);
      newText.animate();
    }
    if (cueCount == 34) {
      let newText = new NarrativeText(cueCount, "witness", 300, 210);
      newText.animate();
    }
    if (cueCount == 35) {
      let newText = new NarrativeText(cueCount, "all", 140, 289);
      newText.animate();
    }
    if (cueCount == 36) {
      let newText = new NarrativeText(cueCount, "along", 300, 289);
      newText.animate();
    }
    if (cueCount == 37) {
      let newText = new NarrativeText(cueCount, "I");
      newText.animate();
    }
    if (cueCount == 38) {
      let newText = new NarrativeText(cueCount, "have");
      newText.animate();
    }
    if (cueCount == 39) {
      let newText = new NarrativeText(cueCount, "learned");
      newText.animate();
    }
    if (cueCount == 40) {
      let newText = new NarrativeText(cueCount, "to");
      newText.animate();
    }
    if (cueCount == 41) {
      let newText = new NarrativeText(cueCount, "stay");
      newText.animate();
    }
    if (cueCount == 42) {
      let newText = new NarrativeText(cueCount, "in");
      newText.animate();
    }
    if (cueCount == 43) {
      let newText = new NarrativeText(cueCount, "constant");
      newText.animate();
    }
    if (cueCount == 44) {
      let newText = new NarrativeText(cueCount, "motion");
      newText.animate();
    }
    if (cueCount == 45) {
      let text1 = new NarrativeText(cueCount, "but to", 34, 171, "hold");

      let text2 = new NarrativeText(cueCount, "hold", 30, 256, "hold", "pink");

      text1.animate();
      text2.animate();
    }
    if (cueCount == 46) {
      let text1 = new NarrativeText(cueCount, "is to be", 320, 171, "hold");
      let text2 = new NarrativeText(cueCount, "held", 360, 256, "hold", "pink");
      text1.animate();
      text2.animate();
    }

    // PART 2

    if (cueCount == 47) {
      let text1 = new NarrativeText(cueCount, "I");
      text1.animate();
    }

    if (cueCount == 48) {
      let text1 = new NarrativeText(cueCount, "can");
      text1.animate();
    }
    if (cueCount == 49) {
      let text1 = new NarrativeText(cueCount, "be-");
      text1.animate();
    }
    if (cueCount == 50) {
      let text1 = new NarrativeText(cueCount, "-lieve");
      text1.animate();
    }
    if (cueCount == 51) {
      let text1 = new NarrativeText(cueCount, "in");
      text1.animate();
    }
    if (cueCount == 52) {
      let text1 = new NarrativeText(cueCount, "the");
      text1.animate();
    }
    if (cueCount == 53) {
      let text1 = new NarrativeText(cueCount, "truth");
      text1.animate();
    }
    if (cueCount == 54) {
      let text1 = new NarrativeText(cueCount, "of");
      text1.animate();
    }
    if (cueCount == 55) {
      let text1 = new NarrativeText(cueCount, "sen-");
      text1.animate();
    }
    if (cueCount == 56) {
      let text1 = new NarrativeText(cueCount, "-sations");
      text1.animate();
    }
    // There are clues in the hunch of my shoulders
    if (cueCount == 57) {
      let text1 = new NarrativeText(cueCount, "There");
      text1.animate();
    }
    if (cueCount == 58) {
      let text1 = new NarrativeText(cueCount, "are");
      text1.animate();
    }
    if (cueCount == 59) {
      let text1 = new NarrativeText(cueCount, "clues");
      text1.animate();
    }
    if (cueCount == 60) {
      let text1 = new NarrativeText(cueCount, "in");
      text1.animate();
    }
    if (cueCount == 61) {
      let text1 = new NarrativeText(cueCount, "the");
      text1.animate();
    }
    if (cueCount == 62) {
      let text1 = new NarrativeText(cueCount, "hunch");
      text1.animate();
    }
    if (cueCount == 63) {
      let text1 = new NarrativeText(cueCount, "of");
      text1.animate();
    }
    if (cueCount == 64) {
      let text1 = new NarrativeText(cueCount, "my");
      text1.animate();
    }
    if (cueCount == 65) {
      let text1 = new NarrativeText(cueCount, "shoul", 50, 211, "hold", "pink");
      text1.animate();
    }
    if (cueCount == 66) {
      let text1 = new NarrativeText(cueCount, "ders", 350, 211, "hold", "pink");
      text1.animate();
    }
    //There is wisdom in the sinking of my chest
    if (cueCount == 67) {
      let text1 = new NarrativeText(cueCount, "There");
      text1.animate();
    }
    if (cueCount == 68) {
      let text1 = new NarrativeText(cueCount, "is");
      text1.animate();
    }
    if (cueCount == 69) {
      let text1 = new NarrativeText(cueCount, "wisdom");
      text1.animate();
    }
    if (cueCount == 70) {
      let text1 = new NarrativeText(cueCount, "in");
      text1.animate();
    }
    if (cueCount == 71) {
      let text1 = new NarrativeText(cueCount, "the");
      text1.animate();
    }
    if (cueCount == 72) {
      let text1 = new NarrativeText(cueCount, "sinking");
      text1.animate();
    }
    if (cueCount == 73) {
      let text1 = new NarrativeText(cueCount, "of");
      text1.animate();
    }
    if (cueCount == 74) {
      let text1 = new NarrativeText(cueCount, "my");
      text1.animate();
    }
    if (cueCount == 75) {
      let text1 = new NarrativeText(cueCount, "che", 170, 211, "hold", "pink");
      text1.animate();
    }
    if (cueCount == 76) {
      let text1 = new NarrativeText(cueCount, "st", 350, 211, "hold", "pink");
      text1.animate();
    }
    //There is wisdom in the sinking of my chest
    if (cueCount == 77) {
      let text1 = new NarrativeText(cueCount, "There");
      text1.animate();
    }
    if (cueCount == 78) {
      let text1 = new NarrativeText(cueCount, "are");
      text1.animate();
    }
    if (cueCount == 79) {
      let text1 = new NarrativeText(cueCount, "signs");
      text1.animate();
    }
    if (cueCount == 80) {
      let text1 = new NarrativeText(cueCount, "in");
      text1.animate();
    }
    if (cueCount == 81) {
      let text1 = new NarrativeText(cueCount, "the");
      text1.animate();
    }
    if (cueCount == 82) {
      let text1 = new NarrativeText(cueCount, "clench");
      text1.animate();
    }
    if (cueCount == 83) {
      let text1 = new NarrativeText(cueCount, "of");
      text1.animate();
    }
    if (cueCount == 84) {
      let text1 = new NarrativeText(cueCount, "my");
      text1.animate();
    }
    if (cueCount == 85) {
      let text1 = new NarrativeText(cueCount, "ja", 200, 211, "hold", "pink");
      text1.animate();
    }
    if (cueCount == 86) {
      let text1 = new NarrativeText(cueCount, "ws", 320, 211, "hold", "pink");
      text1.animate();
    }
    //There is wisdom in the sinking of my chest
    if (cueCount == 87) {
      let text1 = new NarrativeText(cueCount, "There");
      text1.animate();
    }
    if (cueCount == 88) {
      let text1 = new NarrativeText(cueCount, "is");
      text1.animate();
    }
    if (cueCount == 89) {
      let text1 = new NarrativeText(cueCount, "life");
      text1.animate();
    }
    if (cueCount == 90) {
      let text1 = new NarrativeText(cueCount, "in");
      text1.animate();
    }
    if (cueCount == 91) {
      let text1 = new NarrativeText(cueCount, "the");
      text1.animate();
    }
    if (cueCount == 92) {
      let text1 = new NarrativeText(cueCount, "ache");
      text1.animate();
    }
    if (cueCount == 93) {
      let text1 = new NarrativeText(cueCount, "of");
      text1.animate();
    }
    if (cueCount == 94) {
      let text1 = new NarrativeText(cueCount, "my");
      text1.animate();
    }
    if (cueCount == 95) {
      let text1 = new NarrativeText(cueCount, "hea", 170, 211, "hold", "pink");
      text1.animate();
    }
    if (cueCount == 96) {
      let text1 = new NarrativeText(cueCount, "rt", 350, 211, "hold", "pink");
      text1.animate();
    }
    //What do I want
    if (cueCount == 97) {
      let text1 = new NarrativeText(
        cueCount,
        "What do I want?",
        null,
        null,
        "hold"
      );
      text1.animate();
    }
    if (cueCount == 98) {
      let text1 = new NarrativeText(
        cueCount,
        "In this body",
        null,
        171,
        "hold"
      );
      let text2 = new NarrativeText(cueCount, "of mine?", null, 250, "hold");
      text1.animate();
      text2.animate();
    }
    //I want to rupture
    if (cueCount == 99) {
      let text1 = new NarrativeText(cueCount, "I want to", null, 171, "hold");
      let text2 = new NarrativeText(
        cueCount,
        "rupture",
        null,
        250,
        "hold",
        "pink"
      );
      text1.animate();
      text2.animate();
    }
    //I want to repair
    if (cueCount == 100) {
      let text1 = new NarrativeText(cueCount, "I want to", null, 171, "hold");
      let text2 = new NarrativeText(
        cueCount,
        "repair",
        null,
        250,
        "hold",
        "pink"
      );
      text1.animate();
      text2.animate();
    }
    //I want to hurt
    if (cueCount == 101) {
      let text1 = new NarrativeText(cueCount, "I want to", null, 171, "hold");
      let text2 = new NarrativeText(
        cueCount,
        "hurt",
        null,
        250,
        "hold",
        "pink"
      );
      text1.animate();
      text2.animate();
    }
    //I want to heal
    if (cueCount == 102) {
      let text1 = new NarrativeText(cueCount, "I want to", null, 171, "hold");
      let text2 = new NarrativeText(
        cueCount,
        "heal",
        null,
        250,
        "hold",
        "pink"
      );
      text1.animate();
      text2.animate();
    }
    //I want to be won
    if (cueCount == 103) {
      let text1 = new NarrativeText(
        cueCount,
        "I want to be",
        null,
        171,
        "hold"
      );
      let text2 = new NarrativeText(cueCount, "won", null, 250, "hold", "pink");
      text1.animate();
      text2.animate();
    }
    //I want to be lost
    if (cueCount == 104) {
      let text1 = new NarrativeText(
        cueCount,
        "I want to be",
        null,
        171,
        "hold"
      );
      let text2 = new NarrativeText(
        cueCount,
        "be lost",
        null,
        250,
        "hold",
        "pink"
      );
      text1.animate();
      text2.animate();
    }
    //I want to be held
    if (cueCount == 105) {
      let text1 = new NarrativeText(
        cueCount,
        "I want to be",
        null,
        171,
        "hold"
      );
      let text2 = new NarrativeText(
        cueCount,
        "held",
        null,
        250,
        "hold",
        "pink"
      );
      text1.animate();
      text2.animate();
    }
    //I want to be released
    if (cueCount == 106) {
      let text1 = new NarrativeText(
        cueCount,
        "I want to be",
        null,
        171,
        "hold"
      );
      let text2 = new NarrativeText(
        cueCount,
        "released",
        null,
        250,
        "hold",
        "pink"
      );
      text1.animate();
      text2.animate();
    }
    // I wanted to become an artist
    if (cueCount == 107) {
      let text1 = new NarrativeText(cueCount, "I wanted to", null, 171, "hold");
      let text2 = new NarrativeText(
        cueCount,
        "become an artist",
        null,
        250,
        "hold"
      );
      text1.animate();
      text2.animate();
    }
    // I wanted redemption
    if (cueCount == 108) {
      let text1 = new NarrativeText(cueCount, "I wanted", null, 171, "hold");
      let text2 = new NarrativeText(cueCount, "redemption", null, 250, "hold");
      text1.animate();
      text2.animate();
    }
    // To make something
    if (cueCount == 109) {
      let text1 = new NarrativeText(cueCount, "To make", null, 171, "hold");
      let text2 = new NarrativeText(cueCount, "something", null, 250, "hold");
      text1.animate();
      text2.animate();
    }
    // To make something
    if (cueCount == 110) {
      let text1 = new NarrativeText(cueCount, "From", null, 171, "hold");
      let text2 = new NarrativeText(cueCount, "nothing", null, 250, "hold");
      text1.animate();
      text2.animate();
    }

    // Now I see I've been
    if (cueCount == 111) {
      let text1 = new NarrativeText(cueCount, "Now", 40, 10);
      text1.animate();
    }

    if (cueCount == 112) {
      let text1 = new NarrativeText(cueCount, "Now I", 40, 10);
      text1.animate();
    }

    if (cueCount == 113) {
      let text1 = new NarrativeText(cueCount, "Now I see", 40, 10);
      text1.animate();
    }

    if (cueCount == 114) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
    }

    if (cueCount == 115) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been", 160, 95);
      text2.animate();
    }

    // The con sis tent and

    if (cueCount == 116) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
    }

    if (cueCount == 117) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "con", 40, 171);
      text3.animate();
    }
    if (cueCount == 118) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consis", 40, 171);
      text3.animate();
    }
    if (cueCount == 119) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent", 40, 171);
      text3.animate();
    }
    if (cueCount == 120) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
    }
    //re lia ble per son

    if (cueCount == 121) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "re", 160, 250);
      text4.animate();
    }

    if (cueCount == 122) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "relia", 160, 250);
      text4.animate();
    }

    if (cueCount == 123) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "reliable", 160, 250);
      text4.animate();
    }

    if (cueCount == 124) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "reliable", 160, 250);
      text4.animate();
      let text5 = new NarrativeText(cueCount, "per", 60, 308);
      text5.animate();
    }

    if (cueCount == 125) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "reliable", 160, 250);
      text4.animate();
      let text5 = new NarrativeText(cueCount, "person", 60, 308);
      text5.animate();
    }

    // I've nee ded all along

    if (cueCount == 126) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "reliable", 160, 250);
      text4.animate();
      let text5 = new NarrativeText(cueCount, "person I've", 100, 308);
      text5.animate();
    }

    if (cueCount == 127) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "reliable", 160, 250);
      text4.animate();
      let text5 = new NarrativeText(cueCount, "person I've", 100, 308);
      text5.animate();
      let text6 = new NarrativeText(cueCount, "need", 0, 384);
      text6.animate();
    }

    if (cueCount == 128) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "reliable", 160, 250);
      text4.animate();
      let text5 = new NarrativeText(cueCount, "person I've", 100, 308);
      text5.animate();
      let text6 = new NarrativeText(cueCount, "needed", 0, 384);
      text6.animate();
    }
    if (cueCount == 129) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "reliable", 160, 250);
      text4.animate();
      let text5 = new NarrativeText(cueCount, "person I've", 100, 308);
      text5.animate();
      let text6 = new NarrativeText(cueCount, "needed all", 0, 384);
      text6.animate();
    }

    if (cueCount == 130) {
      let text1 = new NarrativeText(cueCount, "Now I see I've", 40, 10);
      text1.animate();
      let text2 = new NarrativeText(cueCount, "been the", 160, 95);
      text2.animate();
      let text3 = new NarrativeText(cueCount, "consistent and", 40, 171);
      text3.animate();
      let text4 = new NarrativeText(cueCount, "reliable", 160, 250);
      text4.animate();
      let text5 = new NarrativeText(cueCount, "person I've", 100, 308);
      text5.animate();
      let text6 = new NarrativeText(cueCount, "need all along", 0, 384);
      text6.animate();
    }

    // I create
    if (cueCount == 131) {
      let text1 = new NarrativeText(cueCount, "I create to", null, 171, "hold");

      text1.animate();
    }

    // to see
    if (cueCount == 132) {
      let text1 = new NarrativeText(cueCount, "see", null, 250, "hold", "pink");
      text1.animate();
    }

    // I create
    if (cueCount == 133) {
      let text1 = new NarrativeText(cueCount, "I create to", null, 171, "hold");

      text1.animate();
    }

    //to be seen
    if (cueCount == 134) {
      let text1 = new NarrativeText(
        cueCount,
        "be seen",
        null,
        250,
        "hold",
        "pink"
      );

      text1.animate();
    }

    // Can you see me?

    if (cueCount == 135) {
      let text1 = new NarrativeText(cueCount, "Can", 180);
      text1.animate();
    }
    if (cueCount == 136) {
      let text1 = new NarrativeText(cueCount, "Can you", 180);
      text1.animate();
    }
    if (cueCount == 137) {
      let text1 = new NarrativeText(cueCount, "see", 180, null, null, "pink");
      text1.animate();
    }
    if (cueCount == 138) {
      let text1 = new NarrativeText(cueCount, "me?", 340, null, null, "pink");
      text1.animate();
    }

    // Can you see you?

    if (cueCount == 139) {
      let text1 = new NarrativeText(cueCount, "Can", 180);
      text1.animate();
    }
    if (cueCount == 140) {
      let text1 = new NarrativeText(cueCount, "Can you", 340);
      text1.animate();
    }
    if (cueCount == 141) {
      let text1 = new NarrativeText(cueCount, "see", 160, null, null, "pink");
      text1.animate();
    }
    if (cueCount == 142) {
      let text1 = new NarrativeText(cueCount, "you?", 320, null, null, "pink");
      text1.animate();
    }

    // Can you reach me?

    if (cueCount == 143) {
      let text1 = new NarrativeText(cueCount, "Can", 180);
      text1.animate();
    }
    if (cueCount == 144) {
      let text1 = new NarrativeText(cueCount, "Can you", 180);
      text1.animate();
    }
    if (cueCount == 145) {
      let text1 = new NarrativeText(cueCount, "reach", 143, null, null, "pink");
      text1.animate();
    }
    if (cueCount == 146) {
      let text1 = new NarrativeText(cueCount, "me?", 383, null, null, "pink");
      text1.animate();
    }

    // Can you reach you?

    if (cueCount == 147) {
      let text1 = new NarrativeText(cueCount, "Can", 180);
      text1.animate();
    }
    if (cueCount == 148) {
      let text1 = new NarrativeText(cueCount, "Can you", 180);
      text1.animate();
    }
    if (cueCount == 149) {
      let text1 = new NarrativeText(cueCount, "reach", 120, null, null, "pink");
      text1.animate();
    }
    if (cueCount == 150) {
      let text1 = new NarrativeText(cueCount, "you?", 360, null, null, "pink");
      text1.animate();
    }
    // Can you feel me?

    if (cueCount == 151) {
      let text1 = new NarrativeText(cueCount, "Can", 180);
      text1.animate();
    }
    if (cueCount == 152) {
      let text1 = new NarrativeText(cueCount, "Can you", 180);

      text1.animate();
    }
    if (cueCount == 153) {
      let text1 = new NarrativeText(cueCount, "feel", 160, null, null, "pink");
      text1.animate();
    }
    if (cueCount == 154) {
      let text1 = new NarrativeText(cueCount, "me?", 360, null, null, "pink");
      text1.animate();
    }

    // Can you feel you?

    if (cueCount == 155) {
      let text1 = new NarrativeText(cueCount, "Can", 180);
      text1.animate();
    }
    if (cueCount == 156) {
      let text1 = new NarrativeText(cueCount, "Can you", 180);
      text1.animate();
    }
    if (cueCount == 157) {
      let text1 = new NarrativeText(cueCount, "feel", 140, null, null, "pink");
      text1.animate();
    }
    if (cueCount == 158) {
      let text1 = new NarrativeText(cueCount, "you?", 340, null, null, "pink");
      text1.animate();
    }

    // Can you know ne?

    if (cueCount == 159) {
      let text1 = new NarrativeText(cueCount, "Can", 180);
      text1.animate();
    }
    if (cueCount == 160) {
      let text1 = new NarrativeText(cueCount, "Can you", 180);
      text1.animate();
    }
    if (cueCount == 161) {
      let text1 = new NarrativeText(cueCount, "know", 140, null, null, "pink");
      text1.animate();
    }
    if (cueCount == 162) {
      let text1 = new NarrativeText(cueCount, "me?", 360, null, null, "pink");
      text1.animate();
    }

    // Can you feel you?
    if (cueCount == 163) {
      let text1 = new NarrativeText(cueCount, "Can", 180);
      text1.animate();
    }
    if (cueCount == 164) {
      let text1 = new NarrativeText(cueCount, "Can you", 180);
      text1.animate();
    }
    if (cueCount == 165) {
      let text1 = new NarrativeText(cueCount, "know", 140, null, null, "pink");
      text1.animate();
    }
    if (cueCount == 166) {
      let text1 = new NarrativeText(cueCount, "you?", 340, null, null, "pink");
      text1.animate();
    }

    // Will you run?
    if (cueCount == 167) {
      let text1 = new NarrativeText(cueCount, "Will", 180);
      text1.animate();
    }
    if (cueCount == 168) {
      let text1 = new NarrativeText(cueCount, "Will you", 180);
      text1.animate();
    }
    if (cueCount == 169) {
      let text1 = new NarrativeText(cueCount, "run", 240, null, "hold", "pink");
      text1.animate();
    }
    if (cueCount == 170) {
      let text1 = new NarrativeText(cueCount, "?", 360, null, "hold", "pink");
      text1.animate();
    }
    // Will you stay?
    if (cueCount == 171) {
      let text1 = new NarrativeText(cueCount, "Will", 180);
      text1.animate();
    }
    if (cueCount == 172) {
      let text1 = new NarrativeText(cueCount, "Will you", 180);
      text1.animate();
    }
    if (cueCount == 173) {
      let text1 = new NarrativeText(
        cueCount,
        "stay",
        220,
        null,
        "hold",
        "pink"
      );
      text1.animate();
    }
    if (cueCount == 174) {
      let text1 = new NarrativeText(cueCount, "?", 380, null, "hold", "pink");
      text1.animate();
    }
    // Will you stop?
    if (cueCount == 175) {
      let text1 = new NarrativeText(cueCount, "Will", 180);
      text1.animate();
    }
    if (cueCount == 176) {
      let text1 = new NarrativeText(cueCount, "Will you", 180);
      text1.animate();
    }
    if (cueCount == 177) {
      let text1 = new NarrativeText(
        cueCount,
        "stop",
        220,
        null,
        "hold",
        "pink"
      );
      text1.animate();
    }
    if (cueCount == 178) {
      let text1 = new NarrativeText(cueCount, "?", 380, null, "hold", "pink");
      text1.animate();
    }
    // Will you play?
    if (cueCount == 179) {
      let text1 = new NarrativeText(cueCount, "Will", 180);
      text1.animate();
    }
    if (cueCount == 180) {
      let text1 = new NarrativeText(cueCount, "Will you", 180);
      text1.animate();
    }
    if (cueCount == 181) {
      let text1 = new NarrativeText(
        cueCount,
        "play",
        220,
        null,
        "hold",
        "pink"
      );
      text1.animate();
    }
    if (cueCount == 182) {
      let text1 = new NarrativeText(cueCount, "?", 380, null, "hold", "pink");
      text1.animate();
    }
    // Will you fight?
    if (cueCount == 183) {
      let text1 = new NarrativeText(cueCount, "Will", 180);
      text1.animate();
    }
    if (cueCount == 184) {
      let text1 = new NarrativeText(cueCount, "Will you", 180);
      text1.animate();
    }
    if (cueCount == 185) {
      let text1 = new NarrativeText(
        cueCount,
        "fight",
        200,
        null,
        "hold",
        "pink"
      );
      text1.animate();
    }
    if (cueCount == 186) {
      let text1 = new NarrativeText(cueCount, "?", 400, null, "hold", "pink");
      text1.animate();
    }
    // Will you flee?
    if (cueCount == 187) {
      let text1 = new NarrativeText(cueCount, "Will", 180);
      text1.animate();
    }
    if (cueCount == 188) {
      let text1 = new NarrativeText(cueCount, "Will you", 180);
      text1.animate();
    }
    if (cueCount == 189) {
      let text1 = new NarrativeText(
        cueCount,
        "flee",
        220,
        null,
        "hold",
        "pink"
      );
      text1.animate();
    }
    if (cueCount == 190) {
      let text1 = new NarrativeText(cueCount, "?", 380, null, "hold", "pink");
      text1.animate();
    }
    // Will you fawn?
    if (cueCount == 191) {
      let text1 = new NarrativeText(cueCount, "Will", 180);
      text1.animate();
    }
    if (cueCount == 192) {
      let text1 = new NarrativeText(cueCount, "Will you", 180);
      text1.animate();
    }
    if (cueCount == 193) {
      let text1 = new NarrativeText(
        cueCount,
        "fawn",
        220,
        null,
        "hold",
        "pink"
      );
      text1.animate();
    }
    if (cueCount == 194) {
      let text1 = new NarrativeText(cueCount, "?", 380, null, "hold", "pink");
      text1.animate();
    }
    // Will you freeze?
    if (cueCount == 195) {
      let text1 = new NarrativeText(cueCount, "Will", 180);
      text1.animate();
    }
    if (cueCount == 196) {
      let text1 = new NarrativeText(cueCount, "Will you", 180);
      text1.animate();
    }
    if (cueCount == 197) {
      let text1 = new NarrativeText(
        cueCount,
        "freeze",
        180,
        null,
        "hold",
        "pink"
      );
      text1.animate();
    }
    if (cueCount == 198) {
      let text1 = new NarrativeText(cueCount, "?", 420, null, "hold", "pink");
      text1.animate();
    }

    // Lose me
    if (cueCount == 199) {
      let text1 = new NarrativeText(cueCount, "Lose", null, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 200) {
      let text1 = new NarrativeText(
        cueCount,
        "Lose",
        null,
        null,
        "hold",
        "pink"
      );
      text1.animate();
      let text2 = new NarrativeText(cueCount, "me", null, 250, "hold");
      text2.animate();
    }

    // Win me
    if (cueCount == 201) {
      let text1 = new NarrativeText(cueCount, "Win", null, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 202) {
      let text1 = new NarrativeText(cueCount, "Win", null, null, "hold");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "me", null, 250);
      text2.animate();
    }

    // Hurt me
    if (cueCount == 203) {
      let text1 = new NarrativeText(cueCount, "Hurt", null, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 204) {
      let text1 = new NarrativeText(
        cueCount,
        "Hurt",
        null,
        171,
        "hold",
        "pink"
      );
      text1.animate();
      let text2 = new NarrativeText(cueCount, "me", null, 250, "hold");
      text2.animate();
    }

    // Heal me
    if (cueCount == 205) {
      let text1 = new NarrativeText(cueCount, "Heal", null, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 206) {
      let text1 = new NarrativeText(cueCount, "Heal", null, 171, "hold");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "me", null, 250, "hold");
      text2.animate();
    }

    // Love me
    if (cueCount == 207) {
      let text1 = new NarrativeText(cueCount, "Lo", 240, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 208) {
      let text1 = new NarrativeText(cueCount, "ve", 320, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 209) {
      let text1 = new NarrativeText(cueCount, "Lo", 240, 171, "hold", "pink");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "m", 280, 250, "hold");
      text2.animate();
    }
    if (cueCount == 210) {
      let text1 = new NarrativeText(cueCount, "ve", 320, 171, "hold", "pink");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "e", 320, 250, "hold");
      text2.animate();
    }

    // Fear me
    if (cueCount == 211) {
      let text1 = new NarrativeText(cueCount, "Fe", 240, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 212) {
      let text1 = new NarrativeText(cueCount, "ar", 320, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 213) {
      let text1 = new NarrativeText(cueCount, "Fe", 240, 171, "hold", "pink");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "m", 280, 250, "hold");
      text2.animate();
    }
    if (cueCount == 214) {
      let text1 = new NarrativeText(cueCount, "ar", 320, 171, "hold", "pink");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "e", 320, 250, "hold");
      text2.animate();
    }

    // Hold me
    if (cueCount == 215) {
      let text1 = new NarrativeText(cueCount, "Ho", 240, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 216) {
      let text1 = new NarrativeText(cueCount, "ld", 320, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 217) {
      let text1 = new NarrativeText(cueCount, "Ho", 240, 171, "hold", "pink");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "m", 280, 250, "hold");
      text2.animate();
    }
    if (cueCount == 218) {
      let text1 = new NarrativeText(cueCount, "ld", 320, 171, "hold", "pink");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "e", 320, 250, "hold");
      text2.animate();
    }

    // Release me
    if (cueCount == 219) {
      let text1 = new NarrativeText(cueCount, "Re", 180, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 220) {
      let text1 = new NarrativeText(cueCount, "lease", 260, 171, null, "pink");
      text1.animate();
    }
    if (cueCount == 221) {
      let text1 = new NarrativeText(cueCount, "Re", 180, 171, "hold", "pink");
      text1.animate();
      let text2 = new NarrativeText(cueCount, "m", 280, 250, "hold");
      text2.animate();
    }
    if (cueCount == 222) {
      let text1 = new NarrativeText(
        cueCount,
        "lease",
        260,
        171,
        "hold",
        "pink"
      );
      text1.animate();
      let text2 = new NarrativeText(cueCount, "e", 320, 250, "hold");
      text2.animate();
    }
  }
};

new p5(arrowScene, "arrow-canvas");
