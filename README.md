# kintone-zipcode

Kintone アプリで郵便番号から住所を自動入力するカスタマイズです。

## 機能

- 郵便番号を入力して「住所検索」ボタンをクリックすると、自動的に住所が入力されます
- [zipcloud API](https://zipcloud.ibsnet.co.jp/doc/api) を使用して郵便番号から住所を検索

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成し、Kintone の接続情報を設定します：

```bash
cp .env.example .env
```

`.env` ファイルを編集して、以下の情報を入力します：

```
KINTONE_BASE_URL=https://your-subdomain.cybozu.com
KINTONE_USERNAME=your-email@example.com
KINTONE_PASSWORD=your-password
KINTONE_APP_ID=123
```

### 3. Kintone アプリの準備

Kintone アプリに以下のフィールドを作成してください：

- `郵便番号` (文字列（1行）)
- `都道府県` (文字列（1行）)
- `市区町村` (文字列（1行）)
- `町域` (文字列（1行）)

※フィールドコードは `src/zipcode.js` で変更可能です

### 4. カスタマイズのアップロード

```bash
# 単発アップロード
npm run push

# ファイル変更を監視して自動アップロード
npm run watch
```

## プロジェクト構成

```
kintone-zipcode/
├─ src/
│  ├─ zipcode.js        # 郵便番号検索のJS
│  └─ style.css         # スタイル
├─ customize-manifest.json
├─ .env                 # 認証情報（gitignore対象）
├─ .env.example         # 環境変数のテンプレート
├─ package.json
└─ README.md
```

## 使い方

1. Kintone アプリのレコード追加・編集画面を開く
2. 郵便番号フィールドに郵便番号を入力（例: 100-0001 または 1000001）
3. 「住所検索」ボタンをクリック
4. 都道府県、市区町村、町域が自動的に入力されます

## ライセンス

ISC
