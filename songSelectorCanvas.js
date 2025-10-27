var songSelector = function (p) {
  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;

  let songSelectorCanvas;
  let isCurrentScene = false;

  let logoImg;
  let startTextImg;

  let numCanvasesLoaded = 0;
  let allCanvasesLoaded = false;

  let menuAnimationTimer = 0.0;

  let menuItems = [];
  let selectedMenuItemIndex = 0;

  let songBannersSpritesheet;
  let songBannersImgs = [];
  let songCdsSpritesheet;
  let songCdsImgs = [];
  let banner = { w: 400, h: 125 };
  let cd = { w: 281, h: 176 };
  let currentCdQueue = [];

  const originalCdPositions = [-500, -250, 0, 250, 500];
  let currentCdPositions = [-500, -250, 0, 250, 500];
  // const originalCdPositions = [-300, -150, 0, 150, 300];
  // let currentCdPositions = [-300, -150, 0, 150, 300];

  const originalCdScales = [0.5, 0.75, 1, 0.75, 0.5];
  let currentCdScales = [0.5, 0.75, 1, 0.75, 0.5];

  let clock = new Tone.Clock((time) => {}, 1);

  p.preload = function () {
    songBannersSpritesheet = p.loadImage("songAssets/songBanners.png");
    songCdsSpritesheet = p.loadImage("songAssets/songCds.png");
  };

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);

    songSelectorCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    songSelectorCanvas.classList.add("gameCanvas");
    songSelectorCanvas.id = "songSelectorCanvas";

    //Initialize song assets
    for (var i = 0; i < 6; i++) {
      let thisBannerImg = songBannersSpritesheet.get(
        0,
        banner.h * i,
        banner.w,
        banner.h
      );
      songBannersImgs.push(thisBannerImg);
      let thisCdImg = songCdsSpritesheet.get(0, cd.h * i, cd.w, cd.h);
      songCdsImgs.push(thisCdImg);
    }

    p.noSmooth();

    p.noStroke();

    clock.start();

    menuItems = [
      new menuItem(0, null, 80, selectSong),
      new menuItem(1, null, 160, selectSong),
      new menuItem(2, null, 240, selectSong),
      new menuItem(3, null, 240, selectSong),
      new menuItem(4, null, 240, selectSong),
      new menuItem(5, null, 240, selectSong),
    ];

    resetCdQueue(selectedMenuItemIndex);

    window.dispatchEvent(canvasLoadedEvent);

    setupNavigation(songSelectorCanvas);
  };

  p.draw = function () {
    p.clear();
    // Start drawing things if all canvases have loaded
    if (allCanvasesLoaded) {
      drawText(`${storyModeDifficulty} mode`, "mainYellow", 1, null, 10);

      drawMenu();

      let currentSongBanner = songBannersImgs[currentCdQueue[2]];
      drawImageToScale(
        currentSongBanner,
        320 - currentSongBanner.width / 2,
        75
      );
      if (Math.floor(clock.seconds) % 2 == 0) {
        drawText("PRESS ENTER TO SELECT", "greenHelper", 1, null, 430);
      }
    }
  };

  // function animateMenuIn() {
  //   let menuItemToAnimate = 0;
  //   let menuItemStaggerTimer = setInterval(function () {
  //     menuItems[menuItemToAnimate].startAnimation();
  //     menuItemToAnimate++;
  //     if (menuItems[menuItemToAnimate] == null) {
  //       clearInterval(menuItemStaggerTimer);
  //     }
  //   }, 150);
  // }

  function setupNavigation(thisCanvas) {
    p.noLoop();
    thisCanvas.addEventListener("showScene", (e) => {
      p.loop();
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
    if (numCanvasesLoaded == totalCanvases) {
      allCanvasesLoaded = true;
    }
  });

  function selectSong(option) {
    console.log("selecting song: " + option);
  }

  function handleInput(keyCode) {
    //Handle case for menu navigation
    if (isCurrentScene) {
      if (keyCode == "ArrowLeft" || keyCode == "KeyA") {
        selectedMenuItemIndex--;
      }
      if (keyCode == "ArrowRight" || keyCode == "KeyD") {
        console.log("going right");
        animateMenu("right");
        //Animate menu to the right
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
    constructor(songId, xPos, yPos, action) {
      this.songId = songId;
      this.title = songList[songId].title;
      this.bannerImg = songBannersImgs[songId];
      this.cdImg = songCdsImgs[songId];
      this.offset = 640 * scaleRatio;
      this.animationTimer = 0.0;
      this.yPos = yPos;
      this.xPos = yPos;
      this.action = action;
    }
    // startAnimation() {
    //   // Create timer for animation menu overlay and text
    //   let _this = this;
    //   let menuFadeInterval = setInterval(function () {
    //     _this.animationTimer += 0.2;
    //     if (_this.animationTimer >= 1.0) {
    //       clearInterval(menuFadeInterval);
    //       _this.animationTimer = 1.0;
    //     }
    //   }, 30);
    // }
    display() {
      // console.log("drawing menu item");
      p.push();
      // p.translate(this.offset - this.offset * this.animationTimer, 0);
      // drawText(this.menuText, "mainYellow", 1, null, this.yPos);
      // Draw cd
      drawImageToScale(this.cdImg, 179, 225);
      p.pop();
    }
    select() {
      this.action(this.menuText);
    }
  }

  function parabolaY(x) {
    return -0.001 * x ** 2;
  }

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  //Returns the songs IDS (0-5) of the current queue as a list... and resets the positions
  // Input index is an int that can be negative or positive in any direction....
  function resetCdQueue(index) {
    currentCdPositions = originalCdPositions.slice();
    currentCdScales = originalCdScales.slice();

    currentCdQueue = [
      mod(index - 2, menuItems.length),
      mod(index - 1, menuItems.length),
      mod(index, menuItems.length),
      mod(index + 1, menuItems.length),
      mod(index + 2, menuItems.length),
    ];
  }
  function drawMenu() {
    p.push();
    p.translate((640 / 2) * scaleRatio, 320 * scaleRatio);
    //Current position is number 0-4 of visible CD position
    let currentPositionIndex = 0;
    currentCdQueue.forEach(function (cdIndex) {
      // console.log(cdIndex);
      let xPos_original = currentCdPositions[currentPositionIndex];

      let yPos_original = parabolaY(xPos_original);

      let currentScale = currentCdScales[currentPositionIndex];

      drawImageToScale(
        menuItems[cdIndex].cdImg,
        xPos_original - (cd.w * currentScale) / 2,
        yPos_original - (cd.h * currentScale) / 2,
        currentScale
      );
      currentPositionIndex++;
    });

    p.pop();
    //Rotatin menu needs to show 3 at a time
    //This is currentIndex, and the one before, and one after it
    //We set 3 points of a parabola for these 3 locations...
    //When right / left button is pressed, trigger animation that shifts the queue right or left, updating the positions of CDs on the parabola
  }

  function animateMenu(direction) {
    if (direction == "right") {
      let menuAnimationInterval = setInterval(function () {
        // calculate the amount this has elapsed by how much the center one has moved
        let amountElapsed =
          (currentCdPositions[2] - originalCdPositions[2]) /
          originalCdPositions[3];
        //If we've succcessfully swapped, then cancel the interval and reset the menu

        // Each tick, increment the position and update...
        currentCdPositions.forEach(function (xPos, index) {
          currentCdPositions[index] += 15;
        });
        currentCdScales.forEach(function (scale, index) {
          //Make ones on left get bigger
          if (index <= 1) {
            currentCdScales[index] =
              originalCdScales[index] + amountElapsed * 0.25;
          }
          //Make ones on right get smaller
          if (index >= 2) {
            currentCdScales[index] =
              originalCdScales[index] - amountElapsed * 0.25;
          }
        });

        if (currentCdPositions[0] >= originalCdPositions[1]) {
          selectedMenuItemIndex--;
          resetCdQueue(selectedMenuItemIndex);
          clearInterval(menuAnimationInterval);
        }
      }, 20);
    }
    if (direction == "left") {
    }
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

  // Animates a sprite given the images as frames, based on a certain interval, with optional callback
  function intervalAnimation(sprite, frames, interval, callback) {
    currentlyAnimating = true;
    let original = sprite.buttonDefault;
    frames.forEach(function (img, index) {
      setTimeout(function () {
        timedAnimationIndex = (index + 1) % frames.length;
        sprite.buttonDefault = img;
      }, interval * index);
    });
    // Another for the last frame
    setTimeout(function () {
      currentlyAnimating = false;
      sprite.buttonDefault = original;
      if (callback) {
        callback();
      }
    }, interval * frames.length);
  }

  function drawImageToScale(img, x, y, extraScalar) {
    if (!extraScalar) {
      extraScalar = 1;
    }

    p.image(
      img,
      x * scaleRatio,
      y * scaleRatio,
      img.width * scaleRatio * extraScalar,
      img.height * scaleRatio * extraScalar
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

new p5(songSelector, "songSelector-canvas-container");
