let characterString = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.,?!-"'()[] `;
let characterList = characterString.split("");

let digitString = "1234567890";

let digitList = digitString.split("");

let fonts = {
  mainYellow: {
    src: "assets/font-spritesheet.png",
    charSet: characterList,
    size: { width: 40, height: 58 },
    charsToImgs: {},
    imgObj: null,
  },

  pinkDigits: {
    src: "assets/combo-number-spritesheet.png",
    charSet: digitList,
    size: { width: 64, height: 72 },
    charsToImgs: {},
    imgObj: null,
  },
};

const hitAnimationTimings = {
  1: 1.12,
  2: 1.15,
  3: 1.14,
  4: 1.1,
  5: 1.05,
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
