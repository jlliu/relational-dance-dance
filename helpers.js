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
