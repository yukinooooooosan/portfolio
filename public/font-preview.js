const fonts = [
  {
    id: "system",
    label: "System Sans",
    category: "system",
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif',
    weight: "760",
    weights: ["400", "500", "600", "700", "760"],
    styles: ["normal"],
  },
  {
    id: "soft-serif",
    label: "Soft Serif",
    category: "system",
    stack: 'ui-serif, Georgia, "Times New Roman", "Hiragino Mincho ProN", "Yu Mincho", serif',
    weight: "620",
    weights: ["400", "500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "georgia",
    label: "Georgia",
    category: "system",
    stack: 'Georgia, "Times New Roman", serif',
    weight: "620",
    weights: ["400", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "avenir",
    label: "Avenir / Rounded Sans",
    category: "system",
    stack: 'Avenir, "Avenir Next", "Helvetica Neue", Arial, sans-serif',
    weight: "700",
    weights: ["400", "500", "600", "700", "800"],
    styles: ["normal", "italic"],
  },
  {
    id: "didot",
    label: "Didot / Baskerville",
    category: "system",
    stack: 'Didot, Baskerville, "Baskerville Old Face", Georgia, serif',
    weight: "500",
    weights: ["400", "500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "quiet-mono",
    label: "Quiet Mono",
    category: "system",
    stack: '"SF Mono", Menlo, Consolas, monospace',
    weight: "650",
    scale: "0.82",
    weights: ["400", "500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "hiragino-mincho",
    label: "Hiragino Mincho",
    category: "system",
    stack: '"Hiragino Mincho ProN", "Yu Mincho", YuMincho, serif',
    weight: "600",
    weights: ["400", "500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "yu-mincho",
    label: "Yu Mincho",
    category: "system",
    stack: '"Yu Mincho", YuMincho, "Hiragino Mincho ProN", serif',
    weight: "600",
    weights: ["400", "500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "times",
    label: "Times Classic",
    category: "system",
    stack: '"Times New Roman", Times, serif',
    weight: "620",
    weights: ["400", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "palatino",
    label: "Palatino",
    category: "system",
    stack: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
    weight: "600",
    weights: ["400", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "garamond",
    label: "Garamond",
    category: "system",
    stack: 'Garamond, "Apple Garamond", Georgia, serif',
    weight: "600",
    weights: ["400", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "hoefler",
    label: "Hoefler Text",
    category: "system",
    stack: '"Hoefler Text", Georgia, serif',
    weight: "560",
    weights: ["400", "500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "optima",
    label: "Optima",
    category: "system",
    stack: 'Optima, Candara, "Noto Sans", sans-serif',
    weight: "650",
    weights: ["400", "500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "gill",
    label: "Gill Sans",
    category: "system",
    stack: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif',
    weight: "700",
    weights: ["400", "500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "helvetica",
    label: "Helvetica Neue",
    category: "system",
    stack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    weight: "720",
    weights: ["400", "500", "600", "700", "800"],
    styles: ["normal", "italic"],
  },
  {
    id: "trebuchet",
    label: "Trebuchet MS",
    category: "system",
    stack: '"Trebuchet MS", "Helvetica Neue", Arial, sans-serif',
    weight: "700",
    weights: ["400", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "verdana",
    label: "Verdana",
    category: "system",
    stack: 'Verdana, Geneva, sans-serif',
    weight: "700",
    scale: "0.86",
    weights: ["400", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "lucida",
    label: "Lucida Grande",
    category: "system",
    stack: '"Lucida Grande", "Lucida Sans Unicode", Geneva, sans-serif',
    weight: "700",
    scale: "0.9",
    weights: ["400", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "arial-rounded",
    label: "Arial Rounded",
    category: "system",
    stack: '"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif',
    weight: "700",
    weights: ["700"],
    styles: ["normal"],
  },
  {
    id: "copperplate",
    label: "Copperplate",
    category: "system",
    stack: 'Copperplate, "Copperplate Gothic Light", Georgia, serif',
    weight: "500",
    scale: "0.86",
    weights: ["400", "500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "courier",
    label: "Courier",
    category: "system",
    stack: '"Courier New", Courier, monospace',
    weight: "700",
    scale: "0.8",
    weights: ["400", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "menlo",
    label: "Menlo",
    category: "system",
    stack: 'Menlo, Monaco, Consolas, monospace',
    weight: "650",
    scale: "0.8",
    weights: ["400", "500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "noteworthy",
    label: "Noteworthy",
    category: "system",
    stack: 'Noteworthy, "Comic Sans MS", cursive',
    weight: "700",
    scale: "0.86",
    weights: ["400", "700"],
    styles: ["normal"],
  },
  {
    id: "marker",
    label: "Marker Felt",
    category: "system",
    stack: '"Marker Felt", "Comic Sans MS", cursive',
    weight: "500",
    scale: "0.82",
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "american-typewriter",
    label: "American Typewriter",
    category: "system",
    stack: '"American Typewriter", "Courier New", serif',
    weight: "600",
    scale: "0.84",
    weights: ["400", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "cochin",
    label: "Cochin",
    category: "system",
    stack: 'Cochin, Georgia, serif',
    weight: "600",
    weights: ["400", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "google-cormorant",
    label: "Cormorant Garamond",
    category: "google",
    stack: '"Cormorant Garamond", Georgia, serif',
    weight: "600",
    weights: ["500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "google-eb-garamond",
    label: "EB Garamond",
    category: "google",
    stack: '"EB Garamond", Georgia, serif',
    weight: "600",
    weights: ["500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "google-playfair",
    label: "Playfair Display",
    category: "google",
    stack: '"Playfair Display", Georgia, serif',
    weight: "600",
    weights: ["500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "google-lora",
    label: "Lora",
    category: "google",
    stack: '"Lora", Georgia, serif',
    weight: "600",
    weights: ["500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "google-fraunces",
    label: "Fraunces",
    category: "google",
    stack: '"Fraunces", Georgia, serif',
    weight: "700",
    weights: ["600", "700"],
    styles: ["normal"],
  },
  {
    id: "google-libre-baskerville",
    label: "Libre Baskerville",
    category: "google",
    stack: '"Libre Baskerville", Georgia, serif',
    weight: "700",
    scale: "0.92",
    weights: ["400", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "google-marcellus",
    label: "Marcellus",
    category: "google",
    stack: '"Marcellus", Georgia, serif',
    weight: "400",
    weights: ["400"],
    styles: ["normal"],
  },
  {
    id: "google-prata",
    label: "Prata",
    category: "google",
    stack: '"Prata", Georgia, serif',
    weight: "400",
    scale: "0.92",
    weights: ["400"],
    styles: ["normal"],
  },
  {
    id: "google-spectral",
    label: "Spectral",
    category: "google",
    stack: '"Spectral", Georgia, serif',
    weight: "600",
    weights: ["500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "google-yeseva",
    label: "Yeseva One",
    category: "google",
    stack: '"Yeseva One", Georgia, serif',
    weight: "400",
    scale: "0.92",
    weights: ["400"],
    styles: ["normal"],
  },
  {
    id: "google-shippori",
    label: "Shippori Mincho",
    category: "google",
    stack: '"Shippori Mincho", "Hiragino Mincho ProN", serif',
    weight: "600",
    scale: "0.9",
    weights: ["500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "google-noto-serif-jp",
    label: "Noto Serif JP",
    category: "google",
    stack: '"Noto Serif JP", "Hiragino Mincho ProN", serif',
    weight: "600",
    scale: "0.9",
    weights: ["500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "google-noto-sans-jp",
    label: "Noto Sans JP",
    category: "google",
    stack: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
    weight: "700",
    scale: "0.9",
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "google-zen-old-mincho",
    label: "Zen Old Mincho",
    category: "google",
    stack: '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
    weight: "700",
    scale: "0.9",
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "google-zen-maru-gothic",
    label: "Zen Maru Gothic",
    category: "google",
    stack: '"Zen Maru Gothic", "Hiragino Sans", "Yu Gothic", sans-serif',
    weight: "700",
    scale: "0.9",
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "google-zen-kaku-gothic-new",
    label: "Zen Kaku Gothic New",
    category: "google",
    stack: '"Zen Kaku Gothic New", "Hiragino Sans", "Yu Gothic", sans-serif',
    weight: "700",
    scale: "0.9",
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "google-kaisei-opti",
    label: "Kaisei Opti",
    category: "google",
    stack: '"Kaisei Opti", "Hiragino Mincho ProN", serif',
    weight: "700",
    scale: "0.9",
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "google-kaisei-decol",
    label: "Kaisei Decol",
    category: "google",
    stack: '"Kaisei Decol", "Hiragino Mincho ProN", serif',
    weight: "700",
    scale: "0.9",
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "google-klee-one",
    label: "Klee One",
    category: "google",
    stack: '"Klee One", "Hiragino Mincho ProN", serif',
    weight: "600",
    scale: "0.9",
    weights: ["400", "600"],
    styles: ["normal"],
  },
  {
    id: "google-m-plus-rounded-1c",
    label: "M PLUS Rounded 1c",
    category: "google",
    stack: '"M PLUS Rounded 1c", "Hiragino Sans", "Yu Gothic", sans-serif',
    weight: "700",
    scale: "0.9",
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "google-syne",
    label: "Syne",
    category: "google",
    stack: '"Syne", "Helvetica Neue", Arial, sans-serif',
    weight: "700",
    weights: ["400", "500", "600", "700", "800"],
    styles: ["normal"],
  },
  {
    id: "google-dm-sans",
    label: "DM Sans",
    category: "google",
    stack: '"DM Sans", "Helvetica Neue", Arial, sans-serif',
    weight: "700",
    weights: ["400", "500", "600", "700"],
    styles: ["normal", "italic"],
  },
  {
    id: "google-space-grotesk",
    label: "Space Grotesk",
    category: "google",
    stack: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif',
    weight: "700",
    weights: ["400", "500", "600", "700"],
    styles: ["normal"],
  },
];

const categoryLabels = {
  system: "System Fonts",
  google: "Google Fonts Recommended",
  all: "All",
};

const scriptLabels = {
  latin: "英語オンリー",
  jp: "日本語+英語",
};

const japaneseFontTokens = [
  "Hiragino",
  "Yu Mincho",
  "YuMincho",
  "Yu Gothic",
  "YuGothic",
  "Noto Serif JP",
  "Noto Sans JP",
  "Shippori Mincho",
  "Zen Old Mincho",
  "Zen Maru Gothic",
  "Zen Kaku Gothic New",
  "Kaisei Opti",
  "Kaisei Decol",
  "Klee One",
  "M PLUS Rounded 1c",
];

const getFontScript = (font) => (
  japaneseFontTokens.some((token) => font.stack.includes(token)) ? "jp" : "latin"
);

const getFontMetaLabel = (font) => (
  `${categoryLabels[font.category]} / ${scriptLabels[getFontScript(font)]}`
);

const scriptPicker = document.querySelector("#script-picker");
const categoryPicker = document.querySelector("#category-picker");
const fontPicker = document.querySelector("#font-picker");
const weightPicker = document.querySelector("#weight-picker");
const stylePicker = document.querySelector("#style-picker");
const enSizeInput = document.querySelector("#en-size-input");
const previewTextInput = document.querySelector("#preview-text-input");
const jpFontPicker = document.querySelector("#jp-font-picker");
const fallbackFontField = document.querySelector("#fallback-font-field");
const jpWeightPicker = document.querySelector("#jp-weight-picker");
const jpStylePicker = document.querySelector("#jp-style-picker");
const jpSizeInput = document.querySelector("#jp-size-input");
const matchJpFontToggle = document.querySelector("#match-jp-font");
const showRoleUnderlinesToggle = document.querySelector("#show-role-underlines");
const punctuationAsJpToggle = document.querySelector("#punctuation-as-jp");
const textColorPicker = document.querySelector("#text-color-picker");
const cardColorPicker = document.querySelector("#card-color-picker");
const pageColorPicker = document.querySelector("#page-color-picker");
const clearColorsButton = document.querySelector("#clear-colors");
const loadColorDefaultsButton = document.querySelector("#load-color-defaults");
const saveColorDefaultsButton = document.querySelector("#save-color-defaults");
const defaultTextSwatch = document.querySelector("#default-text-swatch");
const defaultCardSwatch = document.querySelector("#default-card-swatch");
const defaultPageSwatch = document.querySelector("#default-page-swatch");
const liveFontCard = document.querySelector("#live-font-card");
const liveTitle = document.querySelector("#live-preview-title");
const liveRoleStrip = document.querySelector("#live-role-strip");
const liveStack = document.querySelector("#live-font-stack");
const liveVariantNote = document.querySelector("#live-variant-note");
const prevButton = document.querySelector("#prev-font");
const nextButton = document.querySelector("#next-font");
const keepButton = document.querySelector("#keep-font");
const operateEnCheckbox = document.querySelector("#operate-en");
const operateJpCheckbox = document.querySelector("#operate-jp");
const keptGrid = document.querySelector("#kept-grid");
const emptyMessage = document.querySelector("#empty-message");
const candidateGrid = document.querySelector("#candidate-grid");
const keptFontIds = new Set();

let currentIndex = 0;
let currentScript = "all";
let currentCategory = "system";
let currentWeight = "";
let currentStyle = "normal";
let currentEnSize = Number.parseInt(enSizeInput.value, 10);
let currentJpFont = "system-sans";
let matchJpToEn = matchJpFontToggle.checked;
let currentJpWeight = "";
let currentJpStyle = "normal";
let currentJpSize = Number.parseInt(jpSizeInput.value, 10);
let showRoleUnderlines = showRoleUnderlinesToggle.checked;
let punctuationAsJp = punctuationAsJpToggle.checked;
let sampleText = previewTextInput.value;
const previewColors = {
  text: textColorPicker.value,
  card: cardColorPicker.value,
  page: pageColorPicker.value,
};
const colorDefaults = { ...previewColors };
const clearColors = {
  text: "#111111",
  card: "#ffffff",
  page: "#ffffff",
};
const fallbackSampleText = "これはTestです。";

const normalizeFontSize = (value, fallback) => {
  const size = Number.parseInt(value, 10);

  if (!Number.isFinite(size)) {
    return fallback;
  }

  return Math.min(200, Math.max(20, size));
};

const getSizeConfig = (sizeConfig = {}) => ({
  en: normalizeFontSize(sizeConfig.en ?? currentEnSize, 100),
  jp: normalizeFontSize(sizeConfig.jp ?? currentJpSize, 42),
});

const jpFonts = [
  {
    id: "system-sans",
    label: "System Japanese Sans",
    stack: '"Hiragino Sans", "Yu Gothic", "YuGothic", system-ui, sans-serif',
    weights: ["400", "500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "system-serif",
    label: "System Japanese Serif",
    stack: '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif',
    weights: ["400", "500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "shippori",
    label: "Shippori Mincho",
    stack: '"Shippori Mincho", "Hiragino Mincho ProN", serif',
    weights: ["500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "noto-serif-jp",
    label: "Noto Serif JP",
    stack: '"Noto Serif JP", "Hiragino Mincho ProN", serif',
    weights: ["500", "600", "700"],
    styles: ["normal"],
  },
  {
    id: "noto-sans-jp",
    label: "Noto Sans JP",
    stack: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif',
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "zen-old-mincho",
    label: "Zen Old Mincho",
    stack: '"Zen Old Mincho", "Hiragino Mincho ProN", serif',
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "zen-maru-gothic",
    label: "Zen Maru Gothic",
    stack: '"Zen Maru Gothic", "Hiragino Sans", "Yu Gothic", sans-serif',
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "zen-kaku-gothic-new",
    label: "Zen Kaku Gothic New",
    stack: '"Zen Kaku Gothic New", "Hiragino Sans", "Yu Gothic", sans-serif',
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "kaisei-opti",
    label: "Kaisei Opti",
    stack: '"Kaisei Opti", "Hiragino Mincho ProN", serif',
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "kaisei-decol",
    label: "Kaisei Decol",
    stack: '"Kaisei Decol", "Hiragino Mincho ProN", serif',
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
  {
    id: "klee-one",
    label: "Klee One",
    stack: '"Klee One", "Hiragino Mincho ProN", serif',
    weights: ["400", "600"],
    styles: ["normal"],
  },
  {
    id: "m-plus-rounded-1c",
    label: "M PLUS Rounded 1c",
    stack: '"M PLUS Rounded 1c", "Hiragino Sans", "Yu Gothic", sans-serif',
    weights: ["400", "500", "700"],
    styles: ["normal"],
  },
];

const getVisibleFonts = () => {
  return fonts.filter((font) => {
    const matchesCategory = currentCategory === "all" || font.category === currentCategory;
    const matchesScript = currentScript === "all" || getFontScript(font) === currentScript;

    return matchesCategory && matchesScript;
  });
};

const getSelectedVariant = (font) => {
  const weight = font.weights.includes(currentWeight) ? currentWeight : font.weight;
  const style = ["normal", "italic"].includes(currentStyle) ? currentStyle : "normal";

  return { weight, style };
};

const getEffectiveJpFontId = (
  font,
  jpFontId = currentJpFont,
  matchToEn = matchJpToEn,
) => (
  matchToEn && getFontScript(font) === "jp" ? "match" : jpFontId
);

const isJpUsingFallback = (
  font,
  jpFontId = currentJpFont,
  matchToEn = matchJpToEn,
) => getEffectiveJpFontId(font, jpFontId, matchToEn) !== "match";

const getSelectedJpVariant = (
  font,
  jpFontId = currentJpFont,
  matchToEn = matchJpToEn,
) => {
  const effectiveJpFontId = getEffectiveJpFontId(font, jpFontId, matchToEn);
  const fallbackFont = jpFonts.find((jpFont) => jpFont.id === jpFontId);
  const weights = effectiveJpFontId === "match" ? font.weights : fallbackFont?.weights ?? jpFonts[0].weights;
  const styles = effectiveJpFontId === "match" ? font.styles : fallbackFont?.styles ?? jpFonts[0].styles;
  const defaultWeight = weights.includes("600") ? "600" : weights[0];
  const weight = weights.includes(currentJpWeight) ? currentJpWeight : defaultWeight;
  const style = ["normal", "italic"].includes(currentJpStyle) ? currentJpStyle : "normal";

  return { weight, style };
};

const isPseudoItalic = (font, variant) => (
  variant.style === "italic" && !font.styles.includes("italic")
);

const getJpStack = (
  font,
  jpFontId = currentJpFont,
  matchToEn = matchJpToEn,
) => {
  if (getEffectiveJpFontId(font, jpFontId, matchToEn) === "match") {
    return font.stack;
  }

  return jpFonts.find((jpFont) => jpFont.id === jpFontId)?.stack ?? jpFonts[0].stack;
};

const getJpFontLabel = (
  font,
  jpFontId = currentJpFont,
  matchToEn = matchJpToEn,
) => {
  if (getEffectiveJpFontId(font, jpFontId, matchToEn) === "match") {
    return `英字と同一 (${font.label})`;
  }

  const fallbackLabel = jpFonts.find((jpFont) => jpFont.id === jpFontId)?.label ?? jpFonts[0].label;
  return matchToEn ? `フォールバック (${fallbackLabel})` : fallbackLabel;
};

const isPseudoJpItalic = (
  font,
  jpFontId = currentJpFont,
  jpVariant = getSelectedJpVariant(font),
  matchToEn = matchJpToEn,
) => {
  if (jpVariant.style !== "italic") {
    return false;
  }

  if (getEffectiveJpFontId(font, jpFontId, matchToEn) === "match") {
    return !font.styles.includes("italic");
  }

  const fallbackFont = jpFonts.find((jpFont) => jpFont.id === jpFontId) ?? jpFonts[0];
  return !fallbackFont.styles.includes("italic");
};

const getJpMetaLabel = (
  font,
  jpFontId = currentJpFont,
  jpVariant = getSelectedJpVariant(font),
  matchToEn = matchJpToEn,
) => {
  const styleLabel = isPseudoJpItalic(font, jpFontId, jpVariant, matchToEn) ? "italic (pseudo)" : jpVariant.style;
  const fallbackHint = matchToEn && isJpUsingFallback(font, jpFontId, matchToEn)
    ? " / 英字フォントが日本語非対応のためfallback"
    : matchToEn ? " / fallbackなし" : "";

  return `日本語: ${getJpFontLabel(font, jpFontId, matchToEn)} / ${jpVariant.weight} / ${styleLabel}${fallbackHint}`;
};

const isJapanesePunctuation = (character) => (
  /[\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/.test(character)
);

const isJapaneseCharacter = (character, punctuationIsJapanese = punctuationAsJp) => (
  /[\u3040-\u30ff\u3400-\u9fff\uff66-\uff9f]/.test(character)
  || (punctuationIsJapanese && isJapanesePunctuation(character))
);

const renderHeadingText = (
  heading,
  font,
  variant = getSelectedVariant(font),
  text = sampleText,
  jpFontId = currentJpFont,
  jpVariant = getSelectedJpVariant(font),
  sizeConfig = getSizeConfig(),
  matchToEn = matchJpToEn,
  punctuationIsJapanese = punctuationAsJp,
) => {
  const displayText = text.trim() || fallbackSampleText;
  const jpStack = getJpStack(font, jpFontId, matchToEn);
  const sizes = getSizeConfig(sizeConfig);
  const runs = [];
  let currentRun = "";
  let currentRunIsJapanese = null;

  heading.replaceChildren();
  heading.style.color = previewColors.text;
  heading.setAttribute("aria-label", displayText);

  [...displayText].forEach((character) => {
    const characterIsJapanese = isJapaneseCharacter(character, punctuationIsJapanese);

    if (currentRun && characterIsJapanese !== currentRunIsJapanese) {
      runs.push({ text: currentRun, isJapanese: currentRunIsJapanese });
      currentRun = "";
    }

    currentRun += character;
    currentRunIsJapanese = characterIsJapanese;
  });

  if (currentRun) {
    runs.push({ text: currentRun, isJapanese: currentRunIsJapanese });
  }

  runs.forEach((run) => {
    const span = document.createElement("span");
    span.textContent = run.text;
    span.classList.toggle("title-en", !run.isJapanese);
    span.classList.toggle("title-ja", run.isJapanese);
    span.style.fontFamily = run.isJapanese ? jpStack : font.stack;
    span.style.fontWeight = run.isJapanese ? jpVariant.weight : variant.weight;
    span.style.fontStyle = run.isJapanese ? jpVariant.style : variant.style;
    span.style.fontSize = `${run.isJapanese ? sizes.jp : sizes.en}%`;
    heading.append(span);
  });
};

const applyFontToHeading = (
  heading,
  font,
  variant = getSelectedVariant(font),
  text = sampleText,
  jpFontId = currentJpFont,
  jpVariant = getSelectedJpVariant(font),
  sizeConfig = getSizeConfig(),
  matchToEn = matchJpToEn,
  punctuationIsJapanese = punctuationAsJp,
) => {
  renderHeadingText(heading, font, variant, text, jpFontId, jpVariant, sizeConfig, matchToEn, punctuationIsJapanese);
  heading.classList.toggle("compact-title", Boolean(font.scale));
};

const applyColorsToCard = (card, colors = previewColors) => {
  card.style.backgroundColor = colors.card;
  card.querySelectorAll("h2").forEach((heading) => {
    heading.style.color = colors.text;
  });
};

const createRoleChip = (role, label, detail) => {
  const chip = document.createElement("p");
  chip.className = `font-role-chip font-role-chip-${role}`;

  const roleText = document.createElement("strong");
  roleText.textContent = role.toUpperCase();

  const labelText = document.createElement("span");
  labelText.textContent = label;

  const detailText = document.createElement("span");
  detailText.textContent = detail;

  chip.append(roleText, labelText, detailText);
  return chip;
};

const renderRoleStrip = (
  strip,
  font,
  variant = getSelectedVariant(font),
  jpFontId = currentJpFont,
  jpVariant = getSelectedJpVariant(font),
  matchToEn = matchJpToEn,
) => {
  const enLabel = `${font.label} / ${variant.weight} / ${isPseudoItalic(font, variant) ? "italic (pseudo)" : variant.style}`;
  const jpLabel = `${getJpFontLabel(font, jpFontId, matchToEn)} / ${jpVariant.weight} / ${isPseudoJpItalic(font, jpFontId, jpVariant, matchToEn) ? "italic (pseudo)" : jpVariant.style}`;

  strip.replaceChildren(
    createRoleChip("en", "英字", enLabel),
    createRoleChip("ja", "日本語", jpLabel),
  );
};

const createFontCard = (
  font,
  includeKeepButton = false,
  variant = { weight: font.weight, style: "normal" },
  colors = previewColors,
  selectable = false,
  text = sampleText,
  jpFontId = currentJpFont,
  jpVariant = getSelectedJpVariant(font),
  sizeConfig = getSizeConfig(),
  matchToEn = matchJpToEn,
  punctuationIsJapanese = punctuationAsJp,
) => {
  const card = document.createElement("article");
  card.className = "font-card";
  card.classList.toggle("show-role-underlines", showRoleUnderlines);
  const sizes = getSizeConfig(sizeConfig);

  if (selectable) {
    card.classList.add("font-card-selectable");
    card.tabIndex = 0;
    card.setAttribute(
      "aria-label",
      `${font.label} ${variant.weight} ${variant.style} を上のプレビューに表示`,
    );
    card.addEventListener("click", () => selectFontVariant(font, variant, text, jpFontId, jpVariant, sizes, matchToEn, punctuationIsJapanese));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectFontVariant(font, variant, text, jpFontId, jpVariant, sizes, matchToEn, punctuationIsJapanese);
      }
    });
  }

  const name = document.createElement("p");
  name.className = "font-name";
  name.textContent = `${font.label} / ${getFontMetaLabel(font)}`;

  const roleStrip = document.createElement("div");
  roleStrip.className = "font-role-strip";
  roleStrip.setAttribute("aria-label", "適用中のフォント");
  renderRoleStrip(roleStrip, font, variant, jpFontId, jpVariant, matchToEn);

  const heading = document.createElement("h2");
  applyFontToHeading(heading, font, variant, text, jpFontId, jpVariant, sizes, matchToEn, punctuationIsJapanese);

  const stack = document.createElement("p");
  stack.className = "font-stack";
  const styleLabel = isPseudoItalic(font, variant) ? "italic (pseudo)" : variant.style;
  stack.textContent = `英字: ${font.stack} / ${variant.weight} / ${styleLabel} / ${sizes.en}% | ${getJpMetaLabel(font, jpFontId, jpVariant, matchToEn)} / ${sizes.jp}%`;

  const copy = document.createElement("p");
  copy.className = "sample-copy";
  copy.textContent = "英字と日本語の組み合わせを確認できます。";

  card.append(name, roleStrip, heading, stack, copy);
  applyColorsToCard(card, colors);

  if (includeKeepButton) {
    const footer = document.createElement("div");
    footer.className = "font-card-footer";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "keep-action";
    button.textContent = "Keep";
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      keepFont(font, variant);
    });

    footer.append(button);
    card.append(footer);
  }

  return card;
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

const getCssSnippet = (
  font,
  variant,
  colors,
  jpFontId,
  jpVariant,
  sizeConfig,
  matchToEn,
) => {
  const sizes = getSizeConfig(sizeConfig);
  const jpStack = getJpStack(font, jpFontId, matchToEn);

  return `.font-pair-page {
  background: ${colors.page};
}

.font-pair-preview {
  color: ${colors.text};
  background: ${colors.card};
}

.font-pair-preview .title-en {
  font-family: ${font.stack};
  font-weight: ${variant.weight};
  font-style: ${variant.style};
  font-size: ${sizes.en}%;
}

.font-pair-preview .title-ja {
  font-family: ${jpStack};
  font-weight: ${jpVariant.weight};
  font-style: ${jpVariant.style};
  font-size: ${sizes.jp}%;
  line-height: 1.45;
}`;
};

const renderPicker = () => {
  const visibleFonts = getVisibleFonts();
  const options = visibleFonts.map((font) => {
    const option = document.createElement("option");
    option.value = font.id;
    option.textContent = font.label;
    return option;
  });

  fontPicker.replaceChildren();
  fontPicker.append(...options);
  fontPicker.value = visibleFonts[0]?.id ?? "";
};

const renderVariantPickers = (font) => {
  const weightOptions = font.weights.map((weight) => {
    const option = document.createElement("option");
    option.value = weight;
    option.textContent = weight;
    return option;
  });
  const styleOptions = ["normal", "italic"].map((style) => {
    const option = document.createElement("option");
    option.value = style;
    if (style === "italic") {
      option.textContent = font.styles.includes("italic") ? "Italic" : "Italic（擬似）";
    } else {
      option.textContent = "Normal";
    }
    return option;
  });

  weightPicker.replaceChildren(...weightOptions);
  stylePicker.replaceChildren(...styleOptions);

  currentWeight = font.weights.includes(currentWeight) ? currentWeight : font.weight;
  currentStyle = ["normal", "italic"].includes(currentStyle) ? currentStyle : "normal";
  weightPicker.value = currentWeight;
  stylePicker.value = currentStyle;
};

const renderJpPicker = () => {
  const options = jpFonts.map((jpFont) => {
    const option = document.createElement("option");
    option.value = jpFont.id;
    option.textContent = jpFont.label;
    return option;
  });

  jpFontPicker.replaceChildren(...options);
  jpFontPicker.value = currentJpFont;
};

const getJpPickerValues = () => [...jpFontPicker.options].map((option) => option.value);

const renderJpVariantPickers = (font) => {
  const fallbackFont = jpFonts.find((jpFont) => jpFont.id === currentJpFont);
  const effectiveJpFontId = getEffectiveJpFontId(font);
  const weights = effectiveJpFontId === "match" ? font.weights : fallbackFont?.weights ?? jpFonts[0].weights;
  const styles = effectiveJpFontId === "match" ? font.styles : fallbackFont?.styles ?? jpFonts[0].styles;
  const defaultWeight = weights.includes("600") ? "600" : weights[0];
  const weightOptions = weights.map((weight) => {
    const option = document.createElement("option");
    option.value = weight;
    option.textContent = weight;
    return option;
  });
  const styleOptions = ["normal", "italic"].map((style) => {
    const option = document.createElement("option");
    option.value = style;
    if (style === "italic") {
      option.textContent = styles.includes("italic") ? "Italic" : "Italic（擬似）";
    } else {
      option.textContent = "Normal";
    }
    return option;
  });

  jpWeightPicker.replaceChildren(...weightOptions);
  jpStylePicker.replaceChildren(...styleOptions);
  currentJpWeight = weights.includes(currentJpWeight) ? currentJpWeight : defaultWeight;
  currentJpStyle = ["normal", "italic"].includes(currentJpStyle) ? currentJpStyle : "normal";
  jpWeightPicker.value = currentJpWeight;
  jpStylePicker.value = currentJpStyle;
};

const renderCandidates = () => {
  candidateGrid.replaceChildren();
  candidateGrid.append(
    ...getVisibleFonts().map((font) => createFontCard(font, true, undefined, previewColors, true)),
  );
};

const selectFontVariant = (
  font,
  variant,
  text = sampleText,
  jpFontId = currentJpFont,
  jpVariant = getSelectedJpVariant(font),
  sizeConfig = getSizeConfig(),
  matchToEn = matchJpToEn,
  punctuationIsJapanese = punctuationAsJp,
) => {
  const sizes = getSizeConfig(sizeConfig);
  currentScript = getFontScript(font);
  currentCategory = font.category;
  scriptPicker.value = currentScript;
  categoryPicker.value = currentCategory;
  currentIndex = getVisibleFonts().findIndex((visibleFont) => visibleFont.id === font.id);
  currentWeight = variant.weight;
  currentStyle = variant.style;
  currentEnSize = sizes.en;
  sampleText = text;
  currentJpFont = jpFontId;
  matchJpToEn = matchToEn;
  currentJpWeight = jpVariant.weight;
  currentJpStyle = jpVariant.style;
  currentJpSize = sizes.jp;
  punctuationAsJp = punctuationIsJapanese;
  previewTextInput.value = sampleText;
  enSizeInput.value = currentEnSize;
  jpFontPicker.value = currentJpFont;
  matchJpFontToggle.checked = matchJpToEn;
  jpSizeInput.value = currentJpSize;
  punctuationAsJpToggle.checked = punctuationAsJp;

  renderPicker();
  renderCandidates();
  showFont(currentIndex);
  liveFontCard.scrollIntoView({ behavior: "smooth", block: "center" });
};

const cycleJpFont = (step) => {
  const jpValues = getJpPickerValues();
  const currentJpIndex = jpValues.indexOf(currentJpFont);
  const nextJpIndex = ((currentJpIndex === -1 ? 0 : currentJpIndex) + step + jpValues.length) % jpValues.length;

  currentJpFont = jpValues[nextJpIndex];
  jpFontPicker.value = currentJpFont;
  renderCandidates();
  showFont(currentIndex);
};

const stepControlledFonts = (step) => {
  const operateEn = operateEnCheckbox.checked;
  const operateJp = operateJpCheckbox.checked;

  if (!operateEn && !operateJp) {
    showFont(currentIndex + step);
    return;
  }

  if (operateEn) {
    showFont(currentIndex + step);
  }

  if (operateJp) {
    cycleJpFont(step);
  }
};

const applyPreviewColors = () => {
  previewColors.text = textColorPicker.value;
  previewColors.card = cardColorPicker.value;
  previewColors.page = pageColorPicker.value;

  document.body.style.backgroundColor = previewColors.page;
  applyColorsToCard(liveFontCard);
  showFont(currentIndex);
};

const setColorPickers = (colors) => {
  textColorPicker.value = colors.text;
  cardColorPicker.value = colors.card;
  pageColorPicker.value = colors.page;
  applyPreviewColors();
};

const renderDefaultSwatches = () => {
  defaultTextSwatch.style.backgroundColor = colorDefaults.text;
  defaultCardSwatch.style.backgroundColor = colorDefaults.card;
  defaultPageSwatch.style.backgroundColor = colorDefaults.page;
};

const updateFallbackFieldState = (font) => {
  fallbackFontField.classList.toggle(
    "is-muted",
    matchJpToEn && !isJpUsingFallback(font),
  );
};

const showFont = (index) => {
  const visibleFonts = getVisibleFonts();
  if (visibleFonts.length === 0) {
    return;
  }
  currentIndex = (index + visibleFonts.length) % visibleFonts.length;
  const font = visibleFonts[currentIndex];
  const heading = liveFontCard.querySelector("h2");

  liveFontCard.classList.toggle("show-role-underlines", showRoleUnderlines);
  updateFallbackFieldState(font);
  renderVariantPickers(font);
  renderJpVariantPickers(font);
  const variant = getSelectedVariant(font);
  const jpVariant = getSelectedJpVariant(font);
  const sizes = getSizeConfig();
  const styleLabel = isPseudoItalic(font, variant) ? "italic (pseudo)" : variant.style;
  liveTitle.textContent = `${font.label} / ${getFontMetaLabel(font)}`;
  liveStack.textContent = `英字: ${font.stack} / ${variant.weight} / ${styleLabel} / ${sizes.en}% | ${getJpMetaLabel(font, currentJpFont, jpVariant, matchJpToEn)} / ${sizes.jp}%`;
  renderRoleStrip(liveRoleStrip, font, variant, currentJpFont, jpVariant, matchJpToEn);
  const variantNotes = [];
  if (isPseudoItalic(font, variant)) {
    variantNotes.push("英字はItalic実体なし。ブラウザの擬似Italicで表示中。");
  }
  if (isPseudoJpItalic(font, currentJpFont, jpVariant, matchJpToEn)) {
    variantNotes.push("日本語はItalic実体なし。ブラウザの擬似Italicで表示中。");
  }
  if (matchJpToEn && !isJpUsingFallback(font)) {
    variantNotes.push(`${getJpFontLabel(font)} を日本語にも指定中。`);
  }
  if (matchJpToEn && isJpUsingFallback(font)) {
    variantNotes.push(`この英字フォントは日本語非対応のため、${getJpFontLabel(font)} で表示中。`);
  }
  liveVariantNote.hidden = variantNotes.length === 0;
  liveVariantNote.textContent = variantNotes.join(" ");
  applyFontToHeading(heading, font, variant, sampleText, currentJpFont, jpVariant, sizes, matchJpToEn, punctuationAsJp);
  fontPicker.value = font.id;
};

const keepFont = (
  font = getVisibleFonts()[currentIndex],
  variant = getSelectedVariant(font),
) => {
  const keepId = [
    font.id,
    variant.weight,
    variant.style,
    sampleText,
    currentJpFont,
    currentJpWeight,
    currentJpStyle,
    matchJpToEn,
    currentEnSize,
    currentJpSize,
    punctuationAsJp,
    previewColors.text,
    previewColors.card,
    previewColors.page,
  ].join("|");

  if (keptFontIds.has(keepId)) {
    return;
  }

  keptFontIds.add(keepId);
  emptyMessage.hidden = true;
  const keptColors = { ...previewColors };
  const keptText = sampleText;
  const keptJpFont = currentJpFont;
  const keptJpVariant = getSelectedJpVariant(font);
  const keptSizes = getSizeConfig();
  const keptMatchJpToEn = matchJpToEn;
  const keptPunctuationAsJp = punctuationAsJp;
  const keptCard = createFontCard(
    font,
    false,
    variant,
    keptColors,
    true,
    keptText,
    keptJpFont,
    keptJpVariant,
    keptSizes,
    keptMatchJpToEn,
    keptPunctuationAsJp,
  );

  keptCard.classList.add("kept-card");

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "remove-keep";
  removeButton.setAttribute(
    "aria-label",
    `${font.label} ${variant.weight} ${variant.style} をKeepから削除`,
  );
  removeButton.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18"/>
      <path d="M8 6V4h8v2"/>
      <path d="M6 6l1 15h10l1-15"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
    </svg>
  `;
  removeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    keptFontIds.delete(keepId);
    keptCard.remove();
    emptyMessage.hidden = keptFontIds.size > 0;
  });

  const footer = document.createElement("div");
  footer.className = "font-card-footer";

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "copy-css";
  copyButton.textContent = "CSSをコピー";
  copyButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    const css = getCssSnippet(
      font,
      variant,
      keptColors,
      keptJpFont,
      keptJpVariant,
      keptSizes,
      keptMatchJpToEn,
    );

    try {
      await copyText(css);
      copyButton.textContent = "コピー済み";
      copyButton.classList.add("is-copied");
      window.setTimeout(() => {
        copyButton.textContent = "CSSをコピー";
        copyButton.classList.remove("is-copied");
      }, 1600);
    } catch {
      copyButton.textContent = "コピー失敗";
    }
  });

  footer.append(copyButton);
  keptCard.append(removeButton, footer);
  keptGrid.append(keptCard);
};

fontPicker.addEventListener("change", () => {
  const nextIndex = getVisibleFonts().findIndex((font) => font.id === fontPicker.value);
  showFont(nextIndex);
});

previewTextInput.addEventListener("input", () => {
  sampleText = previewTextInput.value;
  renderCandidates();
  showFont(currentIndex);
});

jpFontPicker.addEventListener("change", () => {
  currentJpFont = jpFontPicker.value;
  renderCandidates();
  showFont(currentIndex);
});

jpWeightPicker.addEventListener("change", () => {
  currentJpWeight = jpWeightPicker.value;
  renderCandidates();
  showFont(currentIndex);
});

jpStylePicker.addEventListener("change", () => {
  currentJpStyle = jpStylePicker.value;
  renderCandidates();
  showFont(currentIndex);
});

matchJpFontToggle.addEventListener("change", () => {
  matchJpToEn = matchJpFontToggle.checked;
  renderCandidates();
  showFont(currentIndex);
});

showRoleUnderlinesToggle.addEventListener("change", () => {
  showRoleUnderlines = showRoleUnderlinesToggle.checked;
  renderCandidates();
  showFont(currentIndex);
  keptGrid
    .querySelectorAll(".font-card")
    .forEach((card) => card.classList.toggle("show-role-underlines", showRoleUnderlines));
});

punctuationAsJpToggle.addEventListener("change", () => {
  punctuationAsJp = punctuationAsJpToggle.checked;
  renderCandidates();
  showFont(currentIndex);
});

scriptPicker.addEventListener("change", () => {
  currentScript = scriptPicker.value;
  currentIndex = 0;
  renderPicker();
  renderCandidates();
  showFont(currentIndex);
});

categoryPicker.addEventListener("change", () => {
  currentCategory = categoryPicker.value;
  currentIndex = 0;
  renderPicker();
  renderCandidates();
  showFont(currentIndex);
});

weightPicker.addEventListener("change", () => {
  currentWeight = weightPicker.value;
  showFont(currentIndex);
});

stylePicker.addEventListener("change", () => {
  currentStyle = stylePicker.value;
  showFont(currentIndex);
});

enSizeInput.addEventListener("input", () => {
  currentEnSize = normalizeFontSize(enSizeInput.value, currentEnSize);
  renderCandidates();
  showFont(currentIndex);
});

enSizeInput.addEventListener("change", () => {
  currentEnSize = normalizeFontSize(enSizeInput.value, currentEnSize);
  enSizeInput.value = currentEnSize;
  renderCandidates();
  showFont(currentIndex);
});

jpSizeInput.addEventListener("input", () => {
  currentJpSize = normalizeFontSize(jpSizeInput.value, currentJpSize);
  renderCandidates();
  showFont(currentIndex);
});

jpSizeInput.addEventListener("change", () => {
  currentJpSize = normalizeFontSize(jpSizeInput.value, currentJpSize);
  jpSizeInput.value = currentJpSize;
  renderCandidates();
  showFont(currentIndex);
});

textColorPicker.addEventListener("input", applyPreviewColors);
cardColorPicker.addEventListener("input", applyPreviewColors);
pageColorPicker.addEventListener("input", applyPreviewColors);
clearColorsButton.addEventListener("click", () => setColorPickers(clearColors));
loadColorDefaultsButton.addEventListener("click", () => setColorPickers(colorDefaults));
saveColorDefaultsButton.addEventListener("click", () => {
  colorDefaults.text = textColorPicker.value;
  colorDefaults.card = cardColorPicker.value;
  colorDefaults.page = pageColorPicker.value;
  renderDefaultSwatches();
});

prevButton.addEventListener("click", () => stepControlledFonts(-1));
nextButton.addEventListener("click", () => stepControlledFonts(1));
keepButton.addEventListener("click", () => keepFont());

const toggleItalic = () => {
  currentStyle = currentStyle === "italic" ? "normal" : "italic";
  currentJpStyle = currentJpStyle === "italic" ? "normal" : "italic";
  renderCandidates();
  showFont(currentIndex);
};

document.addEventListener("keydown", (event) => {
  const activeElement = document.activeElement;
  const isEditing = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(activeElement?.tagName);

  if (isEditing || event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stepControlledFonts(-1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    stepControlledFonts(1);
  }

  if (event.key === " ") {
    event.preventDefault();
    keepFont();
  }

  if (event.code === "ShiftRight") {
    event.preventDefault();
    toggleItalic();
  }
});

renderPicker();
renderJpPicker();
renderCandidates();
renderDefaultSwatches();
applyPreviewColors();
showFont(currentIndex);
