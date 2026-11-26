const stage = (() => {
  'use strict';

  const overlay = document.querySelector('#scene-fx');
  const soundButton = document.querySelector('#sound-button');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const faces = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const restingAngles = {
    1: [0, 0], 2: [-90, 0], 3: [0, -90],
    4: [0, 90], 5: [90, 0], 6: [0, 180]
  };
  const notes = {
    round: [[196, 0, .36, 'triangle'], [294, .085, .32, 'sine']],
    roll: [[150, 0, .07, 'triangle'], [205, .1, .06, 'triangle'], [165, .19, .09, 'triangle']],
    coin: [[1660, 0, .06, 'sine'], [2520, .008, .09, 'sine'], [845, .017, .04, 'triangle']],
    land: [[125, 0, .12, 'triangle'], [315, .02, .045, 'sine']],
    select: [[530, 0, .05, 'sine']],
    show: [[330, 0, .16, 'triangle'], [494, .07, .2, 'sine'], [660, .13, .27, 'triangle']],
    claim: [[131, 0, .29, 'triangle'], [262, .09, .22, 'triangle'], [415, .18, .31, 'triangle']],
    bet: [[210, 0, .07, 'sine'], [420, .045, .07, 'triangle']],
    raise: [[220, 0, .15, 'triangle'], [370, .075, .19, 'sine'], [554, .15, .24, 'triangle']],
    allin: [[98, 0, .24, 'triangle'], [196, .07, .2, 'triangle'], [587, .16, .31, 'triangle']],
    bust: [[247, 0, .2, 'triangle'], [166, .13, .24, 'triangle'], [110, .25, .32, 'sine']],
    reveal: [[147, 0, .22, 'triangle'], [220, .11, .23, 'triangle'], [294, .23, .31, 'sine']],
    win: [[392, 0, .22, 'triangle'], [523, .09, .23, 'triangle'], [659, .18, .35, 'sine']],
    loss: [[330, 0, .22, 'sine'], [247, .12, .23, 'triangle'], [196, .23, .28, 'sine']]
  };
  let soundOn = true;
  try { soundOn = localStorage.getItem('showtime-sound') !== 'off'; } catch {}
  let audio;

  function unlock() {
    if (!soundOn) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      audio ??= new Audio();
      if (audio.state === 'suspended') audio.resume().catch(() => {});
    } catch {}
  }

  function play(name) {
    if (!soundOn || audio?.state !== 'running') return;
    notes[name].forEach(([frequency, delay, duration, type]) => {
      const start = audio.currentTime + delay;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(name === 'coin' ? .033 : .095, start + .013);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + .01);
    });
  }

  function updateSoundButton() {
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.querySelector('span').textContent = soundOn ? '音 ON' : '音 OFF';
  }

  soundButton.addEventListener('click', () => {
    soundOn = !soundOn;
    try { localStorage.setItem('showtime-sound', soundOn ? 'on' : 'off'); } catch {}
    updateSoundButton();
    unlock();
    play('select');
  });
  updateSoundButton();

  const portraitPhone = matchMedia('(max-width: 660px) and (orientation: portrait)');
  const roundHud = document.querySelector('#round-hud');
  const matchHud = document.querySelector('#match-hud');
  const gameRoot = document.querySelector('#game');
  function placeRoundHud() {
    if (portraitPhone.matches) gameRoot.after(roundHud);
    else matchHud.prepend(roundHud);
  }
  placeRoundHud();
  portraitPhone.addEventListener('change', placeRoundHud);

  const fullscreen = document.querySelector('#fullscreen-button');
  if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
    fullscreen.hidden = false;
    document.addEventListener('fullscreenchange', () => {
      const active = Boolean(document.fullscreenElement);
      const label = active ? '全画面を終了' : '全画面にする';
      fullscreen.setAttribute('aria-pressed', String(active));
      fullscreen.setAttribute('aria-label', label);
      fullscreen.title = label;
      fullscreen.querySelector('span').textContent = active ? '戻す' : '全画面';
    });
    let noteTimer;
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch {
        const note = document.querySelector('#display-note');
        note.textContent = 'この画面では全画面に切り替えられません。';
        clearTimeout(noteTimer);
        noteTimer = setTimeout(() => { note.textContent = ''; }, 2600);
      }
    });
  }

  function cube(value) {
    const surfaces = Object.entries(faces).map(([face, dots]) => {
      const pips = value == null ? '' : dots.map(pos =>
        `<i style="grid-row:${Math.floor(pos / 3) + 1};grid-column:${pos % 3 + 1}"></i>`).join('');
      return `<span class="cube-face face-${face}">${pips}</span>`;
    }).join('');
    const [x, y] = restingAngles[value] ?? [0, 0];
    return `<span class="cube-slot"><span class="cube-camera"><span class="cube" style="transform:rotateX(${x}deg) rotateY(${y}deg)">${surfaces}</span></span></span>`;
  }

  function phasePanel(phase, title, subtitle, content, portrait = '', skippable = true, displayName = '') {
    return `<div class="phase-panel" data-tone="${phase.color}" style="${verdictPortrait.sceneStyle?.(portrait) || ''}">
      ${portrait ? `${verdictPortrait.image(portrait, '', 'phase-portrait')}<span class="cutin-name" lang="en">${displayName}</span>` : ''}
      <div class="phase-panel-copy">
        <div class="phase-slate"><span>${phase.roundLabel ?? `ROUND ${String(phase.round).padStart(2, '0')}`}</span><b>PHASE ${phase.number} / ${phase.total ?? 4}</b></div>
        <strong class="phase-title">${title}</strong><p class="phase-hint">${subtitle}</p>
      </div>
      ${content}
      ${skippable ? '<button class="cutin-skip" type="button" aria-label="カットインをスキップ">スキップ ›</button>' : ''}
    </div>`;
  }

  function phaseHold(duration, image, sequence) {
    const skip = overlay.querySelector('.cutin-skip');
    overlay.removeAttribute('aria-hidden');
    if (!document.querySelector('dialog[open]')) skip.focus({ preventScroll: true });
    return new Promise(resolve => {
      let timer = null;
      let active = true;
      let started = false;
      function begin() {
        if (!active || started) return;
        started = true;
        clearTimeout(timer);
        sequence?.play();
        timer = setTimeout(done, duration);
      }
      const readiness = sequence?.ready ?? (image && !image.complete && image.decode ? image.decode() : null);
      if (readiness) {
        timer = setTimeout(begin, 1200);
        readiness.then(begin, begin);
      } else begin();
      function done() {
        active = false;
        clearTimeout(timer);
        sequence?.stop();
        overlay.removeEventListener('click', done);
        document.removeEventListener('keydown', shortcut);
        resolve();
      }
      function shortcut(event) {
        if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
          event.preventDefault();
          done();
        }
      }
      overlay.addEventListener('click', done);
      document.addEventListener('keydown', shortcut);
    });
  }

  async function animateDice(hand) {
    const slots = Array.from(overlay.querySelectorAll('.cube-slot'));
    await Promise.all(slots.map(async (slot, index) => {
      const delay = 55 + index * 85;
      const duration = 520 + index * 25;
      const [x, y] = restingAngles[hand[index]];
      const spin = index === 1 ? -1 : 1;
      const transform = (rx, ry) => `rotateX(${rx}deg) rotateY(${ry}deg)`;
      const throwMotion = slot.animate([
        { transform: 'translate3d(0,-95px,0) scale(.7)', opacity: 0 },
        { transform: `translate3d(${-spin * 12}px,-36px,0) scale(1.05)`, opacity: 1, offset: .32 },
        { transform: 'translate3d(0,7px,0) scale(.96)', offset: .71 },
        { transform: 'translate3d(0,-12px,0) scale(1)', offset: .83 },
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 }
      ], { delay, duration, easing: 'ease-out', fill: 'both' });
      slot.querySelector('.cube').animate([
        { transform: transform(x - 740, y - spin * 840) },
        { transform: transform(x - 390, y - spin * 460), offset: .38 },
        { transform: transform(x - 31, y - spin * 53), offset: .78 },
        { transform: transform(x, y) }
      ], { delay, duration, easing: 'ease-out', fill: 'both' });
      await throwMotion.finished.catch(() => {});
      play('land');
    }));
  }

  function clearOverlay() {
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.replaceChildren();
  }

  function roundSplash(phase, opening) {
    const { rivalId, name, displayName, outfit, portrait, soulTurn } = opening;
    const soul = soulTurn != null;
    const number = soul ? soulTurn : phase.round;
    const heading = soul ? `魂のオールイン 第${number}投` : `ROUND ${number}`;
    return `<div class="round-splash seat-${rivalId}${soul ? ' round-splash-soul' : ''}" style="${verdictPortrait.sceneStyle?.(portrait) || ''}">
      ${verdictPortrait.image(portrait, `${name}・${outfit}`, 'round-splash-art')}
      <span class="cutin-name" lang="en">${displayName}</span>
      <div class="round-splash-copy">
        <h2 id="round-splash-heading" aria-label="${heading}"><span>${soul ? '魂のオールイン' : 'ROUND'}</span>
          <strong>${number}${soul ? '<small>投目</small>' : ''}</strong></h2>
      </div>
      <button class="cutin-skip" type="button" aria-label="ラウンド演出をスキップ" aria-describedby="round-splash-heading">スキップ ›</button>
    </div>`;
  }

  async function roll(hand, phase, opening) {
    const dice = `<div class="roll-tray">${hand.map(cube).join('')}</div>`;
    overlay.dataset.kind = 'round';
    overlay.innerHTML = phasePanel(phase, 'DICE ROLL', '振った３個から、相手に見せる目を１個選ぶ。',
      dice + roundSplash(phase, opening), '', false);
    overlay.hidden = false;
    play(opening.soulTurn != null ? 'allin' : 'round');
    const splash = overlay.querySelector('.round-splash');
    await phaseHold(1400, splash.querySelector('img'));
    splash.remove();
    overlay.dataset.kind = 'roll';
    play('roll');
    if (reducedMotion.matches || typeof Element.prototype.animate !== 'function') {
      overlay.querySelector('.roll-tray').classList.add('still-dice');
      await pause(650);
    } else {
      await animateDice(hand);
      await pause(260);
    }
    clearOverlay();
  }

  async function reroll(face, subtitle, quote = '') {
    play('roll');
    if (reducedMotion.matches || typeof Element.prototype.animate !== 'function') return;
    overlay.dataset.kind = 'reroll';
    overlay.innerHTML = `<div class="fx-panel rolling-panel">
      <span class="fx-kicker">${subtitle}</span><strong class="fx-title">RE-ROLL</strong>
      <div class="roll-tray">${cube(face)}</div>
      ${quote ? `<q class="speech-bubble fx-quote">${quote}</q>` : ''}
      <p class="fx-roll-result"></p></div>`;
    overlay.hidden = false;
    await animateDice([face]);
    overlay.querySelector('.fx-roll-result').textContent = `${face}の目を公開 · ＋2点`;
    await pause(quote ? 1050 : 480);
    clearOverlay();
  }

  function showdownDie(value) {
    if (value == null) return '<span class="die secret" role="img" aria-label="伏せたサイコロ"></span>';
    return `<span class="die" role="img" aria-label="${value}の目">${faces[value].map(pos =>
      `<i class="die-dot" style="grid-row:${Math.floor(pos / 3) + 1};grid-column:${pos % 3 + 1}"></i>`).join('')}</span>`;
  }

  // Both hands start counting at the reveal. Add the actual scoring bonuses in
  // order; never infer the winner from the number (a false claim can disqualify it).
  function scoreProgress(hand, elapsed) {
    const steps = [{ label: '出目', points: hand.base }, ...hand.bonuses];
    let total = 0, time = Math.max(0, elapsed);
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i], duration = i === 0 ? 720 : 360;
      if (time < duration) return {
        value: total + Math.floor(step.points * time / duration),
        note: `${step.label} +${step.points}`, done: false
      };
      total += step.points;
      time -= duration;
    }
    return { value: total, note: hand.failed ? 'トリプル宣言失敗' : 'TOTAL', done: true };
  }

  function showdown({ id, displayName, portrait, subtitle, hands }) {
    overlay.dataset.kind = 'showdown';
    overlay.innerHTML = `<section class="verdict-panel showdown-panel seat-${id}" data-step="ready" aria-labelledby="showdown-title">
      <header class="verdict-banner" style="${verdictPortrait.sceneStyle?.(portrait) || ''}">
        <div class="verdict-portraits showdown-portrait">${verdictPortrait.image(portrait, '', 'showdown-art')}</div>
        <span class="cutin-name" lang="en">${displayName}</span>
        <div class="verdict-caption"><p class="verdict-round">${subtitle}</p>
          <h2 id="showdown-title" lang="en">SHOWDOWN</h2>
          <p class="showdown-status" role="status">伏せた手を、オープン。</p>
          <button type="button" class="cutin-skip" aria-label="手の公開演出をスキップ">スキップ ›</button>
        </div>
      </header>
      <div class="verdict-hands">${hands.map(hand => `<div class="verdict-hand" data-seat="${hand.seat}">
        <div class="verdict-hand-heading"><h3 lang="en">READY</h3><span class="verdict-seat">${hand.name}</span></div>
        <div class="verdict-values"><span class="verdict-dice">${hand.dice.map(die =>
          `<span class="showdown-die${die.public ? '' : ' was-hidden'}">${showdownDie(die.public ? die.face : null)}</span>`).join('')}</span>
          <div class="verdict-score" data-finish="ivory"><strong>0</strong><small lang="en">PTS</small></div>
        </div>
        <div class="showdown-meter" aria-hidden="true"><i></i></div>
        <p class="showdown-addition">公開待ち</p>
      </div>`).join('<div class="verdict-vs" lang="en">VS</div>')}</div>
    </section>`;
    overlay.hidden = false;
    overlay.removeAttribute('aria-hidden');
    const panel = overlay.querySelector('.showdown-panel');
    const rows = [...panel.querySelectorAll('.verdict-hand')].map((row, index) => ({
      hand: hands[index], row, dice: [...row.querySelectorAll('.showdown-die')],
      score: row.querySelector('.verdict-score'), number: row.querySelector('.verdict-score strong'),
      heading: row.querySelector('h3'), note: row.querySelector('.showdown-addition'),
      meter: row.querySelector('.showdown-meter i')
    }));
    const status = panel.querySelector('.showdown-status');
    const skip = panel.querySelector('.cutin-skip');
    if (!document.querySelector('dialog[open]')) skip.focus({ preventScroll: true });
    play('reveal');
    return new Promise(resolve => {
      let frame, active = true, revealed = false, flipStarted = false, lastBeat = '';
      const start = performance.now();
      const countDuration = Math.max(...hands.map(hand => 720 + 360 * hand.bonuses.length));
      function reveal() {
        if (revealed) return;
        revealed = true;
        panel.dataset.step = 'counting';
        rows.forEach(({ hand, dice, heading }) => {
          dice.forEach((slot, index) => {
            if (!hand.dice[index].public) slot.innerHTML = showdownDie(hand.dice[index].face);
          });
          heading.textContent = hand.combo;
        });
        status.textContent = '出目 ＋ 役ボーナス';
        play('land');
      }
      function update(elapsed) {
        const beats = [];
        rows.forEach(({ hand, row, score, number, note, meter }) => {
          const progress = scoreProgress(hand, elapsed);
          number.textContent = progress.value;
          score.setAttribute('aria-label', `${progress.value}点`);
          score.dataset.finish = progress.value === 42 ? 'jackpot' : progress.value >= 30 ? 'gilded' : progress.value >= 20 ? 'gold' : 'ivory';
          note.textContent = progress.note;
          row.dataset.failed = String(progress.done && hand.failed);
          meter.style.width = `${progress.value / 42 * 100}%`;
          beats.push(progress.note);
        });
        const beat = beats.join('/');
        if (beat !== lastBeat && !reducedMotion.matches) play('coin');
        lastBeat = beat;
      }
      function finish() {
        if (!active) return;
        active = false;
        cancelAnimationFrame(frame);
        reveal();
        update(Infinity);
        panel.dataset.step = 'total';
        status.textContent = '得点確定';
        overlay.removeEventListener('click', finish);
        document.removeEventListener('keydown', shortcut);
        // Keep the same frame visible while the game settles, until cue() replaces
        // it with the result. Skipping must not leave timers touching the next scene.
        resolve();
      }
      function shortcut(event) {
        if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
          event.preventDefault();
          finish();
        }
      }
      function tick(now) {
        if (!active) return;
        const elapsed = now - start;
        if (reducedMotion.matches) {
          reveal(); update(Infinity);
          if (elapsed >= 650) return finish();
        } else {
          if (elapsed >= 520 && !flipStarted) {
            flipStarted = true;
            panel.dataset.step = 'flip';
          }
          if (elapsed >= 680) { reveal(); update(elapsed - 680); }
          if (elapsed >= 680 + countDuration + 460) return finish();
        }
        frame = requestAnimationFrame(tick);
      }
      overlay.addEventListener('click', finish);
      document.addEventListener('keydown', shortcut);
      frame = requestAnimationFrame(tick);
    });
  }

  async function cue({ kind, title, subtitle, phase, portrait = '', displayName = '', quote = '', details = '', duration = 700, verdict }) {
    play(kind);
    if (verdict) {
      overlay.dataset.kind = 'verdict';
      overlay.innerHTML = `<section class="verdict-panel seat-${verdict.id}${verdict.revealed ? ' hands-revealed' : ''}" data-outcome="${verdict.outcome}" aria-labelledby="verdict-title">
        <header class="verdict-banner" style="${verdictPortrait.sceneStyle?.(portrait) || ''}">
          <div class="verdict-portraits"></div>
          <span class="cutin-name" lang="en">${verdict.displayName}</span>
          <div class="verdict-caption">
            <p class="verdict-round" lang="en">${subtitle}</p>
            <h2 id="verdict-title" lang="en">${title}</h2>
            ${verdict.bust ? `<p class="verdict-bust" lang="en">BUST OUT · ${verdict.bust}</p>` : ''}
            <button type="button" class="cutin-skip" aria-label="決着演出をスキップ" aria-describedby="verdict-title">スキップ ›</button>
          </div>
          <q class="speech-bubble verdict-quote">${quote}</q>
        </header>
        <div class="verdict-hands">${details}</div></section>`;
      overlay.hidden = false;
      const sequence = verdictPortrait.sequence(overlay.querySelector('.verdict-portraits'), portrait, portrait, verdict.name, reducedMotion);
      await phaseHold(duration, null, sequence);
      clearOverlay();
      return;
    }
    if (reducedMotion.matches) return;
    overlay.dataset.kind = kind;
    overlay.innerHTML = phase ? phasePanel(phase, title, subtitle, details, portrait, true, displayName) : `<div class="fx-panel${portrait ? ' fx-with-portrait' : ''}" style="${verdictPortrait.sceneStyle?.(portrait) || ''}">
      ${portrait ? `${verdictPortrait.image(portrait, '', 'fx-portrait')}<span class="cutin-name" lang="en">${displayName}</span>` : ''}
      <div class="fx-copy">
        <span class="fx-kicker">${subtitle}</span><strong class="fx-title">${title}</strong>
        ${quote ? `<q class="speech-bubble fx-quote">${quote}</q>` : ''}
      </div>
      ${details}
      </div>`;
    overlay.hidden = false;
    if (phase) await phaseHold(duration);
    else await pause(duration);
    clearOverlay();
  }

  return { unlock, play, roll, reroll, cue, cube, showdown };
})();
