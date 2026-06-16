# CLAUDE.md — エドナ屋 (ednaya) プロジェクト

このファイルはClaude.aiとの作業用コンテキストです。

---

## プロジェクト概要

**エドナ屋**は4つのブランドを束ねるポータルサイト。

| ブランド | ページ | 概要 |
|---|---|---|
| EDNA surfboards | `src/pages/edna/edna.astro` | サーフボード |
| BIRDIE plants | `src/pages/birdie.astro` | 植物 |
| PLANET FOTO LABO | `src/pages/planet-foto-labo.astro` | 写真ラボ |
| EDNA BOOKS | `src/pages/edna/edna-books.astro` | 本 |

トップ: `src/pages/index.astro`

---

## スタック

- **フレームワーク**: Astro 6.2.1
- **スタイル**: Tailwind CSS 4.2.4
- **言語**: TypeScript
- **ホスティング**: GitHub Pages
- **URL**: https://okadake.github.io/ednaya/
- **デプロイ**: GitHub Actions（mainブランチへのpushで自動）

---

## ディレクトリ構成

```
src/
├── layouts/
│   └── Layout.astro       # 共通レイアウト
├── pages/
│   ├── index.astro        # トップページ
│   ├── birdie.astro       # BIRDIE plants
│   ├── planet-foto-labo.astro
│   └── edna/
│       ├── edna.astro     # EDNA surfboards
│       └── edna-books.astro
└── styles/
    └── global.css
public/                    # 静的アセット
```

---

## 作業ルール

- **ファイル生成はClaude.aiチャットで行い、手動でコピー&ペースト**
- GitHub Actionsでmainへのpushが自動デプロイ
- `dist/` は生成物なので編集しない
- Tailwind 4.x 系：`@apply` 非推奨、ユーティリティクラス直書きを基本とする
- TypeScript strict モード想定

---

## よく使うコマンド

```sh
npm run dev              # localhost:4321 で開発サーバー起動
npm run build           # dist/ にビルド
npm run preview         # ビルド確認
npm run fetch-notion    # Notion DB から ギャラリーデータを取得
npm run build-deploy    # ビルド + FTP デプロイ
npm run deploy:workflow # GitHub Actions deploy workflow を更新・push
```

---

## KEIZO Gallery 自動化

### Vision API + 手動トリガー方式（✅ 完全実装）

**仕組み**
- note.com の画像 URL から Vision API で自動分析
- キャプション + カテゴリを自動生成
- 複数カテゴリ対応
- 手動トリガー（ワンコマンド）

**使い方**

1. **`gallery-urls.txt` に URL を追加**
```
https://example.com/img/image1.jpg
https://example.com/img/image2.jpg
```

2. **ワンコマンドで完了**
```bash
npm run add-gallery-images
```

（Vision API 分析 → CSV → JSON → ビルド → デプロイまで自動実行）

**設定情報**
- Google Cloud Vision API キー: `.env.local` の `GOOGLE_CLOUD_API_KEY`
- プロジェクト: API Project (api-project-511605367449)
- データファイル: `keizo-gallery.csv` / `src/data/keizo-gallery.json`
