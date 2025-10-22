// Game N: Template for any game number

var background = function (p) {
  let thisCanvas;

  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;

  let backgroundCanvas;

  let shader;

  let clock = new Tone.Clock((time) => {}, 1);

  let percentageElapsed = 0;

  let transitionStarted = 0;

  let narrativeCue = 0;

  p.preload = function () {
    //Preload shaders here
    shader = p.loadShader("shaders/basic.vert", "shaders/pinkGlow.frag");
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

    resizeBackgroundCanvas();
    clock.start();

    window.dispatchEvent(canvasLoadedEvent);
    setupNavigation(document.querySelector("#backgroundCanvas"));
  };

  p.draw = function () {
    //Cursor is default unless otherwise specified
    // cursorState = "default";
    // displayGame();

    shader.setUniform("u_resolution", [canvasWidth, canvasHeight]);
    shader.setUniform("u_time", clock.seconds);
    shader.setUniform("u_percentageElapsed", percentageElapsed);
    shader.setUniform("u_transitionStarted", transitionStarted);
    shader.setUniform("u_narrativeCue", narrativeCue);

    p.shader(shader);

    // rect gives us some geometry on the screen
    p.rect(0, 0, 640, 480);
  };

  // CLASSES

  // HELPERS

  function setupNavigation(thisCanvas) {
    thisCanvas.addEventListener("showScene", (e) => {
      p.loop();
      thisCanvas.style.visibility = "visible";
      thisCanvas.style.opacity = 1;
    });
    thisCanvas.addEventListener("hideScene", (e) => {
      console.log("hide background");
      p.noLoop();
      thisCanvas.style.opacity = 0;
      setTimeout(function () {
        thisCanvas.style.visibility = "hidden";
      }, sceneTransitionTime);
    });
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

new p5(background, "background-canvas-container");
