// --- スタンダードデータ定義 (A~Z, 0~9) ---
const standardData = [
    // A
    { emoji: '🍎', word: 'Apple', key: 'A', pronounciation: 'Apple', jaWord: 'りんご' },
    { emoji: '🐜', word: 'Ant', key: 'A', pronounciation: 'Ant', jaWord: 'あり' },
    { emoji: '✈️', word: 'Airplane', key: 'A', pronounciation: 'Airplane', jaWord: 'ひこうき' },
    // B
    { emoji: '🐻', word: 'Bear', key: 'B', pronounciation: 'Bear', jaWord: 'くま' },
    { emoji: '🍌', word: 'Banana', key: 'B', pronounciation: 'Banana', jaWord: 'バナナ' },
    { emoji: '🚌', word: 'Bus', key: 'B', pronounciation: 'Bus', jaWord: 'バス' },
    { emoji: '🐦', word: 'Bird', key: 'B', pronounciation: 'Bird', jaWord: 'とり' },
    // C
    { emoji: '🐱', word: 'Cat', key: 'C', pronounciation: 'Cat', jaWord: 'ねこ' },
    { emoji: '🚗', word: 'Car', key: 'C', pronounciation: 'Car', jaWord: 'くるま' },
    { emoji: '🍰', word: 'Cake', key: 'C', pronounciation: 'Cake', jaWord: 'ケーキ' },
    { emoji: '🐄', word: 'Cow', key: 'C', pronounciation: 'Cow', jaWord: 'うし' },
    // D
    { emoji: '🐶', word: 'Dog', key: 'D', pronounciation: 'Dog', jaWord: 'いぬ' },
    { emoji: '🦆', word: 'Duck', key: 'D', pronounciation: 'Duck', jaWord: 'あひる' },
    { emoji: '🍩', word: 'Donut', key: 'D', pronounciation: 'Donut', jaWord: 'ドーナツ' },
    // E
    { emoji: '🐘', word: 'Elephant', key: 'E', pronounciation: 'Elephant', jaWord: 'ぞう' },
    { emoji: '🥚', word: 'Egg', key: 'E', pronounciation: 'Egg', jaWord: 'たまご' },
    { emoji: '🦅', word: 'Eagle', key: 'E', pronounciation: 'Eagle', jaWord: 'わし' },
    // F
    { emoji: '🐸', word: 'Frog', key: 'F', pronounciation: 'Frog', jaWord: 'かえる' },
    { emoji: '🐟', word: 'Fish', key: 'F', pronounciation: 'Fish', jaWord: 'さかな' },
    { emoji: '🦊', word: 'Fox', key: 'F', pronounciation: 'Fox', jaWord: 'きつね' },
    // G
    { emoji: '🦒', word: 'Giraffe', key: 'G', pronounciation: 'Giraffe', jaWord: 'きりん' },
    { emoji: '🍇', word: 'Grape', key: 'G', pronounciation: 'Grape', jaWord: 'ぶどう' },
    { emoji: '🦍', word: 'Gorilla', key: 'G', pronounciation: 'Gorilla', jaWord: 'ゴリラ' },
    // H
    { emoji: '🐹', word: 'Hamster', key: 'H', pronounciation: 'Hamster', jaWord: 'ハムスター' },
    { emoji: '🚁', word: 'Helicopter', key: 'H', pronounciation: 'Helicopter', jaWord: 'ヘリコプター' },
    { emoji: '🐎', word: 'Horse', key: 'H', pronounciation: 'Horse', jaWord: 'うま' },
    // I
    { emoji: '🍨', word: 'Ice cream', key: 'I', pronounciation: 'Ice cream', jaWord: 'アイスクリーム' },
    { emoji: '🧊', word: 'Ice', key: 'I', pronounciation: 'Ice', jaWord: 'こおり' },
    { emoji: '🏝️', word: 'Island', key: 'I', pronounciation: 'Island', jaWord: 'しま' },
    // J
    { emoji: '🧃', word: 'Juice', key: 'J', pronounciation: 'Juice', jaWord: 'ジュース' },
    { emoji: '🚙', word: 'Jeep', key: 'J', pronounciation: 'Jeep', jaWord: 'ジープ' },
    { emoji: '🪼', word: 'Jellyfish', key: 'J', pronounciation: 'Jellyfish', jaWord: 'くらげ' },
    // K
    { emoji: '🐨', word: 'Koala', key: 'K', pronounciation: 'Koala', jaWord: 'コアラ' },
    { emoji: '🔑', word: 'Key', key: 'K', pronounciation: 'Key', jaWord: 'かぎ' },
    { emoji: '🪁', word: 'Kite', key: 'K', pronounciation: 'Kite', jaWord: 'たこ' },
    // L
    { emoji: '🦁', word: 'Lion', key: 'L', pronounciation: 'Lion', jaWord: 'ライオン' },
    { emoji: '🍋', word: 'Lemon', key: 'L', pronounciation: 'Lemon', jaWord: 'レモン' },
    { emoji: '🐞', word: 'Ladybug', key: 'L', pronounciation: 'Ladybug', jaWord: 'てんとうむし' },
    // M
    { emoji: '🍈', word: 'Melon', key: 'M', pronounciation: 'Melon', jaWord: 'メロン' },
    { emoji: '🐒', word: 'Monkey', key: 'M', pronounciation: 'Monkey', jaWord: 'さる' },
    { emoji: '🥛', word: 'Milk', key: 'M', pronounciation: 'Milk', jaWord: 'ぎゅうにゅう' },
    // N
    { emoji: '🥜', word: 'Nuts', key: 'N', pronounciation: 'Nuts', jaWord: 'ナッツ' },
    { emoji: '🥷', word: 'Ninja', key: 'N', pronounciation: 'Ninja', jaWord: 'にんじゃ' },
    { emoji: '🌙', word: 'Night', key: 'N', pronounciation: 'Night', jaWord: 'よる' },
    // O
    { emoji: '🐙', word: 'Octopus', key: 'O', pronounciation: 'Octopus', jaWord: 'たこ' },
    { emoji: '🧅', word: 'Onion', key: 'O', pronounciation: 'Onion', jaWord: 'たまねぎ' },
    { emoji: '🦉', word: 'Owl', key: 'O', pronounciation: 'Owl', jaWord: 'ふくろう' },
    // P
    { emoji: '🐧', word: 'Penguin', key: 'P', pronounciation: 'Penguin', jaWord: 'ペンギン' },
    { emoji: '🐼', word: 'Panda', key: 'P', pronounciation: 'Panda', jaWord: 'パンダ' },
    { emoji: '🐷', word: 'Pig', key: 'P', pronounciation: 'Pig', jaWord: 'ぶた' },
    // Q
    { emoji: '👑', word: 'Queen', key: 'Q', pronounciation: 'Queen', jaWord: 'じょおう' },
    { emoji: '❓', word: 'Question', key: 'Q', pronounciation: 'Question', jaWord: 'しつもん' },
    // R
    { emoji: '🐰', word: 'Rabbit', key: 'R', pronounciation: 'Rabbit', jaWord: 'うさぎ' },
    { emoji: '🚀', word: 'Rocket', key: 'R', pronounciation: 'Rocket', jaWord: 'ロケット' },
    { emoji: '🤖', word: 'Robot', key: 'R', pronounciation: 'Robot', jaWord: 'ロボット' },
    // S
    { emoji: '🐍', word: 'Snake', key: 'S', pronounciation: 'Snake', jaWord: 'へび' },
    { emoji: '🍓', word: 'Strawberry', key: 'S', pronounciation: 'Strawberry', jaWord: 'いちご' },
    { emoji: '☀️', word: 'Sun', key: 'S', pronounciation: 'Sun', jaWord: 'たいよう' },
    { emoji: '🐑', word: 'Sheep', key: 'S', pronounciation: 'Sheep', jaWord: 'ひつじ' },
    // T
    { emoji: '🐯', word: 'Tiger', key: 'T', pronounciation: 'Tiger', jaWord: 'とら' },
    { emoji: '🍅', word: 'Tomato', key: 'T', pronounciation: 'Tomato', jaWord: 'トマト' },
    { emoji: '🚆', word: 'Train', key: 'T', pronounciation: 'Train', jaWord: 'でんしゃ' },
    // U
    { emoji: '☂️', word: 'Umbrella', key: 'U', pronounciation: 'Umbrella', jaWord: 'かさ' },
    { emoji: '🦄', word: 'Unicorn', key: 'U', pronounciation: 'Unicorn', jaWord: 'ユニコーン' },
    { emoji: '🛸', word: 'UFO', key: 'U', pronounciation: 'UFO', jaWord: 'ユーフォー' },
    // V
    { emoji: '🎻', word: 'Violin', key: 'V', pronounciation: 'Violin', jaWord: 'バイオリン' },
    { emoji: '🚐', word: 'Van', key: 'V', pronounciation: 'Van', jaWord: 'くるま（バン）' },
    { emoji: '🌋', word: 'Volcano', key: 'V', pronounciation: 'Volcano', jaWord: 'かざん' },
    // W
    { emoji: '🍉', word: 'Watermelon', key: 'W', pronounciation: 'Watermelon', jaWord: 'すいか' },
    { emoji: '🐺', word: 'Wolf', key: 'W', pronounciation: 'Wolf', jaWord: 'おおかみ' },
    { emoji: '🐋', word: 'Whale', key: 'W', pronounciation: 'Whale', jaWord: 'くじら' },
    // X
    { emoji: '🎹', word: 'Xylophone', key: 'X', pronounciation: 'Xylophone', jaWord: 'もっきん' },
    { emoji: '🩻', word: 'X-ray', key: 'X', pronounciation: 'X-ray', jaWord: 'レントゲン' },
    // Y
    { emoji: '🛥️', word: 'Yacht', key: 'Y', pronounciation: 'Yacht', jaWord: 'ヨット' },
    { emoji: '🪀', word: 'Yo-yo', key: 'Y', pronounciation: 'Yo-yo', jaWord: 'ヨーヨー' },
    { emoji: '🟡', word: 'Yellow', key: 'Y', pronounciation: 'Yellow', jaWord: 'きいろ' },
    // Z
    { emoji: '🦓', word: 'Zebra', key: 'Z', pronounciation: 'Zebra', jaWord: 'しまうま' },
    { emoji: '🧟', word: 'Zombie', key: 'Z', pronounciation: 'Zombie', jaWord: 'ゾンビ' },
    { emoji: '⚡', word: 'Zap', key: 'Z', pronounciation: 'Zap', jaWord: 'いなずま' },

    // Numbers
    { emoji: '⭕', word: 'Zero', key: '0', pronounciation: 'Zero', jaWord: 'ゼロ' },
    { emoji: '1️⃣', word: 'One', key: '1', pronounciation: 'One', jaWord: 'いち' },
    { emoji: '2️⃣', word: 'Two', key: '2', pronounciation: 'Two', jaWord: 'に' },
    { emoji: '3️⃣', word: 'Three', key: '3', pronounciation: 'Three', jaWord: 'さん' },
    { emoji: '4️⃣', word: 'Four', key: '4', pronounciation: 'Four', jaWord: 'よん' },
    { emoji: '5️⃣', word: 'Five', key: '5', pronounciation: 'Five', jaWord: 'ご' },
    { emoji: '6️⃣', word: 'Six', key: '6', pronounciation: 'Six', jaWord: 'ろく' },
    { emoji: '7️⃣', word: 'Seven', key: '7', pronounciation: 'Seven', jaWord: 'なな' },
    { emoji: '8️⃣', word: 'Eight', key: '8', pronounciation: 'Eight', jaWord: 'はち' },
    { emoji: '9️⃣', word: 'Nine', key: '9', pronounciation: 'Nine', jaWord: 'きゅう' }
];

// --- 国旗データ定義 ---
const flagData = [
    // A
    { emoji: '🇦🇺', word: 'Australia', key: 'A', pronounciation: 'Australia', jaWord: 'オーストラリア' },
    { emoji: '🇦🇷', word: 'Argentina', key: 'A', pronounciation: 'Argentina', jaWord: 'アルゼンチン' },
    { emoji: '🇦🇹', word: 'Austria', key: 'A', pronounciation: 'Austria', jaWord: 'オーストリア' },
    // B
    { emoji: '🇧🇷', word: 'Brazil', key: 'B', pronounciation: 'Brazil', jaWord: 'ブラジル' },
    { emoji: '🇧🇪', word: 'Belgium', key: 'B', pronounciation: 'Belgium', jaWord: 'ベルギー' },
    // C
    { emoji: '🇨🇦', word: 'Canada', key: 'C', pronounciation: 'Canada', jaWord: 'カナダ' },
    { emoji: '🇨🇳', word: 'China', key: 'C', pronounciation: 'China', jaWord: 'ちゅうごく（中国）' },
    { emoji: '🇨🇱', word: 'Chile', key: 'C', pronounciation: 'Chile', jaWord: 'チリ' },
    // D
    { emoji: '🇩🇰', word: 'Denmark', key: 'D', pronounciation: 'Denmark', jaWord: 'デンマーク' },
    // E
    { emoji: '🇪🇬', word: 'Egypt', key: 'E', pronounciation: 'Egypt', jaWord: 'エジプト' },
    { emoji: '🇪🇨', word: 'Ecuador', key: 'E', pronounciation: 'Ecuador', jaWord: 'エクアドル' },
    // F
    { emoji: '🇫🇷', word: 'France', key: 'F', pronounciation: 'France', jaWord: 'フランス' },
    { emoji: '🇫🇮', word: 'Finland', key: 'F', pronounciation: 'Finland', jaWord: 'フィンランド' },
    // G
    { emoji: '🇩🇪', word: 'Germany', key: 'G', pronounciation: 'Germany', jaWord: 'ドイツ' },
    { emoji: '🇬🇷', word: 'Greece', key: 'G', pronounciation: 'Greece', jaWord: 'ギリシャ' },
    // H
    { emoji: '🇭🇺', word: 'Hungary', key: 'H', pronounciation: 'Hungary', jaWord: 'ハンガリー' },
    // I
    { emoji: '🇮🇹', word: 'Italy', key: 'I', pronounciation: 'Italy', jaWord: 'イタリア' },
    { emoji: '🇮🇳', word: 'India', key: 'I', pronounciation: 'India', jaWord: 'インド' },
    { emoji: '🇮🇩', word: 'Indonesia', key: 'I', pronounciation: 'Indonesia', jaWord: 'インドネシア' },
    // J
    { emoji: '🇯🇵', word: 'Japan', key: 'J', pronounciation: 'Japan', jaWord: 'にほん（日本）' },
    { emoji: '🇯🇲', word: 'Jamaica', key: 'J', pronounciation: 'Jamaica', jaWord: 'ジャマイカ' },
    // K
    { emoji: '🇰🇪', word: 'Kenya', key: 'K', pronounciation: 'Kenya', jaWord: 'ケニア' },
    { emoji: '🇰🇷', word: 'Korea', key: 'K', pronounciation: 'South Korea', jaWord: 'かんこく（韓国）' },
    // L
    { emoji: '🇱🇧', word: 'Lebanon', key: 'L', pronounciation: 'Lebanon', jaWord: 'レバノン' },
    // M
    { emoji: '🇲🇽', word: 'Mexico', key: 'M', pronounciation: 'Mexico', jaWord: 'メキシコ' },
    { emoji: '🇲🇾', word: 'Malaysia', key: 'M', pronounciation: 'Malaysia', jaWord: 'マレーシア' },
    // N
    { emoji: '🇳🇱', word: 'Netherlands', key: 'N', pronounciation: 'Netherlands', jaWord: 'オランダ' },
    { emoji: '🇳🇿', word: 'New Zealand', key: 'N', pronounciation: 'New Zealand', jaWord: 'ニュージーランド' },
    { emoji: '🇳🇴', word: 'Norway', key: 'N', pronounciation: 'Norway', jaWord: 'ノルウェー' },
    // O
    { emoji: '🇴🇲', word: 'Oman', key: 'O', pronounciation: 'Oman', jaWord: 'オマーン' },
    // P
    { emoji: '🇵🇭', word: 'Philippines', key: 'P', pronounciation: 'Philippines', jaWord: 'フィリピン' },
    { emoji: '🇵🇪', word: 'Peru', key: 'P', pronounciation: 'Peru', jaWord: 'ペルー' },
    { emoji: '🇵🇹', word: 'Portugal', key: 'P', pronounciation: 'Portugal', jaWord: 'ポルトガル' },
    // Q
    { emoji: '🇶🇦', word: 'Qatar', key: 'Q', pronounciation: 'Qatar', jaWord: 'カタール' },
    // R
    { emoji: '🇷🇺', word: 'Russia', key: 'R', pronounciation: 'Russia', jaWord: 'ロシア' },
    { emoji: '🇷🇴', word: 'Romania', key: 'R', pronounciation: 'Romania', jaWord: 'ルーマニア' },
    // S
    { emoji: '🇪🇸', word: 'Spain', key: 'S', pronounciation: 'Spain', jaWord: 'スペイン' },
    { emoji: '🇸🇬', word: 'Singapore', key: 'S', pronounciation: 'Singapore', jaWord: 'シンガポール' },
    { emoji: '🇨🇭', word: 'Switzerland', key: 'S', pronounciation: 'Switzerland', jaWord: 'スイス' },
    // T
    { emoji: '🇹🇭', word: 'Thailand', key: 'T', pronounciation: 'Thailand', jaWord: 'タイ' },
    { emoji: '🇹🇷', word: 'Turkey', key: 'T', pronounciation: 'Turkey', jaWord: 'トルコ' },
    // U
    { emoji: '🇺🇸', word: 'United States', key: 'U', pronounciation: 'United States of America', jaWord: 'アメリカ' },
    { emoji: '🇬🇧', word: 'United Kingdom', key: 'U', pronounciation: 'United Kingdom', jaWord: 'イギリス' },
    { emoji: '🇺🇾', word: 'Uruguay', key: 'U', pronounciation: 'Uruguay', jaWord: 'ウルグアイ' },
    // V
    { emoji: '🇻🇳', word: 'Vietnam', key: 'V', pronounciation: 'Vietnam', jaWord: 'ベトナム' },
    // Y
    { emoji: '🇾🇪', word: 'Yemen', key: 'Y', pronounciation: 'Yemen', jaWord: 'イエメン' },
    // Z
    { emoji: '🇿🇲', word: 'Zambia', key: 'Z', pronounciation: 'Zambia', jaWord: 'ザンビア' }
];

// --- HTML要素の取得 ---
const startControls = document.getElementById('start-controls');
const startStandardBtn = document.getElementById('start-standard-btn');
const startFlagBtn = document.getElementById('start-flag-btn');
const mainArea = document.getElementById('main-area');
const keyboardArea = document.getElementById('keyboard-area');
const emojiDisplay = document.getElementById('emoji-display');
const wordDisplay = document.getElementById('word-display');
const jaWordDisplay = document.getElementById('ja-word-display');
const targetKeyDisplay = document.getElementById('target-key');
const feedbackArea = document.getElementById('feedback-area');

// --- グローバル変数 ---
let currentQuestion = null;
let previousQuestion = null;
let isPlaying = false;
let audioContext = null;

// --- Web Audio API 初期化 (ユーザーアクション後に呼ぶ) ---
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// 簡単な音を鳴らす (frequency: 周波数, type: 波形, duration: 長さ)
function playSound(frequency, type, duration) {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration);
}

function playCorrectSound() {
    playSound(880, 'sine', 0.1); // 高い音 (A5)
    setTimeout(() => playSound(1108.73, 'sine', 0.15), 100); // さらに高い音 (C#6)
}

function playWrongSound() {
    playSound(200, 'sawtooth', 0.3); // 低いブー音
}

// --- Web Speech API で読み上げ ---
function speakWord(enText, jaText) {
    if ('speechSynthesis' in window) {
        // 現在の読み上げをキャンセル
        speechSynthesis.cancel();

        const enUtterance = new SpeechSynthesisUtterance(enText);
        enUtterance.lang = 'en-US'; // 英語で発音させる
        enUtterance.rate = 0.9; // 少しゆっくりめに

        const jaUtterance = new SpeechSynthesisUtterance(jaText);
        jaUtterance.lang = 'ja-JP'; // 日本語で発音させる
        jaUtterance.rate = 0.9; // 少しゆっくりめに

        // 英語を読み上げ、続いて日本語を読み上げる (キューに入る)
        speechSynthesis.speak(enUtterance);
        speechSynthesis.speak(jaUtterance);
    }
}

// --- ゲームロジック ---

// 次の問題をセットする
function nextQuestion() {
    // ランダムに問題を選ぶ。ただし前回と同じ問題は避ける
    let randomIndex;
    let nextQ;
    do {
        randomIndex = Math.floor(Math.random() * activeGameData.length);
        nextQ = activeGameData[randomIndex];
    } while (activeGameData.length > 1 && previousQuestion === nextQ);

    currentQuestion = nextQ;
    previousQuestion = currentQuestion;

    // 画面に表示
    emojiDisplay.textContent = currentQuestion.emoji;
    wordDisplay.textContent = currentQuestion.word;
    jaWordDisplay.textContent = currentQuestion.jaWord; // Fix: Assign jaWord
    targetKeyDisplay.textContent = currentQuestion.key;

    // アニメーション追加
    emojiDisplay.classList.remove('correct-anim');
    void emojiDisplay.offsetWidth; // リフロー強制してアニメーション再スタート
    emojiDisplay.classList.add('correct-anim');

    // キーボードのハイライトを更新
    document.querySelectorAll('.highlight-key').forEach(btn => btn.classList.remove('highlight-key'));
    const targetBtn = document.getElementById('btn-key-' + currentQuestion.key);
    if (targetBtn) {
        targetBtn.classList.add('highlight-key');
    }

    // 単語を読み上げる（英語 -> 日本語の順で）
    speakWord(currentQuestion.pronounciation, currentQuestion.jaWord);
}

// キー入力の判定
function handleInput(inputKey) {
    if (!isPlaying || !currentQuestion) return;

    const uppercaseInput = inputKey.toUpperCase();

    // 正解の場合
    if (uppercaseInput === currentQuestion.key) {
        playCorrectSound();
        showFeedback('⭕', 'feedback-correct');

        // すぐに次の問題へ
        nextQuestion();
    }
    // 不正解の場合 (Shiftなどの修飾キーは無視)
    else if (uppercaseInput.length === 1 && uppercaseInput.match(/[A-Z0-9]/)) {
        playWrongSound();
        showFeedback('❌', 'feedback-wrong');

        // 不正解のシェイクアニメーション
        mainArea.classList.remove('wrong-anim');
        void mainArea.offsetWidth;
        mainArea.classList.add('wrong-anim');
    }
}

// ⭕/❌のフィードバックアニメーション表示
function showFeedback(text, className) {
    feedbackArea.textContent = text;
    feedbackArea.className = className;
    feedbackArea.style.opacity = 1;

    // 1秒後に見えなくする (CSSアニメーションと同期)
    setTimeout(() => {
        feedbackArea.style.opacity = 0;
        feedbackArea.className = '';
    }, 1000);
}

// 仮想キーボードの生成
function createVirtualKeyboard() {
    keyboardArea.innerHTML = '';

    // 数字の行
    const numbers = '1234567890'.split('');
    addKeyboardRow(numbers, 0);

    // QWERTY配列
    const row1 = 'QWERTYUIOP'.split('');
    const row2 = 'ASDFGHJKL'.split('');
    const row3 = 'ZXCVBNM'.split('');

    addKeyboardRow(row1, 1);
    addKeyboardRow(row2, 2);
    addKeyboardRow(row3, 3);
}

function addKeyboardRow(keys, rowIndex) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'keyboard-row keyboard-row-' + rowIndex;

    keys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'key-btn';
        btn.textContent = key;
        btn.id = 'btn-key-' + key;

        btn.addEventListener('mousedown', (e) => {
            e.preventDefault(); // フォーカスが移動するのを防ぐ
            handleInput(key);
        });
        // タッチデバイス対応
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleInput(key);
        });

        rowDiv.appendChild(btn);
    });

    keyboardArea.appendChild(rowDiv);
}

// --- イベントリスナー ---

function startGame(mode) {
    if (mode === 'standard') {
        activeGameData = standardData;
    } else if (mode === 'flag') {
        activeGameData = flagData;
    }

    initAudio(); // ユーザーのクリックでAudioContextを有効化
    isPlaying = true;

    startControls.style.display = 'none';
    mainArea.style.display = 'block';
    createVirtualKeyboard();
    keyboardArea.style.display = 'flex';

    // 最初の出題
    nextQuestion();
}

// モード選択ボタンのクリック
startStandardBtn.addEventListener('click', () => startGame('standard'));
startFlagBtn.addEventListener('click', () => startGame('flag'));

// 物理キーボードの入力
window.addEventListener('keydown', (e) => {
    // スペースキーなどでスクロールするのを防ぐ（必要に応じて）
    if (e.key === " ") e.preventDefault();

    handleInput(e.key);

    // 物理キーを押したときに、画面上の仮想キーボードも一瞬光らせる（視覚的フィードバック）
    const keyId = 'btn-key-' + e.key.toUpperCase();
    const virtualBtn = document.getElementById(keyId);
    if (virtualBtn) {
        virtualBtn.classList.add('active');
        setTimeout(() => virtualBtn.classList.remove('active'), 100);
    }
});
