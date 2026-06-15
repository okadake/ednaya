# KEIZO Gallery - 画像更新ガイド

## 新しい画像を追加する方法

### 1. Notion に新しい行を追加
- Notion で「KEIZO Gallery DB」を開く
- 新しい行を追加
- 以下を入力：
  - **Filename**: 画像ファイル名（例：`A7407701.jpg`）
  - **Caption**: キャプション（例：`Mountain View`）
  - **Image**: 画像をアップロード
  - **Order**: 順序（例：`3`）

### 2. 画像 URL をコピー
- Notion で新しく追加した行の **Image セル** をクリック
- 画像が拡大表示されたら、**右クリック**
- **「新しいタブで開く」** をクリック
- 新しいタブの URL をコピー（`https://img.notionusercontent.com/...` の形式）

### 3. JSON ファイルを更新
- `src/data/keizo-gallery.json` を編集
- 新しいエントリを追加：

```json
{
  "filename": "A7407701.jpg",
  "caption": "Mountain View",
  "order": 3,
  "imageUrl": "https://img.notionusercontent.com/s3/..."
}
```

### 4. 完了
- ファイルを保存
- dev サーバーは自動更新されます
- ブラウザをリフレッシュして確認

---

**注意**: 画像 URL には有効期限があります（約1ヶ月）。
URL が切れたら、上記の手順で新しい URL をコピーしてください。

---

## 自動化について

GitHub Actions ワークフローが以下を自動実行します：
- 毎日 UTC 0:00（JST 9:00）に実行
- main へのプッシュ時に実行
- Notion DB から最新データを自動取得
- JSON ファイルを自動生成・更新
- 変更があれば自動コミット

新しい画像を Notion に追加したら、push するだけで自動反映されます！
