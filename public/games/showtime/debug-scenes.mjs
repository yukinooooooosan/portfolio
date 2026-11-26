// Fixed, playable starting points. This module does not touch the DOM or roll dice.
export const DEBUG_SCENES = [
  { id: 'intro', group: '開始・対戦中', label: 'タイトル・相手選択', hint: 'タイトルでは両方のキャラが表示されます。' },
  { id: 'choose', group: '開始・対戦中', label: '最初のダイスを公開', hint: '公開する１個を選ぶところから操作できます。' },
  { id: 'show', group: '開始・対戦中', label: 'SHOW TIME', hint: '２個目の公開や振り直しを確認できます。' },
  { id: 'claim', group: '開始・対戦中', label: 'トリプル宣言', hint: '４のゾロ目で、宣言を選ぶ場面です。' },
  { id: 'bluff', group: '開始・対戦中', label: 'ブラフ宣言', hint: '４・４・２で、嘘のトリプル宣言を選べます。' },
  { id: 'bet', group: '開始・対戦中', label: 'ベット・チェック', hint: 'あなたの手番で止まります。操作すると対戦が進みます。' },
  { id: 'call', group: '開始・対戦中', label: 'コール・レイズ・フォールド', hint: '相手が４枚ベットした状態です。' },
  { id: 'dice-roll', group: 'スプラッシュ演出', label: 'ROUND → DICE ROLL', hint: 'ラウンド開始とダイスロールの演出を再生します。' },
  { id: 'showdown-win', group: 'スプラッシュ演出', label: 'SHOWDOWN・勝利', hint: '伏せ目を公開し、得点を加算してから勝利を表示します。' },
  { id: 'showdown-loss', group: 'スプラッシュ演出', label: 'SHOWDOWN・敗北' },
  { id: 'showdown-draw', group: 'スプラッシュ演出', label: 'SHOWDOWN・同点' },
  { id: 'showdown-bluff', group: 'スプラッシュ演出', label: 'SHOWDOWN・宣言失敗', hint: '得点が高くても、嘘の宣言が失敗すると敗北する例です。' },
  { id: 'showdown-pin', group: 'スプラッシュ演出', label: 'SHOWDOWN・ピンゾロ42点', hint: '出目3点、SHOW +2、ピンゾロ宣言 +37を順番に加算します。' },
  { id: 'danger-low', group: '相棒の会話', label: '劣勢・手持ち残り３枚', hint: '追い込まれたときの相棒のセリフを確認できます。' },
  { id: 'danger-call', group: '相棒の会話', label: '劣勢・コールで全額', hint: '残り３枚で、相手の４枚ベットに応じる場面です。' },
  { id: 'danger-streak', group: '相棒の会話', label: '劣勢・３連敗中', hint: '連敗中の作戦会議や励ましを確認できます。' },
  { id: 'rival-low', group: '相棒の会話', label: '優勢・相手が残り３枚', hint: '赤髪女／青髪女を追い込んだときの悪巧みです。' },
  { id: 'hand-pair', group: '相棒の会話', label: '自分の手・ペア', hint: '２・５・２のペアを見た相棒の反応です。' },
  { id: 'hand-stairs', group: '相棒の会話', label: '自分の手・連番', hint: '６・４・５の連番を見た相棒の反応です。' },
  { id: 'hand-triple', group: '相棒の会話', label: '自分の手・トリプル', hint: '４・４・４。宣言前のトリプルです。' },
  { id: 'hand-pin', group: '相棒の会話', label: '自分の手・ピンゾロ', hint: '１・１・１。宣言成功時は特別なボーナスが付きます。' },
  { id: 'hand-none', group: '相棒の会話', label: '自分の手・役なし', hint: '１・３・６。合計10点で役がない手です。' },
  { id: 'hand-reroll', group: '相棒の会話', label: '自分の手・振り直し後の連番', hint: '振り直し料２枚を支払い、連番とSHOWで21点になった場面です。' },
  { id: 'round-win', group: 'ラウンド決着・衣装', label: 'ラウンド勝利' },
  { id: 'round-loss', group: 'ラウンド決着・衣装', label: 'ラウンド敗北' },
  { id: 'round-draw', group: 'ラウンド決着・衣装', label: 'ラウンド引き分け' },
  { id: 'wardrobe-offer', group: 'ラウンド決着・衣装', label: '衣装の買取を選ぶ', outfits: [0, 1], hint: '相手がバーストし、今着ている衣装を買い取れる状態です。' },
  { id: 'wardrobe-purchased', group: 'ラウンド決着・衣装', label: '衣装の買取完了', outfits: [1, 2], hint: '選択した衣装に着替え、相手が10枚で復帰しています。' },
  { id: 'bust', group: 'ゲームオーバー', label: 'バースト・全画面の敗北演出', hint: '敗北の全画面画像を表示します。すずの最終衣装は２枚続きです。' },
  { id: 'gameover-win', group: 'ゲームオーバー', label: 'ゲームオーバー・勝利の結果' },
  { id: 'gameover-loss', group: 'ゲームオーバー', label: 'ゲームオーバー・敗北の結果' },
  { id: 'soul-offer', group: '魂戦', label: '完全勝利・魂戦への誘い', outfits: [2] },
  { id: 'soul-choose', group: '魂戦', label: '魂戦・最初のダイスを公開', outfits: [2] },
  { id: 'soul-show', group: '魂戦', label: '魂戦・SHOW TIME／無料リロール', outfits: [2] },
  { id: 'soul-win', group: '魂戦', label: '魂戦・勝利', outfits: [2] },
  { id: 'soul-loss', group: '魂戦', label: '魂戦・敗北', outfits: [2] },
  { id: 'soul-draw', group: '魂戦', label: '魂戦・引き分け／再勝負', outfits: [2] },
  { id: 'ed-toast', group: 'ED・一枚絵', label: 'ED・お酌「勝者への一杯」', outfits: [2] },
  { id: 'ed-soul-win', group: 'ED・一枚絵', label: 'ED・魂戦勝利「最後の一枚」', outfits: [2] },
  { id: 'ed-soul-loss', group: 'ED・一枚絵', label: 'ED・魂戦敗北', outfits: [2] },
  { id: 'ed-bust', group: 'ED・一枚絵', label: '敗北の一枚絵・拡大表示', hint: '選んだ衣装に対応する敗北画像を表示します。' }
];

export function normalizeDebugSelection(input, context) {
  const character = context.rivals.find(rival => rival.id === input.character)?.id ?? context.rivals[0].id;
  const scene = DEBUG_SCENES.find(item => item.id === input.scene) ?? DEBUG_SCENES[1];
  const allowed = scene.outfits ?? [0, 1, 2];
  const requested = Number(input.outfit);
  return { character, scene: scene.id, outfit: allowed.includes(requested) ? requested : allowed[0] };
}

export function createDebugSnapshot(input, context) {
  const selection = normalizeDebugSelection(input, context);
  const { character, outfit, scene } = selection;
  const { wardrobe, voices, soulLines } = context;
  const seat = {
    chips: 17, openingChips: 20, publicIndex: 0, showIndex: null,
    rerolled: false, rerollLine: null, claim: false, folded: false, betPaid: 0, contributed: 3,
    lastAction: '', lastClaim: null
  };
  const you = { ...seat, name: 'あなた', human: true, hand: [6, 5, 4] };
  const rival = {
    ...context.rivals.find(item => item.id === character), ...seat,
    human: false, hand: [3, 3, 2], outfit, mood: 0,
    line: voices[character].greet[0], bubbleSide: 'right', bubbleRow: 'middle'
  };
  const players = [you, rival];
  const game = {
    phase: 'choose', round: 3, pot: 6, bet: 0, minRaise: 2, betQueue: [0, 1],
    selected: null, selectedShow: null, lastResult: null, busy: false,
    history: [], finalePage: null, ending: null, endingLine: null, soulOfferLine: null, soul: null, extensionFee: 0
  };
  let action = null;

  function setHands(outcome) {
    you.hand = outcome === 'loss' ? [3, 3, 2] : [6, 5, 4];
    rival.hand = outcome === 'win' ? [3, 3, 2] : [4, 5, 6];
    players.forEach(player => { player.publicIndex = 0; player.showIndex = 1; });
  }

  function finishRound(outcome, bust = false) {
    setHands(outcome);
    const winners = outcome === 'tie' ? players : [outcome === 'win' ? you : rival];
    const contribution = bust ? 20 : 7;
    players.forEach(player => {
      player.contributed = contribution;
      player.betPaid = contribution - 3;
      player.chips = 20 - contribution + (winners.includes(player) ? contribution * 2 / winners.length : 0);
    });
    const busted = players.find(player => player.chips === 0) ?? null;
    const winnerNames = winners.map(player => player.name).join('・');
    Object.assign(game, {
      phase: 'result', pot: 0, bet: contribution - 3, betQueue: [],
      lastResult: {
        winners, liars: [], byFold: false, detail: '公開した３個の得点で決着。',
        winnerNames, busted, amount: contribution * 2, refund: null, refundAmount: 0
      },
      history: [{ round: game.round, winnerNames, change: you.chips - you.openingChips }]
    });
    const line = busted === rival ? 'despair' : busted === you ? 'champion'
      : outcome === 'tie' ? 'tie' : outcome === 'win' ? 'loss' : 'win';
    rival.line = voices[character][line][0];
    rival.mood = busted === rival ? 'despair' : outcome === 'loss' ? 2 : outcome === 'win' ? 1 : 0;
  }

  function prepareSoul(phase, outcome = null) {
    Object.assign(game, {
      phase, pot: outcome && outcome !== 'tie' ? 0 : 40, bet: 0, betQueue: [],
      soul: { stake: 40, turn: 1, verdict: outcome }
    });
    players.forEach(player => { player.chips = 0; player.contributed = 0; player.betPaid = 0; });
    you.openingChips = 40;
    rival.openingChips = 0;
    rival.mood = 'resolve';
    rival.line = soulLines[character].playing[0];
    if (phase === 'choose') you.publicIndex = null;
    if (outcome) {
      setHands(outcome);
      if (outcome === 'win') you.chips = 40;
      if (outcome === 'loss') rival.chips = 40;
      game.lastResult = { byFold: false, liars: [] };
      const winnerNames = outcome === 'tie' ? '引き分け' : outcome === 'win' ? you.name : rival.name;
      game.history = [{ soul: 1, winnerNames, change: outcome === 'loss' ? -40 : 0 }];
      rival.line = soulLines[character][outcome === 'win' ? 'defeat' : outcome === 'loss' ? 'champion' : 'tie'][0];
      rival.mood = outcome === 'win' ? 'despair' : outcome === 'loss' ? 2 : 'resolve';
    }
  }

  switch (scene) {
    case 'intro': game.phase = 'intro'; break;
    case 'choose': you.publicIndex = null; break;
    case 'dice-roll':
      you.publicIndex = null;
      action = 'roll';
      break;
    case 'showdown-win':
    case 'showdown-loss':
    case 'showdown-draw':
    case 'showdown-bluff':
    case 'showdown-pin':
      setHands(scene === 'showdown-loss' ? 'loss' : scene === 'showdown-draw' ? 'tie' : 'win');
      if (scene === 'showdown-bluff') { you.hand = [6, 6, 5]; you.claim = true; }
      if (scene === 'showdown-pin') { you.hand = [1, 1, 1]; you.claim = true; }
      game.phase = 'bet';
      action = 'showdown';
      break;
    case 'show': game.phase = 'show'; break;
    case 'hand-pair':
    case 'hand-stairs':
    case 'hand-triple':
    case 'hand-pin':
    case 'hand-none':
      you.publicIndex = null;
      you.hand = { 'hand-pair': [2, 5, 2], 'hand-stairs': [6, 4, 5], 'hand-triple': [4, 4, 4],
        'hand-pin': [1, 1, 1], 'hand-none': [1, 3, 6] }[scene];
      break;
    case 'hand-reroll':
      game.phase = 'bet';
      you.hand = [4, 5, 6];
      you.showIndex = 1;
      you.rerolled = true;
      you.chips -= 2;
      rival.chips += 2;
      rival.showIndex = 1;
      break;
    case 'danger-low':
    case 'rival-low':
      you.publicIndex = null;
      you.chips = scene === 'danger-low' ? 3 : 31;
      rival.chips = scene === 'danger-low' ? 31 : 3;
      you.openingChips = you.chips + 3;
      rival.openingChips = rival.chips + 3;
      break;
    case 'danger-streak':
      you.publicIndex = null;
      you.chips = 12;
      rival.chips = 22;
      you.openingChips = 15;
      rival.openingChips = 25;
      game.round = 4;
      game.history = [1, 2, 3].map(round => ({ round, winnerNames: rival.name, change: -2 }));
      break;
    case 'claim':
    case 'bluff':
      game.phase = 'claim';
      you.hand = scene === 'claim' ? [4, 4, 4] : [4, 4, 2];
      you.showIndex = 1;
      rival.line = voices[character].inviteClaim[0];
      break;
    case 'bet':
    case 'call':
    case 'danger-call':
      game.phase = 'bet';
      players.forEach(player => { player.showIndex = 1; });
      if (scene === 'danger-call') {
        you.chips = 3;
        rival.chips = 31;
        you.openingChips = 6;
        rival.openingChips = 34;
      }
      if (scene === 'call' || scene === 'danger-call') {
        game.bet = 4;
        game.pot += 4;
        game.betQueue = [0];
        rival.chips -= 4;
        rival.betPaid = 4;
        rival.contributed += 4;
        rival.lastAction = 'bet4';
        rival.line = voices[character].bet4[0];
        rival.mood = 'challenge';
      }
      break;
    case 'round-win': finishRound('win'); break;
    case 'round-loss': finishRound('loss'); break;
    case 'round-draw': finishRound('tie'); break;
    case 'wardrobe-offer': finishRound('win', true); break;
    case 'wardrobe-purchased': {
      finishRound('win', true);
      you.chips -= 10;
      rival.chips += 10;
      const purchase = { price: 10, garment: wardrobe[character].garments[outfit - 1] };
      game.lastResult.purchase = purchase;
      Object.assign(game.history[0], { change: you.chips - you.openingChips, purchase });
      rival.line = wardrobe[character].lines[outfit - 1][0];
      rival.mood = 0;
      break;
    }
    case 'bust':
      finishRound('loss', true);
      action = 'bust';
      break;
    case 'gameover-win':
      finishRound('win', true);
      game.phase = 'gameover';
      if (outfit === 2) game.ending = 'toast';
      else { rival.line = voices[character].comeback[0]; rival.mood = 'comeback'; }
      break;
    case 'gameover-loss':
    case 'ed-bust':
      finishRound('loss', true);
      game.phase = 'gameover';
      if (scene === 'ed-bust') action = 'photo';
      break;
    case 'soul-offer':
    case 'ed-toast':
      finishRound('win', true);
      game.phase = 'gameover';
      game.ending = scene === 'soul-offer' ? 'offer' : 'toast';
      game.finalePage = scene === 'ed-toast' ? 0 : null;
      rival.mood = 'resolve';
      rival.line = soulLines[character].offer[0];
      break;
    case 'soul-choose': prepareSoul('choose'); break;
    case 'soul-show': prepareSoul('show'); break;
    case 'soul-win': prepareSoul('soul-result', 'win'); break;
    case 'soul-loss': prepareSoul('soul-result', 'loss'); break;
    case 'soul-draw': prepareSoul('soul-result', 'tie'); break;
    case 'ed-soul-win':
    case 'ed-soul-loss':
      prepareSoul('gameover', scene === 'ed-soul-win' ? 'win' : 'loss');
      game.ending = scene === 'ed-soul-win' ? 'spent' : 'defeat';
      game.finalePage = 0;
      break;
  }
  return { selection, players, game, action };
}
