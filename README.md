# EDNA BOOKS — KEIZO OKADA Gallery

ポートフォリオサイト EDNA の KEIZO OKADA アーティストページ。Vision API を使った自動ギャラリー管理システム。

## 🚀 Tech Stack

- **Framework**: Astro 6.2.1
- **Styling**: Tailwind CSS 4.2.4
- **Language**: TypeScript
- **Hosting**: FTP (edna.jp)
- **Gallery**: Google Cloud Vision API (自動分析)

## 📁 Project Structure

```
/
├── public/           # 静的アセット
├── src/
│   ├── pages/       # ルート（.astro ファイル）
│   ├── layouts/     # 共通レイアウト
│   ├── data/        # keizo-gallery.json（生成）
│   └── styles/      # グローバルスタイル
├── scripts/         # automation scripts
│   └── add-gallery-images.js  # Vision API 分析スクリプト
├── gallery-urls.txt # ギャラリー画像 URL リスト
└── keizo-gallery.csv # 生成されるメタデータ
```

## 🧞 Commands

| Command | Action |
|---------|--------|
| `npm install` | 依存をインストール |
| `npm run dev` | localhost:4321 で開発サーバー起動 |
| `npm run build` | dist/ にビルド |
| `npm run preview` | ビルド確認 |
| `npm run build-deploy` | ビルド + FTP デプロイ |
| `npm run add-gallery-images` | Vision API で画像分析 → CSV/JSON 生成 → ビルド → デプロイ |

## 📸 Gallery Management

### 使い方

1. `gallery-urls.txt` に画像 URL を追加
   ```
   https://example.com/image1.jpg
   https://example.com/image2.jpg
   ```

2. ワンコマンドで完了
   ```bash
   npm run add-gallery-images
   ```

### 特徴

- ✅ Vision API で自動分析（キャプション + カテゴリ生成）
- ✅ 複数カテゴリ対応
- ✅ CSV/JSON で管理
- ✅ バックアップ機能（失敗時復元）
- ✅ 既分析画像は再分析しない（API コスト削減）
- ✅ gallery-urls.txt で一元管理

## 🔐 Environment Variables

`.env.local` に設定：

```
GOOGLE_CLOUD_API_KEY=your_api_key
FTP_USER=your_ftp_user
FTP_PASSWORD=your_ftp_password
```

## 📝 Development Notes

- CLAUDE.md を参照（詳細ドキュメント）
- GitHub Actions は使用していない（ローカル FTP デプロイのみ）
- Tailwind 4.x：@apply 非推奨、ユーティリティクラス直書き
