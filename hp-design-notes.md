# HPデザインメモ

## 概要

- サイト名: `Yukino's Folio`
- 本番URL: `https://portfolio-dwx.pages.dev`
- GitHub Pages標準URL候補: `https://yukinooooooosan.github.io/portfolio/`
- GitHubリポジトリ: `https://github.com/yukinooooooosan/portfolio`
- ローカル確認ファイル: `/Users/yukino/Desktop/mypofile/public/index.html`
- 公開ディレクトリ: `public/`
- トップページ: `public/index.html`
- メインCSS: `public/styles.css`
- 関連ページ:
  - `public/mojimoji/index.html`
  - `public/font-preview.html`
  - `public/font-preview-manual.html`

## Cloudflare関連メモ

現在の本番公開先はCloudflare Pages。

- 本番URL: `https://portfolio-dwx.pages.dev`
- Preview URLの形式: `https://xxxxx.portfolio-dwx.pages.dev`
- PRごとの途中確認では、Cloudflare PagesがPreview URLを発行する。
- Safariで本番URLを開き、リード文が戻っていることを確認済み。

デプロイ前に、Cloudflare Pages側の公開ディレクトリを `public` にする。
この設定を変えないままデプロイすると、ルート直下に `index.html` がないためトップページが見つからない可能性がある。
現時点のリポジトリ内には `CNAME` やCloudflare設定ファイルは見当たらない。

今後確認したいこと:

- GitHub Pages標準URLも使い続けるのか。
- Cloudflare Pagesを本番公開先として固定するのか。
- 独自ドメインをCloudflare DNSで管理しているのか。
- 独自ドメインを使う場合、`CNAME` ファイルが必要か。

用語メモ:

- GitHub Pages: GitHubリポジトリから静的サイトを公開できる機能。
- Cloudflare DNS: 独自ドメインの向き先を管理する機能。
- Cloudflare Pages: Cloudflare側で静的サイトをビルド・公開する機能。
- CNAME: 独自ドメインをGitHub Pagesなどへ向けるときに使う設定名、またはGitHub Pages用の設定ファイル名。

### Cloudflare Pagesで配信されるファイル

このHPは、現時点ではビルドツールなしの静的サイト。
`package.json`、`vite.config`、`wrangler` などのビルド設定ファイルは見当たらない。

公開用ファイルは `public/` にまとめる。
Cloudflare Pages側で「ビルドコマンドなし」「出力ディレクトリ `public`」にすると、`public/` の中身だけが配信対象になる。

主な配信対象:

- `public/index.html`
- `public/styles.css`
- `public/script.js`
- `public/font-preview.html`
- `public/font-preview.css`
- `public/font-preview.js`
- `public/font-preview-manual.html`
- `public/mojimoji/index.html`
- `public/mojimoji/style.css`
- `public/mojimoji/script.js`
- `public/assets/` 配下の画像、SVGなど

注意:

- Gitの管理情報である `.git/` は公開用ファイルとして扱わない。
- `.gitignore` やルート直下のメモは、`public/` に入れなければ公開対象から外れる。
- 新しいHTML、CSS、JS、画像を公開したい場合は `public/` 配下に置く。

お勉強メモ:

Cloudflare Pagesは「GitHubにあるファイルを全部そのままインターネットに出す」というより、「指定された出力ディレクトリの中身を公開する」仕組み。
ReactやViteなどを使うサイトでは、ソースファイルをビルドして `dist/` のような出力フォルダを作り、その中身だけを公開することが多い。
今回のような素のHTML/CSS/JSサイトでは、ビルドせずに `public/` をそのまま公開する構成にすると分かりやすい。

## 目的

個人サイト `Yukino's Folio` のデザイン方針、変更した内容、今後の調整候補をまとめる。
あとで自分でCSSやレイアウトを触るときに、判断の理由も思い出せるようにする。

## 現在の方向性

- 個人の作品棚、ポートフォリオとして見せる。
- ゲーム、小説、写真、制作メモ、ツールへの入口をBento風のカードで整理する。
- 全体の雰囲気は、黒背景、紫の発光、少し文芸・創作寄り。
- 派手なランディングページより、作品に入っていける静かなトップにする。

## 今回整理したポイント

### プロフィール写真

最初はトップ右側に切り抜き写真を浮かせていたが、Bentoカード群と別ルールの要素に見えてしまい、少し浮いて見えた。

対応として、トップの浮遊写真を外し、`About` カード内の背景ビジュアルとして入れた。

意図:

- 写真もBentoカードの一部として扱う。
- 「人物写真が置いてある」より「作っている人カードの背景モチーフ」に寄せる。
- トップはタイトルと作品導線を主役にする。

関連ファイル:

- `public/index.html`
- `public/styles.css`

### タイトルエリア

`Yukino's Folio` と `手の届く場所に、好きなものを。` のエリアが縦に大きかったため、ヘッダーの高さと余白を縮めた。

対応:

- `.site-header` の `min-height` を外す。
- `.site-header-copy` の上下パディングを縮める。
- `h1` と `.lead` の間隔を縮める。
- タイトルとリード文のフォントサイズを小さくする。

意図:

- Bentoカード群へ早く視線を送る。
- トップを大きなヒーローではなく、作品棚の見出しとして扱う。

### タイトル文字

`Yukino's Folio` は白単色だと少し素直すぎたため、文字に質感を足した。

対応:

- 文字色を `#f4e9ff` に変更。
- 濃い紫の縁取りを追加。
- 影を発光系から闇系に変更。

意図:

- 白文字の浮き方を抑える。
- 黒背景と紫の世界観に合わせる。
- タイトルに少しロゴ感を出す。

### リード文

`手の届く場所に、好きなものを。` は、タイトルの補足として控えめにした。

対応:

- フォントサイズを小さめにする。
- 左インデントを `2em` から `1.15em` に縮める。
- タイトル縁取りに近い紫系の色へ変更。
- タイトルと同系統の闇系シャドウを付ける。

意図:

- 主役はタイトル、リード文は添え書きにする。
- 色と影でタイトルとのつながりを作る。

### 背景

背景はより黒くしつつ、紫・ピンク・青の発光は少し残した。

対応:

- `--color-bg` をほぼ黒に近い `#010102` に変更。
- 布テクスチャにかける暗幕を濃くする。
- 背景の発光は一度弱めたあと、少し戻した。

意図:

- カードと文字が締まって見えるようにする。
- ただの真っ黒ではなく、創作サイトらしい奥行きを残す。

### Safari対応

`user-select` に対して、Safari/iOS Safari向けの警告が出ていた。

対応:

```css
-webkit-user-select: none;
user-select: none;
```

標準プロパティの前に `-webkit-` 付きのプロパティを追加した。

対象:

- `public/font-preview.css`
- `public/mojimoji/style.css`

## お勉強メモ

### Bentoとは

Bento UIは、複数の情報や導線をカード状に並べるレイアウトのこと。
カードごとに役割が分かれるため、情報を整理して見せやすい。

今回のサイトでは以下がBento的な要素。

- `展示中`
- `制作メモ`
- `作っている人`
- `外部リンク`

注意点:

- カード外に強い装飾要素を置くと、その要素だけ別世界に見えやすい。
- 写真や装飾もカード内に入れると、全体のルールが揃いやすい。

### CSS Gridの注意

トップの写真を文字に重ねようとしたとき、`margin-left` では思ったほど動かなかった。

理由:

- CSS Gridの中で `justify-self: end` を使っていた。
- Gridの配置計算とマイナスマージンが組み合わさり、見た目の移動量が分かりにくくなった。

見た目だけ動かしたい場合は、以下のような `transform` の方が直感的。

```css
transform: translate(-188px, -4px);
```

### `text-shadow`

文字に影を付けるCSS。
複数行指定すると、影や発光を重ねられる。

例:

```css
text-shadow:
  0 2px 4px rgba(4, 3, 8, 0.92),
  0 7px 16px rgba(8, 5, 18, 0.74);
```

値の意味:

- 1つ目: 横方向のずれ
- 2つ目: 縦方向のずれ
- 3つ目: ぼかし量
- 4つ目: 色

発光っぽくしたいときは明るい色を使う。
闇系にしたいときは黒や濃い紫を使う。

### `-webkit-text-stroke`

文字に縁取りを付けるCSS。
SafariやChromeなどWebKit/Blink系ブラウザで使える。

例:

```css
-webkit-text-stroke: 1.3px rgba(110, 78, 204, 0.78);
```

注意点:

- 太くしすぎるとロゴやゲームタイトル感が強くなる。
- 薄すぎると見えない。
- 文字色、背景色、影との組み合わせで印象が変わる。

### `rgba()` と見え方

同じ `rgba(110, 78, 204, 0.78)` でも、置かれる背景によって違う色に見える。

理由:

- `rgba()` は透明度を持つ。
- 背景色と混ざって表示される。

同じ色に見せたい場合は、透過なしの16進カラーを使うと安定しやすい。

```css
color: #6e4ecc;
```

### `user-select`

テキスト選択を許可するかどうかを指定するCSS。
ボタンやゲーム用キーなど、ドラッグ時に文字選択されると困るUIに使う。

例:

```css
-webkit-user-select: none;
user-select: none;
```

Safari対応を考える場合は `-webkit-user-select` も一緒に書く。

## 今後の調整候補

- `About` カード内の写真の明るさや位置を微調整する。
- タイトルの紫縁取りが強すぎる場合は、太さや透明度を少し下げる。
- リード文の紫が暗く見える場合は、少し明るい紫に変える。
- `展示中` カード内の未公開リンクを、準備中表示にするかリンクを無効化する。
- 外部リンクの `#` を実URLに置き換える。
- スマホ表示でタイトル、リード文、カードの間隔を再確認する。

## 確認方法

ローカルで確認する場合:

```bash
open /Users/yukino/Desktop/mypofile/public/index.html
```

確認する観点:

- タイトルが大きすぎないか。
- リード文が読めるか。
- 背景が黒すぎないか、発光がうるさくないか。
- `About` カード内の写真が浮いて見えないか。
- スマホ幅でも余白や文字サイズが自然か。
