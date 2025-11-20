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

  let glowAmount = 1.0;
  let glowSongIndex = 0;

  let myBuffer;

  let shaderType = "mainGlow";

  p.preload = function () {
    //Preload shaders here
    mainGlow = p.loadShader("/shaders/basic.vert", "/shaders/pinkGlow.frag");
    radialGlow = p.loadShader(
      "/shaders/basic.vert",
      "/shaders/radialGlow.frag"
    );
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

    myBuffer = p.createFramebuffer();
  };

  p.draw = function () {
    //Cursor is default unless otherwise specified
    // cursorState = "default";
    // displayGame();

    mainGlow.setUniform("u_resolution", [canvasWidth, canvasHeight]);
    mainGlow.setUniform("u_time", clock.seconds);
    mainGlow.setUniform("u_percentageElapsed", percentageElapsed);
    mainGlow.setUniform("u_transitionStarted", transitionStarted);
    mainGlow.setUniform("u_narrativeCue", narrativeCue);

    radialGlow.setUniform("u_resolution", [canvasWidth, canvasHeight]);
    radialGlow.setUniform("u_glowAmount", glowAmount);

    radialGlow.setUniform("u_songIndex", glowSongIndex);

    let glowPosition = Math.min(
      (clock.seconds / revelationGlowTime) * 0.5,
      0.5
    );

    radialGlow.setUniform("u_time", clock.seconds);
    radialGlow.setUniform("u_glowPosition", glowPosition);

    if (shaderType == "mainGlow") {
      p.shader(mainGlow);
    } else {
      p.shader(radialGlow);
    }

    // rect gives us some geometry on the screen
    p.rect(0, 0, 640, 480);
  };

  // CLASSES

  // HELPERS

  function setupNavigation(thisCanvas) {
    thisCanvas.addEventListener("showScene", (e) => {
      if (e.detail && e.detail.shaderType) {
        shaderType = e.detail.shaderType;
        // //Override to make purple if needed
        // if (e.detail.colorCode == 49) {
        //   narrativeCue = 49;
        // }
        //Animate in.revelation radio glow
        if (shaderType == "radialGlow") {
          glowAmount = 1.0;
          glowSongIndex = parseInt(e.detail.songIndex);
          clock.stop();
          setTimeout(function () {
            clock.start();
          }, sceneTransitionTime);
        }
      } else {
        shaderType = "mainGlow";
      }
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

    thisCanvas.addEventListener("endRevelationScene", (e) => {
      setTimeout(function () {
        let explodeGlowInterval = setInterval(function () {
          glowAmount *= 1.03;
          if (glowAmount >= 100.0) {
            clearInterval(explodeGlowInterval);
            console.log("hide background");
            setTimeout(function () {
              p.noLoop();
              thisCanvas.style.opacity = 0;
              setTimeout(function () {
                thisCanvas.style.visibility = "hidden";
                //Show canvas again for unlock scene
                thisCanvas.dispatchEvent(showSceneEvent);
              }, sceneTransitionTime);
            }, 2000);
          }
        }, 10);
      }, 2000);
    });

    thisCanvas.addEventListener("backgroundTransition", (e) => {
      let canvasToShow = document.querySelector("#backgroundCanvas");
      canvasToShow.style.display = "block";
      canvasToShow.style.opacity = 1;
      percentageElapsed = e.detail;
      transitionStarted = 1;
    });

    thisCanvas.addEventListener("backgroundCue", (e) => {
      narrativeCue = e.detail;
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
