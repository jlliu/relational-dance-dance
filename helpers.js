// Global js helpers

let characterString = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.,?!-"'()[] `;
let characterList = characterString.split("");

let digitString = "1234567890";

let digitList = digitString.split("");

let mainPinkCharacters = `ABCDEFGHIJKLNOPQRSTUVXYZabcdefghijklnopqrstuvxyz1234567890.,?!-"'()[] `;

let widePinkCharacters = `MWmw`;

let fonts = {
  mainYellow: {
    sets: [
      {
        src: "assets/font-spritesheet.png",
        charSet: characterString.split(""),
        size: { width: 40, height: 58 },

        imgObj: null,
      },
    ],

    charsToImgs: {},
  },

  greenHelper: {
    sets: [
      {
        src: "assets/green-helper-text-spritesheet.png",
        charSet: characterString.split(""),
        size: { width: 24, height: 35 },
        imgObj: null,
      },
    ],
    charsToImgs: {},
  },

  // pinkDigits: {
  //   src: "assets/combo-number-spritesheet.png",
  //   charSet: digitString.split(""),
  //   size: { width: 64, height: 72 },
  //   charsToImgs: {},
  //   imgObj: null,
  // },

  pink: {
    sets: [
      {
        src: "assets/main-pink-character-spritesheet.png",
        charSet: mainPinkCharacters.split(""),
        size: { width: 60, height: 84 },
      },
      {
        src: "assets/wide-pink-character-spritesheet.png",
        charSet: widePinkCharacters.split(""),
        size: { width: 84, height: 84 },
        imgObj: null,
      },
    ],
    charsToImgs: {},
    // src: "assets/assets/main-pink-character-spritesheet.png",
    // charSet: mainPinkCharacters.split(""),
    // size: { width: 60, height: 84 },
    // charsToImgs: {},
    // imgObj: null,
  },

  // widePink: {
  //   src: "assets/assets/wide-pink-character-spritesheet.png",
  //   charSet: widePinkCharacters.split(""),
  //   size: { width: 84, height: 84 },
  //   charsToImgs: {},
  //   imgObj: null,
  // },

  // pin
};

const hitAnimationTimings = {
  1: 1.12,
  2: 1.15,
  3: 1.14,
  4: 1.1,
  5: 1.05,
};

const fadeOutTiming = {
  1: 1,
  2: 0.95,
  3: 0.9,
  4: 0.8,
  5: 0.65,
  6: 0.4,
  7: 0.1,
  8: 0,
};

const arrowHitSizeTimings = {
  1: 0.85,
  2: 0.8,
  3: 0.81,
  4: 0.83,
  5: 0.87,
  6: 0.9,
  7: 0.91,
  8: 0.95,
  9: 0.97,
};

const arrowHitGradientTimings = {
  1: 0.8,
  2: 1,
  3: 0.9,
  4: 0.85,
  5: 0.8,
  6: 0.7,
  7: 0.55,
  8: 0.4,
  9: 0.2,
};

function hsl2rgb(h, s, l) {
  let a = s * Math.min(l, 1 - l);
  let f = (n, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0), f(8), f(4)];
}

// Navigation helpers
const canvasLoadedEvent = new Event("canvasLoaded");
const showSceneEvent = new CustomEvent("showScene");
const hideSceneEvent = new CustomEvent("hideScene");
const sceneTransitionTime = 1000;

// Background, title, tutorial, difficulty, songSelector, mainSong
let totalCanvases = 6;

let storyModeDifficulty = "Normal";

let songList = [
  {
    bannerImg: `songAssets/song1-banner.png`,
    title: `Walkin' on Eggshells`,
    cdImg: `song1-cd.png`,
    songData: eggshells,
    songFile: `songAssets/Music/walking_on_sunshine.ogg`,
    songPlayer: new Tone.Player(
      `songAssets/Music/walking_on_sunshine.ogg`
    ).toDestination(),
    sampleStart: 57.784,
    sampleLength: 15,
    songVideoEl: document.querySelector("#cowgirlVideo"),
  },
  {
    bannerImg: `songAssets/song2-banner.png`,
    title: `Kung Fu Fawning`,
    cdImg: `song2-cd.png`,
    songData: curryup,
    songFile: `songAssets/Music/kungfu.ogg`,
    songPlayer: new Tone.Player(`songAssets/Music/kungfu.ogg`).toDestination(),
    sampleStart: 42.713,
    sampleLength: 15,
    songVideoEl: document.querySelector("#cowgirlVideo"),
  },
  {
    bannerImg: `songAssets/song3-banner.png`,
    title: `Chasing Breadcrumbs`,
    cdImg: `song3-cd.png`,
    songData: barbie,
    songFile: `songAssets/Music/barbie_girl.mp3`,
    songPlayer: new Tone.Player(
      `songAssets/Music/barbie_girl.mp3`
    ).toDestination(),
    sampleStart: 78.21,
    sampleLength: 11.0,
    songVideoEl: document.querySelector("#cowgirlVideo"),
  },
  {
    bannerImg: `songAssets/song4-banner.png`,
    title: `Lone Ranger`,
    cdImg: `song4-cd.png`,
    songData: cowgirl,
    songFile: `songAssets/Music/cowgirl.ogg`,
    songPlayer: new Tone.Player(`songAssets/Music/cowgirl.ogg`).toDestination(),
    sampleStart: 41.74,
    sampleLength: 15.0,
    songVideoEl: document.querySelector("#cowgirlVideo"),
  },
  {
    bannerImg: `songAssets/song5-banner.png`,
    title: `ENTER THE VOiD`,
    cdImg: `song5-cd.png`,
    songData: sandstorm,
    songFile: `songAssets/Music/sandstorm.ogg`,
    songPlayer: new Tone.Player(
      `songAssets/Music/Sandstorm.ogg`
    ).toDestination(),
    sampleStart: 36.54,
    sampleLength: 12.0,
    songVideoEl: document.querySelector("#cowgirlVideo"),
  },
  {
    bannerImg: `songAssets/song6-banner.png`,
    title: `???`,
    cdImg: `song6-cd.png`,
    songData: eggshells,
    songFile: null,
    songPlayer: null,
    sampleStart: null,
    sampleLength: null,
    songVideoEl: document.querySelector("#cowgirlVideo"),
  },
];
