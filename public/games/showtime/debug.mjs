import { DEBUG_SCENES, normalizeDebugSelection, createDebugSnapshot } from './debug-scenes.mjs?v=2';

export function installDebug(context) {
  document.body.classList.add('debug-enabled');
  const params = new URLSearchParams(location.search);
  const initial = normalizeDebugSelection(Object.fromEntries(params), context);
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = new URL('./debug.css', import.meta.url).href;
  document.head.append(style);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'subtle-button debug-trigger';
  trigger.textContent = 'デバッグ';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'debug-dialog');
  document.querySelector('.top-tools').prepend(trigger);

  const dialog = document.createElement('dialog');
  dialog.id = 'debug-dialog';
  dialog.className = 'debug-dialog';
  dialog.setAttribute('aria-labelledby', 'debug-title');
  dialog.innerHTML = `
    <div class="debug-heading"><div><small>SHOW TIME DUEL</small><h2 id="debug-title">画面デバッグ</h2></div>
      <button class="icon-button debug-close" type="button" aria-label="デバッグを閉じる">×</button></div>
    <p class="debug-intro">キャラ・衣装・場面を選んで、確認したい画面へ。</p>
    <form id="debug-form">
      <div class="debug-selects">
        <label>キャラクター<select name="character" id="debug-character"></select></label>
        <label>衣装<select name="outfit" id="debug-outfit" aria-describedby="debug-outfit-note"></select></label>
      </div>
      <label class="debug-scene-label">場面<select name="scene" id="debug-scene" aria-describedby="debug-scene-note"></select></label>
      <div class="debug-selects">
        <label>立ち絵の動き<select name="motion" id="debug-motion">
          <option value="auto">通常</option><option value="still">静止</option>
          <option value="blink">閉じ目を確認（通常表情）</option>
          <option value="sway">胸の揺れ（上端）</option><option value="sway-down">胸の揺れ（下端）</option>
        </select></label>
        <label>表情（対戦中）<select name="expression" id="debug-expression">
          <option value="auto">場面に合わせる</option>
          <option value="neutral">通常</option><option value="loss">敗北</option><option value="win">勝利</option>
          <option value="challenge">挑発</option><option value="comeback">反撃</option><option value="despair">絶望</option>
          <option value="embarrassed">照れ</option><option value="pale">青ざめ</option>
          <option value="remember">回想</option><option value="resolve">決意</option>
        </select></label>
      </div>
      <p id="debug-outfit-note" class="debug-note"></p>
      <p id="debug-scene-note" class="debug-note"></p>
      <div class="debug-actions">
        <button class="primary-button" type="submit">この画面を表示</button>
        <button class="secondary-button debug-copy" type="button">URLをコピー</button>
      </div>
    </form>
    <p class="debug-status" role="status" aria-live="polite"></p>
    <footer class="debug-footer"><a class="debug-reset">通常のタイトルへ</a><span>Shift + D で開く</span></footer>`;
  document.body.append(dialog);
  const form = dialog.querySelector('form');
  const character = form.elements.namedItem('character');
  const outfit = form.elements.namedItem('outfit');
  const scene = form.elements.namedItem('scene');
  const motion = form.elements.namedItem('motion');
  const expression = form.elements.namedItem('expression');
  motion.value = ['auto','still','blink','sway','sway-down'].includes(params.get('motion')) ? params.get('motion') : 'auto';
  expression.value = Array.from(expression.options).some(option => option.value === params.get('expression')) ? params.get('expression') : 'auto';
  const status = dialog.querySelector('.debug-status');
  for (const rival of context.rivals) character.add(new Option(rival.name, rival.id));
  let group;
  for (const item of DEBUG_SCENES) {
    if (group?.label !== item.group) {
      group = document.createElement('optgroup');
      group.label = item.group;
      scene.append(group);
    }
    group.append(new Option(item.label, item.id));
  }
  character.value = initial.character;
  scene.value = initial.scene;

  function updateOutfits(preferred = Number(outfit.value)) {
    const definition = DEBUG_SCENES.find(item => item.id === scene.value);
    const allowed = definition.outfits ?? [0, 1, 2];
    outfit.replaceChildren();
    context.wardrobe[character.value].looks.forEach((name, index) => {
      const option = new Option(`${index}：${name}`, String(index));
      option.disabled = !allowed.includes(index);
      outfit.add(option);
    });
    outfit.value = String(allowed.includes(preferred) ? preferred : allowed[0]);
    dialog.querySelector('#debug-outfit-note').textContent = allowed.length === 1
      ? 'この場面は、衣装を２着買い取った後の状態です。衣装は２段階目に固定されます。'
      : allowed.length === 2 ? 'この場面で表示できる衣装のみ選択できます。' : '';
    dialog.querySelector('#debug-scene-note').textContent = definition.hint
      ?? '画面を表示した後は、その場面から通常の操作を続けられます。';
    status.textContent = '';
  }
  updateOutfits(initial.outfit);
  character.addEventListener('change', () => updateOutfits());
  scene.addEventListener('change', () => updateOutfits());
  outfit.addEventListener('change', () => { status.textContent = ''; });

  function selectedURL() {
    const url = new URL(location.href);
    url.searchParams.set('debug', '1');
    url.searchParams.set('character', character.value);
    url.searchParams.set('outfit', outfit.value);
    url.searchParams.set('scene', scene.value);
    for (const select of [motion, expression]) {
      if (select.value === 'auto') url.searchParams.delete(select.name);
      else url.searchParams.set(select.name, select.value);
    }
    return url;
  }
  const resetURL = new URL(location.href);
  for (const key of ['debug', 'character', 'outfit', 'scene', 'motion', 'expression']) resetURL.searchParams.delete(key);
  dialog.querySelector('.debug-reset').href = resetURL.href;
  form.addEventListener('submit', event => {
    event.preventDefault();
    // A fresh document cancels pending CPU timers, coin animations and cut-ins.
    location.assign(selectedURL().href);
  });
  dialog.querySelector('.debug-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(selectedURL().href);
      status.textContent = 'このキャラ・衣装・場面を開くURLをコピーしました。';
    } catch {
      status.textContent = 'URLを選択してコピーしてください。';
      const input = document.createElement('input');
      input.className = 'debug-url';
      input.readOnly = true;
      input.setAttribute('aria-label', 'この場面のURL');
      input.value = selectedURL().href;
      status.append(input);
      input.select();
    }
  });
  function open() {
    if (!dialog.open) dialog.showModal();
    character.focus();
  }
  trigger.addEventListener('click', open);
  dialog.querySelector('.debug-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.addEventListener('keydown', event => {
    if (event.shiftKey && event.key.toLowerCase() === 'd' && !event.ctrlKey && !event.metaKey && !event.altKey
      && !event.target.closest('input, select, textarea, [contenteditable]')) {
      event.preventDefault();
      open();
    }
  });

  if (params.get('debug') === '1') {
    if (params.has('scene')) {
      const snapshot = createDebugSnapshot(initial, context);
      if (expression.value !== 'auto' && ['choose','show','claim','bet'].includes(snapshot.game.phase))
        snapshot.players[1].mood = expression.value;
      document.body.dataset.debugScene = snapshot.selection.scene;
      context.restore(snapshot);
    } else open();
  }
}
