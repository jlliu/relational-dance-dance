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
