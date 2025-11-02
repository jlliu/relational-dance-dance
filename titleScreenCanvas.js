const audioCtx = new AudioContext();

// Code for title screen

// const title_player = new Tone.Player(
//   "assets/audio/RDD_p2_drum_loop.mp3",
//   startSong
// ).toDestination();
// title_player.loop = true;
// title_player.volume.value = -5;
// title_player.fadeOut = 4;

function startSong() {
  title_player.stop();
  title_player.start();
}
var title = function (p) {
  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;
  let mouse_x;
  let mouse_y;
  let rightButton;
  let leftButton;

  let titleCanvas;
  let isCurrentScene = true;

  let logoImg;
  let startTextImg;

  let numCanvasesLoaded = 0;
  let allCanvasesLoaded = false;

  let menuVisible = false;

  let menuAnimationTimer = 0.0;

  let menuItems = [];
  let selectedMenuItemIndex = 0;

  let clock = new Tone.Clock((time) => {}, 1);

  // Setup all fonts in this file
  let fontsToLoad = ["mainYellow", "pink", "greenHelper", "whitePixel"];

  p.preload = function () {
    //Preload a background here
    //Preload whatever needs to be preloaded

    // shader = p.loadShader("shaders/basic.vert", "shaders/basic.frag");
    logoImg = p.loadImage("assets/RDD-logo.png");
    startTextImg = p.loadImage("assets/startText.png");

    fontsToLoad.forEach(function (fontName) {
      fonts[fontName].sets.forEach(function (fontSet) {
        fontSet.imgObj = p.loadImage(fontSet.src);
      });
    });
  };

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);

    titleCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    titleCanvas.classList.add("gameCanvas");
    titleCanvas.id = "titleCanvas";

    p.noSmooth();

    p.noStroke();

    clock.start();

    fontsToLoad.forEach(function (fontName) {
      setupFont(fontName);
    });

    menuItems = [
      new menuItem("STORY MODE", null, 80, startStoryMode),
      new menuItem("ARCADE MODE", null, 160, startArcadeMode),
      new menuItem("SETTINGS", null, 240, showSettings),
      new menuItem("CREDITS", null, 320, showCredits),
    ];

    window.dispatchEvent(canvasLoadedEvent);

    setupNavigation(titleCanvas);
  };

  p.draw = function () {
    p.clear();

    // If auto is not running, display the click to start
    if (audioCtx.state == "running") {
      let enableAudioOverlay = document.querySelector("#enableAudio-overlay");
      enableAudioOverlay.style.display = "none";
    } else {
      let enableAudioOverlay = document.querySelector("#enableAudio-overlay");
      enableAudioOverlay.style.display = "flex";
    }

    // Start drawing things if all canvases have loaded
    if (allCanvasesLoaded) {
      drawImageToScale(logoImg, 94, 176);
      // Draw Title Screen Elements
      if (!menuVisible) {
        if (Math.floor(clock.seconds) % 2 == 0) {
          drawText("PRESS ENTER TO START", "greenHelper", 1, null, 430);
        }
      } else {
        // Draw Menu Screen Elements
        drawMenu();
        if (Math.floor(clock.seconds) % 2 == 0) {
          drawText("PRESS ENTER TO SELECT", "greenHelper", 1, null, 430);
        }
      }
    }
  };

  function setupNavigation(thisCanvas) {
    thisCanvas.addEventListener("showScene", (e) => {
      p.loop();
      isCurrentScene = true;
      setTimeout(function () {
        thisCanvas.style.visibility = "visible";
        thisCanvas.style.opacity = 1;
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

  function showCredits() {
    console.log("show credits");
  }

  function showSettings() {
    console.log("show settings");
  }

  function startArcadeMode() {
    console.log("start Arcade mode");
  }

  function startStoryMode() {
    console.log("start story mode");

    // Show tutorial
    // document.getElementById("tutorial").dispatchEvent(showSceneEvent);
    // Show difficulty (for testing)
    document.getElementById("difficultyCanvas").dispatchEvent(showSceneEvent);

    titleCanvas.dispatchEvent(hideSceneEvent);

    // document.getElementById("revelationCanvas").dispatchEvent(showSceneEvent);
    // let showBackgroundShaderEvent = new CustomEvent("showScene", {
    //   detail: {
    //     shaderType: "radialGlow",
    //     songIndex: 2,
    //   },
    // });

    // document
    //   .getElementById("backgroundCanvas")
    //   .dispatchEvent(showBackgroundShaderEvent);

    // document.getElementById("backgroundCanvas").dispatchEvent(hideSceneEvent);
  }

  function handleInput(keyCode) {
    // let songStarted = title_player.state == "started";

    // if (allCanvasesLoaded && songStarted) {
    if (allCanvasesLoaded && isCurrentScene) {
      //Handle case for first key press (Any), which shows menu
      if (!menuVisible && keyCode == "Enter") {
        //Display menu for the first time
        menuVisible = true;
        //Create stagggered animation for menu items
        let menuItemToAnimate = 0;
        let menuItemStaggerTimer = setInterval(function () {
          menuItems[menuItemToAnimate].startAnimation();
          menuItemToAnimate++;
          if (menuItems[menuItemToAnimate] == null) {
            clearInterval(menuItemStaggerTimer);
          }
        }, 150);

        // Create timer for animation menu overlay and text
        let menuFadeInterval = setInterval(function () {
          menuAnimationTimer += 0.2;
          if (menuAnimationTimer >= 1.0) {
            clearInterval(menuFadeInterval);
            menuAnimationTimer = 1.0;
          }
        }, 30);
      } else {
        //Handle case for menu navigation
        if (keyCode == "ArrowDown" || keyCode == "KeyS") {
          if (selectedMenuItemIndex < menuItems.length - 1) {
            selectedMenuItemIndex++;
          }
        }
        if (keyCode == "ArrowUp" || keyCode == "KeyW") {
          if (selectedMenuItemIndex > 0) {
            selectedMenuItemIndex--;
          }
        }
        //Select menu item
        if (keyCode == "Enter") {
          menuItems[selectedMenuItemIndex].select();
        }
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
      if (audioCtx.state == "suspended") {
        audioCtx.resume();
        // startSong();
        Tone.start();
      }
    }

    // Handle key press after game load
    // let songStarted =
    //   title_player.state == "started" && audioCtx.state == "running";
    // if (songStarted) {
    //   handleInput(e.code);
    // }

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
      this.action();
    }
  }

  function drawMenu() {
    let menuOpacity = menuAnimationTimer * 0.5;

    // console.log(menuOpacity);
    let overlayColor = `rgba(0,0,0,${menuOpacity})`;

    p.fill(p.color(overlayColor));

    p.rect(0, 0, p.width, p.height);

    menuItems.forEach(function (menuItem, index) {
      if (index != selectedMenuItemIndex) {
        menuItem.display();
      }
    });

    p.rect(0, 0, p.width, p.height);

    //Display selected menu item at full brightness
    menuItems[selectedMenuItemIndex].display();
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

new p5(title, "title-canvas-container");
