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
npm run dev      # localhost:4321 で開発サーバー起動
npm run build    # dist/ にビルド
npm run preview  # ビルド確認
```
