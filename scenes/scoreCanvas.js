var score = function (p) {
  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;

  let scoreCanvas;
  let isCurrentScene = false;

  let numCanvasesLoaded = 0;
  let allCanvasesLoaded = false;

  let menuAnimationTimer = 0.0;

  let menuItems = [];
  let selectedMenuItemIndex = 1;

  let scoreData;
  let scoreSetup = false;

  let currentSongBanner;

  p.preload = function () {};

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);

    scoreCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    scoreCanvas.classList.add("gameCanvas");
    scoreCanvas.id = "scoreCanvas";

    p.noSmooth();

    p.noStroke();

    window.dispatchEvent(canvasLoadedEvent);

    setupNavigation(scoreCanvas);
  };

  p.draw = function () {
    p.clear();

    // Start drawing things if all canvases have loaded
    if (allCanvasesLoaded) {
      // console.log("all canvases loaded score");
      // drawText("Score", "pink", 1, null, 30);

      //Draw score banner
      if (scoreSetup) {
        drawImageToScale(
          currentSongBanner,
          320 - (currentSongBanner.width * 0.75) / 2,
          20,
          0.75
        );

        //Draw Ranking
        drawText(scoreData.ranking, "pink", 1, 50, 50);

        // Draw total
        displayNumberWithLeadingZeros(
          scoreData.scoreCount,
          7,
          80,
          360,
          "mainYellow"
        );

        // Draw PERFECT
        displayNumberWithLeadingZeros(
          scoreData.perfect,
          3,
          150,
          150,
          "greenHelper"
        );
        drawText("Perfect", "greenHelper", 1, null, 150);

        // Draw GREAT
        displayNumberWithLeadingZeros(
          scoreData.great,
          3,
          150,
          200,
          "greenHelper"
        );
        drawText("Great", "greenHelper", 1, null, 200);

        // Draw OK
        displayNumberWithLeadingZeros(scoreData.ok, 3, 150, 250, "greenHelper");
        drawText("O.K.", "greenHelper", 1, null, 250);

        // Draw MISS
        displayNumberWithLeadingZeros(
          scoreData.miss,
          3,
          150,
          300,
          "greenHelper"
        );
        drawText("Miss", "greenHelper", 1, null, 300);

        // Draw Continue
        if (Math.floor(globalClock.seconds) % 2 == 0) {
          drawText("PRESS ENTER TO CONTINUE", "greenHelper", 1, null, 430);
        }
      }
    }
  };

  function setupScore(scoreData) {
    currentSongBanner = songBannersImgs[scoreData.songId];
    scoreSetup = true;
  }

  function displayNumberWithLeadingZeros(
    number,
    totalDigits,
    xPos,
    yPos,
    fontName
  ) {
    let numberDigitLength = number.toString().length;
    let numOfZeros = totalDigits - numberDigitLength;
    let zerosString = "";
    for (var i = 0; i < numOfZeros; i++) {
      zerosString += "0";
    }

    // Draw zeros
    p.tint(255, 100);
    drawText(zerosString, fontName, 1, xPos, yPos);
    p.tint(255, 255);

    // Draw actual number
    drawText(
      number.toString(),
      fontName,
      1,
      xPos + numOfZeros * fonts[fontName].sets[0].size.width,
      yPos
    );
  }

  function animateMenuIn() {
    let menuItemToAnimate = 0;
    let menuItemStaggerTimer = setInterval(function () {
      menuItems[menuItemToAnimate].startAnimation();
      menuItemToAnimate++;
      if (menuItems[menuItemToAnimate] == null) {
        clearInterval(menuItemStaggerTimer);
      }
    }, 150);
  }

  function setupNavigation(thisCanvas) {
    p.noLoop();
    thisCanvas.addEventListener("showScene", (e) => {
      //Take in the score data
      scoreData = e.detail.scoreData;
      p.loop();

      setupScore(scoreData);

      setTimeout(function () {
        thisCanvas.style.visibility = "visible";
        thisCanvas.style.opacity = 1;
        // animateMenuIn();
        isCurrentScene = true;
      }, sceneTransitionTime);
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
    console.log(numCanvasesLoaded);
    if (numCanvasesLoaded == totalCanvases) {
      allCanvasesLoaded = true;
    }
  });

  function handleInput(keyCode) {
    //Handle case for menu navigation
    if (isCurrentScene) {
      //Select menu item
      if (keyCode == "Enter") {
        //Navigate back to song selector
        document
          .querySelector("#songSelectorCanvas")
          .dispatchEvent(showSceneEvent);
        scoreCanvas.dispatchEvent(hideSceneEvent);

        //Reset score stuff
        setTimeout(function () {
          scoreSetup = false;
          scoreData = null;
        }, sceneTransitionTime);
      }
    }
  }

  function padOrKeyrelease(direction) {
    // hitArrowObjs[direction].release();
    // assessHit(direction, "lift");
  }

  function directionToKeycode(direction) {
    let keyCode;
    switch (direction) {
      case "down":
        keyCode = "ArrowDown";
        break;
      case "up":
        keyCode = "ArrowUp";
        break;
      case "left":
        keyCode = "ArrowLeft";
        break;
      case "right":
        keyCode = "ArrowRight";
        break;
    }
    return keyCode;
  }
  window.addEventListener("padPress", function (e) {
    let direction = e.detail.direction;
    handleInput(directionToKeycode(direction));
  });
  window.addEventListener("padRelease", function (e) {
    let direction = e.detail.direction;
    handleInput(directionToKeycode(direction));
  });

  window.addEventListener("keydown", function (e) {
    //Ignore repeated keydown
    if (e.repeat) {
      return;
    }

    // Add logic for enabling audio context
    if (e.code == "Space") {
    }

    handleInput(e.code);
  });

  //Create a class for menu items
  // Create each one has an animation timer to calculate the offset
  class menuItem {
    constructor(menuText, xPos, yPos, action) {
      this.menuText = menuText;
      this.offset = 640 * scaleRatio;
      this.animationTimer = 0.0;
      this.yPos = yPos;
      this.xPos = yPos;
      this.action = action;
    }
    startAnimation() {
      // Create timer for animation menu overlay and text
      let _this = this;
      let menuFadeInterval = setInterval(function () {
        _this.animationTimer += 0.2;
        if (_this.animationTimer >= 1.0) {
          clearInterval(menuFadeInterval);
          _this.animationTimer = 1.0;
        }
      }, 30);
    }
    display() {
      // console.log("drawing menu item");
      p.push();
      p.translate(this.offset - this.offset * this.animationTimer, 0);
      drawText(this.menuText, "mainYellow", 1, null, this.yPos);
      p.pop();
    }
    select() {
      this.action(this.menuText);
    }
  }

  // function drawMenu() {
  //   let menuOpacity = 0.4;
  //   // console.log(menuOpacity);
  //   let overlayColor = `rgba(0,0,0,${menuOpacity})`;
  //   p.fill(p.color(overlayColor));
  //   p.rect(0, 0, p.width, p.height);
  //   menuItems.forEach(function (menuItem, index) {
  //     if (index != selectedMenuItemIndex) {
  //       menuItem.display();
  //     }
  //   });
  //   p.rect(0, 0, p.width, p.height);
  //   //Display selected menu item at full brightness
  //   menuItems[selectedMenuItemIndex].display();
  // }

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

  p.windowResized = function () {
    calculateCanvasDimensions();
    p.resizeCanvas(canvasWidth, canvasHeight);
    // resizeBackgroundCanvas();
  };

  // function resizeBackgroundCanvas() {
  //   // console.log(backgroundCanvas);
  //   let thisCanvas = document.querySelector("#titleCanvas");
  //   thisCanvas.style.transform = `translate(-50%, -50%) scale(${scaleRatio})`;
  // }

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

new p5(score, "score-canvas-container");
