# Nomi Party Notes

## 概要

- 仮タイトル: `夜のまわしスマホ`
- ディレクトリ: `apps/nomi-party/`
- 想定URL: `https://nomi-party.yukinooooooosan.cc/`
- 位置づけ: 飲み会向けの軽量パーティゲーム集
- 公開方針: このリポジトリ内の軽量アプリとして管理し、Cloudflare Pagesで `apps/nomi-party` を公開ディレクトリにする

## コンセプト

一台のスマホを順番に回して遊ぶ。
参加者全員が自分の端末を出さなくてもよく、ルール説明が短く、飲み会の途中でも始めやすいゲーム集にする。

雰囲気は、少し攻める・少し大人向け。
ただし、直接的すぎる表現や人間関係を壊しやすいお題には寄せすぎない。
笑える、少し照れる、会話が増える、くらいの温度を狙う。

## このリポジトリで扱う理由

`nomi-party` は、最初は素のHTML/CSS/JavaScriptで作れる軽量アプリとして扱う。
DB、認証、API、重いビルド環境は使わない想定なので、`portfolio` リポジトリ内の `apps/` に置く。

将来、以下が必要になった場合は別リポジトリ化を検討する。

- ユーザー登録やログイン
- お題投稿、保存、共有などのDB
- 管理画面
- サーバーAPI
- 課金や年齢確認などの重い運用
- フレームワークや依存関係が大きくなった場合

## フォルダ構成

現在:

```text
apps/
  nomi-party/
    index.html
    style.css
```

当面の想定:

```text
apps/
  nomi-party/
    index.html
    style.css
    script.js
```

ゲームが増えて複雑になった場合:

```text
apps/
  nomi-party/
    index.html
    style.css
    script.js
    games/
      minority.js
      nominate.js
      question-pass.js
      midnight-choice.js
```

最初から細かく分けすぎず、必要になった時点で分ける。

## URLと画面遷移の方針

初期段階では、複数ページに分けず、1つの `index.html` の中でゲームを切り替える。
URLはハッシュでゲームを表す。

想定URL:

```text
https://nomi-party.yukinooooooosan.cc/
https://nomi-party.yukinooooooosan.cc/#minority
https://nomi-party.yukinooooooosan.cc/#nominate
https://nomi-party.yukinooooooosan.cc/#question-pass
https://nomi-party.yukinooooooosan.cc/#midnight-choice
```

`/` はゲーム集トップ。
`#minority` などは各ゲームの開始画面。
ゲーム途中の状態まではURLに持たせない。
途中でリロードした場合は、そのゲームの初期画面に戻る方針にする。

この方針にする理由:

- 飲み会中にスマホを回す体験を、ページ遷移で分断しない。
- ゲームごとの直接リンクは作れる。
- Cloudflare Pages側のルーティング設定を増やさなくてよい。
- まだ軽量な静的アプリとして管理しやすい。

注意点:

- ハッシュはサーバーに送られないので、Cloudflare Pagesから見ると常に `/` へのアクセスになる。
- ゲームごとのSEOやSNSプレビューを個別に作る用途には弱い。
- もし将来、ゲームごとの説明ページやOGPが必要になったら `/games/minority/` のような個別ページ化を検討する。

## JavaScript構成の方針

画面は1ページにまとめるが、JavaScriptはゲームごとに分ける。
`script.js` はメイン処理、ルーティング、共通UIを担当する。
各ゲームのロジックは `games/` 配下に分ける。

想定:

```text
apps/
  nomi-party/
    index.html
    style.css
    script.js
    games/
      minority.js
      nominate.js
      question-pass.js
      midnight-choice.js
      shared.js
```

`script.js` の役割:

- `location.hash` を見て、表示するゲームを決める。
- ハッシュが空ならゲーム集トップを表示する。
- 存在しないハッシュならトップに戻す。
- 各ゲームの `mount()` を呼び出す。
- トップへ戻る、スマホを次の人へ渡す、共通ボタンなどの共通UIを扱う。

各ゲームファイルの役割:

- 自分のゲームID、タイトル、説明を持つ。
- `mount(root)` のような入口関数を持つ。
- そのゲーム固有の状態と画面だけを管理する。
- 他のゲームのDOMや状態には触らない。

実装イメージ:

```js
// script.js
import { minorityGame } from "./games/minority.js";
import { nominateGame } from "./games/nominate.js";

const games = {
  minority: minorityGame,
  nominate: nominateGame,
};

function route() {
  const gameId = location.hash.replace("#", "");
  const game = games[gameId];

  if (!game) {
    renderHome();
    return;
  }

  game.mount(document.querySelector("#app"));
}

window.addEventListener("hashchange", route);
route();
```

ES Modulesを使うため、HTML側は以下のように読み込む。

```html
<script type="module" src="script.js"></script>
```

注意:

- `file://` 直開きではES Modulesが動かない場合がある。
- ローカル確認は `python3 -m http.server` などの静的サーバーを使う。

## Folioとの関係

Folio本館 `public/index.html` には、作品カードとして `夜のまわしスマホ` を置く。
カードのリンク先は `https://nomi-party.yukinooooooosan.cc/`。

本館側にはゲーム本体を置かない。
本館は入口、`apps/nomi-party/` がゲーム集本体。

## ゲーム候補

### 少数派を探せ

一人だけ違うお題を持つ。
全員で会話しながら、誰が少数派かを探す。

想定:

- 人数: 3-8人
- 時間: 5分
- 雰囲気: じわじわ
- 最初に実装する候補

### 指名のグラス

表示されたお題に対して、全員で「この中で一番それっぽい人」を指名する。
攻めすぎない範囲で、少し照れる投票ゲームにする。

想定:

- 人数: 3人以上
- 時間: 3分
- 雰囲気: にぎやか

### 質問パス

表示された質問に答えるか、次の人に渡す。
答えにくさもゲームの一部にするが、パスできる逃げ道を残す。

想定:

- 人数: 2人以上
- 時間: 10分
- 雰囲気: しっとり

### 深夜の二択

二択に答えるだけの軽いゲーム。
恋愛、秘密、欲望、見栄などを直接的にしすぎず、夜っぽく扱う。

想定:

- 人数: 2人以上
- 時間: 5分
- 雰囲気: 大人寄り

## UI方針

- スマホ縦画面を第一に考える。
- 片手で操作できる大きめのボタンにする。
- 文字は短く、酔っていても読める量にする。
- ゲーム中は説明文を減らし、次に何をすればいいかだけを見せる。
- 画面を人に見せる場面と、自分だけが見る場面を明確に分ける。
- `スマホを次の人へ` のような受け渡し画面を用意する。

## 表現の安全ライン

少し攻めるが、強制的な暴露や特定の人を傷つけるお題にはしない。

避けるもの:

- 個人の身体的特徴をいじるお題
- 実在の恋人、配偶者、職場関係を壊しやすいお題
- 飲酒の強要
- 性的に直接的すぎる表現
- 断りにくい命令

入れてよい方向:

- 秘密がありそう
- 恋愛観
- 見栄
- 意外な一面
- ちょっとした嫉妬
- もしもの話

## 実装メモ

- まずは `index.html` と `style.css` だけでリンク集を作る。
- 次に `script.js` を追加して、最初のゲームを実装する。
- 最初の実装候補は `少数派を探せ`。
- お題データは最初はJavaScript内の配列で持つ。
- DBや外部APIは使わない。
- ローカル確認は `apps/nomi-party/` をルートとして静的サーバーを立てる。

例:

```bash
cd apps/nomi-party
python3 -m http.server 8090
```

確認URL:

```text
http://localhost:8090/
```

## 今後やること

- `少数派を探せ` のルールを確定する。
- 人数設定画面を作る。
- お題確認画面を作る。
- スマホ受け渡し画面を作る。
- 投票、答え合わせ、もう一回遊ぶ導線を作る。
- お題の温度を `safe`、`spicy` などで分けるか検討する。
