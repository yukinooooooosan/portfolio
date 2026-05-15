# Study Note

このメモは、`Yukino's Folio` を作る中で出てきた用語をまとめたもの。
一般的な意味に加えて、このHPでどう使っているかも一緒に残す。

## サイト構成

### 静的サイト

HTML、CSS、JavaScript、画像などのファイルをそのまま配信するWebサイト。
サーバー側でデータベース処理やページ生成をしないため、構成がシンプル。

このHPでは:

- ビルドツールを使わない静的サイトとして作っている。
- `public/` 配下のファイルをそのまま公開する。
- トップページは `public/index.html`。

### `public/`

Webに公開するファイルをまとめるディレクトリ。
静的サイトやフロントエンドアプリで、配信対象を分かりやすく切り分けるためによく使う。

このHPでは:

- Cloudflare Pages と GitHub Pages の両方で公開対象にしている。
- HTML、CSS、JavaScript、画像は基本的に `public/` 配下に置く。
- ルート直下の `hp-design-notes.md` や `study-note.md` は公開対象ではない。

### トップページ

Webサイトにアクセスしたとき最初に表示されるページ。
多くの場合は `index.html` がトップページとして扱われる。

このHPでは:

- `public/index.html` がトップページ。
- `Yukino's Folio` のタイトル、作品カード、制作メモ、About、外部リンクを置いている。

## Git / GitHub

### Git

ファイルの変更履歴を管理するツール。
いつ、何を、なぜ変更したかを記録できる。

このHPでは:

- HTML、CSS、画像、メモの変更をGitで管理している。
- 変更ごとにcommitし、GitHubへpushしている。

### commit

Gitで変更内容をひとまとまりとして記録すること。
あとから履歴を追ったり、変更単位を確認したりできる。

このHPでは:

- `Rename Wolffac card`
- `Deploy public directory to GitHub Pages`
- `Refresh design notes`

のようなcommitを作っている。

### push

ローカルPCのcommitをGitHubなどのリモートリポジトリへ送ること。

このHPでは:

- `main` にpushするとGitHub Actionsが自動で動く。
- GitHub Pagesに `public/` の内容が反映される。
- Cloudflare Pages側もGitHub連携により反映される構成。

### リポジトリ

Gitで管理されているプロジェクトの置き場。
GitHub上では、コード、履歴、Issues、Actions、Pages設定などをまとめて扱う。

このHPでは:

- GitHubリポジトリは `yukinooooooosan/portfolio`。
- URLは `https://github.com/yukinooooooosan/portfolio`。

### `main` ブランチ

Gitリポジトリの中心になるブランチ。
多くのプロジェクトで、公開や本番反映の基準になる。

このHPでは:

- `main` へのpushをきっかけにGitHub Pagesへ自動デプロイする。
- `.github/workflows/pages.yml` で `main` を監視している。

## デプロイ / 公開

### デプロイ

作ったWebサイトやアプリを、インターネット上で見られる状態にすること。

このHPでは:

- `public/` の中身をGitHub PagesとCloudflare Pagesへデプロイしている。
- GitHub PagesはGitHub Actionsで自動デプロイする。

### GitHub Pages

GitHubリポジトリから静的サイトを公開できる機能。
ユーザー名やリポジトリ名に応じたURLでサイトを公開できる。

このHPでは:

- 公開URLは `https://yukinooooooosan.github.io/portfolio/`。
- Sourceは `GitHub Actions` に設定済み。
- `public/` 配下だけを公開するため、workflowでデプロイしている。

### GitHub Actions

GitHub上で自動作業を実行できる仕組み。
テスト、ビルド、デプロイなどをpush時に自動実行できる。

このHPでは:

- `main` にpushすると `Deploy GitHub Pages` workflowが動く。
- `public/` をアップロードし、GitHub Pagesへ公開する。
- workflowファイルは `.github/workflows/pages.yml`。

### workflow

GitHub Actionsで実行する自動作業の設定。
YAMLファイルで、いつ動くか、何をするかを書く。

このHPでは:

- `.github/workflows/pages.yml` がworkflow。
- push時と手動実行時に動く。
- `actions/upload-pages-artifact` と `actions/deploy-pages` を使っている。

### `workflow_dispatch`

GitHub Actionsのworkflowを手動実行できるようにする設定。
GitHubのActions画面から「Run workflow」を押して実行できる。

このHPでは:

- GitHub Pagesの初回設定後、手動でworkflowを実行して公開確認した。
- 以後は通常のpushで自動実行される。

### artifact

GitHub Actionsなどの実行中に作られる成果物。
デプロイ用ファイルやテスト結果などを次の処理へ渡すために使う。

このHPでは:

- `public/` をPages用artifactとしてアップロードしている。
- そのartifactを `actions/deploy-pages` がGitHub Pagesへ公開する。

### Cloudflare Pages

Cloudflareが提供する静的サイト公開サービス。
GitHubリポジトリと連携し、指定したディレクトリを公開できる。

このHPでは:

- 本館URLは `https://yukinooooooosan.cc`。
- Cloudflare Pages標準URLは `https://portfolio-dwx.pages.dev`。
- 出力ディレクトリは `public`。
- ビルドコマンドなしで配信する構成。

### 出力ディレクトリ

公開やデプロイの対象になるファイルが入ったディレクトリ。
ビルドツールを使う場合は `dist/` などになることが多い。

このHPでは:

- 出力ディレクトリは `public/`。
- Cloudflare PagesもGitHub Pagesも `public/` の中身を公開する。

### ビルド

ソースファイルを、公開用のHTML/CSS/JSなどに変換する処理。
ReactやViteなどを使う場合によく必要になる。

このHPでは:

- ビルドツールを使っていない。
- そのためビルドコマンドは不要。
- `public/` のファイルをそのまま公開する。

### `200 OK`

Webサーバーが「ページを正常に返せた」ときのHTTPステータス。

このHPでは:

- `https://yukinooooooosan.github.io/portfolio/` が `200 OK` になったことで、GitHub Pages公開成功を確認した。
- `Yukino's Folio` と `オオカミ工場` が公開HTMLに含まれることも確認した。

### `404 Not Found`

指定したURLのページが見つからないときのHTTPステータス。

このHPでは:

- GitHub Pagesを有効化する前は `https://yukinooooooosan.github.io/portfolio/` が `404` だった。
- SourceをGitHub Actionsに設定し、workflowを成功させたことで解消した。

## ドメイン / URL

### URL

Webページやファイルの場所を示す住所のようなもの。

このHPでは:

- 本館URLは `https://yukinooooooosan.cc`。
- Cloudflare Pages URLは `https://portfolio-dwx.pages.dev`。
- GitHub Pages URLは `https://yukinooooooosan.github.io/portfolio/`。
- GitHubリポジトリURLは `https://github.com/yukinooooooosan/portfolio`。

### ドメイン

Webサイトの住所として使う名前。
`github.io` や `pages.dev` もドメインの一種。

このHPでは:

- GitHub Pagesでは `yukinooooooosan.github.io` の下に公開される。
- Cloudflare Pagesでは `portfolio-dwx.pages.dev` の下にも公開される。
- 本館の独自ドメインとして `yukinooooooosan.cc` を使う。
- 独立性が高い作品は、必要に応じて `chara-baton.yukinooooooosan.cc` のようなサブドメインにする。

### DNS

ドメイン名を、実際のサーバーの場所へつなぐ仕組み。
独自ドメインを使うときに設定が必要になる。

このHPでは:

- `yukinooooooosan.cc` はCloudflare Pagesの本館に向ける。
- `chara-baton.yukinooooooosan.cc` は別のCloudflare Pagesプロジェクト `chara-baton` に向ける。
- Cloudflare Registrarで取得したドメインなので、Cloudflare内でDNSとPagesの連携を管理できる。

### CNAME

あるドメインを別のドメインへ向けるDNS設定。
GitHub Pagesでは、独自ドメインを使うときに `CNAME` ファイルを置く場合もある。

このHPでは:

- 現在は独自ドメインを使っていないため、`CNAME` は不要。
- 将来独自ドメインを使うときに再検討する。

## HTML / CSS / JavaScript

### HTML

Webページの構造を書くための言語。
見出し、段落、リンク、画像、セクションなどを定義する。

このHPでは:

- `public/index.html` がトップページの構造を持つ。
- 作品カード、About、外部リンクなどをHTMLで配置している。

### CSS

Webページの見た目を指定するための言語。
色、余白、レイアウト、フォント、影、レスポンシブ対応などを扱う。

このHPでは:

- `public/styles.css` がトップページの見た目を担当する。
- 黒背景、紫の発光、Bentoカード、作品カード画像などをCSSで設定している。

### JavaScript

Webページに動きや操作を加えるための言語。
ボタン操作、表示切り替え、入力処理などに使う。

このHPでは:

- `public/script.js` で作品カテゴリのフィルターを動かしている。
- `すべて`、`遊ぶ`、`読む`、`見る`、`試す` の切り替えに使う。

### `index.html`

ディレクトリにアクセスしたときに自動で表示される代表的なHTMLファイル名。

このHPでは:

- `public/index.html` がサイトのトップ。
- `public/mojimoji/index.html` はMojimojiページのトップ。

### アセット

Webサイトで使う画像、フォント、SVG、音声などの素材ファイル。

このHPでは:

- 画像やSVGは `public/assets/` に置いている。
- `work-ookami-factory-bg.png`、`profile-cutout-nohand.png`、`kinari-fabric.svg` などがある。

### CSS Grid

CSSで二次元レイアウトを作る仕組み。
行と列を使って、カードやエリアを整理して配置できる。

このHPでは:

- `workbench-grid` でBento風のカード配置を作っている。
- `展示中` を横長カードにし、その下に `制作メモ`、`作っている人`、`外部リンク` を並べている。

### レスポンシブ

画面幅に応じてレイアウトや文字サイズを調整する考え方。
PC、タブレット、スマホで読みやすくするために使う。

このHPでは:

- `@media` で画面幅ごとのレイアウトを調整している。
- スマホ幅ではカードを1列に並べる。

### `@media`

CSSで画面幅や環境に応じたスタイルを指定するための構文。

このHPでは:

- `max-width: 860px` や `max-width: 520px` でスマホ向けレイアウトに切り替える。
- `prefers-reduced-motion` で動きを減らしたいユーザーへの対応もしている。

### `aria-label`

スクリーンリーダーなどの支援技術に、要素の意味を伝えるための属性。

このHPでは:

- 作品一覧や外部リンクのナビゲーションに説明を付けている。
- 見た目だけでなく、読み上げでもページ構造が分かりやすいようにしている。

### `aria-pressed`

ボタンが押された状態かどうかを支援技術に伝える属性。

このHPでは:

- 作品カテゴリのフィルターボタンで使っている。
- 現在選択中のカテゴリを読み上げ環境にも伝える。

## デザイン

### Bento UI

情報や導線を、弁当箱のようなカード群で整理するレイアウト。
複数の入口を見やすく並べたいときに向いている。

このHPでは:

- `展示中`
- `制作メモ`
- `作っている人`
- `外部リンク`

をBento風に並べている。

### カード

情報をひとまとまりに見せるUI部品。
リンク、説明、画像、見出しなどをまとめられる。

このHPでは:

- 作品カード、制作メモカード、Aboutカード、外部リンクカードに使っている。
- `card`、`work-item` などのCSSクラスで見た目を作っている。

### 作品カード

作品やコンテンツへの入口として使うカード。
タイトル、説明文、背景画像、リンクなどを持つ。

このHPでは:

- `Mojimoji`
- `オオカミ工場`
- `Font Preview`

などへの入口として使っている。

### ヒーロー

Webページの最初に大きく置くメインビジュアルやキャッチコピーの領域。

このHPでは:

- 大きなヒーローは作らず、タイトルを控えめな見出しとして使っている。
- 主役は作品カード群。

### リード文

タイトルの下に置く短い説明文やキャッチコピー。

このHPでは:

- `手の届く場所に、好きなものを。`
- タイトルの補足として、控えめな紫色と影で表示している。

### テクスチャ

背景や素材に質感を加える画像やパターン。

このHPでは:

- `kinari-fabric.svg` を背景に使っている。
- その上に暗いレイヤーを重ね、黒背景の中に少し布の質感を残している。

### 発光

光って見えるような色やぼかしの表現。
背景や文字に奥行きを出すために使う。

このHPでは:

- 黒背景に紫、ピンク、青の控えめな発光を重ねている。
- 創作サイトらしい雰囲気を作るために使っている。

### `text-shadow`

文字に影を付けるCSS。
影を重ねると、浮き上がりや暗い縁取りのような表現ができる。

このHPでは:

- `Yukino's Folio` とリード文に使っている。
- 白文字が浮きすぎないよう、闇系の影を重ねている。

### `-webkit-text-stroke`

文字に縁取りを付けるCSS。
対応ブラウザに注意は必要だが、タイトルの印象を強めやすい。

このHPでは:

- `Yukino's Folio` に紫系の縁取りを付けている。
- 黒背景とのなじみとロゴ感を出すために使っている。

### `user-select`

テキストを選択できるかどうかを指定するCSS。
ゲームUIやボタンで、ドラッグ時に文字が選択されるのを防ぎたいときに使う。

このHPでは:

- `font-preview.css` と `mojimoji/style.css` で使っている。
- Safari対応として `-webkit-user-select` も併記している。

## 画像

### 画像生成

AIなどを使って新しい画像を作ること。

このHPでは:

- `オオカミ工場` の作品カード用背景画像を生成した。
- 工場、動物、疑い、見抜くゲームという雰囲気に合わせた画像にした。

### トリミング

画像の不要な端を切り取ること。
構図を整えたり、余白を消したりするために使う。

このHPでは:

- `オオカミ工場` の生成画像に白い四隅があったため、カード背景用にトリミングした。

### リサイズ

画像の縦横サイズを変更すること。
表示サイズに合わせたり、ファイルサイズを軽くしたりするために使う。

このHPでは:

- `work-ookami-factory-bg.png` を 600x900 にリサイズした。
- カード背景として扱いやすいサイズにしている。

### カード背景

カードの中に敷く背景画像。
作品の雰囲気を小さな面積でも伝えやすくする。

このHPでは:

- `オオカミ工場` のカード背景に `public/assets/work-ookami-factory-bg.png` を使っている。
- CSSでは `.work-thumb-wolffac` から参照している。クラス名は旧名由来なので、将来整理してもよい。

## アフィリエイト

### アフィリエイト

商品やサービスへの紹介リンクを置き、購入や申込が発生したときに報酬を得る仕組み。

このHPでは:

- まだ導入していない。
- 追加する場合はトップ直置きではなく、`制作メモ` や専用ページから自然に導線を作る方針。

### Amazonアソシエイト

Amazonの商品を紹介できるアフィリエイトプログラム。
参加表示やリンクの扱いなど、規約に沿った運用が必要。

このHPでは:

- まだ未導入。
- 導入する場合は、参加表示をサイト内に入れる必要がある。
- 価格や在庫の固定表示は扱いが難しいため、まずはテキストリンク中心が安全。

### 180日審査

Amazonアソシエイトで、登録後の一定期間内に成果が必要になる審査のこと。
アクセスが少ないサイトでは負担になりやすい。

このHPでは:

- いきなりAmazonアソシエイトに申し込むより、先に「使っているもの」「読んだ本」などのページを育てる方がよい。

### ASP

Affiliate Service Providerの略。
広告主とサイト運営者をつなぐアフィリエイト仲介サービス。

このHPでは:

- 候補として楽天アフィリエイト、もしもアフィリエイト、A8.net、バリューコマース、afbなどを検討した。
- 創作、ゲーム制作、写真、読書などの文脈に合う案件を選ぶのがよい。

### Google AdSense

Googleが提供する広告配信サービス。
クリックや表示に応じた広告収益を得られる場合がある。

このHPでは:

- まだ未導入。
- 現在のトップページだけではコンテンツ量が少ないため、制作メモや作品ページが増えてから検討する方が自然。

## 認証 / 権限

### Personal Access Token

GitHubに対して、パスワードの代わりに操作権限を与えるトークン。
ローカルからpushするときなどに使われることがある。

このHPでは:

- workflowファイルをpushしようとしたとき、トークンに `workflow` 権限がなくて拒否された。
- そのため、GitHubのWeb画面経由でworkflowを作成した。

### `workflow` scope

Personal Access Tokenに付けられる権限の一つ。
GitHub Actionsのworkflowファイルを作成・更新するには、この権限が必要になる。

このHPでは:

- `.github/workflows/pages.yml` を通常のgit pushで追加しようとして失敗した原因。
- 以後、workflowファイルをローカルから直接pushする場合は、認証トークンの権限に注意する。

### ログイン状態

GitHubなどのWebサービスに、ブラウザ上でサインインしている状態。

このHPでは:

- ChromeでGitHubに再ログインしたあと、`Settings > Pages` を操作できるようになった。
- GitHub PagesのSourceを `GitHub Actions` に切り替えるには、リポジトリ設定を編集できるログイン状態が必要だった。

## 確認コマンド

### `curl`

URLへアクセスして、レスポンスを確認できるコマンド。
HTML本文やHTTPステータスの確認に使える。

このHPでは:

- `curl -I https://yukinooooooosan.github.io/portfolio/` で `200 OK` を確認した。
- `curl -s` で公開HTMLに `Yukino's Folio` や `オオカミ工場` が含まれるか確認した。

### `rg`

高速にファイル内検索できるコマンド。
`grep` より速く、コードベース内の文字列確認に便利。

このHPでは:

- `Wolffac` や `オオカミ工場` の残り箇所を探すために使った。
- 古い情報がメモに残っていないか確認するためにも使った。

### `sips`

macOS標準の画像操作コマンド。
画像サイズの確認、リサイズ、トリミングなどに使える。

このHPでは:

- `オオカミ工場` の生成画像サイズを確認した。
- 画像を600x900にリサイズした。

## 運用メモ

### 新しいページを追加するとき

1. `public/` 配下にHTMLや関連ファイルを置く。
2. トップページからリンクする。
3. ローカルで表示を確認する。
4. commitしてpushする。
5. GitHub ActionsとCloudflare Pagesの反映を確認する。

### 新しい画像を追加するとき

1. `public/assets/` に保存する。
2. 必要に応じてトリミングやリサイズをする。
3. CSSまたはHTMLから参照する。
4. 公開URLで画像が表示されるか確認する。

### 公開確認

確認URL:

- `https://yukinooooooosan.cc`
- `https://yukinooooooosan.github.io/portfolio/`

確認すること:

- ページが `200 OK` で返る。
- 画像が表示される。
- リンク先が意図通り。
- スマホ幅でも崩れない。
