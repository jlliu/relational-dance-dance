const audioCtx = new AudioContext();

// Code for title screen

const title_player = new Tone.Player(
  "assets/audio/RDD_p2_drum_loop.mp3",
  startSong
).toDestination();
title_player.loop = true;
title_player.volume.value = -5;
title_player.fadeOut = 4;

function startSong() {
  title_player.stop();
  title_player.start();
}
var title = function (p) {
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

  let titleCanvas;

  let button_r_up, button_r_down, button_l_up, button_l_down;

  let currentlyAnimating = false;
  let timedAnimationIndex = 0;
  let currentlyDragging = false;

  let clickedObjects = [];

  let gameEntered = false;
  let gameStarted = false;

  let logoImg;
  let startTextImg;

  let numCanvasesLoaded = 0;
  let allCanvasesLoaded = false;
  // let shader;

  let clock = new Tone.Clock((time) => {}, 1);

  p.preload = function () {
    //Preload a background here
    //Preload whatever needs to be preloaded

    // shader = p.loadShader("shaders/basic.vert", "shaders/basic.frag");
    logoImg = p.loadImage("assets/RDD-logo.png");
    startTextImg = p.loadImage("assets/startText.png");
  };

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);

    titleCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    titleCanvas.classList.add("gameCanvas");
    titleCanvas.id = "titleCanvas";

    thisCanvas = titleCanvas;
    p.noSmooth();

    p.noStroke();

    clock.start();

    const canvasLoadedEvent = new Event("canvasLoaded");

    window.dispatchEvent(canvasLoadedEvent);
  };

  p.draw = function () {
    p.clear();
    mouse_x = p.mouseX;
    mouse_y = p.mouseY;

    drawImageToScale(logoImg, 94, 176);

    // If auto is not running, display the click to start

    if (audioCtx.state == "running") {
      let enableAudioOverlay = document.querySelector("#enableAudio-overlay");
      enableAudioOverlay.style.display = "none";
    } else {
      let enableAudioOverlay = document.querySelector("#enableAudio-overlay");
      enableAudioOverlay.style.display = "flex";
    }
    if (Math.floor(clock.seconds) % 2 == 0 && allCanvasesLoaded) {
      drawImageToScale(startTextImg, 92, 420);
    }
  };

  ////////////////////////////////////////////
  // -------------- SCENES --------------- //
  //////////////////////////////////////////

  window.addEventListener("canvasLoaded", function () {
    numCanvasesLoaded++;
    if (numCanvasesLoaded == 3) {
      allCanvasesLoaded = true;
    }
  });

  function padOrKeypress(direction) {
    // let hitSuccessful = assessHit(direction, "press");
    // hitArrowObjs[direction].press(hitSuccessful);
    let songStarted = title_player.state == "started";
    if (!gameStarted && allCanvasesLoaded && songStarted) {
      const startGameEvent = new Event("startGame");
      window.dispatchEvent(startGameEvent);
      gameStarted = true;
      thisCanvas.style.opacity = 0;
      title_player.stop();
      setTimeout(function () {
        thisCanvas.style.display = "none";
      }, 3000);
    }
  }
  function padOrKeyrelease(direction) {
    // hitArrowObjs[direction].release();
    // assessHit(direction, "lift");
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

    // Add logic for enabling audio context
    if (e.code == "Space") {
      if (audioCtx.state == "suspended") {
        audioCtx.resume();
        startSong();
      }
    }

    let songStarted =
      title_player.state == "started" && audioCtx.state == "running";
    if (songStarted) {
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

  function hideCanvas() {
    //Add things we want to do when we leave this scene
    gameEntered = false;
    gameStarted = false;
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
