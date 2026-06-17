# KEIZO Gallery - 画像更新ガイド

Vision API を使った自動ギャラリー管理システム。

## 新しい画像を追加する方法

### 1. gallery-urls.txt に URL を追加

`gallery-urls.txt` に画像 URL を1行ずつ追加します：

```
https://edna.jp/edna-books/artist/keizo-okada/gallery/image1.jpg
https://edna.jp/edna-books/artist/keizo-okada/gallery/image2.jpg
https://edna.jp/edna-books/artist/keizo-okada/gallery/image3.jpg
```

### 2. ワンコマンドで完了

```bash
npm run add-gallery-images
```

このコマンドで自動実行されます：
- ✅ Google Cloud Vision API で画像を分析
- ✅ キャプション自動生成（日本語翻訳付き）
- ✅ カテゴリ自動判定（Places, People, Food, Daily Life）
- ✅ CSV/JSON ファイル生成
- ✅ ビルド + FTP デプロイ

### 3. ブラウザで確認

本番サイト（edna.jp）で新しい画像が表示されます。

---

## カテゴリ機能

Vision API が自動判定した4つのカテゴリ：

- **All**: すべての画像を表示
- **Places**: 風景、建物、ランドマーク
- **People**: 人物、ポートレート
- **Food**: 食べ物、料理、飲み物
- **Daily Life**: 室内、ペット、アート、ファッション

タブで簡単に絞り込めます。

---

## コマンド一覧

### Vision API で分析 → ビルド → デプロイ
```bash
npm run add-gallery-images
```
- gallery-urls.txt から URL を読み込み
- Vision API で新規画像のみ分析（既分析画像は再分析しない）
- CSV/JSON を生成
- ビルド + FTP デプロイを自動実行
- バックアップ機能付き（失敗時復元可能）

### ローカル開発サーバーを起動
```bash
npm run dev
```

### ビルド確認
```bash
npm run build
npm run preview
```

---

## ファイル管理

| ファイル | 役割 |
|---------|------|
| `gallery-urls.txt` | 管理対象の URL リスト（唯一の管理ファイル） |
| `keizo-gallery.csv` | メタデータ（自動生成） |
| `src/data/keizo-gallery.json` | ギャラリーデータ（自動生成） |

---

## データ削除方法

gallery-urls.txt から URL を削除すると、次回実行時に自動削除されます。

```
# 削除したい URL を行ごと削除
# npm run add-gallery-images を実行
# → 削除されたギャラリーから自動削除
```

---

## API コスト管理

- **無料枠**: Google Cloud Vision API 1000リクエスト/月まで無料
- **効率化**: 既分析画像は自動的にスキップ（再分析しない）
- **バックアップ**: 実行前に JSON/CSV をバックアップ

---

## トラブルシューティング

### Vision API エラーが出た場合
1. URL が外部から確認可能か確認
2. `.env.local` に `GOOGLE_CLOUD_API_KEY` が設定されているか確認
3. Google Cloud プロジェクトに課金が有効になっているか確認

### ビルドエラーが出た場合
1. `npm install` で依存を更新
2. `npm run build` でローカルビルドテスト
3. JSON 形式が正しいか確認

---

## 自動化について

- GitHub Actions ワークフローは **削除済み**
- デプロイは **手動トリガー**（`npm run add-gallery-images`）で実行
- エラー検知と確認が可能
