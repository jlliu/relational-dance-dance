// Game N: Template for any game number

var background = function (p) {
  let thisCanvas;

  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;
  let mouse_x;
  let mouse_y;
  let rightButton;
  let leftButton;

  let backgroundCanvas;

  let button_r_up, button_r_down, button_l_up, button_l_down;

  let currentlyAnimating = false;
  let timedAnimationIndex = 0;
  let currentlyDragging = false;

  let clickedObjects = [];

  let gameEntered = false;
  let gameStarted = false;

  let shader;

  let clock = new Tone.Clock((time) => {}, 1);

  p.preload = function () {
    //Preload a background here
    //Preload whatever needs to be preloaded

    shader = p.loadShader("shaders/basic.vert", "shaders/basic.frag");
  };

  p.setup = function () {
    // put setup code here
    p.pixelDensity(1);
    calculateCanvasDimensions(p);

    backgroundCanvas = p.createCanvas(
      canvasSizeOriginal.width,
      canvasSizeOriginal.height,
      p.WEBGL
    ).elt;
    backgroundCanvas.classList.add("gameCanvas");
    backgroundCanvas.id = "backgroundCanvas";

    thisCanvas = backgroundCanvas;
    p.noSmooth();

    p.noStroke();

    // setupNavigation();
    resizeBackgroundCanvas();
    clock.start();

    //Initialize Game N Sprites
  };

  p.draw = function () {
    mouse_x = p.mouseX;
    mouse_y = p.mouseY;
    //Cursor is default unless otherwise specified
    // cursorState = "default";
    // displayGame();

    shader.setUniform("u_resolution", [canvasWidth, canvasHeight]);
    // console.log(clock.seconds);
    shader.setUniform("u_time", clock.seconds);
    // shader.setUniform("u_scale", scaleRatio);

    // shader() sets the active shader with our shader
    p.shader(shader);

    // rect gives us some geometry on the screen
    p.rect(0, 0, 640, 480);
  };

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
    // p.image(bg, 0, 0, canvasWidth, canvasHeight);

    // Display Sprites

    p.background("pink");

    // Navigation
  }

  // CLASSES

  class Button {
    constructor(buttonDefaultImg, buttonHover, xPos, yPos) {
      this.x = xPos;
      this.y = yPos;
      this.buttonDefault = buttonDefaultImg;
      this.buttonHover = buttonHover;
      this.width = buttonDefaultImg.width;
      this.height = buttonDefaultImg.height;
      this.mouseInBounds = false;
      this.interactive = true;
      this.intendingToClick = false;
      this.visible = true;
      let _this = this;
      thisCanvas.addEventListener("mousedown", function (e) {
        if (_this.isMouseInBounds()) {
          _this.intendingToClick = true;
          clickedObjects.push(_this);
        }
      });
    }

    addClickEvent(clickFunction) {
      let _this = this;
      thisCanvas.addEventListener("click", function (e) {
        if (_this.isMouseInBounds() && _this.intendingToClick) {
          clickFunction();
          _this.intendingToClick = false;
          clickedObjects = [];
        }
      });
    }
    isMouseInBounds() {
      this.mouseInBounds =
        this.interactive &&
        !currentlyAnimating &&
        mouse_x > this.x * scaleRatio &&
        mouse_x < this.x * scaleRatio + this.width * scaleRatio &&
        mouse_y > this.y * scaleRatio &&
        mouse_y < this.y * scaleRatio + this.height * scaleRatio;
      return this.mouseInBounds;
    }

    display() {
      let imageToDraw =
        this.isMouseInBounds() && !currentlyDragging && !currentlyAnimating
          ? this.buttonHover
          : this.buttonDefault;

      if (this.visible) {
        drawImageToScale(imageToDraw, this.x, this.y);
      }

      if (
        this.mouseInBounds &&
        this.interactive &&
        this.visible &&
        !currentlyAnimating
      ) {
        cursorState = "pointer";
      }
    }
  }

  class Draggable {
    constructor(
      defaultImg,
      hoverImg,
      xPos,
      yPos,
      xFinal,
      yFinal,
      xRange,
      yRange
    ) {
      this.x = xPos;
      this.y = yPos;
      this.buttonDefault = defaultImg;
      this.buttonHover = hoverImg;
      this.width = this.buttonDefault.width;
      this.height = this.buttonDefault.height;
      this.mouseInBounds = false;
      this.interactive = true;
      this.visible = true;
      this.dragging = false;
      this.xCurrent = this.x;
      this.yCurrent = this.y;
      this.xFinal = xFinal;
      this.yFinal = yFinal;
      this.xRange = xRange;
      this.yRange = yRange;
      let _this = this;

      //once the single mousedown event, this item drags everywhere until we drop it
      thisCanvas.addEventListener("mousedown", function (e) {
        if (_this.mouseInBounds) {
          _this.dragging = true;
          currentlyDragging = true;
          clickedObjects.forEach(function (value) {
            value.intendingToClick = false;
            clickedObjects = [];
          });
        }
      });

      thisCanvas.addEventListener("mouseup", function (e) {
        // If dropped in the target area, then it's done
        if (_this.mouseInBounds) {
          _this.dragging = false;
          currentlyDragging = false;
          if (
            mouse_x > xRange[0] * scaleRatio &&
            mouse_x < xRange[1] * scaleRatio &&
            mouse_y > yRange[0] * scaleRatio &&
            mouse_y < yRange[1] * scaleRatio
          ) {
            _this.interactive = false;
            pageFlipSound.start();
            //Snap it into position if we don't make it disappear
            if (_this.xFinal && _this.yFinal) {
              _this.xCurrent = _this.xFinal;
              _this.yCurrent = _this.yFinal;
            } else {
              _this.visible = false;
            }
          } else {
            _this.xCurrent = _this.x;
            _this.yCurrent = _this.y;
          }
        }
      });
    }

    addClickEvent(clickFunction) {
      let _this = this;
      thisCanvas.addEventListener("click", function (e) {
        if (_this.isMouseInBounds(e.offsetX, e.offsetY)) {
          clickFunction();
        }
      });
    }
    isMouseInBounds() {
      this.mouseInBounds =
        !currentlyAnimating &&
        this.interactive &&
        mouse_x > this.xCurrent * scaleRatio &&
        mouse_x < this.xCurrent * scaleRatio + this.width * scaleRatio &&
        mouse_y > this.yCurrent * scaleRatio &&
        mouse_y < this.yCurrent * scaleRatio + this.height * scaleRatio;
      return this.mouseInBounds;
    }

    display() {
      let imageToDraw = this.isMouseInBounds()
        ? this.buttonHover
        : this.buttonDefault;

      if (this.mouseInBounds && this.interactive) {
        cursorState = "grab";
      }
      if (this.dragging) {
        cursorState = "hold";
        this.xCurrent = Math.floor((mouse_x - this.width / 2) / scaleRatio);
        this.yCurrent = Math.floor((mouse_y - this.height / 2) / scaleRatio);
      }
      if (this.visible) {
        drawImageToScale(imageToDraw, this.xCurrent, this.yCurrent);
      }
    }
  }

  // HELPERS

  // function setupNavigation() {
  //   p.noLoop();
  //   document.addEventListener("navigateFwd", (e) => {
  //     if (currentSceneNum == thisSceneNum) {
  //       gameEntered = true;
  //       p.loop();
  //     }
  //   });
  //   document.addEventListener("navigateBack", (e) => {
  //     if (currentSceneNum == thisSceneNum + 1) {
  //       gameEntered = true;
  //       p.loop();
  //     }
  //   });
  //   //Navigation stuff
  //   rightButton = new Button(button_r_up, button_r_down, 503, 407);
  //   leftButton = new Button(button_l_up, button_l_down, 37, 407);
  //   rightButton.addClickEvent(function (e) {
  //     if (currentlyAnimating == false) {
  //       currentSceneNum++;
  //       harpTransitionOutSound.start();
  //       // We need to hide this.
  //       storyCanvas.style.visibility = "visible";
  //       storyCanvas.style.opacity = 1;
  //       window.setTimeout(function () {
  //         thisCanvas.style.visibility = "hidden";
  //         storyMode = true;
  //         p.noLoop();
  //         hideCanvas();
  //       }, 1000);
  //       storyMode = true;
  //     }
  //   });
  //   leftButton.addClickEvent(function (e) {
  //     if (currentlyAnimating == false) {
  //       harpTransitionOutSound.start();
  //       // We need to hide this.
  //       storyCanvas.style.visibility = "visible";
  //       storyCanvas.style.opacity = 1;
  //       window.setTimeout(function () {
  //         thisCanvas.style.visibility = "hidden";
  //         storyMode = true;
  //         p.noLoop();
  //         hideCanvas();
  //       }, 1000);
  //       storyMode = true;
  //     }
  //   });
  // }

  function hideCanvas() {
    //Add things we want to do when we leave this scene
    gameEntered = false;
    gameStarted = false;
  }

  p.windowResized = function () {
    calculateCanvasDimensions();
    // p.resizeCanvas(canvasWidth, canvasHeight);
    resizeBackgroundCanvas();
  };

  function resizeBackgroundCanvas() {
    // console.log(backgroundCanvas);
    let thisCanvas = document.querySelector("#backgroundCanvas");
    thisCanvas.style.transform = `translate(-50%, -50%) scale(${scaleRatio})`;
  }

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
    scaleRatio = canvasWidth / canvasSizeOriginal.width;
  }
};

new p5(background, "background-canvas");
