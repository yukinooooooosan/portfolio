(() => {
  'use strict';

  const gameRoot = document.querySelector('#game');
  const rules = document.querySelector('#rules-dialog');
  const hud = document.querySelector('#round-hud');
  const announcement = document.querySelector('#phase-announcement');
  const matchHud = document.querySelector('#match-hud');
  const chipGauge = document.querySelector('#chip-gauge');
  const portraitPhone = matchMedia('(max-width: 660px) and (orientation: portrait)');
  const gaugeYou = document.querySelector('#gauge-you');
  const gaugeRival = document.querySelector('#gauge-rival');
  const gaugeRivalName = document.querySelector('#gauge-rival-name');
  const gaugePot = document.querySelector('#gauge-pot');
  const gaugeYouDelta = document.querySelector('#gauge-you-delta');
  const gaugeRivalDelta = document.querySelector('#gauge-rival-delta');
  const photoDialog = document.querySelector('#photo-dialog');
  const companion = companionGuide.create();
  const buybackPrice = 10;
  const { wardrobe, soul: soulLines, voices } = characterDialogue;

  function soulOfferArt(rival) { return `./art/${rival.id}-soul-offer-v2.webp`; }

  function portraits(rival, mood = rival.mood ?? 0) {
    return portraitAssets.get(rival.id, rival.outfit, mood).src;
  }

  const startingChips = 20;
  const rerollCost = 2;
  const extensionInterval = 5;
  const extensionCost = 2;
  let tableView;
  let tableImport;
  const players = [{ name: 'あなた', human: true }];
  const rivals = [
    { name: 'こはく', id: 'kohaku', displayName: 'Kohaku', intro: 'あんた、最後まで座ってられる？', patient: false },
    { name: 'すず', id: 'suzu', displayName: 'Suzu', intro: 'その目、覚えておきますね。', patient: true }
  ];
  const game = { phase: 'intro', round: 0, pot: 0, bet: 0, minRaise: 2, betQueue: [], selected: null, selectedShow: null, lastResult: null, busy: false, session: 0 };
  const pipPositions = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const rand = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
  const roll = () => 1 + Math.floor(rand() * 6);
  const expressions = {
    claim: 'challenge', bet4: 'challenge', raise: 'challenge', faceRaise: 'challenge',
    remember: 'remember', allin: 'resolve', bluff: 'embarrassed', pale: 'pale',
    despair: 'despair', comeback: 'comeback', win: 2, foldWin: 2, champion: 2, loss: 1, fold: 1
  };
  const preloadedRivals = new Set();

  function preloadPortraits(rival) {
    const key = `${rival.id}-${rival.outfit}`;
    if (preloadedRivals.has(key)) return;
    preloadedRivals.add(key);
    for (const mood of new Set([0, ...Object.values(expressions)])) {
      const image = new Image();
      image.fetchPriority = 'low';
      image.src = portraits(rival, mood);
    }
  }

  function pickLine(lines, previous) {
    const candidates = lines.length > 1 ? lines.filter(line => line !== previous) : lines;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function speak(p, action) {
    p.line = pickLine(voices[p.id][action], p.line);
    p.bubbleSide = Math.random() < .5 ? 'left' : 'right';
    p.bubbleRow = ['top', 'middle', 'bottom'][Math.floor(Math.random() * 3)];
    p.mood = expressions[action] ?? 0;
  }

  // Only pass publicly visible faces here. Enumerate hypothetical completions
  // using the same scoring rules as the showdown.
  function possibleScores(faces, claim) {
    let max = 0;
    let sum = 0;
    let count = 0;
    const hand = [...faces];
    const showIndex = faces.length === 2 ? 1 : null;
    function complete() {
      if (hand.length === 3) {
        const result = handScore({ hand, showIndex, claim });
        if (claim && !result.isTriple) return;
        max = Math.max(max, result.value);
        count++;
        sum += result.value;
        return;
      }
      for (let face = 1; face <= 6; face++) {
        hand.push(face);
        complete();
        hand.pop();
      }
    }
    complete();
    return { max, mean: sum / count };
  }

  function publicFaces(p) {
    if (['rolling', 'choose'].includes(game.phase) || p.publicIndex === null) return [];
    const faces = [p.hand[p.publicIndex]];
    if (p.showIndex !== null && (p.rerolled || !['show', 'claim'].includes(game.phase))) {
      faces.push(p.hand[p.showIndex]);
    }
    return faces;
  }

  function ruleTip() {
    const [you, rival] = players;
    switch (game.phase) {
      case 'rolling': return 'まずはひと振り。出目がそろったら、見せる１個を選ぼう。';
      case 'choose': return game.selected === null
        ? '見せるのは１個だけ。残りの２個をどう読ませるか考えてみよう。'
        : `「${you.hand[game.selected]}」を見せる？　公開するまでは選び直せるよ。`;
      case 'show': return game.soul ? '公開で＋２点。魂戦はお互いに１回だけ無料で振り直せるよ。'
        : canReroll(you) ? `公開で＋２点。振り直すなら${rival.name}に${rerollCost}枚渡すよ。` : `公開で＋２点。振り直しには手元に${rerollCost}枚必要だよ。`;
      case 'claim': return handScore(you).isTriple
        ? `宣言が決まれば POWER ${handScore({ ...you, claim: true }).value}。宣言する？`
        : '３個目は違う目。ブラフ宣言は手を開いたときに失敗するよ。';
      case 'reply': return `${rival.name}の番。２個目を見せるか、手元に注目しよう。`;
      case 'bet': return gameRoot.querySelector('#bet-hint')?.textContent || `${rival.name}が賭け方を考えているよ。`;
      case 'reveal': return game.lastResult.byFold ? 'フォールドで決着。伏せた目はそのままだよ。' : '手を公開。役とPOWERを見比べよう。';
      case 'result': {
        const offer = wardrobeOffer();
        if (offer) return offer.affordable ? `${offer.garment}を${offer.price}枚で買うと、${rival.name}が復帰するよ。` : `買取には次局用の１枚を含めて${offer.price + 1}枚必要だよ。`;
        return game.lastResult.purchase ? `${rival.name}が新しい衣装で復帰。次の回戦へ進もう。` : game.lastResult.detail;
      }
      case 'soul-result': return game.soul.verdict === 'tie' ? '引き分け。チップは卓に残して、同じ賭けでもう一投。' : '魂のオールイン、決着。結末を見届けよう。';
    }
  }

  function guideContext() {
    const [you, rival] = players;
    const ownScore = handScore(you);
    const ownCombo = ownScore.isTriple && you.hand[0] === 1 ? 'pin'
      : Object.keys(combos).find(key => combos[key] === ownScore.combo);
    const result = game.lastResult;
    const resolved = ['reveal', 'result', 'soul-result', 'gameover'].includes(game.phase);
    const outcome = game.soul?.verdict === 'tie' ? 'draw' : game.soul?.verdict
      || (resolved && result?.winners ? result.winners.length > 1 ? 'draw' : result.winners.includes(you) ? 'win' : 'loss' : null);
    function streak(won) {
      let count = 0;
      for (const entry of [...(game.history || [])].reverse()) {
        const expected = won ? you.name : rival.name;
        if (entry.soul || entry.winnerNames !== expected) break;
        count++;
      }
      return count;
    }
    // Deliberately exclude the rival's hand, score, mood and private decision data.
    return {
      session: game.session, character: rival.id, round: game.round, phase: game.phase,
      ending: game.ending, outfit: rival.outfit, purchase: Boolean(result?.purchase),
      youChips: you.chips, rivalChips: rival.chips, bet: game.bet,
      toCall: game.phase === 'bet' ? Math.min(you.chips, Math.max(0, game.bet - you.betPaid)) : 0,
      yourTurn: game.phase === 'bet' && game.betQueue[0] === 0,
      youClaim: you.claim, yourTriple: ownScore.isTriple, knownBluff: you.lastClaim === 'bluff',
      yourCombo: ownCombo, yourHandKey: [...you.hand].sort((a, b) => a - b).join('-'),
      yourRerolled: you.rerolled, yourScore: ownScore.value,
      rivalClaim: publicFaces(rival).length === 2 && rival.claim, rivalAction: rival.lastAction,
      soul: Boolean(game.soul), soulTurn: game.soul?.turn, soulVerdict: game.soul?.verdict,
      outcome, playerBluff: resolved && !result?.byFold && Boolean(result?.liars?.includes(you)),
      rivalBluff: resolved && !result?.byFold && Boolean(result?.liars?.includes(rival)),
      bluffWin: resolved && outcome === 'win' && result?.byFold && you.claim && !handScore(you).isTriple,
      lossStreak: streak(false), winStreak: streak(true)
    };
  }

  function guideTip() { return companion.select(guideContext(), ruleTip() || '旦那、自分も隣で見てるっす。'); }

  function tableAdvice(message = guideTip()) {
    const text = message.text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    return `<aside class="table-advice companion-advice" data-kind="${message.kind}" data-line="${message.id}" aria-label="キノコの相棒">
      <img class="guide-mushroom" src="./art/guide-mushroom.webp" width="48" height="48" alt="" decoding="async">
      <div><strong class="guide-label">相棒</strong><p>${text}</p></div></aside>`;
  }

  function publicReadout(p) {
    const faces = publicFaces(p);
    if (!faces.length && ['rolling', 'choose'].includes(game.phase)) return '<div class="public-score empty">最初に見せる目を１個選ぼう</div>';
    if (!faces.length) return '<div class="public-score empty">１個目の公開待ち</div>';
    const sum = faces.reduce((a, b) => a + b, 0);
    const shown = faces.length === 2;
    const subtotal = shown
      ? `公開目 ${faces.join('＋')}＝${sum} ／ SHOW＋2` : `公開目の小計 ${sum}`;
    if (p.folded || game.phase === 'result') {
      return `<div class="public-score"><small>${subtotal}</small><strong>残りは非公開</strong></div>`;
    }
    const declared = shown && p.claim;
    const { max } = possibleScores(faces, declared);
    const beforeShow = !shown && ['show', 'claim', 'reply'].includes(game.phase);
    const note = beforeShow ? ' · SHOW前' : '';
    return `<div class="public-score"><small>${subtotal}${note}</small>
      <dl class="strength-stats">
        <div><dt>${declared ? '成功時の最大' : '最大'}</dt><dd>${max}点</dd></div>
      </dl></div>`;
  }
  const combos = {
    triple: { name: 'トリプル', splash: 'TRIPLE' },
    stairs: { name: '連番', splash: 'STAIRS' },
    pair: { name: 'ペア', splash: 'PAIR' },
    none: { name: '役なし', splash: 'NO COMBO' }
  };

  function handScore(p) {
    const [a, b, c] = [...p.hand].sort((x, y) => x - y);
    const isTriple = a === c;
    const shown = p.showIndex !== null;
    let combo = combos.none;
    const bonuses = [];
    if (isTriple) {
      combo = combos.triple;
    } else if (a === b || b === c) {
      combo = combos.pair;
      bonuses.push({ label: combo.name, points: 2 });
    } else if (a + 1 === b && b + 1 === c) {
      combo = combos.stairs;
      bonuses.push({ label: combo.name, points: 4 });
    }
    if (shown) bonuses.push({ label: 'SHOW', points: 2 });
    if (isTriple && shown && p.claim) {
      bonuses.push(a === 1
        ? { label: 'ピンゾロ宣言', points: 37 }
        : { label: 'トリプル宣言', points: 16 });
    }
    const value = bonuses.reduce((total, bonus) => total + bonus.points, a + b + c);
    return { value, bonuses, isTriple, combo };
  }

  function scoreFormula(p, caption) {
    const { value, bonuses, combo } = handScore(p);
    const additions = bonuses.map(({ label, points }) =>
      `<span class="formula-bonus">＋ ${points}〈${label}〉</span>`).join(' ');
    return `<div class="score-formula"><span class="formula-label">${caption} · ${combo.name}</span>
      <div class="formula-terms"><span>${p.hand.join(' ＋ ')}</span> ${additions}
        <strong>＝ ${value}点</strong></div></div>`;
  }

  function die(value, small = false, selected = false, onTable = false) {
    if (onTable) {
      return `<span class="die table-model${selected ? ' selected' : ''}" data-table-die="${value ?? 0}"
        role="img" aria-label="${value == null ? '伏せたサイコロ' : `${value}の目`}">${value == null ? '<i class="die-back" aria-hidden="true"></i>' : stage.cube(value)}</span>`;
    }
    if (value == null) return `<span class="die secret${small ? ' small' : ''}" role="img" aria-label="伏せたサイコロ"></span>`;
    const dots = pipPositions[value].map(pos => `<i class="die-dot" style="grid-row:${Math.floor(pos / 3) + 1};grid-column:${pos % 3 + 1}"></i>`).join('');
    return `<span class="die${small ? ' small' : ''}${selected ? ' selected' : ''}" role="img" aria-label="${value}の目">${dots}</span>`;
  }
  function dieControl(value, index, type, selected) {
    return `<button class="die-button" type="button" data-action="${type}" data-index="${index}" aria-label="${value}の目を選ぶ" aria-pressed="${selected}">${die(value, false, selected, true)}</button>`;
  }
  function tableSeat(p) { return p.human ? 'you' : 'rival'; }

  function mountTable() {
    const table = gameRoot.querySelector('[data-dice-table]');
    if (tableView) {
      tableView.mount(table);
    } else if (table && !tableImport) {
      tableImport = import('./table-money.js').then(({ createTableView }) => {
        tableView = createTableView();
        tableView.mount(gameRoot.querySelector('[data-dice-table]'));
      }).catch(() => { tableView = null; });
    }
  }

  function coinStacks(amount) {
    const slots = [0, -1, 1, -2, 2];
    const shift = amount === 2 || amount === 4 ? .5 : 0;
    const middleLevel = Math.floor((amount - 1) / slots.length) / 2;
    return Array.from({ length: amount }, (_, i) =>
      `<i class="minted-coin" style="--column:${slots[i % slots.length] + shift};--level:${Math.floor(i / slots.length) - middleLevel}"></i>`
    ).join('');
  }

  async function animateTableCoins(moves) {
    const transfers = moves.filter(move => move.amount > 0);
    const table = gameRoot.querySelector('[data-dice-table]');
    if (!table || !transfers.length) { updateChipGauge(); return; }
    const before = { you: players[0].chips, rival: players[1].chips, pot: game.pot };
    for (const { from, to, amount } of transfers) {
      before[from] += amount;
      before[to] -= amount;
    }
    const rack = table.querySelector('[data-table-anchor="pot"]');
    const meter = table.querySelector('[data-pot-meter]');
    const amountLabel = table.querySelector('[data-table-amount]');
    let stacked = -1;
    function present(balances, resting) {
      updateChipGauge(balances);
      table.dataset.pot = balances.pot;
      meter.setAttribute('aria-valuenow', balances.pot);
      meter.style.setProperty('--pot-share', `${100 * balances.pot / chipsInPlay()}%`);
      amountLabel.textContent = balances.pot;
      if (stacked !== resting) rack.innerHTML = coinStacks(resting);
      stacked = resting;
    }
    present(before, before.pot);
    if (!tableView && tableImport) await tableImport;
    await tableView?.moveCoins(transfers, before, present, () => stage.play('coin'));
    present({ you: players[0].chips, rival: players[1].chips, pot: game.pot }, game.pot);
  }
  function canBet(p) { return !p.folded && p.chips > 0; }
  function rerollFee() { return game.soul ? 0 : rerollCost; }
  function canReroll(p) { return !p.rerolled && p.showIndex === null && p.chips >= rerollFee(); }
  function matchEnded() { return players.some(p => p.chips === 0); }
  function ante() { return Math.min(game.round, 5); }
  function isExtensionRound(round) { return round > 1 && (round - 1) % extensionInterval === 0; }
  function extensionPrice(chips) { return Math.min(extensionCost, Math.max(0, chips - 1)); }
  function chipsInPlay() { return players[0].chips + players[1].chips + game.pot; }
  function seatOrder() { return game.round % 2 ? [0, 1] : [1, 0]; }
  function chooseAiFirst(p) {
    const counts = p.hand.map(v => p.hand.filter(x => x === v).length);
    const matching = counts.map((count, i) => count > 1 ? i : -1).filter(i => i >= 0);
    if (matching.length && rand() < .72) return matching[Math.floor(rand() * matching.length)];
    if (rand() < .54) return p.hand.indexOf(Math.max(...p.hand));
    return Math.floor(rand() * 3);
  }
  function chooseAiShow(p) {
    const first = p.hand[p.publicIndex];
    const remaining = [0, 1, 2].filter(i => i !== p.publicIndex);
    const match = remaining.find(i => p.hand[i] === first);
    const { value: score, isTriple } = handScore(p);
    if (match !== undefined && rand() < (isTriple ? .94 : .66)) p.showIndex = match;
    else if (rand() < (score < 15 ? .45 : .28)) p.showIndex = remaining[Math.floor(rand() * remaining.length)];
    else p.showIndex = null;
  }

  function chooseAiClaim(p) {
    const first = p.hand[p.publicIndex];
    if (p.showIndex === null || p.hand[p.showIndex] !== first) return;
    const bluffChance = p.patient ? (first === 1 ? .19 : .08) : (first === 1 ? .54 : .39);
    p.claim = rand() < (handScore(p).isTriple ? .97 : bluffChance);
  }

  function chooseAiReroll(p) {
    if (!canReroll(p) || handScore(p).isTriple) return null;
    const baseline = handScore({ ...p, showIndex: 0 }).value;
    let bestIndex = null;
    let bestGain = game.soul ? 0 : p.patient ? 3.5 : 2.25;

    for (const index of p.hand.keys()) {
      if (index === p.publicIndex) continue;
      const hand = [...p.hand];
      let sum = 0;
      for (let face = 1; face <= 6; face++) {
        hand[index] = face;
        sum += handScore({ hand, showIndex: index, claim: true }).value;
      }
      const gain = sum / 6 - baseline;
      if (gain > bestGain) {
        bestGain = gain;
        bestIndex = index;
      }
    }

    if (game.soul) return bestIndex;
    const chance = (p.patient ? .2 : .4) + game.pot * .025;
    return bestIndex !== null && rand() < chance ? bestIndex : null;
  }
  function startGame(id) {
    const rival = rivals.find(p => p.id === id);
    if (!rival) return;
    players[1] = { ...rival, human: false, outfit: 0 };
    preloadPortraits(players[1]);
    game.session++;
    players.forEach(p => { p.chips = startingChips; p.lastClaim = null; });
    game.round = 0;
    game.history = [];
    game.finalePage = null;
    game.ending = null;
    game.endingLine = null;
    game.soulOfferLine = null;
    game.soul = null;
    window.trackShowtimeStart?.(rival.id, rival.name);
    startRound();
  }
  function dealHand(p) {
    p.hand = [roll(), roll(), roll()];
    p.publicIndex = p.human ? null : chooseAiFirst(p);
    p.showIndex = null;
    p.rerolled = false;
    p.rerollLine = null;
    p.claim = false;
    p.folded = false;
    p.betPaid = 0;
    p.lastAction = '';
  }

  async function startRound() {
    game.round++;
    game.phase = 'rolling';
    game.pot = 0;
    game.bet = 0;
    game.betQueue = [];
    game.minRaise = 2;
    game.selected = null;
    game.selectedShow = null;
    game.lastResult = null;
    game.busy = true;
    game.extensionFee = isExtensionRound(game.round) ? extensionPrice(players[0].chips) : 0;
    players.forEach(p => {
      p.openingChips = p.chips;
      if (p.human) p.chips -= game.extensionFee;
      p.contributed = Math.min(ante(), p.chips);
      p.chips -= p.contributed;
      game.pot += p.contributed;
      dealHand(p);
      if (!p.human) {
        speak(p, p.chips === 0 ? 'allin' : game.round === 1 ? 'lobby' : 'greet');
        if (p.id === 'kohaku' && game.round === extensionInterval) p.line = pickLine(voices.kohaku.extension, p.line);
      }
    });
    render();
    if (!rules.open) window.scrollTo(0, 0);
    await animateTableCoins(players.map(p => ({ from: tableSeat(p), to: 'pot', amount: p.contributed })));
    await rollOpening();
  }

  async function rollOpening() {
    const rival = players[1];
    await stage.roll(players[0].hand, phaseCard('choose'), {
      rivalId: rival.id, name: rival.name, displayName: rival.displayName, outfit: wardrobe[rival.id].looks[rival.outfit],
      portrait: battleArt(rival),
      soulTurn: game.soul?.turn
    });
    game.phase = 'choose';
    game.busy = false;
    render();
    focusPhase();
  }
  async function confirmFirst() {
    if (game.busy || game.phase !== 'choose' || game.selected === null) return;
    game.busy = true;
    players[0].publicIndex = game.selected;
    game.phase = 'show';
    if (game.soul) players[1].line = pickLine(soulLines[players[1].id].show, players[1].line);
    else speak(players[1], 'inviteShow');
    render();
    await stage.cue({
      phase: phaseCard('show'), kind: 'show', title: 'SHOW TIME',
      subtitle: game.soul ? '魂戦は双方とも、伏せた１個を無料で振り直せる。' : '２個目を見せて＋２点。伏せたままでも進める。',
      displayName: players[1].displayName, portrait: battleArt(players[1]), duration: 1150
    });
    game.busy = false;
    focusPhase();
  }

  async function confirmShow(reroll = false) {
    const you = players[0];
    const index = game.selectedShow;
    if (!Number.isInteger(index) || index < 0 || index >= you.hand.length || index === you.publicIndex) return;
    if (reroll && !canReroll(you)) return;

    game.busy = true;
    if (reroll) await rerollShow(you, index);
    else {
      you.showIndex = index;
      stage.play('show');
    }
    if (you.hand[you.publicIndex] === you.hand[you.showIndex]) {
      game.phase = 'claim';
      const rival = players[1];
      if (game.soul) rival.line = pickLine(soulLines[rival.id].inviteClaim, rival.line);
      else speak(rival, 'inviteClaim');
      game.busy = false;
      render();
      focusPhase();
    } else await startBetting();
  }

  async function rerollShow(p, index) {
    if (!canReroll(p) || !Number.isInteger(index) || index < 0 || index >= p.hand.length || index === p.publicIndex) return;
    const other = p.human ? players[1] : players[0];
    const fee = rerollFee();
    p.chips -= fee;
    other.chips += fee;
    p.showIndex = index;
    p.rerolled = true;
    p.hand[index] = roll();
    if (fee) await animateTableCoins([{ from: tableSeat(p), to: tableSeat(other), amount: fee }]);
    const rival = players[1];
    if (game.soul) {
      rival.line = pickLine(soulLines[rival.id][p.human ? 'playerReroll' : 'reroll'], rival.line);
      p.rerollLine = rival.line;
    }
    await stage.reroll(p.hand[index], fee ? `${p.name} → ${other.name} · ${fee}枚` : `魂戦 · ${p.name}の無料リロール`, game.soul ? rival.line : '');
  }

  async function startBetting() {
    game.busy = true;
    game.phase = 'reply';
    render();
    const rival = players[1];
    const rerollIndex = chooseAiReroll(rival);
    if (rerollIndex === null) chooseAiShow(rival);
    else await rerollShow(rival, rerollIndex);
    if (game.soul) {
      if (rival.showIndex === null) rival.showIndex = rival.hand.findIndex((_, i) => i !== rival.publicIndex);
      rival.claim = handScore(rival).isTriple;
      await resolveSoul();
      return;
    }
    chooseAiClaim(rival);
    speak(rival, rival.claim ? 'claim' : rival.rerolled ? 'reroll' : rival.showIndex !== null ? 'show' : 'hide');
    const claimers = players.filter(p => p.claim);
    if (claimers.length) {
      await stage.cue({
        kind: 'claim', title: 'TRIPLE CALL',
        subtitle: `${claimers.map(p => p.name).join('・')} · ${claimers.some(p => p.chips < 2) ? '残りチップで勝負' : '２枚ベット'}`,
        displayName: rival.displayName, portrait: rival.claim ? portraits(rival) : ''
      });
    } else if (rival.showIndex !== null && !rival.rerolled) {
      await stage.cue({
        kind: 'show', title: '公開 ＋２',
        subtitle: `${rival.name}が２個目を公開`, duration: 560,
        displayName: rival.displayName, portrait: portraits(rival, 0)
      });
    }
    game.phase = 'bet';
    claimers.forEach(p => payBet(p, Math.min(2, p.chips)));
    game.bet = Math.max(0, ...claimers.map(p => p.betPaid));
    game.betQueue = seatOrder();
    if (game.bet) {
      await animateTableCoins(claimers.map(p => ({ from: tableSeat(p), to: 'pot', amount: p.betPaid })));
    }
    await advanceBetting(true);
  }

  function payBet(p, amount) {
    p.chips -= amount;
    p.betPaid += amount;
    p.contributed += amount;
    game.pot += amount;
  }

  function actionOptions(p) {
    const toCall = game.bet - p.betPaid;
    const other = p.human ? players[1] : players[0];
    const canRaise = canBet(other) && other.betPaid + other.chips > game.bet;
    const options = toCall > 0 ? { fold: 0, call: Math.min(toCall, p.chips) } : { check: 0 };
    if (!canRaise || p.chips <= toCall) return options;

    // The explicit all-in action covers exact-stack opens and raises as well.
    if (game.bet === 0) {
      if (p.chips > 2) options.bet2 = 2;
      if (p.chips > 4) options.bet4 = 4;
    } else if (p.chips > toCall + game.minRaise) {
      options.raise = toCall + game.minRaise;
    }
    options.allin = p.chips;
    return options;
  }

  async function advanceBetting(entering = false) {
    if (players.some(p => p.folded)) { settle(true); return; }
    const canOpen = players.every(canBet);
    while (game.betQueue.length) {
      const p = players[game.betQueue[0]];
      if (canBet(p) && (game.bet > p.betPaid || (!game.bet && canOpen))) break;
      game.betQueue.shift();
    }
    if (!game.betQueue.length) { settle(false); return; }
    const actor = players[game.betQueue[0]];
    if (entering) {
      render();
      const call = Math.min(actor.chips, game.bet - actor.betPaid);
      const instruction = call ? `続けるには${call}枚コール。` : 'チェックかベットを選ぶ。';
      await stage.cue({
        phase: phaseCard('bet'), kind: 'bet', title: 'ベット',
        subtitle: `${actor.name}の手番。${instruction}`, duration: 1020
      });
      game.busy = false;
    }
    if (actor.human) {
      if (!entering) render();
      focusPhase();
      return;
    }

    const you = players[0];
    const mustRiskAll = game.bet - actor.betPaid >= actor.chips;
    const remembersBluff = you.claim && you.lastClaim === 'bluff';
    const reaction = mustRiskAll ? 'pale' : remembersBluff ? 'remember'
      : you.lastAction === 'raise' ? 'faceRaise' : '';
    if (reaction) speak(actor, reaction);
    render();
    const session = game.session;
    const delay = reaction ? 950 : 400;
    setTimeout(() => {
      if (session === game.session && game.phase === 'bet') aiBet(actor);
    }, delay + Math.floor(rand() * 300));
  }

  function aiBet(p) {
    const hand = handScore(p);
    const you = players[0];
    const wary = p.patient;
    const publicStrength = possibleScores(publicFaces(you), false).mean;
    const edge = hand.value - publicStrength;
    const options = actionOptions(p);
    let choice;
    if (!game.bet) {
      const chance = Math.max(.13, Math.min(.94, (wary ? .52 : .75) + edge * .073));
      if (rand() >= chance) choice = 'check';
      else if (options.allin && rand() < (edge > 5 ? .23 : wary ? .015 : .07)) choice = 'allin';
      else if (options.bet4 && rand() < (edge > 0 || !wary ? .77 : .34)) choice = 'bet4';
      else choice = options.bet2 ? 'bet2' : options.allin ? 'allin' : 'check';
    } else {
      const cost = options.call / Math.max(1, p.chips);
      let chance = (wary ? .66 : .82) + edge * .085 - cost * (wary ? .49 : .29);
      if (you.claim) {
        chance = (wary ? .21 : .53) - cost * .21;
        if (you.lastClaim === 'bluff') chance += wary ? .22 : .32;
      }
      chance = Math.max(.06, Math.min(.98, chance));
      if (p.claim && hand.isTriple) chance = 1;
      if (rand() >= chance) choice = 'fold';
      else if (options.allin && (p.claim && hand.isTriple
        || rand() < (edge >= 4 ? .27 : !wary && edge >= -1 ? .12 : .025))) choice = 'allin';
      else if (options.raise && rand() < (edge >= 2 ? (wary ? .41 : .72) : wary ? .03 : .34)) choice = 'raise';
      else choice = 'call';
    }
    actBet(choice);
  }

  async function actBet(choice) {
    if (game.phase !== 'bet' || game.busy || !game.betQueue.length) return;
    const index = game.betQueue[0];
    const p = players[index];
    const options = actionOptions(p);
    if (!Object.hasOwn(options, choice)) return;
    const amount = options[choice];
    game.busy = true;
    game.betQueue.shift();
    if (choice === 'fold') p.folded = true;
    if (amount) {
      payBet(p, amount);
      stage.play('bet');
      await animateTableCoins([{ from: tableSeat(p), to: 'pot', amount }]);
    }

    const increased = p.betPaid > game.bet;
    if (increased) {
      game.minRaise = Math.max(game.minRaise, p.betPaid - game.bet);
      game.bet = p.betPaid;
      game.betQueue = [1 - index];
    }

    const allin = amount > 0 && p.chips === 0;
    p.lastAction = allin ? 'allin' : choice;
    if (!p.human) speak(p, p.lastAction);
    if (allin || choice === 'raise') {
      await stage.cue({
        kind: allin ? 'allin' : 'raise', title: allin ? 'ALL IN' : 'RAISE',
        subtitle: `${p.name} · ${allin && !increased ? '残り' : '追加'}${amount}枚`,
        displayName: p.displayName, portrait: p.human ? '' : portraits(p),
        quote: !p.human && allin ? p.line : '',
        duration: !p.human && allin ? 870 : 660
      });
    } else if (!amount) stage.play('select');
    game.busy = false;
    advanceBetting();
  }

  function showdown(byFold) {
    const live = players.filter(p => !p.folded);
    const liars = byFold ? [] : live.filter(p => p.claim && !handScore(p).isTriple);
    const truthful = live.filter(p => !liars.includes(p));
    const eligible = truthful.length ? truthful : live;
    const scores = eligible.map(p => handScore(p).value);
    const best = Math.max(...scores);
    const winners = eligible.filter((p, i) => scores[i] === best);
    return { liars, winners };
  }

  function payPot(byFold) {
    const { liars, winners } = showdown(byFold);
    // The two matched wagers form a single pot. Return anything unmatched.
    const matched = Math.min(...players.map(p => p.contributed));
    const amount = matched * 2;
    const refund = players.find(p => p.contributed > matched);
    const refundAmount = refund ? refund.contributed - matched : 0;
    if (refund) refund.chips += refundAmount;
    winners.forEach(p => { p.chips += amount / winners.length; });
    return { liars, winners, amount, refund, refundAmount };
  }

  function revealHands() {
    const rival = players[1];
    const { liars } = showdown(false);
    return stage.showdown({
      id: rival.id, displayName: rival.displayName, portrait: game.soul ? battleArt(rival) : portraits(rival, 'resolve'),
      subtitle: game.soul ? `SOUL ALL-IN · ${game.soul.turn}` : `ROUND ${game.round}`,
      hands: [rival, players[0]].map(p => {
        const score = handScore(p);
        return { seat: tableSeat(p), name: p.human ? 'YOU' : p.id.toUpperCase(),
          dice: p.hand.map((face, index) => ({ face, public: index === p.publicIndex || index === p.showIndex })),
          base: p.hand.reduce((total, face) => total + face, 0), bonuses: score.bonuses,
          combo: score.combo.splash, failed: liars.includes(p) };
      })
    });
  }

  function showVerdict(winners, liars, byFold = false, busted = null) {
    const rival = players[1];
    const tied = winners.length === 2;
    const winner = tied ? null : winners[0];
    const after = game.soul && tied ? portraits(rival, 'resolve') : portraits(rival);
    const hands = [rival, players[0]].map(p => {
      const faces = byFold
        ? p.hand.map((value, i) => i === p.publicIndex || i === p.showIndex ? value : null)
        : p.hand;
      const dice = faces.map(value => die(value)).join('');
      const seat = p.human ? 'YOU' : p.id.toUpperCase();
      const score = byFold ? null : handScore(p);
      let finish = 'ivory';
      if (score?.value === 42) finish = 'jackpot';
      else if (score?.value >= 30) finish = 'gilded';
      else if (score?.value >= 20) finish = 'gold';
      const label = score ? score.combo.splash : p.folded ? 'FOLD' : 'UNREVEALED';
      return `<div class="verdict-hand" data-seat="${tableSeat(p)}" data-winner="${winners.includes(p)}">
        <div class="verdict-hand-heading"><h3 lang="en">${label}</h3><span class="verdict-seat" lang="en">${seat}</span></div>
        <div class="verdict-values"><span class="verdict-dice">${dice}</span>
          <div class="verdict-score" data-finish="${finish}" aria-label="${score ? `合計 ${score.value}点` : '合計は非公開'}">
            <strong>${score ? score.value : '—'}</strong>${score ? '<small lang="en">PTS</small>' : ''}</div>
        </div>${score ? `<div class="showdown-meter" aria-hidden="true"><i style="width:${score.value / 42 * 100}%"></i></div>
          <p class="showdown-addition">${liars.includes(p) ? 'トリプル宣言失敗' : score.bonuses.map(bonus => `${bonus.label} +${bonus.points}`).join(' · ') || '出目の合計'}</p>` : ''}</div>`;
    }).join('<div class="verdict-vs" lang="en">VS</div>');
    return stage.cue({
      kind: busted ? 'bust' : 'reveal',
      title: tied ? 'DRAW' : winner.human ? 'YOU WIN' : `${rival.id.toUpperCase()} WINS`,
      subtitle: game.soul ? `SOUL ALL-IN · ${game.soul.turn}` : `ROUND ${game.round} · ${byFold ? 'FOLD' : 'SHOWDOWN'}`,
      portrait: after, quote: rival.line, details: hands,
      verdict: { id: rival.id, name: rival.name, displayName: rival.displayName, revealed: !byFold, bust: busted ? (busted.human ? 'YOU' : rival.id.toUpperCase()) : '',
        outcome: tied ? 'draw' : winner.human ? 'win' : 'loss' },
      duration: byFold ? 3300 : 2300
    });
  }

  async function settle(byFold) {
    game.busy = true;
    if (!byFold) await revealHands();
    const { liars, winners, amount, refund, refundAmount } = payPot(byFold);
    game.pot = 0;
    const winnerNames = winners.map(p => p.name).join('・');
    const busted = players.find(p => p.chips === 0);
    for (const p of players.filter(seat => seat.claim && !seat.folded)) {
      p.lastClaim = byFold ? 'unseen' : liars.includes(p) ? 'bluff' : 'true';
    }
    let detail = byFold ? 'フォールドで決着。残りの目は非公開。'
      : liars.length ? `${liars.map(p => p.name).join('・')}のトリプル宣言は失敗。`
      : '公開した３個の得点で決着。';
    if (liars.length === 2) detail += ' 両方の宣言が外れたので、得点で判定。';
    game.lastResult = { winners, byFold, liars, detail, winnerNames, busted, amount, refund, refundAmount };
    game.history.push({
      round: game.round, winnerNames,
      change: players[0].chips - players[0].openingChips
    });
    game.phase = 'reveal';
    if (completeVictory()) {
      const preview = new Image();
      preview.src = soulOfferArt(players[1]);
    }
    render();
    const rival = players[1];
    const table = gameRoot.querySelector('[data-dice-table]');
    if (table) {
      if (!rules.open && table.getBoundingClientRect().top < matchHud.offsetHeight) {
        table.scrollIntoView({ block: 'start' });
      }
      const moves = winners.map(p => ({ from: 'pot', to: tableSeat(p), amount: amount / winners.length }));
      if (refund) moves.push({ from: 'pot', to: tableSeat(refund), amount: refundAmount });
      await animateTableCoins(moves);
    }
    const tied = winners.length === 2;
    speak(rival, busted === rival ? 'despair' : busted ? 'champion'
      : byFold ? (rival.folded ? 'fold' : 'foldWin') : liars.includes(rival) ? 'bluff'
      : tied ? 'tie' : winners.includes(rival) ? 'win' : 'loss');
    await showVerdict(winners, liars, byFold, busted);
    game.phase = 'result';
    game.busy = false;
    stage.play(tied || winners.includes(players[0]) ? 'win' : 'loss');
    render();
    if (!rules.open) window.scrollTo(0, 0);
    focusPhase();
    if (busted?.human) showBustArt();
  }

  function wardrobeOffer() {
    const [you, rival] = players;
    const result = game.lastResult;
    if (game.phase !== 'result' || result.purchase || result.busted !== rival || rival.chips !== 0 ||
        result.winners.length !== 1 || result.winners[0] !== you) return null;
    const garment = wardrobe[rival.id].garments[rival.outfit];
    if (!garment) return null;
    // Choose once for this offer, including when rendering or reopening artwork.
    const line = result.offerLine ??= pickLine(wardrobe[rival.id].offers[rival.outfit], rival.line);
    return { price: buybackPrice, garment, affordable: you.chips > buybackPrice, line };
  }

  function buyGarment() {
    const offer = wardrobeOffer();
    if (game.busy || !offer?.affordable) return false;
    const [you, rival] = players;
    const { price, garment } = offer;
    you.chips -= price;
    rival.chips += price;
    rival.outfit++;
    const purchase = { price, garment };
    game.lastResult.purchase = purchase;
    const entry = game.history[game.history.length - 1];
    entry.change = you.chips - you.openingChips;
    entry.purchase = purchase;
    rival.line = pickLine(wardrobe[rival.id].lines[rival.outfit - 1], rival.line);
    rival.mood = 0;
    preloadPortraits(rival);
    stage.play('coin');
    render();
    return true;
  }

  function outfitPhoto(rival) {
    return { src: portraits(rival, 0), title: wardrobe[rival.id].looks[rival.outfit], caption: rival.line };
  }

  function completeVictory() {
    const [you, rival] = players;
    return you.chips > 0 && rival.chips === 0 && rival.outfit === wardrobe[rival.id].garments.length;
  }

  function endingPhotos() {
    const [you, rival] = players;
    const photo = (suffix, title, caption) => ({ src: `./art/${rival.id}-reward${suffix}.webp`, title, caption });
    if (you.chips > 0) {
      if (game.ending === 'toast') return [photo('2', '勝者への一杯', game.endingLine ??= pickLine(wardrobe[rival.id].toast, rival.line))];
      if (game.ending === 'spent') return [photo('1', '最後の一枚', game.endingLine ??= pickLine(soulLines[rival.id].spent, rival.line))];
      return [];
    }
    if (rival.outfit < 2) return [photo('-bust', '勝者のまなざし', rival.line)];
    return [photo('-bust-bikini', '勝者のまなざし・水着', rival.line)];
  }

  function showBustArt() {
    const rival = players[1];
    const photos = endingPhotos();
    const dialog = document.querySelector('#bust-dialog');
    const next = dialog.querySelector('button');
    let index = 0;
    function display() {
      const photo = photos[index];
      dialog.querySelector('source').srcset = photo.src.replace('./art/', './art/wide/');
      const img = dialog.querySelector('img');
      img.src = photo.src;
      img.alt = `${rival.name} · ${photo.title}`;
      dialog.querySelector('#bust-winner').textContent = `${rival.displayName} wins`;
      dialog.querySelector('#bust-quote').textContent = photo.caption;
      next.textContent = index + 1 < photos.length ? '次の一枚へ' : '決着に戻る';
    }
    next.onclick = () => {
      if (++index < photos.length) display();
      else dialog.close();
    };
    display();
    dialog.showModal();
  }

  function openPhoto(photo) {
    const asset = portraitAssets.describe(photo.src);
    photoDialog.dataset.standing = asset ? 'square' : '';
    photoDialog.style.setProperty('--scene-background', asset ? `url('${portraitAssets.backgrounds[asset.outfit]}')` : 'none');
    photoDialog.querySelector('img').src = photo.src;
    photoDialog.querySelector('h2').textContent = photo.title;
    photoDialog.querySelector('p').textContent = photo.caption;
    photoDialog.showModal();
  }

  function nextRound() {
    if (!matchEnded()) {
      startRound();
      return;
    }
    game.phase = 'gameover';
    if (completeVictory()) {
      game.ending = 'offer';
    } else if (players[1].chips === 0) {
      speak(players[1], 'comeback');
    }
    stage.play(players[0].chips ? 'win' : 'loss');
    render();
    window.scrollTo(0, 0);
    focusPhase();
  }

  function portrait(p, className = '', mood = p.mood ?? 0) {
    const asset = portraitAssets.get(p.id, p.outfit, mood);
    return `<span class="${className} portrait-avatar">${verdictPortrait.image(asset.src)}</span>`;
  }

  function handsRevealed() {
    return game.phase === 'soul-result' || (['reveal', 'result'].includes(game.phase) && !game.lastResult.byFold);
  }

  function tablePower(p) {
    const faces = p.human || handsRevealed() ? p.hand : publicFaces(p);
    const hidden = p.human ? 0 : p.hand.length - faces.length;
    const rolling = game.phase === 'rolling';
    const score = !rolling && !hidden ? handScore(p) : null;
    const combo = score && score.combo !== combos.none ? score.combo : null;
    const showBonus = !rolling && p.showIndex !== null && (!hidden || faces.length === 2);
    const publicPower = faces.reduce((sum, face) => sum + face, 0) + (showBonus ? 2 : 0);
    const value = p.human && rolling ? '—' : score?.value ?? publicPower;
    const label = value === '—' ? 'ロール中' : `POWER ${value}${hidden ? `、未公開${hidden}個` : ''}`;
    return `<div class="table-power" role="img" aria-label="${combo ? combo.name + '、' : ''}${showBonus ? 'SHOW +2、' : ''}${label}">
      ${combo || showBonus ? `<span class="combo-slot" aria-hidden="true" lang="en">
        ${combo ? `<i class="table-combo" data-combo="${combo.splash}">${combo.splash}</i>` : ''}
        ${showBonus ? '<small class="show-bonus">SHOW +2</small>' : ''}
      </span>` : ''}
      <span class="power-readout" aria-hidden="true">
        <span class="power-label" lang="en">POWER</span>
        <span class="power-value"><b>${value}</b>${hidden ? `<small>${'+'.repeat(hidden)}</small>` : ''}</span>
      </span>
    </div>`;
  }

  function renderDice(p) {
    const isRolling = game.phase === 'rolling';
    const visible = isRolling || game.phase === 'choose' ? [] : [p.publicIndex];
    if (p.showIndex !== null && (p.human || p.rerolled || !['rolling', 'choose', 'show', 'claim'].includes(game.phase))) {
      visible.push(p.showIndex);
    }
    const showdown = handsRevealed();
    return p.hand.map((value, i) => {
      if (p.human && game.phase === 'choose') return dieControl(value, i, 'select-first', game.selected === i);
      if (p.human && game.phase === 'show' && i !== p.publicIndex) return dieControl(value, i, 'select-show', game.selectedShow === i);
      const open = visible.includes(i);
      return die((p.human && !isRolling) || open || showdown ? value : null, false, p.human && open, true);
    }).join('');
  }

  function renderTableSide(p) {
    const badges = [];
    if (p.rerolled) badges.push(`<span class="badge reroll">REROLL · ${game.soul ? 'FREE' : `−${rerollCost}枚`}</span>`);
    if (p.claim && !['rolling', 'choose', 'show', 'claim'].includes(game.phase)) badges.push('<span class="badge claim">TRIPLE CLAIM</span>');
    if (p.human && p.claim && !handScore(p).isTriple) badges.push('<span class="badge claim">BLUFF</span>');
    if (p.folded) badges.push('<span class="badge fold">FOLD</span>');
    if (game.phase === 'bet' && p.betPaid) {
      const label = p.lastAction === 'raise' ? 'RAISE' : 'BET';
      badges.push(`<span class="badge bet">${label} ${p.betPaid}枚</span>`);
    }
    if (!p.folded && p.chips === 0) badges.push('<span class="badge allin">ALL IN</span>');
    const seat = tableSeat(p);
    const label = p.human ? 'あなた' : p.name;
    const faces = p.human ? [] : publicFaces(p);
    let limit = '';
    if (faces.length && !handsRevealed() && !p.folded && game.phase !== 'result') {
      const declared = faces.length === 2 && p.claim;
      limit = `<small class="mobile-hand-limit">${declared ? '成功時 ' : ''}MAX ${possibleScores(faces, declared).max}</small>`;
    }
    const current = game.phase === 'bet' && game.betQueue[0] === players.indexOf(p);
    return `<div class="table-lane table-${seat}${current ? ' table-current' : ''}">
      <strong class="table-lane-name" lang="en">${p.human ? 'YOU' : p.displayName.toUpperCase()}${limit}</strong>
      <div class="dice-line" data-table-anchor="${seat}" role="group" aria-label="${label}のダイス">${renderDice(p)}</div>
      ${tablePower(p)}
      <div class="player-foot">${badges.join('')}</div>
    </div>`;
  }

  function renderTable() {
    const [you, rival] = players;
    return `<section class="dice-table" data-dice-table data-round="${game.soul ? `soul-${game.soul.turn}` : game.round}" data-pot="${game.pot}" aria-label="対戦卓">
      ${renderTableSide(rival)}
      <div class="table-pot">
        <span class="table-pot-name" lang="en">POT</span>
        <div class="table-coins" data-table-anchor="pot" aria-hidden="true">${coinStacks(game.pot)}</div>
        <strong class="table-pot-amount"><span data-table-amount>${game.pot}</span>枚</strong>
        <div class="pot-meter" data-pot-meter role="meter" aria-label="場のチップ" aria-valuemin="0"
          aria-valuemax="${chipsInPlay()}" aria-valuenow="${game.pot}"
          style="--pot-share:${100 * game.pot / chipsInPlay()}%"><i></i></div>
      </div>
      ${renderTableSide(you)}
    </section>`;
  }

  function characterScene(p, art, line, { alt = '', side = 'right', speaking = false, speechToggle = false, resultTitle = '', resultNote = '' } = {}) {
    const speech = line ? `<q class="speech-bubble${speaking ? ' just-spoken' : ''}">${line}</q>` : '';
    const soul = verdictPortrait.framing(art).soul;
    const standing = art === portraits(p) || soul;
    return `<div class="character-scene${speechToggle ? ' duel-portrait' : ''}${standing ? ' standing-scene' : ''}${soul ? ' soul-battle-scene' : ''}" data-side="${side}" data-outfit="${p.outfit ?? 0}" style="${soul ? verdictPortrait.sceneStyle(art) : portraitAssets.sceneStyle(p.outfit)}">
      ${standing ? verdictPortrait.image(art, alt, 'character-art') : `<img class="character-art" src="${art}" alt="${alt}">`}
      <span class="character-label"><strong lang="en">${p.displayName}</strong></span>
      ${resultTitle ? `<div class="result-overlay">${resultNote ? `<small lang="en">${resultNote}</small>` : ''}<h1 lang="en">${resultTitle}</h1>${speech}</div>` : speech}
      ${speechToggle ? `<button type="button" class="speech-toggle" data-action="toggle-speech" aria-label="対戦相手のセリフ" aria-pressed="${gameRoot.dataset.speech !== 'off'}">セリフ <span aria-hidden="true"></span></button>` : ''}
    </div>`;
  }

  function battleArt(p) {
    return game.soul && !game.soul.verdict ? verdictPortrait.soulArt(p.id) : portraits(p);
  }

  function renderRival(p) {
    const current = game.phase === 'bet' && game.betQueue[0] === 1;
    const previous = gameRoot.querySelector('.arena .speech-bubble')?.textContent;
    return `<section class="player-card rival seat-${p.id}${p.folded ? ' folded' : ''}${current ? ' current' : ''}" aria-label="${p.name}" data-expression="${p.mood}" data-outfit="${p.outfit ?? 0}" data-bubble-row="${p.bubbleRow ?? 'middle'}">
      ${characterScene(p, battleArt(p), p.line, { side: p.bubbleSide, speaking: previous !== p.line, speechToggle: true })}
      <div class="rival-hand">${publicReadout(p)}</div>
    </section>`;
  }

  function renderAction() {
    const you = players[0];
    if (game.phase === 'rolling') return '<section class="action-panel"><h2>ダイスを振っています…</h2></section>';
    if (game.phase === 'choose') return `<section class="action-panel"><h2>公開するダイスを１個選ぶ</h2><p class="choose-hint">残りの２個は相手に見えません。</p><button class="primary-button full-width" data-action="confirm-first" ${game.selected === null ? 'disabled' : ''}>この目を公開する</button></section>`;
    if (game.phase === 'show') {
      const selected = game.selectedShow !== null;
      const rival = players[1];
      const fee = game.soul ? 'この一投では双方1回ずつ、伏せたダイスを1個無料で振り直して公開できます。' : canReroll(you)
        ? `選んだ伏せ目は、${rival.name}に${rerollCost}枚渡すと振り直して公開できます。`
        : `リロールには手元に${rerollCost}枚必要です。`;
      return `<section class="action-panel"><h2>もう１個、見せる？</h2>
        <p>公開で得点＋２。同じ目が並べばトリプル宣言もできます。</p>
        <div class="button-row">
          <button class="secondary-button" data-action="skip-show">隠したまま進む</button>
          <button class="primary-button" data-action="confirm-show" ${selected ? '' : 'disabled'}>SHOWする ＋2</button>
          <button class="secondary-button reroll-button" data-action="reroll-show" aria-describedby="reroll-fee" ${selected && canReroll(you) ? '' : 'disabled'}>振り直して公開 · ${game.soul ? '無料' : `${rerollCost}枚`}</button>
        </div>
        <p id="reroll-fee" class="reroll-fee">${fee}</p>
      </section>`;
    }
    if (game.phase === 'reveal') return '<section class="action-panel waiting"><h2>チップを精算中…</h2></section>';
    if (game.phase === 'result') return renderResult(true);
    if (game.phase === 'soul-result') return renderSoulResult(true);
    if (game.phase === 'reply') return `<section class="action-panel waiting"><h2>${players[1].name}の手番</h2></section>`;
    if (game.phase === 'claim') {
      const preview = handScore(you).isTriple
        ? scoreFormula({ ...you, claim: true }, '宣言した場合')
        : game.soul ? '<p>最後の目が違うので、宣言すればショーダウンで失敗します。</p>' : '<p>３個目は違う目ですが、ブラフで宣言できます。相手が降りれば勝ちです。</p>';
      return `<section class="action-panel"><h2>トリプルを宣言する？</h2>${preview}
        <div class="button-row"><button class="secondary-button" data-action="skip-claim">宣言しない</button>
        <button class="primary-button" data-action="make-claim">${game.soul ? 'トリプルを宣言' : you.chips === 0 ? 'トリプル宣言' : you.chips < 2 ? '宣言してオールイン' : 'トリプル宣言・２枚ベット'}</button></div></section>`;
    }
    if (game.phase === 'bet') {
      const actor = players[game.betQueue[0]];
      if (actor?.human) {
        const options = actionOptions(you);
        const toCall = game.bet - you.betPaid;
        const button = (action, label, kind, amount = '') => Object.hasOwn(options, action)
          ? `<button class="${kind}-button" data-action="${action}"><span>${label}</span>${amount ? ` <span class="bet-amount">${amount}</span>` : ''}</button>` : '';
        const callAmount = options.call === you.chips ? `残り${options.call}枚` : `${options.call}枚`;
        const buttons = [
          button('check', 'チェック', 'secondary'), button('fold', '降りる', 'danger'),
          button('bet2', 'ベット', 'primary', '2枚'), button('bet4', 'ベット', 'primary', '4枚'),
          button('call', 'コール', 'primary', callAmount),
          button('raise', 'レイズ', 'primary', `計${options.raise}枚`),
          button('allin', 'ALL IN', 'allin', `${you.chips}枚`)
        ].join('');
        const openingHint = options.bet4 ? '２枚か４枚で仕掛けるか、チェックで回します。'
          : options.bet2 ? '２枚ベットか、チェックで回せます。'
          : 'チェックで回すか、オールインで仕掛けます。';
        const hint = !toCall ? openingHint
          : options.call === you.chips ? '残りをすべて出すと勝負に残れます。'
          : options.raise ? `コールは追加${toCall}枚。レイズは計${options.raise}枚を追加します。`
          : `コールは追加${toCall}枚。降りると賭けたチップは場に残ります。`;
        return `<section class="action-panel"><h2>${toCall ? `${game.bet}枚まで上がった。` : 'ここで仕掛ける？'}</h2>
          <p id="bet-hint">${hint}</p><div class="button-row bet-actions" role="group" aria-label="ベットの操作" aria-describedby="bet-hint">${buttons}</div></section>`;
      }
      return `<section class="action-panel waiting"><h2>${actor.name}が考え中<span aria-hidden="true">…</span></h2></section>`;
    }
    return '';
  }
  function signedChips(value) {
    return value > 0 ? `＋${value}` : value < 0 ? `−${Math.abs(value)}` : '±0';
  }

  function renderWardrobe() {
    const [you, rival] = players;
    const purchase = game.lastResult.purchase;
    if (purchase) {
      return `<section class="wardrobe-contract sold seat-${rival.id}">
        <div><h2>${purchase.garment}を買い取った</h2>
        <p>${rival.name}は代金の${purchase.price}枚で復帰。次局もこの衣装で対戦します。</p></div>
        <button class="secondary-button" data-action="outfit-photo">立ち絵を見る</button></section>`;
    }
    const offer = wardrobeOffer();
    if (!offer) return '';
    const { price, garment, affordable } = offer;
    const projection = affordable
      ? `支払い後　あなた ${you.chips - price}枚 ／ ${rival.name} ${rival.chips + price}枚`
      : `買取には${price + 1}枚必要です（次局用に１枚残します）。`;
    return `<section class="wardrobe-contract seat-${rival.id}" aria-label="衣装の買取">
      <div><small>${rival.name}のバースト　${rival.outfit + 1}回目</small><h2>${garment}を買って対戦を続ける？</h2>
      ${affordable ? `<q class="speech-bubble offer-line">${offer.line}</q>` : ''}
      <p>買えば${rival.name}が${price}枚で復帰。ここで席を立てば、あなたの勝利です。</p>
      <p class="wallet-preview">${projection}</p></div>
      <button class="wardrobe-buy" data-action="buy-garment" ${affordable ? '' : 'disabled'}>${price}ドルで買う</button>
    </section>`;
  }

  function renderResult(onTable = false) {
    const result = game.lastResult;
    const split = result.winners.length > 1;
    const title = split ? '引き分け' : `${result.winnerNames}の勝ち`;
    const rows = players.map(p => {
      const delta = p.chips - p.openingChips;
      const failed = result.liars.includes(p);
      const winner = result.winners.includes(p);
      const avatar = p.human ? '<span class="receipt-avatar" aria-hidden="true">✦</span>' : portrait(p, 'receipt-avatar');
      let breakdown;
      if (!result.byFold && !p.folded) {
        const label = failed ? 'トリプル宣言失敗' : '確定得点';
        breakdown = scoreFormula(p, label);
      } else {
        const faces = p.human ? p.hand : publicFaces(p);
        const prefix = p.human ? '自分の目' : '公開目';
        const action = p.folded ? 'フォールド' : 'フォールド勝ち';
        breakdown = `<small>${action} · ${prefix} ${faces.join('・')}</small>`;
      }
      return `<li class="receipt-row${winner ? ' receipt-winner' : ''}">
        <div class="receipt-name">${avatar}<b>${p.name}</b>${result.busted === p ? `<span class="bust-label">${p.chips ? '復帰' : 'バースト'}</span>` : ''}</div>
        <div class="receipt-balance">${p.openingChips} → <b>${p.chips}枚</b>
          <em class="${delta > 0 ? 'gain' : ''}">${signedChips(delta)}枚</em></div>
        <div class="receipt-hand">
          <div class="receipt-dice">${p.hand.map((value, i) => die(p.human || (!result.byFold && !p.folded) ||
            (i === p.publicIndex || i === p.showIndex) ? value : null, true)).join('')}</div>
          <div>${breakdown}</div>
        </div>
      </li>`;
    }).join('');
    let next = matchEnded() ? '最終結果を見る' : `第${game.round + 1}回戦を始める`;
    if (!matchEnded() && isExtensionRound(game.round + 1)) {
      const price = extensionPrice(players[0].chips);
      next += price ? `（延長料 ${price}ドル）` : '（延長料免除）';
    }
    const payouts = `<li><span>${split ? 'ポットを折半' : 'ポット獲得'}</span>
        <b>${split ? `各 ${result.amount / 2}枚` : `${result.winnerNames} · ${result.amount}枚`}</b></li>`;
    const refunds = result.refund
      ? `<li><span>余剰チップの返却</span><b>${result.refund.name} · ${result.refundAmount}枚</b></li>`
      : '';
    const fees = players.map((p, i) => p.rerolled
      ? `<li><span>リロール料</span><b>${p.name} → ${players[1 - i].name} · ${rerollCost}枚</b></li>`
      : '').join('');
    const extension = isExtensionRound(game.round)
      ? `<li><span>卓の延長料</span><b>${game.extensionFee ? `あなた → 店 · ${game.extensionFee}ドル` : '免除 · 0ドル'}</b></li>` : '';
    const rival = players[1];
    const sale = result.purchase ? `<li><span>${result.purchase.garment}の買取</span>
      <b>あなた → ${rival.name} · ${result.purchase.price}ドル</b></li>` : '';
    const offer = wardrobeOffer();
    if (offer?.affordable) next = '買わずに勝利を確定';
    if (completeVictory()) next = '完全勝利のエンディングへ';
    const details = `<ul class="pot-payouts" aria-label="チップの精算">${payouts}${refunds}${fees}${extension}${sale}</ul>
      <ul class="receipt-list" aria-label="この回の収支と出目">${rows}</ul>`;
    if (onTable) {
      const buy = offer ? `<button class="secondary-button" data-action="buy-garment" ${offer.affordable ? '' : 'disabled'}>${offer.price}枚で買取</button>` : '';
      const photo = result.purchase ? '<button class="secondary-button" data-action="outfit-photo">立ち絵</button>' : '';
      return tableResultActions(title, buy + photo +
        `<button class="primary-button" data-action="next">${next}</button>`, details);
    }
    return `<section class="round-receipt">
      <header class="result-hero seat-${rival.id}" data-expression="${rival.mood}">
        ${characterScene(rival, portraits(rival), rival.line)}
        <div class="result-copy"><p class="receipt-round">第${game.round}回戦　決着</p><h1>${title}</h1></div>
      </header>
      <p class="result-detail">${result.detail}</p>
      ${renderWardrobe()}
      <button class="primary-button full-width" data-action="next">${next}</button>
      ${details}</section>`;
  }

  function renderHistory() {
    const rows = game.history.map(entry => `<tr><th scope="row">${entry.soul ? `魂戦 第${entry.soul}投` : `第${entry.round}回戦`}</th>
      <td>${entry.winnerNames}${entry.purchase ? `<small class="history-sale">${entry.purchase.garment}買取 · ${entry.purchase.price}ドル</small>` : ''}</td><td>${signedChips(entry.change)}枚</td></tr>`).join('');
    return `<table class="round-history"><caption>対戦記録</caption>
      <thead><tr><th scope="col">回戦</th><th scope="col">勝者</th><th scope="col">あなたの収支</th></tr></thead>
      <tbody>${rows}</tbody></table>`;
  }

  async function startSoulThrow() {
    const [you, rival] = players;
    const first = game.phase === 'gameover' && game.ending === 'offer';
    const replay = game.phase === 'soul-result' && game.soul?.verdict === 'tie';
    if (game.busy || (!first && !replay)) return;
    game.busy = true;
    if (first) {
      game.soul = { stake: you.chips, turn: 0, verdict: null };
      game.ending = null;
      you.openingChips = you.chips;
      rival.openingChips = 0;
      game.pot = you.chips;
      you.chips = 0;
    }
    game.soul.turn++;
    game.soul.verdict = null;
    game.phase = 'rolling';
    game.selected = null;
    game.selectedShow = null;
    game.lastResult = null;
    players.forEach(dealHand);
    rival.line = pickLine(soulLines[rival.id][first ? 'playing' : 'again'], rival.line);
    render();
    if (!rules.open) window.scrollTo(0, 0);
    if (first) await animateTableCoins([{ from: 'you', to: 'pot', amount: game.soul.stake }]);
    await rollOpening();
  }

  async function resolveSoul() {
    game.busy = true;
    await revealHands();
    const rival = players[1];
    const { winners, liars } = showdown(false);
    const winner = winners.length === 1 ? winners[0] : null;
    game.lastResult = { byFold: false, liars };
    game.phase = 'reveal';
    render();
    if (winner) {
      const amount = game.pot;
      winner.chips += amount;
      game.pot = 0;
      await animateTableCoins([{ from: 'pot', to: tableSeat(winner), amount }]);
    }
    game.soul.verdict = !winner ? 'tie' : winner.human ? 'win' : 'loss';
    game.history.push({ soul: game.soul.turn, winnerNames: winner?.name ?? '引き分け',
      change: winner === rival ? -game.soul.stake : 0 });
    const lines = soulLines[rival.id];
    if (winner) {
      rival.line = pickLine(winner.human ? lines.defeat : lines.champion, rival.line);
      rival.mood = winner.human ? expressions.despair : expressions.champion;
    } else rival.line = pickLine(game.soul.turn === 1 ? lines.tie : lines.tieAgain, rival.line);
    await showVerdict(winners, liars);
    game.phase = 'soul-result';
    game.busy = false;
    stage.play(!winner ? 'land' : winner.human ? 'win' : 'loss');
    render();
    if (!rules.open) window.scrollTo(0, 0);
    focusPhase();
    if (winner === rival) showBustArt();
  }

  function tableResultActions(title, actions, details) {
    return `<section class="action-panel round-actions"><h2>${title}</h2><div class="button-row">
      <button class="secondary-button" data-action="receipt">明細</button>${actions}</div></section>
      <dialog class="rules-dialog receipt-dialog" aria-label="この回の精算明細"><form method="dialog">
      <button class="secondary-button" autofocus>卓に戻る</button></form>${details}</dialog>`;
  }

  function renderSoulResult(onTable = false) {
    const { turn, stake, verdict } = game.soul;
    const rival = players[1], lines = soulLines[rival.id];
    const tie = verdict === 'tie';
    const title = tie ? '引き分け' : verdict === 'win' ? 'あなたが魂戦に勝利' : `${players[1].name}の逆転勝利`;
    const scores = players.map(p => {
      const winner = tie || p === players[verdict === 'win' ? 0 : 1];
      const avatar = p.human ? '<span class="receipt-avatar" aria-hidden="true">✦</span>' : portrait(p, 'receipt-avatar');
      return `<li class="receipt-row${winner ? ' receipt-winner' : ''}">
        <div class="receipt-name">${avatar}<b>${p.name}</b></div>
        <div class="receipt-hand">
          <div class="receipt-dice">${p.hand.map(face => die(face, true)).join('')}</div>
          <div>${scoreFormula(p, game.lastResult.liars.includes(p) ? 'トリプル宣言失敗' : '確定得点')}</div>
        </div>
        ${p.rerolled ? `<small class="soul-roll-note">無料リロール · ${rival.name}「${p.rerollLine ?? (p.human ? lines.playerReroll : lines.reroll)[0]}」</small>` : ''}
      </li>`;
    }).join('');
    if (onTable) return tableResultActions(title,
      `<button class="primary-button" data-action="${tie ? 'soul-rematch' : 'soul-finish'}">${tie ? '同じ賭けでもう一投' : verdict === 'loss' ? '対戦結果へ' : '結末を見る'}</button>`,
      `<p>魂戦 第${turn}投 · ${stake}枚</p><ul class="receipt-list">${scores}</ul>`);
    return `<section class="round-receipt soul-receipt seat-${rival.id}">
      ${characterScene(rival, portraits(rival), rival.line)}
      <p class="receipt-round">魂のオールイン　第${turn}投</p><h1>${title}</h1>
      <p>${tie ? `全${stake}枚と魂は卓に残ります。次の一投も、双方が1回ずつ無料でリロールできます。`
        : `${verdict === 'win' ? 'あなた' : players[1].name}が場の${stake}枚を獲得。`}</p>
      <ul class="receipt-list">${scores}</ul>
      <button class="primary-button full-width" data-action="${tie ? 'soul-rematch' : 'soul-finish'}">${tie ? '同じ賭けでもう一投' : verdict === 'loss' ? '対戦結果へ' : '結末を見る'}</button></section>`;
  }

  function renderSoulOffer() {
    const [you, rival] = players;
    const line = game.soulOfferLine ??= pickLine(soulLines[rival.id].offer, rival.line);
    return `<section class="victory-scene soul-offer seat-${rival.id}">
      ${characterScene(rival, soulOfferArt(rival), line, { alt: `${rival.name}が静かに立ち上がり、魂の勝負へ誘う` })}
      <div class="victory-script"><p class="receipt-round">完全勝利</p>
        <h1>魂のオールイン</h1>
        <p>勝利を受け取るなら一杯のお酌を。挑むなら、あなたの全${you.chips}枚を賭けて最後の勝負へ。</p>
        <div class="soul-choices"><button class="secondary-button" data-action="take-toast">グラスを差し出す</button>
        <button class="allin-button" data-action="start-soul">全${you.chips}枚で勝負する</button></div>
      </div></section>`;
  }

  function renderFinale(photos, rival) {
    const index = game.finalePage;
    const photo = photos[index];
    return `<section class="victory-scene ending-scene seat-${rival.id}">
      ${characterScene(rival, photo.src, index === 0 ? photo.caption : '', { alt: `${rival.name} · ${photo.title}` })}
      <div class="victory-script"><p class="receipt-round">${game.ending === 'toast' ? '完全勝利' : game.ending === 'spent' ? '魂戦勝利' : '魂戦敗北'}</p>
        <h1>${photo.title}</h1>${index ? `<p>${photo.caption}</p>` : ''}
        <button class="primary-button" data-action="advance-ending" data-index="${index}">${index + 1 < photos.length ? '次の一枚へ' : '対戦結果へ'}</button>
      </div></section>`;
  }

  function renderGameover() {
    const [you, rival] = players;
    const won = you.chips > 0;
    if (game.ending === 'offer') return renderSoulOffer();
    const photos = endingPhotos();
    if (game.finalePage != null) return renderFinale(photos, rival);
    const ordered = won ? players : [rival, you];
    return `<section class="gameover">
      <header class="result-hero duel-finale seat-${rival.id}" data-expression="${rival.mood}">
        ${characterScene(rival, portraits(rival), rival.line, {
          speechToggle: true, resultTitle: won ? 'YOU WIN' : 'YOU LOSE',
          resultNote: game.soul ? 'SOUL ALL-IN' : completeVictory() ? 'PERFECT VICTORY' : ''
        })}
      </header>
      <div class="gameover-details">${tableAdvice()}<div class="leaderboard">${ordered.map(p => `<div class="leader-row${p.human ? ' you' : ''}">
        ${p.human ? '<span class="receipt-avatar" aria-hidden="true">✦</span>' : portrait(p, 'receipt-avatar')}
        <strong>${p.name}</strong><span class="amount">${p.chips} 枚</span></div>`).join('')}</div>
      <div class="button-row">
        <button class="secondary-button" data-action="choose-rival">相手を選び直す</button>
        <button class="primary-button" data-action="restart">${rival.name}と再戦</button>
      </div>${renderHistory()}</div>
    </section>`;
  }

  const phases = [
    { label: '１個公開', color: 'opening' },
    { label: 'SHOW TIME', color: 'show' },
    { label: 'ベット', color: 'bet' },
    { label: '決着', color: 'result' }
  ];
  const phaseIndices = { rolling: 0, choose: 0, show: 1, claim: 1, reply: 1, bet: 2, reveal: 3, result: 3 };

  function phaseCard(state) {
    const index = phaseIndices[state];
    if (game.soul) return { ...phases[index], number: index === 3 ? 3 : index + 1, total: 3,
      round: game.round, roundLabel: `魂戦 第${game.soul.turn}投` };
    return { ...phases[index], number: index + 1, round: game.round };
  }

  function updateChipGauge(balances) {
    matchHud.hidden = game.phase === 'intro';
    if (matchHud.hidden) return;

    const [you, rival] = players;
    const youChips = balances?.you ?? you.chips;
    const rivalChips = balances?.rival ?? rival.chips;
    const pot = balances?.pot ?? game.pot;
    const total = chipsInPlay();
    const settled = game.phase === 'result' || game.phase === 'gameover' || (game.phase === 'soul-result' && game.soul.verdict !== 'tie');
    const youDelta = settled ? you.chips - you.openingChips : 0;
    const rivalDelta = settled ? rival.chips - rival.openingChips : 0;
    chipGauge.className = `seat-${rival.id}`;
    chipGauge.dataset.stage = settled ? 'settled' : 'betting';
    chipGauge.dataset.gain = youDelta > 0 ? 'you' : rivalDelta > 0 ? 'rival' : '';
    chipGauge.style.setProperty('--gauge-you', `${100 * youChips / total}%`);
    chipGauge.style.setProperty('--gauge-rival', `${100 * rivalChips / total}%`);
    chipGauge.style.setProperty('--gauge-pot', `${100 * pot / total}%`);
    gaugeRivalName.textContent = rival.name;
    gaugeYou.textContent = `${youChips}枚`;
    gaugeRival.textContent = `${rivalChips}枚`;
    gaugePot.textContent = settled ? '精算後' : `場 ${pot}枚`;
    gaugeYouDelta.hidden = youDelta === 0;
    gaugeRivalDelta.hidden = rivalDelta === 0;
    gaugeYouDelta.textContent = signedChips(youDelta);
    gaugeRivalDelta.textContent = signedChips(rivalDelta);
  }

  function phaseTrack(index, list = phases) {
    const steps = list.map((phase, i) => `<li${i === index ? ' aria-current="step"' : ''}
      class="${i < index ? 'done' : ''}"><span class="step-number" aria-hidden="true">${i < index ? '✓' : i + 1}</span>${phase.label}</li>`).join('');
    return `<ol class="phase-track" aria-label="この回の進行">${steps}</ol>`;
  }

  function updatePhaseHud() {
    if (game.soul && game.phase !== 'gameover' && game.phase !== 'intro') {
      const turn = game.soul.turn;
      const prompts = { rolling: 'ダイスを振っています', choose: '公開する目を１個選ぶ', show: '双方リロール無料',
        claim: 'トリプルを宣言する？', reply: '相手のSHOW TIME', reveal: 'ショーダウン', 'soul-result': 'この一投の結果' };
      hud.hidden = false;
      const prompt = prompts[game.phase];
      hud.dataset.key = 'soul-' + turn + game.phase;
      hud.dataset.tone = 'result';
      hud.innerHTML = `<div class="step-advice"></div><div class="round-hud-line"><strong>魂戦 第${turn}投</strong>
        <span class="ante-label">全${game.soul.stake}枚 対 魂</span><b class="phase-prompt">${prompt}</b></div>
        ${phaseTrack(Math.min(phaseIndices[game.phase] ?? 3, 2), [phases[0], phases[1], phases[3]])}`;
      announcement.textContent = `魂のオールイン、第${turn}投。${prompt}`;
      return;
    }
    const index = phaseIndices[game.phase];
    hud.hidden = index === undefined;
    if (hud.hidden) {
      hud.dataset.key = '';
      announcement.textContent = game.phase === 'gameover'
        ? (game.ending === 'offer' ? '完全勝利。最後の勝負を受けますか？' : '対戦終了。最終結果です。') : '';
      return;
    }
    let prompt;
    switch (game.phase) {
      case 'rolling': prompt = 'ダイスを振っています'; break;
      case 'choose': prompt = 'あなたの番 · 見せる目を１個選ぶ'; break;
      case 'show': prompt = 'あなたの番 · ２個目を見せる？'; break;
      case 'claim': prompt = 'あなたの番 · トリプルを宣言する？'; break;
      case 'reply': prompt = `${players[1].name}のSHOW TIME`; break;
      case 'bet': {
        const actor = players[game.betQueue[0]];
        prompt = actor.human ? (game.bet ? `あなたの番 · 追加${Math.min(actor.chips, game.bet - actor.betPaid)}枚でコール` : 'あなたの番 · 賭け方を選ぶ')
          : `${actor.name}の手番`;
        break;
      }
      case 'reveal': prompt = game.lastResult.byFold ? 'フォールドで決着' : '２人の手を公開'; break;
      case 'result': prompt = game.lastResult.purchase ? '買取完了 · 次の回戦へ'
        : wardrobeOffer()?.affordable ? '衣装を買う？　見送る？' : 'チップの精算が完了'; break;
    }
    const key = `${game.round}-${game.phase}-${prompt}`;
    if (hud.dataset.key === key) return;
    hud.dataset.key = key;
    hud.dataset.tone = phases[index].color;
    const name = `第${game.round}回戦`;
    let feeNote = '';
    if (isExtensionRound(game.round + 1) && index < 3) {
      feeNote = `次局の延長料 · あなたのみ最大${extensionCost}ドル`;
    } else if (isExtensionRound(game.round) && index === 0) {
      feeNote = game.extensionFee ? `卓の延長料 · あなたから店へ ${game.extensionFee}ドル` : '卓の延長料は免除 · 最後の1ドルで勝負';
    }
    hud.innerHTML = `<div class="step-advice"></div>
      <div class="round-hud-line">
        <div class="round-counter" aria-label="${name}"><small lang="en">ROUND</small><strong>${String(game.round).padStart(2, '0')}</strong></div>
      <span class="ante-label">参加料 ${ante()}枚</span><b class="phase-prompt">${prompt}</b></div>
      ${phaseTrack(index)}
      ${feeNote ? `<p class="extension-note">${feeNote}</p>` : ''}`;
    announcement.textContent = `${name}、${phases[index].label}。${prompt}。${feeNote}`;
  }

  function focusPhase() {
    if (rules.open) return;
    const die = gameRoot.querySelector('button.die-button');
    if (die) {
      die.focus({ preventScroll: true });
      return;
    }
    const heading = gameRoot.querySelector('h1, h2');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }

  function renderIntro() {
    const choices = rivals.map(p => `<button class="hero-rival seat-${p.id}" type="button"
      data-action="start" data-rival="${p.id}" aria-label="${p.name}と対戦">
      <span class="roster-portrait" style="${portraitAssets.sceneStyle(0)}">${verdictPortrait.image(portraits({ ...p, outfit: 0 }, 0), p.name)}</span>
      <span class="roster-caption">
        <span><strong class="roster-name" lang="en">${p.displayName}</strong></span>
        <span class="rival-cta">対戦する <i class="arrow" aria-hidden="true"></i></span>
      </span>
    </button>`).join('');
    return `<section class="lobby" aria-label="対戦相手選択">
      <header class="marquee">
        <div class="marquee-copy">
          <p class="title-tag">サイコロの一騎打ち</p>
          <h1 aria-label="SHOW TIME DUEL"><span>Show Time</span><small>DUEL</small></h1>
          <p class="lead"><span>相手の目を読み、</span><span>チップを奪い切れ。</span></p>
        </div>
      </header>
      <section class="roster" aria-labelledby="roster-title">
        <div class="roster-heading"><h2 id="roster-title">対戦相手を選ぶ</h2><span class="roster-rule"></span><p>ダイス各３個 <i aria-hidden="true">◆</i> チップ各20枚</p></div>
        <div class="roster-grid">${choices}</div>
      </section>
    </section>`;
  }

  function placeDuelHud() {
    const scene = portraitPhone.matches && gameRoot.querySelector('.arena .duel-portrait');
    const parent = scene || matchHud;
    if (chipGauge.parentNode !== parent) parent.append(chipGauge);

    const slot = hud.querySelector('.step-advice');
    if (slot) {
      const markup = tableAdvice();
      if (slot.innerHTML !== markup) slot.innerHTML = markup;
    }
  }
  portraitPhone.addEventListener('change', () => {
    if (['result', 'soul-result'].includes(game.phase)) render();
    else placeDuelHud();
  });

  let detachBattlePortrait;
  let detachSoulFlames;
  let soulFlamesModule;

  function mountSoulFlames() {
    const scene = gameRoot.querySelector('.soul-offer > .character-scene');
    if (!scene) return;
    const character = players[1].id;
    soulFlamesModule ??= import('./soul-flames.mjs');
    soulFlamesModule.then(({ attachSoulFlames }) => {
      if (scene.isConnected && !detachSoulFlames) detachSoulFlames = attachSoulFlames(scene, character);
    }).catch(() => { soulFlamesModule = null; });
  }

  function render() {
    detachBattlePortrait?.();
    detachBattlePortrait = null;
    detachSoulFlames?.();
    detachSoulFlames = null;
    if (chipGauge.parentNode !== matchHud) matchHud.append(chipGauge);
    const activeAction = document.activeElement?.dataset;
    updateChipGauge();
    updatePhaseHud();
    if (game.phase === 'intro') {
      gameRoot.innerHTML = renderIntro();
      mountTable();
      return;
    }
    if (!portraitPhone.matches && ['result', 'soul-result'].includes(game.phase)) {
      gameRoot.innerHTML = game.soul ? renderSoulResult() : renderResult();
      placeDuelHud();
      mountTable();
      return;
    }
    if (game.phase === 'gameover') {
      gameRoot.innerHTML = renderGameover();
      mountSoulFlames();
      mountTable();
      return;
    }
    gameRoot.innerHTML = `<div class="arena seat-${players[1].id}${game.soul ? ' soul-arena' : ''}" data-phase="${game.phase}">
      ${renderRival(players[1])}
      <div class="duel-table">${renderTable()}${renderAction()}</div>
    </div>`;
    placeDuelHud();
    mountTable();
    if (!['result', 'soul-result', 'reveal'].includes(game.phase)) {
      detachBattlePortrait = battlePortrait.attach(gameRoot.querySelector('.duel-portrait .character-art'), players[1], game.soul);
    }
    if (activeAction?.action === 'select-first' || activeAction?.action === 'select-show') {
      gameRoot.querySelector(`[data-action="${activeAction.action}"][data-index="${activeAction.index}"]`)?.focus({ preventScroll: true });
    }
  }

  gameRoot.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    if (target.dataset.action === 'toggle-speech') {
      const show = gameRoot.dataset.speech === 'off';
      gameRoot.dataset.speech = show ? 'on' : 'off';
      target.setAttribute('aria-pressed', String(show));
      return;
    }
    if (game.busy) return;
    stage.unlock();
    const action = target.dataset.action;
    const index = Number(target.dataset.index);
    if (action === 'receipt') gameRoot.querySelector('.receipt-dialog')?.showModal();
    else if (action === 'start' && game.phase === 'intro') startGame(target.dataset.rival);
    else if (action === 'restart' && game.phase === 'gameover') startGame(players[1].id);
    else if (action === 'choose-rival' && game.phase === 'gameover') {
      game.phase = 'intro';
      render();
      window.scrollTo(0, 0);
      focusPhase();
    }
    else if (action === 'select-first' && game.phase === 'choose') { game.selected = index; stage.play('select'); render(); }
    else if (action === 'confirm-first' && game.phase === 'choose') confirmFirst();
    else if (action === 'select-show' && game.phase === 'show') { game.selectedShow = index; stage.play('select'); render(); }
    else if (['confirm-show', 'reroll-show'].includes(action) && game.phase === 'show') confirmShow(action === 'reroll-show');
    else if (action === 'skip-show' && game.phase === 'show') startBetting();
    else if ((action === 'skip-claim' || action === 'make-claim') && game.phase === 'claim') { players[0].claim = action === 'make-claim'; startBetting(); }
    else if (['check', 'bet2', 'bet4', 'raise', 'allin', 'call', 'fold'].includes(action) && game.phase === 'bet' && players[game.betQueue[0]]?.human) actBet(action);
    else if (action === 'buy-garment' && buyGarment()) {
      gameRoot.querySelector('[data-action="outfit-photo"]')?.focus({ preventScroll: true });
      openPhoto(outfitPhoto(players[1]));
    }
    else if (action === 'outfit-photo' && game.phase === 'result' && game.lastResult.purchase) openPhoto(outfitPhoto(players[1]));
    else if (action === 'take-toast' && game.phase === 'gameover' && game.ending === 'offer') {
      game.ending = 'toast';
      game.finalePage = 0;
      render();
      focusPhase();
    }
    else if (action === 'start-soul' || action === 'soul-rematch') startSoulThrow();
    else if (action === 'soul-finish' && game.phase === 'soul-result' && game.soul.verdict !== 'tie') {
      game.phase = 'gameover';
      game.ending = game.soul.verdict === 'win' ? 'spent' : 'defeat';
      game.finalePage = game.ending === 'spent' ? 0 : null;
      render();
      if (!rules.open) window.scrollTo(0, 0);
      focusPhase();
    }
    else if (action === 'advance-ending' && game.phase === 'gameover' && index === game.finalePage) {
      game.finalePage = index + 1 < endingPhotos().length ? index + 1 : null;
      render();
      window.scrollTo(0, 0);
      focusPhase();
    }
    else if (action === 'next' && game.phase === 'result') nextRound();
  });
  document.querySelector('#rules-button').addEventListener('click', () => rules.showModal());
  document.querySelector('#close-rules').addEventListener('click', () => rules.close());
  document.querySelector('#rules-done').addEventListener('click', () => rules.close());
  rules.addEventListener('click', event => { if (event.target === rules) rules.close(); });
  render();

  // Keep the scene picker out of normal hosted play. Local development enables
  // it automatically; an explicit ?debug=1 also supports shared preview URLs.
  const debugRequested = new URLSearchParams(location.search).get('debug') === '1';
  if (debugRequested || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    import('./debug.mjs?v=4').then(({ installDebug }) => installDebug({
      rivals, wardrobe, voices, soulLines,
      restore(snapshot) {
        players.splice(0, players.length, ...snapshot.players);
        Object.assign(game, snapshot.game, { session: game.session + 1 });
        preloadPortraits(players[1]);
        render();
        focusPhase();
        if (snapshot.action === 'bust') showBustArt();
        if (snapshot.action === 'photo') openPhoto(endingPhotos()[0]);
        if (snapshot.action === 'showdown') settle(false);
        if (snapshot.action === 'roll') {
          game.phase = 'rolling';
          game.busy = true;
          rollOpening();
        }
      }
    })).catch(error => {
      console.error('画面デバッグを読み込めませんでした。', error);
      document.querySelector('#display-note').textContent = 'デバッグ機能を読み込めませんでした。ページを再読み込みしてください。';
    });
  }
})();
