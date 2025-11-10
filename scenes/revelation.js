var revelation = function (p) {
  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;

  let revelationCanvas;
  let isCurrentScene = false;

  let numCanvasesLoaded = 0;
  let allCanvasesLoaded = false;

  let typingAnimationTimer;
  let typingIndex = 0;
  let lineShown = 0;
  let charsInLineShown = 0;

  let thisSongIndex = 0;

  let scoreData;

  let revelations = [
    // 0. Walking on Eggshells
    ['"Thank you for', "trying to", 'keep me safe"'],
    // 1. Kung Fu Fawning
    ["Thank you for", "showing your capacity", 'for compassion"'],
    // 2. Chasing Breadcrumbs
    ['"Thank you for', "being in search", 'of connection"'],
    // 3. Lone Ranger
    ['"Thank you for', "wanting to soften", 'the pain"'],
    // 4. Filling the Void
    ['"Thank you for', "trying to keep me", 'moving forward"'],
  ];

  p.preload = function () {};

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);

    revelationCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    revelationCanvas.classList.add("gameCanvas");
    revelationCanvas.id = "revelationCanvas";

    p.noSmooth();

    p.noStroke();

    window.dispatchEvent(canvasLoadedEvent);

    setupNavigation(revelationCanvas);
  };

  p.draw = function () {
    p.clear();

    // Start drawing things if all canvases have loaded
    if (allCanvasesLoaded) {
      let lines = revelations[thisSongIndex];
      let yPos = 160;
      //Iterate through each line...
      lines.forEach(function (line, index) {
        let textToDraw = "";
        //Given the current typing Index, decide if this line should be shown or not, and how much text is in it...
        if (index <= lineShown) {
          if (index == lineShown) {
            textToDraw = line.slice(0, charsInLineShown);
          } else {
            textToDraw = line;
          }
        }
        drawText(textToDraw, "whitePixel", 1, null, yPos);
        yPos += 50;
      });
    }
  };

  function animateScene() {
    setTimeout(function () {
      let lines = revelations[thisSongIndex];
      let typingAnimationTimer = setInterval(function () {
        charsInLineShown++;
        //Reach the end of line, increment line shown
        if (charsInLineShown == lines[lineShown].length) {
          lineShown++;
          charsInLineShown = 0;
          if (lineShown == lines.length) {
            // END OF TYPING ANIMATION
            clearInterval(typingAnimationTimer);
            document
              .querySelector("#backgroundCanvas")
              .dispatchEvent(endRevelationSceneEvent);
            setTimeout(function () {
              // Transition to UNLOCK scene
              let unlockCanvas = document.querySelector("#unlockCanvas");

              // Hide revelation scene
              setTimeout(function () {
                revelationCanvas.dispatchEvent(hideSceneEvent);
              }, 2000);
              //Show unlock scene after background transition
              setTimeout(function () {
                let showUnlockFromRevelation = new CustomEvent("showScene", {
                  detail: {
                    prevScene: "revelation",
                    scoreData: scoreData,
                  },
                });
                unlockCanvas.dispatchEvent(showUnlockFromRevelation);
              }, 4000);
            }, 2000);
          }
        }
      }, 110);
    }, revelationGlowTime * 1000);
  }

  function setupNavigation(thisCanvas) {
    p.noLoop();
    thisCanvas.addEventListener("showScene", (e) => {
      thisSongIndex = e.detail.songIndex;
      scoreData = e.detail.scoreData;

      p.loop();

      setTimeout(function () {
        thisCanvas.style.visibility = "visible";
        thisCanvas.style.opacity = 1;
        isCurrentScene = true;
        animateScene();
      }, sceneTransitionTime);
    });
    thisCanvas.addEventListener("hideScene", (e) => {
      p.noLoop();
      isCurrentScene = false;
      thisCanvas.style.opacity = 0;

      setTimeout(function () {
        thisCanvas.style.visibility = "hidden";
        //Reset properties
        typingIndex = 0;
        lineShown = 0;
        charsInLineShown = 0;
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

  function handleInput(keyCode) {
    //Handle case for menu navigation
    if (isCurrentScene) {
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

new p5(revelation, "revelation-canvas-container");
