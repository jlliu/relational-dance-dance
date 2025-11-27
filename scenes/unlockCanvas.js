var unlock = function (p) {
  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;

  let difficultyCanvas;
  let isCurrentScene = false;

  let codeGlowImg;

  let numCanvasesLoaded = 0;
  let allCanvasesLoaded = false;

  let menuAnimationTimer = 0.0;

  let menuItems = [];
  let selectedMenuItemIndex = 1;

  let unlockFromRevelation = false;

  let glowScale = 0;

  let glows = [];

  let numCompleted = 0;

  let scoreData;

  let attemptedCode = [];
  let correctCode = ["up", "down", "left", "right", "left"];
  let codeIndex = 0;
  let preventEnter = false;

  let bottomTextOptions = {
    default: "PRESS ENTER TO GO BACK",
    denied: "ACCESS DENIED",
    granted: "ACCESS GRANTED",
  };

  let bottomText = bottomTextOptions.default;

  p.preload = function () {
    codeGlowImg = p.loadImage("assets/code-glow.png");
  };

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);

    unlockCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    unlockCanvas.classList.add("gameCanvas");
    unlockCanvas.id = "unlockCanvas";

    p.noSmooth();

    p.noStroke();

    window.dispatchEvent(canvasLoadedEvent);

    setupNavigation(unlockCanvas);

    // create glows
    for (let i = 0; i < 5; i++) {
      glows.push(new glow(i, 1.0));
    }
  };

  p.draw = function () {
    p.clear();

    // Start drawing things if all canvases have loaded
    if (allCanvasesLoaded) {
      //Include direction to go back if accessed from screen
      if (!unlockFromRevelation) {
        if (bottomText.default) {
          if (Math.floor(globalClock.seconds) % 2 == 0) {
            drawText(bottomText, "greenHelper", 1, null, 430);
          }
        } else {
          drawText(bottomText, "greenHelper", 1, null, 430);
        }
      }

      //For each song in the list (minus ???) draw a space for each input and underline
      glows.forEach(function (glow, index) {
        p.fill("white");
        p.rect(
          (135 + index * 80) * scaleRatio,
          300 * scaleRatio,
          60 * scaleRatio,
          10 * scaleRatio
        );
        let showGlow = songList[index].cleared || attemptedCode.length > index;
        glow.display(showGlow);
      });
      // songList.slice(0, 5).forEach(function (song, index) {
      //   p.fill("white");
      //   p.rect(
      //     (135 + index * 80) * scaleRatio,
      //     300 * scaleRatio,
      //     60 * scaleRatio,
      //     10 * scaleRatio
      //   );

      // if (index == numCompleted - 1) {
      //   //Animate in recently cleared number
      //   // (Glowscale changes if coming from revelation)
      //   p.tint(255, glowScale * 255);
      //   drawImageToScale(codeGlowImg, 135 + index * 80, 200);
      //   p.noTint();
      // } else if (index < numCompleted) {
      //   // Show previous ones without animation
      //   drawImageToScale(codeGlowImg, 135 + index * 80, 200);
      // }
      // });
    }
  };

  function getNumCompleted() {
    let num = 0;
    songList.slice(0, 5).forEach(function (song, index) {
      if (song.cleared) {
        num++;
      }
    });
    return num;
  }

  // function animateCodeGlows() {
  //   //animate last one by scaling
  //   let animationIndex = 1;
  //   glowScale = 0;
  //   let codeGlowInterval = setInterval(function () {
  //     if (glowScale >= 1) {
  //       clearInterval(codeGlowInterval);
  //     }
  //     glowScale += 0.1;
  //   }, 20);
  // }

  function setupNavigation(thisCanvas) {
    p.noLoop();
    thisCanvas.addEventListener("showScene", (e) => {
      p.loop();
      if (e.detail) {
        if (e.detail.prevScene == "revelation") {
          scoreData = e.detail.scoreData;
          unlockFromRevelation = true;
        } else {
          unlockFromRevelation = false;
        }
      }

      setTimeout(function () {
        thisCanvas.style.visibility = "visible";
        thisCanvas.style.opacity = 1;

        isCurrentScene = true;
        numCompleted = getNumCompleted();

        if (unlockFromRevelation) {
          // glowScale = 0;
          glows[numCompleted - 1].scale = 0.0;
          setTimeout(function () {
            glows[numCompleted - 1].animateIn();
          }, 2000);
          if (numCompleted == 5) {
            // Unlock service mode
            setTimeout(function () {
              transitionToServiceMode();
            }, 4000);
          } else {
            //Go back to STATS SCENE
            setTimeout(function () {
              thisCanvas.dispatchEvent(hideSceneEvent);
              // document
              //   .querySelector("#songSelectorCanvas")
              //   .dispatchEvent(showSceneEvent);

              // Figure out how to pass scoreData here
              let showScoreSceneEvent = new CustomEvent("showScene", {
                detail: {
                  scoreData: scoreData,
                },
              });
              document
                .getElementById("scoreCanvas")
                .dispatchEvent(showScoreSceneEvent);
            }, 5000);
          }
        }
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

  function listsAreEqual(list1, list2) {
    let result = true;
    list1.filter(function (val1, index) {
      let val2 = list2[index];
      if (val1 != val2) {
        result = false;
      }
    });
    return result;
  }

  function animateCodeKeypress(arrowDirection) {
    // As we type the code, pulse animate the glows that already exist... and fade in the ones that don't
    if (attemptedCode.length < 5) {
      attemptedCode.push(arrowDirection);
      if (songList[codeIndex].cleared) {
        glows[codeIndex].pulseAnimation();
      } else {
        glows[codeIndex].animateIn();
      }
      codeIndex++;
    }
    if (attemptedCode.length == 5) {
      preventEnter = true;
      //Evaluate code
      if (listsAreEqual(attemptedCode, correctCode)) {
        // ACCESS GRANTED: Show experimental scene
        bottomText = bottomTextOptions.granted;

        //Transition to Terminal mode

        transitionToServiceMode();
      } else {
        // ACCESS DENIED: Go back to song selector
        bottomText = bottomTextOptions.denied;
        codeIndex++;

        setTimeout(function () {
          backToSongSelector();
        }, 4000);
        setTimeout(function () {
          resetCodeAttempt();
        }, 6000);
      }
    }
  }

  function resetCodeAttempt() {
    attemptedCode = [];
    bottomText = bottomTextOptions.default;
    codeIndex = 0;
  }

  function transitionToServiceMode() {
    glows.forEach(function (glow) {
      glow.growAnimation();
    });
    setTimeout(function () {
      document.querySelector("#backgroundCanvas").dispatchEvent(hideSceneEvent);
    }, 2000);
    setTimeout(function () {
      unlockCanvas.dispatchEvent(hideSceneEvent);
    }, 5000);
    setTimeout(function () {
      let serviceModeCanvas = document.querySelector("#serviceModeCanvas");
      serviceModeCanvas.dispatchEvent(showSceneEvent);
    }, 11000);
  }
  function backToSongSelector() {
    let songSelectorCanvas = document.querySelector("#songSelectorCanvas");
    songSelectorCanvas.dispatchEvent(showSceneEvent);
    unlockCanvas.dispatchEvent(hideSceneEvent);
  }

  function handleInput(keyCode) {
    //Handle case for menu navigation
    if (isCurrentScene) {
      if (keyCode == "ArrowDown" || keyCode == "KeyS") {
        // if (selectedMenuItemIndex < menuItems.length - 1) {
        //   selectedMenuItemIndex++;
        // }
        // attemptedCode.push("down");
        animateCodeKeypress("down");
      }
      if (keyCode == "ArrowUp" || keyCode == "KeyW") {
        // if (selectedMenuItemIndex > 0) {
        //   selectedMenuItemIndex--;
        // }

        animateCodeKeypress("up");
      }
      if (keyCode == "ArrowLeft" || keyCode == "KeyA") {
        // if (selectedMenuItemIndex < menuItems.length - 1) {
        //   selectedMenuItemIndex++;
        // }

        animateCodeKeypress("left");
      }

      if (keyCode == "ArrowRight" || keyCode == "KeyD") {
        // if (selectedMenuItemIndex < menuItems.length - 1) {
        //   selectedMenuItemIndex++;
        // }

        animateCodeKeypress("right");
      }
      //Select menu item
      if (keyCode == "Enter") {
        if (!unlockFromRevelation && !preventEnter) {
          console.log("go back to song selector");
          backToSongSelector();
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
    }

    handleInput(e.code);
  });

  //Create a class for menu items
  // Create each one has an animation timer to calculate the offset
  // class menuItem {
  //   constructor(menuText, xPos, yPos, action) {
  //     this.menuText = menuText;
  //     this.offset = 640 * scaleRatio;
  //     this.animationTimer = 0.0;
  //     this.yPos = yPos;
  //     this.xPos = yPos;
  //     this.action = action;
  //   }
  //   startAnimation() {
  //     // Create timer for animation menu overlay and text
  //     let _this = this;
  //     let menuFadeInterval = setInterval(function () {
  //       _this.animationTimer += 0.2;
  //       if (_this.animationTimer >= 1.0) {
  //         clearInterval(menuFadeInterval);
  //         _this.animationTimer = 1.0;
  //       }
  //     }, 30);
  //   }
  //   display() {
  //     // console.log("drawing menu item");
  //     p.push();
  //     p.translate(this.offset - this.offset * this.animationTimer, 0);
  //     drawText(this.menuText, "mainYellow", 1, null, this.yPos);
  //     p.pop();
  //   }
  //   select() {
  //     this.action(this.menuText);
  //   }
  // }

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

  class glow {
    constructor(index, scale) {
      this.scale = scale;
      this.sizeScale = 1.0;
      this.index = index;
    }
    display(show) {
      if (show) {
        p.tint(255, this.scale * 255);
        drawImageToScale(
          codeGlowImg,
          135 +
            this.index * 80 -
            (codeGlowImg.width * this.sizeScale) / 2 +
            codeGlowImg.width / 2,
          200 -
            (codeGlowImg.height * this.sizeScale) / 2 +
            codeGlowImg.width / 2,
          this.sizeScale
        );
        p.noTint();
      }
    }
    pulseAnimation() {
      this.sizeScale = 1.0;
      let _this = this;
      let timingIndex = 1;
      let animationInterval = setInterval(function () {
        if (timingIndex == 9) {
          _this.sizeScale = 1.0;
          clearInterval(animationInterval);
        }
        _this.sizeScale = 1.0 + arrowHitGradientTimings[timingIndex] * 0.5;
        timingIndex++;
      }, 20);
    }
    growAnimation() {
      //animate last one in by scaling
      this.sizeScale = 1.0;
      let _this = this;
      let time = 0;
      let animationInterval = setInterval(function () {
        if (time > 5000) {
          // _this.scale = 1.0;
          clearInterval(animationInterval);
        }
        _this.sizeScale *= 1.03;
        time += 20;
      }, 20);
    }
    animateIn() {
      //animate last one in by scaling
      this.scale = 0;
      let _this = this;
      let animationInterval = setInterval(function () {
        if (_this.scale >= 1) {
          _this.scale = 1.0;
          clearInterval(animationInterval);
        }
        _this.scale += 0.1;
      }, 20);
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

new p5(unlock, "unlock-canvas-container");
