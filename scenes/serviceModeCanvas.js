var serviceMode = function (p) {
  let canvasSizeOriginal = { width: 640, height: 480 };
  let canvasWidth = canvasSizeOriginal.width;
  let canvasHeight = canvasSizeOriginal.height;

  let canvasRatio = canvasWidth / canvasHeight;
  let scaleRatio = 1;

  let serviceModeCanvas;
  let isCurrentScene = false;

  let logoImg;
  let startTextImg;

  let numCanvasesLoaded = 0;
  let allCanvasesLoaded = false;

  let menuAnimationTimer = 0.0;

  let mainMenuItems = [];

  let mainMenu;

  let currentMenu;

  let showSettings = false;

  let visibleScene = null;

  let settingsDialogueScenes = [];

  let exitDialogueScenes = [];

  let currentDialogueSceneIndex = 0;

  let dialogueSceneType;

  p.preload = function () {};

  p.setup = function () {
    // put setup code here
    p.pixelDensity(3);
    calculateCanvasDimensions(p);

    serviceModeCanvas = p.createCanvas(canvasWidth, canvasHeight).elt;
    serviceModeCanvas.classList.add("gameCanvas");
    serviceModeCanvas.id = "serviceModeCanvas";

    p.noSmooth();

    p.noStroke();

    mainMenuItems = [
      new menuItem("INPUT CHECK", showInputCheck),
      new menuItem("SOUND CHECK", showSoundCheck),
      new menuItem("SCREEN CHECK", showScreenCheck),
      new menuItem("COLOR CHECK", showColorCheck),
      new menuItem("GAME SETTINGS", showGameSettings),
      new menuItem("EXIT", showColorCheck),
    ];

    mainMenu = new menuGroup(mainMenuItems, 200, 140, "MENU");

    // let dialogueMenuItems = [
    //   new menuItem("I AM YOU", showInputCheck),
    //   new menuItem("SECOND OPTION", showSoundCheck),
    //   new menuItem("THIRD OPTION", showSoundCheck),
    // ];

    // let dialogueMenuGroup = new menuGroup(dialogueMenuItems, 360, "I AM...");

    // dialogueScene1 = new dialogueScene(["WHO ARE YOU?"], dialogueMenuGroup);

    settingsDialogueScenes = setupDialogueScenes(settingsDialogue, "settings");
    exitDialogueScenes = setupDialogueScenes(exitDialogue, "exit");

    currentMenu = mainMenu;

    visibleScene = mainMenu;

    window.dispatchEvent(canvasLoadedEvent);

    setupNavigation(serviceModeCanvas);
  };

  function setupDialogueScenes(dialogueData, sceneType) {
    let dialogueScenes = [];

    dialogueData.forEach(function (sceneData) {
      let leftText = sceneData.left;
      let menuOptions = sceneData.right.options;
      let dialogueMenuItems = [];

      menuOptions.forEach(function (option) {
        let thisItem = new menuItem(option, progressDialogue);
        dialogueMenuItems.push(thisItem);
      });

      let thisMenuGroup = new menuGroup(
        dialogueMenuItems,
        360,
        0,
        sceneData.right.title
      );

      let thisDialogueScene = new dialogueScene(leftText, thisMenuGroup);
      dialogueScenes.push(thisDialogueScene);
    });

    return dialogueScenes;
  }

  p.draw = function () {
    // p.clear();
    p.fill("black");
    p.rect(0, 0, p.width, p.height);

    // Start drawing things if all canvases have loaded
    if (allCanvasesLoaded) {
      // drawMenu();

      // if (mainMenu == currentMenu) {
      visibleScene.display();
      // }
      // Note to self:
      // We need a system that displays whatever the current scene is...
      // Maybe just store a visible scenes variable
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

  function showInputCheck() {
    //Add scene here
  }
  function showSoundCheck() {
    //Add scene here
  }
  function showScreenCheck() {
    //Add scene here
  }
  function showColorCheck() {
    //Add scene here
  }

  function showGameSettings() {
    visibleScene = settingsDialogueScenes[0];
    currentMenu = settingsDialogueScenes[0].menuGroup;
    dialogueSceneType = "settings";
  }

  function progressDialogue() {
    console.log("progress dialogue event");
    currentDialogueSceneIndex++;
    //We've reached end of dialogue scenes
    if (
      dialogueSceneType == "settings" &&
      currentDialogueSceneIndex >= settingsDialogueScenes.length
    ) {
      visibleScene = mainMenu;
      currentMenu = mainMenu;
    } else if (
      dialogueSceneType == "exit" &&
      currentDialogueSceneIndex >= exitDialogueScenes.length
    ) {
    } else {
      visibleScene = settingsDialogueScenes[currentDialogueSceneIndex];
      currentMenu = settingsDialogueScenes[currentDialogueSceneIndex].menuGroup;
    }
  }

  function handleInput(keyCode) {
    //Handle case for menu navigation
    if (isCurrentScene) {
      if (currentMenu) {
        let menuIndex = currentMenu.activeMenuItemIndex;
        let menuItems = currentMenu.itemList;
        if (keyCode == "ArrowDown" || keyCode == "KeyS") {
          if (menuIndex < menuItems.length - 1) {
            currentMenu.activeMenuItemIndex++;
            menuItems.forEach(function (menuItem) {
              menuItem.active = false;
            });
            menuItems[currentMenu.activeMenuItemIndex].active = true;
          }
        }
        if (keyCode == "ArrowUp" || keyCode == "KeyW") {
          if (menuIndex > 0) {
            currentMenu.activeMenuItemIndex--;
          }
          menuItems.forEach(function (menuItem) {
            menuItem.active = false;
          });
          menuItems[currentMenu.activeMenuItemIndex].active = true;
        }
        //Select menu item
        if (keyCode == "Enter") {
          menuItems[currentMenu.activeMenuItemIndex].select();
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

  class dialogueScene {
    constructor(leftText, menuGroup) {
      this.leftText = leftText;
      this.menuGroup = menuGroup;

      //Account for height of multiple lines
      if (typeof this.leftText == "string") {
        this.numOfLines_L = 1;
        this.height_L = 29;
      } else {
        this.numOfLines_L = this.leftText.length;
        this.height_L = 29 * this.numOfLines_L;
      }
    }
    display() {
      //Draw left side of text
      let L_start_xPos = 50;
      //Center it vertically
      let L_current_yPos = (480 - this.height_L) / 2;
      for (var i = 0; i < this.numOfLines_L; i++) {
        let textToDraw =
          typeof this.leftText == "string" ? this.leftText : this.leftText[i];
        drawText(textToDraw, "whiteTerminal", 1, L_start_xPos, L_current_yPos);
        L_current_yPos += 29;
      }

      // Draw menu on the right
      // let Y_start_xPos = 360;
      p.push();
      console.log(this.menuGroup.getHeight());
      p.translate(0, ((480 - this.menuGroup.getHeight()) / 2) * scaleRatio);
      this.menuGroup.display(true);
      p.pop();
    }
  }

  // A menu group is a set of selectable menu items
  class menuGroup {
    constructor(itemList, xPos, yPos, titleText) {
      this.itemList = itemList;
      this.visible = false;
      this.activeMenuItemIndex = 0;
      this.xPos = xPos;
      this.yPos = yPos;
      this.itemList[0].active = true;
      this.titleText = titleText;
      this.height = 0;
    }
    getHeight() {
      let totalHeight = 0;
      if (this.title) {
        totalHeight += 60;
      }
      let _this = this;
      this.itemList.forEach(function (menuItem) {
        totalHeight += menuItem.height + 15;
      });
      return totalHeight;
    }
    display(center) {
      let current_yPos = this.yPos;

      if (center == true) {
        current_yPos = 0;
      }
      //Draw title
      if (this.titleText) {
        drawText(this.titleText, "whiteTerminal", 1, this.xPos, this.yPos);
        current_yPos = current_yPos + 60;
      }

      // Draw all menu items after one another
      let _this = this;

      this.itemList.forEach(function (menuItem) {
        menuItem.display(_this.xPos, current_yPos);

        current_yPos += menuItem.height + 15;
      });
    }
  }

  // menu text is a string, or list or strings
  class menuItem {
    constructor(menuText, action) {
      this.menuText = menuText;
      this.action = action;
      this.active = false;

      //Account for height of multiple lines
      if (typeof this.menuText == "string") {
        this.numOfLines = 1;
        this.height = 29;
      } else {
        this.numOfLines = this.menuText.length;
        this.height = 29 * this.numOfLines;
      }
      this.opacity = 1;
    }

    display(xPos, yPos) {
      if (this.active) {
        let charWidth = fonts["whiteTerminal"].sets[0].size.width;
        drawText(">", "whiteTerminal", 1, xPos - charWidth * 1.5, yPos);
      }
      // Draw the number of lines in this menu item text
      let current_yPos = yPos;
      for (var i = 0; i < this.numOfLines; i++) {
        let textToDraw =
          typeof this.menuText == "string" ? this.menuText : this.menuText[i];
        p.tint(255, this.opacity * 255);
        drawText(textToDraw, "whiteTerminal", 1, xPos, current_yPos);
        p.tint(255, 255);
        current_yPos += 29;
      }
    }
    select() {
      let _this = this;
      let count = 0;
      let flashInterval = setInterval(function () {
        _this.opacity = 0;
        setTimeout(function () {
          _this.opacity = 1;
        }, 80);
        _this.opacity = 0;
        if (count == 10) {
          clearInterval(flashInterval);
          _this.action(_this.menuText);
        }
        count++;
      }, 160);
    }
  }

  // function drawMenu() {
  //   menuItems.forEach(function (menuItem, index) {
  //     if (index != selectedMenuItemIndex) {
  //       menuItem.display();
  //     }
  //   });
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

  // Animates a sprite given the images as frames, based on a certain interval, with optional callback

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

new p5(serviceMode, "service-mode-canvas-container");
