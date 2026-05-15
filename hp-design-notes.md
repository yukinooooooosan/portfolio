# HPデザインメモ

## 概要

- サイト名: `Yukino's Folio`
- 本館URL: `https://yukinooooooosan.cc`
- Cloudflare Pages URL: `https://portfolio-dwx.pages.dev`
- GitHub Pages URL: `https://yukinooooooosan.github.io/portfolio/`
- GitHubリポジトリ: `https://github.com/yukinooooooosan/portfolio`
- 公開ディレクトリ: `public/`
- トップページ: `public/index.html`
- メインCSS: `public/styles.css`
- GitHub Pages workflow: `.github/workflows/pages.yml`
- ローカル確認ファイル: `/Users/yukino/Desktop/mypofile/public/index.html`

関連アプリ:

- `apps/mojimoji/index.html`
- `apps/font-preview/index.html`
- `apps/font-preview/manual.html`

## 公開構成

このHPは、ビルドツールなしの静的サイト。
本館は `public/` 配下のHTML、CSS、JavaScript、画像をそのまま公開する。
独立アプリは `apps/` 配下に切り出し、Cloudflare Pages側でアプリごとに公開ディレクトリを変える。

主な公開対象:

- `public/index.html`
- `public/styles.css`
- `public/script.js`
- `public/_redirects`
- `public/assets/` 配下の画像、SVGなど

独立アプリ:

- `apps/mojimoji/index.html`
- `apps/mojimoji/style.css`
- `apps/mojimoji/script.js`
- `apps/font-preview/index.html`
- `apps/font-preview/manual.html`
- `apps/font-preview/font-preview.css`
- `apps/font-preview/font-preview.js`

注意:

- 新しいHTML、CSS、JS、画像を公開したい場合は `public/` 配下に置く。
- 独立アプリとして公開したい場合は `apps/` 配下に置き、Cloudflare Pagesの公開ディレクトリをアプリのフォルダにする。
- `.git/`、`.gitignore`、ルート直下のメモ類は公開用ファイルとして扱わない。
- Cloudflare Pages と GitHub Pages の両方で、公開対象は `public/` の中身に揃える。

## デプロイ

### GitHub Pages

GitHub PagesはGitHub Actionsで自動デプロイする。

- Source: `GitHub Actions`
- workflow: `.github/workflows/pages.yml`
- trigger:
  - `main` ブランチへのpush
  - 手動実行 `workflow_dispatch`
- 公開URL: `https://yukinooooooosan.github.io/portfolio/`

運用:

1. `public/` 配下を編集する。
2. commitする。
3. `main` にpushする。
4. GitHub Actionsが `public/` をGitHub Pagesへ公開する。

GitHub Pagesの初回設定では、リポジトリの `Settings > Pages` で Source を `GitHub Actions` に変更した。
以後はpushごとに自動反映される。

### Cloudflare Pages

Cloudflare Pagesも `public/` を公開ディレクトリとして配信する。

- 本館URL: `https://yukinooooooosan.cc`
- Cloudflare Pages URL: `https://portfolio-dwx.pages.dev`
- 出力ディレクトリ: `public`
- ビルドコマンド: なし

Cloudflare Pagesは指定した出力ディレクトリの中身を公開する仕組み。
今回のような素のHTML/CSS/JSサイトでは、ビルドせずに `public/` をそのまま公開する構成にすると分かりやすい。

### ドメイン運用

本館は独自ドメイン `https://yukinooooooosan.cc` で公開する。
Cloudflare Pages標準URL `https://portfolio-dwx.pages.dev` は内部的な配信元・予備URLとして扱う。

展示作品は、独立性が高いものだけサブドメイン化する。

- 本館: `https://yukinooooooosan.cc`
- 創作キャラバトン: `https://chara-baton.yukinooooooosan.cc/`
- オオカミ工場: `https://yukinooooooosan.github.io/wolffac/`
- Mojimoji: `https://mojimoji.yukinooooooosan.cc/`
- Font Preview: `https://font-preview.yukinooooooosan.cc/`

`chara-baton` は別のCloudflare Pagesプロジェクトなので、サブドメインで独立させる。
`Mojimoji` と `Font Preview` は同じGitHubリポジトリ内の `apps/` 配下に切り出し、Cloudflare Pagesプロジェクトを分けてサブドメインで公開する。

## 目的

個人サイト `Yukino's Folio` のデザイン方針、変更した内容、運用方法をまとめる。
あとで自分でCSSやレイアウトを触るときに、判断の理由も思い出せるようにする。

## 現在の方向性

- 個人の作品棚、ポートフォリオとして見せる。
- ゲーム、小説、写真、制作メモ、ツールへの入口をBento風のカードで整理する。
- 全体の雰囲気は、黒背景、紫の発光、少し文芸・創作寄り。
- 派手なランディングページより、作品に入っていける静かなトップにする。
- トップはタイトルと作品導線を主役にする。

## 現在のトップページ構成

- `展示中`
  - `Mojimoji`
  - `オオカミ工場`
  - `短編小説`
  - `Photo Gallery`
  - `長編置き場`
  - `Font Preview`
- `制作メモ`
- `作っている人`
- `外部リンク`

`展示中` にはカテゴリフィルターがある。

- `すべて`
- `遊ぶ`
- `読む`
- `見る`
- `試す`

## 最近の変更

### GitHub Pages対応

GitHub Pagesでも `public/` を公開できるように、GitHub Actions workflowを追加した。

追加ファイル:

- `.github/workflows/pages.yml`

対応内容:

- `main` へのpush時に自動デプロイする。
- `public/` ディレクトリをPages用アーティファクトとしてアップロードする。
- `actions/deploy-pages` でGitHub Pagesへ公開する。

確認済み:

- `https://yukinooooooosan.github.io/portfolio/` が `200 OK` を返す。
- 公開HTML内に `Yukino's Folio` と `オオカミ工場` が含まれている。

### `オオカミ工場` の作品カード

作品カードの表示名は以下にする。

- `オオカミ工場`

説明文は以下のまま維持する。

```text
動物たちと働き、疑い、見抜くゲーム
```

関連ファイル:

- `public/index.html`

### `オオカミ工場` のカード画像

作品カード用に新しい画像を生成し、カード背景として設定した。

追加ファイル:

- `public/assets/work-ookami-factory-bg.png`

処理:

- 生成画像をカード背景向けにトリミング。
- 600x900にリサイズ。
- 四隅の白い余白が出ないよう調整。

関連ファイル:

- `public/styles.css`

## デザイン整理

### プロフィール写真

最初はトップ右側に切り抜き写真を浮かせていたが、Bentoカード群と別ルールの要素に見えた。
現在はトップの浮遊写真を外し、`About` カード内の背景ビジュアルとして入れている。

意図:

- 写真もBentoカードの一部として扱う。
- 「人物写真が置いてある」より「作っている人カードの背景モチーフ」に寄せる。
- トップはタイトルと作品導線を主役にする。

関連ファイル:

- `public/index.html`
- `public/styles.css`

### タイトルエリア

`Yukino's Folio` と `手の届く場所に、好きなものを。` のエリアは、作品棚の見出しとして扱う。
大きなヒーローではなく、Bentoカード群へ早く視線を送るため、余白と文字サイズを抑えている。

対応:

- `.site-header` の `min-height` を外す。
- `.site-header-copy` の上下パディングを縮める。
- `h1` と `.lead` の間隔を縮める。
- タイトルとリード文のフォントサイズを小さくする。

### タイトル文字

`Yukino's Folio` は、白単色ではなく黒背景と紫の世界観に合わせた質感にしている。

対応:

- 文字色を `#f4e9ff` に変更。
- 濃い紫の縁取りを追加。
- 影を発光系から闇系に変更。

意図:

- 白文字の浮き方を抑える。
- タイトルに少しロゴ感を出す。

### リード文

`手の届く場所に、好きなものを。` は、タイトルの補足として控えめに扱う。

対応:

- フォントサイズを小さめにする。
- 左インデントを `1.15em` にする。
- タイトル縁取りに近い紫系の色にする。
- タイトルと同系統の闇系シャドウを付ける。

### 背景

背景はほぼ黒にしつつ、紫・ピンク・青の発光を少し残している。

対応:

- `--color-bg` を `#010102` にする。
- 布テクスチャに暗幕を重ねる。
- 背景の発光で創作サイトらしい奥行きを残す。

## CSSメモ

### Bento

Bento UIは、複数の情報や導線をカード状に並べるレイアウト。
カードごとに役割が分かれるため、情報を整理して見せやすい。

このサイトでは以下がBento的な要素。

- `展示中`
- `制作メモ`
- `作っている人`
- `外部リンク`

注意点:

- カード外に強い装飾要素を置くと、その要素だけ別世界に見えやすい。
- 写真や装飾もカード内に入れると、全体のルールが揃いやすい。

### `text-shadow`

文字に影を付けるCSS。
複数行指定すると、影や発光を重ねられる。

```css
text-shadow:
  0 2px 4px rgba(4, 3, 8, 0.92),
  0 7px 16px rgba(8, 5, 18, 0.74);
```

### `-webkit-text-stroke`

文字に縁取りを付けるCSS。
SafariやChromeなどWebKit/Blink系ブラウザで使える。

```css
-webkit-text-stroke: 1.3px rgba(110, 78, 204, 0.78);
```

### `user-select`

テキスト選択を許可するかどうかを指定するCSS。
ボタンやゲーム用キーなど、ドラッグ時に文字選択されると困るUIに使う。

```css
-webkit-user-select: none;
user-select: none;
```

Safari対応を考える場合は `-webkit-user-select` も一緒に書く。

対象:

- `apps/font-preview/font-preview.css`
- `apps/mojimoji/style.css`

## 今後の調整候補

- `About` カード内の写真の明るさや位置を微調整する。
- `展示中` カード内の未公開リンクを、準備中表示にするかリンクを無効化する。
- 外部リンクの `#` を実URLに置き換える。
- スマホ表示でタイトル、リード文、カードの間隔を再確認する。
- アフィリエイトやおすすめ紹介を追加する場合は、トップ直置きではなく `制作メモ` や専用ページから自然に導線を作る。

## 確認方法

ローカルで確認する場合:

```bash
open /Users/yukino/Desktop/mypofile/public/index.html
```

公開URLで確認する場合:

- `https://yukinooooooosan.cc`
- `https://yukinooooooosan.github.io/portfolio/`

確認する観点:

- タイトルが大きすぎないか。
- リード文が読めるか。
- 背景が黒すぎないか、発光がうるさくないか。
- `About` カード内の写真が浮いて見えないか。
- `オオカミ工場` のカード画像が自然に見えるか。
- スマホ幅でも余白や文字サイズが自然か。
