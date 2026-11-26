// The companion sees only the explicitly public/own-hand snapshot supplied by game.js.
// Keep dialogue separate from the dice rules and CPU decisions.
const companionGuide = (() => {
  'use strict';

  const common = {
    hand_pair: [
      'おっ、ペアっす。二つ揃って＋2点、まずは足場ができたっすね。',
      'ペアっすねぇ。同じ目を二個見せれば、あの女に三つ目を勘ぐらせられるっす。',
      '二つお揃いっす。今は{yourScore}点、ニヤける前に残りの目も見るっすよ。'
    ],
    hand_stairs: [
      '連番っす！ きれいに並んだっすねぇ。役の＋4点、いい仕事するっす。',
      '旦那、連番できてるっす。自分までちょっと強気な顔になるっすね。',
      'おっ、連番っす。今は{yourScore}点、この並びを崩すかはよく考えるっす。'
    ],
    hand_triple: [
      '旦那、トリプルっす！ 二個目も見せて宣言すれば＋16点、顔に出しすぎないっすよ。',
      '三つ揃ってるっす……！ でも、役のボーナスは宣言してからっすよ。',
      'へへっ、本物のトリプルっす。あの女に見せる顔、ちょっと抑えるっす。宣言も忘れずに。'
    ],
    hand_pin: [
      'ピンゾロっす！ 全部1でも弱気にならないで、宣言成功で＋37点っすよ。',
      '旦那、1・1・1っす！ 二個目を見せて宣言するまで、大事に隠すっす。',
      'ピンゾロっす……自分までニヤけてきたっす。特別な＋37点は宣言してからっすよ。'
    ],
    hand_none: [
      '今回は役なしっす。合計は{yourScore}点、まだ出目の大きさで勝負できるっす。',
      '揃いはなしっすね。自分と旦那くらい、ダイスも息を合わせてほしいっす。今は{yourScore}点っす。',
      '役は付いてないっす。今の{yourScore}点でどう見せるか、悪い相談の時間っすね。'
    ],
    reroll_pair: [
      '振り直してペアっす！ 二つ揃ったっすね。役＋2と公開＋2が付いてるっす。',
      '振り直し後はペア、今は{yourScore}点っす。自分もちょっと身を乗り出したっす。'
    ],
    reroll_stairs: [
      'おっ、振り直して連番っす！ 役＋4と公開＋2、今は{yourScore}点っす。',
      '振り直した手が連番っすねぇ。きれいに並んで、こっちまでいい顔になるっす。'
    ],
    reroll_triple: [
      '振り直してトリプルっす！ 旦那、ここから宣言して＋16点を取りにいくっす。',
      '三つ揃ったっす……！ 自分まで声が出たっす。トリプルの宣言、忘れないでほしいっす。'
    ],
    reroll_pin: [
      '振り直してピンゾロっす！ 宣言成功で＋37点、これは顔に出ちゃうっすよ。',
      '1・1・1になったっす！ 旦那、ニヤけるのは一緒に宣言してからっす。'
    ],
    reroll_none: [
      '振り直し後は役なしっすね。公開の＋2込みで{yourScore}点、ここから考えるっす。',
      '役は付かなかったっす。でも今は{yourScore}点、まだ結果まで決まったわけじゃないっすよ。'
    ],
    critical: [
      '旦那、あと{youChips}枚っす。自分も笑ってる場合じゃなくなってきたっす。',
      '財布が薄いっすね……。でも、まだ隣にいるっす。次の一手、考えましょう。',
      '旦那、ここで見栄を張ると自分まで震えるっす。払う枚数、確認しましょう。'
    ],
    low: [
      '旦那、こっちは{youChips}枚っす。胸元より手元、今だけは手元っす。',
      'ちょっと雲行きが怪しいっすね。強がるのは自分がやるんで、旦那は冷静に。',
      '帰りの豪遊プラン、いったん畳むっす。まだ取り返すチャンスはあるっす。'
    ],
    allinCall: [
      'コールすると残り{toCall}枚、全部っす。ここは煽り抜きで、手と相談しましょう。',
      '旦那、このコールは財布ごとっす。降りる手も残ってるっすよ。',
      '続けるなら残り全部っすね……。決めたら、自分も最後まで付き合うっす。'
    ],
    allinWaiting: [
      '全部、卓に出たっすね。まだ負けは決まってないっす。見届けましょう。',
      '自分まで手に汗かいてきたっす。……キノコに手汗ってあるんすかね。',
      'もう財布は空でも、場のチップはまだ決まってないっす。頼むっすよ、ダイス。'
    ],
    losing: [
      'ちょっと続けて持ってかれてるっすね。次の一手まで一緒に考えるっす。',
      'さっきから下見が長いっすね……。深呼吸して、手元を見直すっす。',
      '旦那のせいだけじゃないっす。自分も調子に乗ってたっす。立て直しましょう。'
    ],
    loss: [
      '……今のは下見っす。次が本番っすから。',
      'あっ、持ってかれたっす。自分の分まで悔しがっといて……いや、一緒に悔しがるっす。',
      '今の一局は向こうの勝ちっすね。旦那、次の作戦会議っす。'
    ],
    dangerLoss: [
      '残り{youChips}枚っすか……。旦那、次は無理に大きく取り返そうとしなくていいっす。',
      'かなり削られたっすね。自分、逃げないっすよ。次の手をちゃんと見ましょう。',
      '口では強がっても、財布は強がれないっす。残り{youChips}枚、大事にいくっす。'
    ],
    bust: [
      '……すっからかんっすね。旦那を置いて逃げたりしないっすよ。',
      '分からせる予定が、分からされたっす……。自分も一緒に反省するっす。',
      '豪遊はお預けっす。帰り道くらい、自分が話し相手になるっすよ。'
    ],
    caught: [
      'あっ、嘘がバレたっす。旦那、自分と一緒に目をそらすっす。',
      '三つ目まで見られちゃったっすね……。次の宣言、警戒されるっすよ。'
    ],
    repeatBluff: [
      '前にバレた嘘、覚えられてるっす。今度は宣言しても降りにくいっすよ。',
      'また宣言っすね。前のブラフで信用が落ちてるのは忘れずに。'
    ],
    win: [
      'へへっ、いただきっす。旦那と組むと悪い顔になっちゃうっすねぇ。',
      'いいっすねぇ。そのチップ、こっちに並ぶ方が似合うっす。',
      '一局いただいたっす。自分、今かなり得意げな顔してるっす。'
    ],
    streakWin: [
      '連勝っすねぇ。これ、帰りにいいモン食える流れっすね。',
      '旦那、乗ってるっす。自分まで強くなった気がするっすよ。'
    ],
    bluffWin: [
      'へへっ、信じたっすね。旦那も悪いお人で。',
      '三つ目は秘密のままっす。いやぁ、二人で悪いことした気分っすね。'
    ],
    rivalCaught: [
      'あの女も嘘ついてたっすねぇ。三つ目を開けるまでは分からないもんっす。',
      '宣言、ハッタリだったっすね。こっちも人のこと言えないっすけど。'
    ],
    draw: ['引き分けっすか。気が合うのか、意地の張り合いなのか。', 'おあいこっすね。いいところで決着を焦らすっすねぇ。'],
    rivalAllin: ['あの女、残り全部出したっす。まだ空っぽにしたことにはならないっすよ。', '向こうも財布ごと勝負っすね。ニヤけるのは結果を見てからっす。'],
    bankrupt: ['あの女、もうチップないっす。分からせちゃいましたねぇ。', 'へへっ、すっからかんっす。さっきまでの威勢、どこ行ったんすか。'],
    soulOffer: ['勝ちはもう手に入ってるっす。もう一勝負なら全額っすよ。旦那、どうするっすか。', '魂まで出してきたっすか……。受けるなら、こっちも全チップっす。'],
    soulPlay: ['今度は追加のベットなしっす。無料の振り直しは一投に一回、使いどころを考えるっす。', '魂を賭けたって、ダイスはダイスっす。公開と振り直し、落ち着いて選ぶっす。'],
    soulWin: ['やったっす……！ 旦那、自分、さっきまで傘の裏まで震えてたっす。', '最後の勝負もいただきっす。今だけは、素直にすごいって言わせてほしいっす。'],
    soulLoss: ['全部持っていかれたっすね……。大口叩いた自分も、隣で反省するっす。', '逆転されちゃったっすか……。旦那、こういう時こそ自分は逃げないっす。'],
    soulDraw: ['まだ決まらないっすか。全額は卓に残るっす。もう一投、付き合うっすよ。', 'また同じ賭けでもう一投っす。自分の心臓が先に負けそうっす。'],
    toast: ['勝った後の一杯っすね。旦那、ニヤけてるの隠せてないっすよ。', 'へへっ、今日はいい席に座ったっすね。自分も乾杯に混ぜてほしいっす。'],
    idle: [
      '自分、見た目は毒っすけど、味方には優しいんすよ。',
      '旦那、胸ばっか見てると出目を見逃すっすよ。……自分もっすけど。',
      'この蝶ネクタイ、正装っす。中身まで紳士とは言ってないっす。',
      '勝った後のニヤけ方だけは、もう練習済みっす。',
      '旦那とこそこそ作戦立てるの、結構好きなんすよ。'
    ]
  };

  const opponents = {
    kohaku: {
      choose: ['赤髪女は勢いで押してくるっす。見せる目で、どんな手に見せるか考えるっす。', '威勢はいいっすねぇ。手まで強いとは限らないっすよ。'],
      show: ['二個目を見せれば＋2点っす。赤髪女にどこまで読ませるか、考えるっす。', 'あの女には隠すか見せるか、悩ませてやりたいっすね。公開は＋2点っす。'],
      claim: ['揃ってるなら宣言が切り札っす。赤髪女、付き合ってくるかもしれないっすよ。', '本物のトリプルっすね。宣言のボーナス、取りにいきたいっす。'],
      bluff: ['赤髪女は強気に付き合う方っす。嘘を開かれたら宣言失敗、忘れずに。', 'ハッタリっすか。あの女、簡単には引かないっすよ。悪い相談ほど慎重にっす。'],
      bet: ['赤髪女の勢いに、余計なチップまで付き合う必要はないっすよ。', 'こっちの手が強いなら取りたいっすね。煽られた分まで払うのはナシっす。'],
      raised: ['また上げてきたっすねぇ。赤髪女は強気多め、手元と払う枚数で考えるっす。', 'あの余裕、崩したいっすねぇ。まずはコールの額を確認するっす。'],
      claimed: ['赤髪女は宣言にハッタリも混ぜるっす。本物の可能性も見て、払う額と相談っす。', 'トリプル宣言っすね。こはくはブラフも多め、でも決めつけると痛いっすよ。'],
      reply: ['赤髪女の番っす。公開する目と、いくら出すかを見ておくっす。', 'あの女、どう出るっすかね。こっちは落ち着いて観察っす。'],
      rivalLow: ['赤髪女、あと{rivalChips}枚っす。分からせましょうぜ。……自分の手も確認っすよ。', 'あの威勢で残り{rivalChips}枚っすか。旦那、追い込んでるっすねぇ。'],
      outfit1: ['へへっ、赤髪女からベスト一枚いただきっす。旦那、勝負中より目が真剣っすよ。', '赤髪女、ベストは強気に脱いだっすね。次もその顔でいられるっすかねぇ。', '一枚いただきっす。旦那、胸元に気を取られて復帰した10枚を忘れないでほしいっす。'],
      outfit2: ['赤髪女、ずいぶん立派な切り札を隠してたっすねぇ。', 'ビスチェ姿までいただきっす。旦那、ダイスを見る時より集中してないっすか？', 'へへっ、約束のブラウスっす。自分も目のやり場には困ってないっす。'],
      idle: ['赤髪女、態度も胸もでかいっすねぇ。こっちも気持ちだけは強気でいくっす。', 'あの女の余裕顔、崩してやりたいっすね。旦那も同じ顔してるっすよ。']
    },
    suzu: {
      choose: ['青髪女は慎重っす。何を見せるかで、向こうの判断も変わるっすよ。', '涼しい顔してるっすね。見せる一個で、考え込ませてやるっす。'],
      show: ['公開で＋2点、ただし情報も渡すっす。青髪女に何を読ませたいっすか？', 'あの女は手元を見てるっす。二個目を見せる利点と、隠す利点を比べるっす。'],
      claim: ['本物のトリプルっすね。慎重な青髪女に、宣言をどう受け取らせるかっす。', '揃ってるっす。宣言のボーナスも、相手が降りる可能性もあるっすよ。'],
      bluff: ['慎重な青髪女なら降りることもあるっす。でも嘘を開かれたら宣言失敗っすよ。', '悪い相談っすねぇ。すずは宣言を警戒するけど、必ず降りるわけじゃないっす。'],
      bet: ['青髪女は払う額を気にするっす。手の強さと賭け方、セットで考えるっす。', '慎重な相手っす。大きく出れば降りることもあるけど、必ずじゃないっすよ。'],
      raised: ['慎重な青髪女が上げてきたっす。公開目と残り枚数、見直すっすよ。', 'すずが付き合ってくるっすね。こっちの見栄で上乗せするのは待つっす。'],
      claimed: ['青髪女の宣言は比較的堅めっす。本物とは限らないけど、軽く見ない方がいいっす。', 'すずも嘘はつくっす。ただ、こはくほど気軽には宣言しないっすよ。'],
      reply: ['青髪女の番っす。静かな顔でも、公開する目と賭け方は見えるっす。', 'あの女、考えてるっすね。こっちも次に払える枚数を確認しとくっす。'],
      rivalLow: ['青髪女、あと{rivalChips}枚っす。涼しい顔、いつまで持つっすかねぇ。', 'あの女の手元、残り{rivalChips}枚っす。分からせたいっすねぇ。'],
      outfit1: ['青髪女、ジャケットの脱ぎ方までお上品っす。こっちはそんな上品な気持ちじゃないっすけど。', 'ジャケット一枚いただきっす。旦那、ニヤけてるのバレてるっすよ。', 'へへっ、青髪女も約束は守るっすね。代金の10枚で復活したのは忘れずに。'],
      outfit2: ['青髪女、その腰のラインは反則っす。チップより先に理性がなくなるっすよ。', '約束のブラウス、いただきっす。旦那、自分も今かなり悪い顔してるっす。', 'そこまで見せてもらって、冷静な顔は難しいっすね。旦那も同じっすか？'],
      idle: ['青髪女、お上品な顔してるっすね。崩れたところ、見たいっすねぇ。', 'あの落ち着き、こっちに少し欲しいっす。自分は下心が顔に出るもんで。']
    }
  };

  function create({ random = Math.random } = {}) {
    let session;
    const cache = new Map(), recent = [], chatterRounds = new Set(), announcedHands = new Set();
    function reset() { cache.clear(); recent.length = 0; chatterRounds.clear(); announcedHands.clear(); }

    function select(c, fallback = '') {
      if (session !== c.session) { reset(); session = c.session; }
      const round = `${c.round}:${c.soulTurn || 0}`;
      // Selection/viewport changes must not reroll dialogue. Actual betting events may.
      const key = JSON.stringify([round, c.phase, c.ending, c.outfit, c.purchase, c.outcome,
        c.youChips, c.rivalChips, c.toCall, c.bet, c.yourTurn, c.rivalAction,
        c.youClaim, c.rivalClaim, c.yourTriple, c.knownBluff, c.lossStreak, c.winStreak,
        c.yourCombo, c.yourHandKey, c.yourRerolled, c.yourScore, c.soul, c.soulVerdict]);
      if (cache.has(key)) return cache.get(key);
      const rival = opponents[c.character] || opponents.kohaku;
      const handKey = `${round}:${c.yourRerolled ? 'reroll' : 'opening'}:${c.yourHandKey}`;
      // Normal reply is transient and immediately covered by the opponent's cut-in.
      // Keep a reroll reaction for the next player decision instead of consuming it there.
      const handEvent = !announcedHands.has(handKey) && (
        c.phase === 'choose' || c.yourRerolled && (c.phase === 'claim'
          || c.phase === 'bet' && c.yourTurn || c.soul && c.phase === 'reply')
      ) && common[`${c.yourRerolled ? 'reroll' : 'hand'}_${c.yourCombo}`]
        ? `${c.yourRerolled ? 'reroll' : 'hand'}_${c.yourCombo}` : null;
      let event, kind = 'advice', pool;
      if (c.purchase && c.phase === 'result') { event = `outfit${c.outfit}`; kind = 'wardrobe'; }
      else if (c.phase === 'gameover' && c.ending === 'offer') { event = 'soulOffer'; kind = 'event'; }
      else if (c.soul) {
        event = c.soulVerdict === 'win' ? 'soulWin' : c.soulVerdict === 'loss' ? 'soulLoss'
          : c.soulVerdict === 'tie' ? 'soulDraw' : c.phase === 'claim' ? (c.yourTriple ? 'claim' : 'bluff') : 'soulPlay';
        // Soul throws have no folding: declarations must not suggest bluffing someone out.
        if (c.phase === 'claim' && (!c.yourTriple || !handEvent)) return remember({ id: 'soul-rule', kind, text: fallback });
        kind = c.soulVerdict ? 'result' : 'advice';
        if (!c.soulVerdict && handEvent) { event = handEvent; kind = 'hand'; }
      } else if (['result', 'gameover', 'reveal'].includes(c.phase)) {
        kind = 'result';
        event = c.outcome === 'loss' && c.youChips === 0 ? 'bust'
          : c.ending === 'toast' ? 'toast' : c.outcome === 'draw' ? 'draw'
          : c.playerBluff ? 'caught' : c.outcome === 'loss' && c.youChips <= 5 ? 'dangerLoss'
          : c.outcome === 'loss' && c.lossStreak >= 2 ? 'losing' : c.outcome === 'loss' ? 'loss'
          : c.rivalChips === 0 ? 'bankrupt' : c.bluffWin ? 'bluffWin'
          : c.rivalBluff ? 'rivalCaught' : c.winStreak >= 2 ? 'streakWin' : 'win';
      } else if (c.youChips === 0) { event = 'allinWaiting'; kind = 'danger'; }
      else if (c.yourTurn && c.toCall >= c.youChips && c.toCall > 0) { event = 'allinCall'; kind = 'danger'; }
      else if (c.youChips <= 3) { event = 'critical'; kind = 'danger'; }
      else if (c.youChips <= 6 || (c.youChips <= 10 && c.youChips * 3 <= c.rivalChips)) { event = 'low'; kind = 'danger'; }
      else if (c.lossStreak >= 2) { event = 'losing'; kind = 'danger'; }
      else if (c.phase === 'bet' && c.youClaim && c.knownBluff) event = 'repeatBluff';
      else if (c.rivalChips === 0) event = 'rivalAllin';
      else if (c.rivalClaim) event = 'claimed';
      else if (c.rivalChips <= 3) { event = 'rivalLow'; kind = 'banter'; }
      else if (handEvent) { event = handEvent; kind = 'hand'; }
      else if (c.round > 1 && ['rolling', 'choose', 'reply'].includes(c.phase)
        && !chatterRounds.has(round) && random() < .25) {
        event = 'idle'; kind = 'chatter'; chatterRounds.add(round);
        pool = [...common.idle, ...rival.idle];
      } else event = c.phase === 'claim' ? (c.yourTriple ? 'claim' : 'bluff')
        : c.phase === 'bet' && c.yourTurn && c.toCall > 0 ? 'raised'
        : c.phase === 'bet' && !c.yourTurn ? 'reply' : c.phase === 'rolling' ? 'choose' : c.phase;

      pool ||= rival[event] || common[event];
      if (!pool) return remember({ id: 'rule', kind: 'advice', text: fallback });
      if (kind === 'hand') announcedHands.add(handKey);
      const candidates = pool.map((text, index) => ({ text, id: `${rival[event] ? c.character : 'common'}:${event}:${index}` }));
      const fresh = candidates.filter(line => !recent.includes(line.id));
      const available = fresh.length ? fresh : candidates.filter(line => line.id !== recent.at(-1));
      const choices = available.length ? available : candidates;
      const chosen = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
      recent.push(chosen.id);
      if (recent.length > 12) recent.shift();
      return remember({ ...chosen, kind, text: chosen.text.replace(/\{(youChips|rivalChips|toCall|yourScore)\}/g, (_, field) => c[field]) });

      function remember(message) {
        cache.set(key, message);
        if (cache.size > 160) cache.delete(cache.keys().next().value);
        return message;
      }
    }
    return { select, reset };
  }
  return { create, common, opponents };
})();
