// Square transparent masters, keyed by character / outfit / expression.
// Face rectangles use 0–1000 source-image coordinates; no pixels are stretched.
const portraitAssets = (() => {
  const entries = {
    "kohaku/0/neutral": {"src": "./art/standing/kohaku-0.webp", "character": "kohaku", "outfit": 0, "mood": "neutral", "face": [363, 131, 576, 344], "headTop": 2, "motion": {"chest": [[0.535, 0.59, 0.11, 0.11], [0.69, 0.6, 0.11, 0.11]], "blink": {"src": "./art/standing/blinks/kohaku-0.webp", "crop": [0.3429027, 0.1315789, 0.2870813, 0.1754386], "eyes": [[0.4066986, 0.222488, 0.0454545, 0.023126, -0.48], [0.5063796, 0.1746411, 0.0526316, 0.0239234, -0.48]]}}},
    "suzu/0/neutral": {"src": "./art/standing/suzu-0.webp", "character": "suzu", "outfit": 0, "mood": "neutral", "face": [397, 147, 605, 354], "headTop": 10, "motion": {"chest": [[0.39, 0.625, 0.1, 0.105], [0.565, 0.625, 0.1, 0.105]], "blink": {"src": "./art/standing/blinks/suzu-0.webp", "crop": [0.3429027, 0.1315789, 0.2870813, 0.1754386], "eyes": [[0.4266348, 0.2288676, 0.0518341, 0.0247209, -0.2], [0.5414673, 0.1985646, 0.0574163, 0.0255183, -0.24]]}}},
    "kohaku/0/loss": {"src": "./art/standing/kohaku-1.webp", "character": "kohaku", "outfit": 0, "mood": "loss", "face": [402, 215, 577, 389], "headTop": 7, "motion": {"chest": [[0.535, 0.6, 0.095, 0.085], [0.675, 0.6, 0.105, 0.1]]}},
    "suzu/0/loss": {"src": "./art/standing/suzu-1.webp", "character": "suzu", "outfit": 0, "mood": "loss", "face": [415, 260, 597, 442], "headTop": 11, "motion": {"chest": [[0.425, 0.66, 0.09, 0.085], [0.585, 0.65, 0.09, 0.085]]}},
    "kohaku/0/win": {"src": "./art/standing/kohaku-2.webp", "character": "kohaku", "outfit": 0, "mood": "win", "face": [360, 96, 554, 290], "headTop": 5, "motion": {"chest": [[0.545, 0.59, 0.11, 0.11], [0.695, 0.59, 0.11, 0.11]]}},
    "suzu/0/win": {"src": "./art/standing/suzu-2.webp", "character": "suzu", "outfit": 0, "mood": "win", "face": [382, 102, 608, 328], "headTop": 13, "motion": {"chest": [[0.35, 0.635, 0.1, 0.105], [0.525, 0.625, 0.1, 0.105]]}},
    "kohaku/0/challenge": {"src": "./art/standing/kohaku-challenge.webp", "character": "kohaku", "outfit": 0, "mood": "challenge", "face": [397, 216, 612, 431], "headTop": 7, "motion": {"chest": [[0.545, 0.68, 0.11, 0.11], [0.685, 0.67, 0.11, 0.11]]}},
    "suzu/0/challenge": {"src": "./art/standing/suzu-challenge.webp", "character": "suzu", "outfit": 0, "mood": "challenge", "face": [384, 231, 623, 470], "headTop": 10, "motion": {"chest": [[0.505, 0.7, 0.105, 0.11], [0.65, 0.695, 0.1, 0.105]]}},
    "kohaku/0/comeback": {"src": "./art/standing/kohaku-comeback.webp", "character": "kohaku", "outfit": 0, "mood": "comeback", "face": [374, 141, 578, 344], "headTop": 10, "motion": {"chest": [[0.545, 0.6, 0.11, 0.105], [0.69, 0.6, 0.11, 0.105]]}},
    "suzu/0/comeback": {"src": "./art/standing/suzu-comeback.webp", "character": "suzu", "outfit": 0, "mood": "comeback", "face": [387, 180, 603, 396], "headTop": 7, "motion": {"chest": [[0.365, 0.645, 0.1, 0.105], [0.545, 0.635, 0.1, 0.105]]}},
    "kohaku/0/despair": {"src": "./art/standing/kohaku-despair.webp", "character": "kohaku", "outfit": 0, "mood": "despair", "face": [401, 273, 593, 464], "headTop": 17, "motion": {"chest": [[0.545, 0.65, 0.1, 0.1], [0.68, 0.635, 0.1, 0.1]]}},
    "suzu/0/despair": {"src": "./art/standing/suzu-despair.webp", "character": "suzu", "outfit": 0, "mood": "despair", "face": [388, 250, 569, 431], "headTop": 11, "motion": {"chest": [[0.42, 0.62, 0.085, 0.09], [0.555, 0.62, 0.085, 0.09]]}},
    "kohaku/0/embarrassed": {"src": "./art/standing/kohaku-embarrassed.webp", "character": "kohaku", "outfit": 0, "mood": "embarrassed", "face": [395, 143, 605, 353], "headTop": 9, "motion": {"chest": [[0.535, 0.59, 0.105, 0.11], [0.695, 0.59, 0.105, 0.11]]}},
    "suzu/0/embarrassed": {"src": "./art/standing/suzu-embarrassed.webp", "character": "suzu", "outfit": 0, "mood": "embarrassed", "face": [396, 175, 615, 395], "headTop": 10, "motion": {"chest": [[0.385, 0.65, 0.095, 0.1], [0.56, 0.64, 0.095, 0.1]]}},
    "kohaku/0/pale": {"src": "./art/standing/kohaku-pale.webp", "character": "kohaku", "outfit": 0, "mood": "pale", "face": [379, 133, 593, 347], "headTop": 6, "motion": {"chest": [[0.545, 0.6, 0.11, 0.11], [0.69, 0.6, 0.11, 0.11]]}},
    "suzu/0/pale": {"src": "./art/standing/suzu-pale.webp", "character": "suzu", "outfit": 0, "mood": "pale", "face": [387, 173, 622, 408], "headTop": 9, "motion": {"chest": [[0.37, 0.64, 0.09, 0.085], [0.555, 0.635, 0.095, 0.09]]}},
    "kohaku/0/remember": {"src": "./art/standing/kohaku-remember.webp", "character": "kohaku", "outfit": 0, "mood": "remember", "face": [360, 178, 551, 369], "headTop": 8, "motion": {"chest": [[0.54, 0.6, 0.095, 0.1], [0.685, 0.6, 0.105, 0.105]]}},
    "suzu/0/remember": {"src": "./art/standing/suzu-remember.webp", "character": "suzu", "outfit": 0, "mood": "remember", "face": [396, 199, 603, 406], "headTop": 10, "motion": {"chest": [[0.43, 0.66, 0.09, 0.1], [0.6, 0.65, 0.095, 0.1]]}},
    "kohaku/0/resolve": {"src": "./art/standing/kohaku-resolve.webp", "character": "kohaku", "outfit": 0, "mood": "resolve", "face": [403, 181, 599, 377], "headTop": 8, "motion": {"chest": [[0.545, 0.6, 0.11, 0.11], [0.695, 0.6, 0.11, 0.11]]}},
    "suzu/0/resolve": {"src": "./art/standing/suzu-resolve.webp", "character": "suzu", "outfit": 0, "mood": "resolve", "face": [408, 188, 613, 393], "headTop": 10, "motion": {"chest": [[0.39, 0.64, 0.095, 0.1], [0.57, 0.63, 0.095, 0.1]]}},
    "kohaku/1/neutral": {"src": "./art/standing/kohaku-01.webp", "character": "kohaku", "outfit": 1, "mood": "neutral", "face": [393, 139, 596, 343], "headTop": 9, "motion": {"chest": [[0.515, 0.6, 0.11, 0.11], [0.68, 0.6, 0.11, 0.11]], "blink": {"src": "./art/standing/blinks/kohaku-01.webp", "crop": [0.3429027, 0.1315789, 0.2870813, 0.1754386], "eyes": [[0.4322169, 0.2232855, 0.0438596, 0.0223285, -0.44], [0.5271132, 0.1770335, 0.0518341, 0.0239234, -0.4]]}}},
    "suzu/1/neutral": {"src": "./art/standing/suzu-01.webp", "character": "suzu", "outfit": 1, "mood": "neutral", "face": [388, 146, 603, 361], "headTop": 9, "motion": {"chest": [[0.37, 0.625, 0.105, 0.11], [0.57, 0.625, 0.105, 0.11]], "blink": {"src": "./art/standing/blinks/suzu-01.webp", "crop": [0.3429027, 0.1315789, 0.2870813, 0.1754386], "eyes": [[0.4258373, 0.2272727, 0.0518341, 0.0247209, -0.2], [0.5406699, 0.1969697, 0.0574163, 0.0255183, -0.24]]}}},
    "kohaku/1/loss": {"src": "./art/standing/kohaku-1-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "loss", "face": [403, 223, 568, 387], "headTop": 10, "motion": {"chest": [[0.515, 0.595, 0.095, 0.085], [0.67, 0.595, 0.105, 0.1]]}},
    "suzu/1/loss": {"src": "./art/standing/suzu-1-lv1.webp", "character": "suzu", "outfit": 1, "mood": "loss", "face": [419, 268, 594, 443], "headTop": 13, "motion": {"chest": [[0.415, 0.68, 0.09, 0.085], [0.59, 0.665, 0.095, 0.09]]}},
    "kohaku/1/win": {"src": "./art/standing/kohaku-2-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "win", "face": [381, 102, 567, 287], "headTop": 6, "motion": {"chest": [[0.53, 0.6, 0.11, 0.11], [0.685, 0.6, 0.11, 0.11]]}},
    "suzu/1/win": {"src": "./art/standing/suzu-2-lv1.webp", "character": "suzu", "outfit": 1, "mood": "win", "face": [384, 109, 607, 333], "headTop": 14, "motion": {"chest": [[0.33, 0.65, 0.1, 0.105], [0.545, 0.64, 0.105, 0.11]]}},
    "kohaku/1/challenge": {"src": "./art/standing/kohaku-challenge-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "challenge", "face": [389, 216, 602, 430], "headTop": 7, "motion": {"chest": [[0.535, 0.685, 0.11, 0.11], [0.68, 0.68, 0.11, 0.11]]}},
    "suzu/1/challenge": {"src": "./art/standing/suzu-challenge-lv1.webp", "character": "suzu", "outfit": 1, "mood": "challenge", "face": [409, 236, 644, 471], "headTop": 6, "motion": {"chest": [[0.49, 0.74, 0.1, 0.105], [0.68, 0.725, 0.1, 0.105]]}},
    "kohaku/1/comeback": {"src": "./art/standing/kohaku-comeback-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "comeback", "face": [379, 135, 579, 336], "headTop": 10, "motion": {"chest": [[0.535, 0.6, 0.11, 0.11], [0.685, 0.6, 0.11, 0.11]]}},
    "suzu/1/comeback": {"src": "./art/standing/suzu-comeback-lv1.webp", "character": "suzu", "outfit": 1, "mood": "comeback", "face": [397, 179, 616, 398], "headTop": 10, "motion": {"chest": [[0.335, 0.675, 0.1, 0.105], [0.55, 0.665, 0.105, 0.11]]}},
    "kohaku/1/despair": {"src": "./art/standing/kohaku-despair-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "despair", "face": [412, 289, 623, 500], "headTop": 19, "motion": {"chest": [[0.53, 0.65, 0.105, 0.1], [0.665, 0.635, 0.105, 0.1]]}},
    "suzu/1/despair": {"src": "./art/standing/suzu-despair-lv1.webp", "character": "suzu", "outfit": 1, "mood": "despair", "face": [376, 259, 568, 451], "headTop": 10, "motion": {"chest": [[0.4, 0.62, 0.095, 0.1], [0.585, 0.62, 0.095, 0.1]]}},
    "kohaku/1/embarrassed": {"src": "./art/standing/kohaku-embarrassed-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "embarrassed", "face": [396, 149, 613, 366], "headTop": 7, "motion": {"chest": [[0.52, 0.6, 0.11, 0.11], [0.68, 0.6, 0.11, 0.11]]}},
    "suzu/1/embarrassed": {"src": "./art/standing/suzu-embarrassed-lv1.webp", "character": "suzu", "outfit": 1, "mood": "embarrassed", "face": [400, 173, 621, 394], "headTop": 6, "motion": {"chest": [[0.355, 0.685, 0.1, 0.105], [0.56, 0.675, 0.1, 0.105]]}},
    "kohaku/1/pale": {"src": "./art/standing/kohaku-pale-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "pale", "face": [373, 136, 579, 342], "headTop": 7, "motion": {"chest": [[0.525, 0.6, 0.11, 0.11], [0.68, 0.6, 0.11, 0.11]]}},
    "suzu/1/pale": {"src": "./art/standing/suzu-pale-lv1.webp", "character": "suzu", "outfit": 1, "mood": "pale", "face": [386, 178, 610, 402], "headTop": 7, "motion": {"chest": [[0.35, 0.65, 0.09, 0.08], [0.565, 0.65, 0.095, 0.09]]}},
    "kohaku/1/remember": {"src": "./art/standing/kohaku-remember-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "remember", "face": [362, 177, 549, 364], "headTop": 8, "motion": {"chest": [[0.52, 0.6, 0.095, 0.1], [0.675, 0.6, 0.105, 0.105]]}},
    "suzu/1/remember": {"src": "./art/standing/suzu-remember-lv1.webp", "character": "suzu", "outfit": 1, "mood": "remember", "face": [401, 200, 611, 410], "headTop": 9, "motion": {"chest": [[0.4, 0.695, 0.09, 0.1], [0.605, 0.685, 0.1, 0.105]]}},
    "kohaku/1/resolve": {"src": "./art/standing/kohaku-resolve-lv1.webp", "character": "kohaku", "outfit": 1, "mood": "resolve", "face": [408, 181, 605, 378], "headTop": 9, "motion": {"chest": [[0.525, 0.6, 0.11, 0.11], [0.69, 0.6, 0.11, 0.11]]}},
    "suzu/1/resolve": {"src": "./art/standing/suzu-resolve-lv1.webp", "character": "suzu", "outfit": 1, "mood": "resolve", "face": [401, 185, 618, 402], "headTop": 9, "motion": {"chest": [[0.35, 0.675, 0.1, 0.1], [0.57, 0.665, 0.1, 0.105]]}},
    "kohaku/2/neutral": {"src": "./art/standing/kohaku-02.webp", "character": "kohaku", "outfit": 2, "mood": "neutral", "face": [382, 182, 579, 379], "headTop": 9, "motion": {"chest": [[0.475, 0.545, 0.095, 0.085], [0.64, 0.545, 0.1, 0.085]], "blink": {"src": "./art/standing/blinks/kohaku-02.webp", "crop": [0.3429027, 0.1315789, 0.2870813, 0.1754386], "eyes": [[0.400319, 0.2623604, 0.0422648, 0.0191388, -0.23], [0.507177, 0.23126, 0.0502392, 0.0215311, -0.32]]}}},
    "suzu/2/neutral": {"src": "./art/standing/suzu-02.webp", "character": "suzu", "outfit": 2, "mood": "neutral", "face": [398, 182, 604, 388], "headTop": 9, "motion": {"chest": [[0.42, 0.625, 0.09, 0.085], [0.595, 0.615, 0.095, 0.09]], "blink": {"src": "./art/standing/blinks/suzu-02.webp", "crop": [0.3429027, 0.1315789, 0.2870813, 0.1754386], "eyes": [[0.4186603, 0.261563, 0.0502392, 0.0215311, -0.16], [0.5438596, 0.2288676, 0.0606061, 0.023126, -0.25]]}}},
    "kohaku/2/loss": {"src": "./art/standing/kohaku-1-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "loss", "face": [407, 218, 578, 389], "headTop": 8, "motion": {"chest": [[0.495, 0.605, 0.095, 0.09], [0.655, 0.6, 0.105, 0.1]]}},
    "suzu/2/loss": {"src": "./art/standing/suzu-1-lv2.webp", "character": "suzu", "outfit": 2, "mood": "loss", "face": [418, 266, 597, 446], "headTop": 13, "motion": {"chest": [[0.425, 0.655, 0.09, 0.085], [0.595, 0.645, 0.095, 0.09]]}},
    "kohaku/2/win": {"src": "./art/standing/kohaku-2-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "win", "face": [400, 105, 579, 284], "headTop": 6, "motion": {"chest": [[0.5, 0.61, 0.105, 0.11], [0.675, 0.6, 0.105, 0.11]]}},
    "suzu/2/win": {"src": "./art/standing/suzu-2-lv2.webp", "character": "suzu", "outfit": 2, "mood": "win", "face": [383, 102, 605, 324], "headTop": 9, "motion": {"chest": [[0.385, 0.66, 0.1, 0.105], [0.575, 0.64, 0.1, 0.105]]}},
    "kohaku/2/challenge": {"src": "./art/standing/kohaku-challenge-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "challenge", "face": [398, 219, 618, 438], "headTop": 10, "motion": {"chest": [[0.505, 0.705, 0.105, 0.1], [0.67, 0.695, 0.105, 0.1]]}},
    "suzu/2/challenge": {"src": "./art/standing/suzu-challenge-lv2.webp", "character": "suzu", "outfit": 2, "mood": "challenge", "face": [411, 232, 644, 464], "headTop": 8, "motion": {"chest": [[0.51, 0.735, 0.095, 0.1], [0.675, 0.715, 0.095, 0.1]]}},
    "kohaku/2/comeback": {"src": "./art/standing/kohaku-comeback-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "comeback", "face": [379, 135, 583, 338], "headTop": 8, "motion": {"chest": [[0.505, 0.61, 0.105, 0.11], [0.67, 0.61, 0.105, 0.11]]}},
    "suzu/2/comeback": {"src": "./art/standing/suzu-comeback-lv2.webp", "character": "suzu", "outfit": 2, "mood": "comeback", "face": [391, 177, 612, 397], "headTop": 6, "motion": {"chest": [[0.375, 0.65, 0.1, 0.105], [0.585, 0.65, 0.1, 0.105]]}},
    "kohaku/2/despair": {"src": "./art/standing/kohaku-despair-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "despair", "face": [404, 290, 599, 485], "headTop": 18, "motion": {"chest": [[0.505, 0.66, 0.1, 0.1], [0.67, 0.645, 0.105, 0.1]]}},
    "suzu/2/despair": {"src": "./art/standing/suzu-despair-lv2.webp", "character": "suzu", "outfit": 2, "mood": "despair", "face": [383, 267, 567, 451], "headTop": 15, "motion": {"chest": [[0.445, 0.62, 0.08, 0.095], [0.59, 0.62, 0.08, 0.095]]}},
    "kohaku/2/embarrassed": {"src": "./art/standing/kohaku-embarrassed-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "embarrassed", "face": [387, 148, 598, 359], "headTop": 10, "motion": {"chest": [[0.495, 0.615, 0.1, 0.105], [0.66, 0.605, 0.1, 0.105]]}},
    "suzu/2/embarrassed": {"src": "./art/standing/suzu-embarrassed-lv2.webp", "character": "suzu", "outfit": 2, "mood": "embarrassed", "face": [401, 169, 626, 394], "headTop": 6, "motion": {"chest": [[0.38, 0.65, 0.1, 0.105], [0.58, 0.65, 0.1, 0.105]]}},
    "kohaku/2/pale": {"src": "./art/standing/kohaku-pale-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "pale", "face": [363, 136, 574, 347], "headTop": 7, "motion": {"chest": [[0.495, 0.61, 0.105, 0.11], [0.66, 0.6, 0.105, 0.11]]}},
    "suzu/2/pale": {"src": "./art/standing/suzu-pale-lv2.webp", "character": "suzu", "outfit": 2, "mood": "pale", "face": [387, 170, 620, 404], "headTop": 11, "motion": {"chest": [[0.39, 0.64, 0.09, 0.08], [0.575, 0.64, 0.095, 0.09]]}},
    "kohaku/2/remember": {"src": "./art/standing/kohaku-remember-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "remember", "face": [375, 172, 565, 361], "headTop": 7, "motion": {"chest": [[0.495, 0.62, 0.095, 0.1], [0.67, 0.62, 0.105, 0.105]]}},
    "suzu/2/remember": {"src": "./art/standing/suzu-remember-lv2.webp", "character": "suzu", "outfit": 2, "mood": "remember", "face": [378, 201, 588, 411], "headTop": 8, "motion": {"chest": [[0.43, 0.67, 0.09, 0.1], [0.6, 0.65, 0.095, 0.1]]}},
    "kohaku/2/resolve": {"src": "./art/standing/kohaku-resolve-lv2.webp", "character": "kohaku", "outfit": 2, "mood": "resolve", "face": [409, 173, 604, 369], "headTop": 5, "motion": {"chest": [[0.5, 0.61, 0.105, 0.11], [0.675, 0.61, 0.105, 0.11]]}},
    "suzu/2/resolve": {"src": "./art/standing/suzu-resolve-lv2.webp", "character": "suzu", "outfit": 2, "mood": "resolve", "face": [401, 182, 623, 404], "headTop": 10, "motion": {"chest": [[0.39, 0.66, 0.1, 0.105], [0.595, 0.65, 0.1, 0.105]]}}
  };
  const aliases = { 0: 'neutral', 1: 'loss', 2: 'win' };
  const backgrounds = [0, 1, 2].map(level => `./art/backgrounds/stage-${level}.webp`);
  const level = value => Math.max(0, Math.min(2, Math.trunc(Number(value) || 0)));
  const bySource = new Map(Object.values(entries).map(entry => [entry.src.split('/').pop(), entry]));

  function get(character, outfit = 0, mood = 0) {
    const id = character === 'suzu' ? 'suzu' : 'kohaku';
    const expression = aliases[mood] ?? mood;
    return entries[`${id}/${level(outfit)}/${expression}`] ?? entries[`${id}/${level(outfit)}/neutral`];
  }
  function describe(src = '') {
    const path = src.split(/[?#]/)[0];
    return path.includes('/standing/') ? bySource.get(path.split('/').pop()) : undefined;
  }
  function sceneStyle(outfit) {
    return `--scene-background:url('${backgrounds[level(outfit)]}')`;
  }
  function imageStyle(entry) {
    const [left, top, right, bottom] = entry.face;
    const scale = Math.max(1.02, Math.min(1.7, 250 / (bottom - top)));
    return `--portrait-height:${(scale * 100).toFixed(3)}%;--source-head-top:${entry.headTop / 1000};--source-face-y:${(top + bottom) / 2000};--portrait-face-x:${((left + right) / 20).toFixed(3)}%`;
  }
  return { get, describe, sceneStyle, imageStyle, backgrounds };
})();
