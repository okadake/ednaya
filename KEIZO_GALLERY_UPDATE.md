# KEIZO Gallery - 画像更新ガイド

## 新しい画像を追加する方法（推奨）

### 1. Notion に新しい行を追加
- Notion で「KEIZO Gallery DB」を開く
- 新しい行を追加
- 以下を入力：
  - **Caption**: キャプション（例：`Mountain View`）
  - **Image**: 画像をアップロード
  - **選択**: カテゴリを選択（`Landscape`, `People`, `Places`, `Daily Life`, `Food` など）
  - **Order**: 順序番号（オプション。指定しない場合は自動で最後に追加）

### 2. ローカルでスクリプト実行
```bash
npm run fetch-notion
```

このコマンドで：
- Notion DB から自動的にすべての画像データを取得
- JSON ファイルを自動生成・更新
- dev サーバーが自動リロード

### 3. ブラウザで確認
- ブラウザをリロード（`Cmd + Shift + R`）
- 新しい画像がギャラリーに表示されます
- 選択したカテゴリーでタブフィルタリングが可能

---

## カテゴリ機能

ギャラリーの下部にあるタブで、カテゴリー別に画像を絞り込めます：

- **All**: すべての画像を表示
- **Landscape**, **People**, **Places** など: 選択したカテゴリーのみ表示

Notion で「選択」フィールドに値が入っているカテゴリーのタブが自動生成されます。

---

## コマンド一覧

### Notion からデータを取得して JSON を更新
```bash
npm run fetch-notion
```
- `.env.local` から自動的に API キーを読み込み
- Notion DB の最新データを取得
- `src/data/keizo-gallery.json` を更新

### ローカル開発サーバーを起動
```bash
npm run dev
```

---

## 自動化について

### GitHub Actions による自動更新
GitHub Actions ワークフローが以下を自動実行します：
- **毎日 UTC 0:00**（JST 9:00）に実行
- **main へのプッシュ時**に実行
- Notion DB から最新データを自動取得
- JSON ファイルを自動生成・更新

### 手動実行
スケジュールを待たずに更新したい場合：
1. ローカルで `npm run fetch-notion` を実行
2. ブラウザをリロード

---

## 注意事項

- **Filename フィールドは不要です**（自動的に画像から取得）
- **Order は指定しなくてもOK**（デフォルト値: 999。つまり一番最後に追加）
- **画像 URL の有効期限**: Notion CDN の URL は約1時間有効（スクリプト実行時に自動更新）
