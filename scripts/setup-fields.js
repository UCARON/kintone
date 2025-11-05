/**
 * Kintone アプリに郵便番号検索用のフィールドを自動追加するスクリプト
 */

const { KintoneRestAPIClient } = require('@kintone/rest-api-client');
require('dotenv').config();

// 環境変数から設定を取得
const baseUrl = process.env.KINTONE_BASE_URL;
const username = process.env.KINTONE_USERNAME;
const password = process.env.KINTONE_PASSWORD;
const appId = process.env.KINTONE_APP_ID;

// 必要なフィールドの定義
const REQUIRED_FIELDS = [
  {
    code: '郵便番号',
    type: 'SINGLE_LINE_TEXT',
    label: '郵便番号',
  },
  {
    code: '都道府県',
    type: 'SINGLE_LINE_TEXT',
    label: '都道府県',
  },
  {
    code: '市区町村',
    type: 'SINGLE_LINE_TEXT',
    label: '市区町村',
  },
  {
    code: '町域',
    type: 'SINGLE_LINE_TEXT',
    label: '町域',
  },
];

async function setupFields() {
  console.log('🚀 Kintone フィールドセットアップを開始します...\n');

  // クライアント初期化
  const client = new KintoneRestAPIClient({
    baseUrl: baseUrl,
    auth: {
      username: username,
      password: password,
    },
  });

  try {
    // 現在のアプリ設定を取得
    console.log(`📋 アプリ ${appId} の現在のフィールド設定を取得中...`);
    const { properties } = await client.app.getFormFields({ app: appId });

    // 既存のフィールドコードを取得
    const existingFieldCodes = Object.keys(properties);
    console.log(`✅ 既存フィールド数: ${existingFieldCodes.length}`);

    // 追加が必要なフィールドをチェック
    const fieldsToAdd = REQUIRED_FIELDS.filter(
      field => !existingFieldCodes.includes(field.code)
    );

    if (fieldsToAdd.length === 0) {
      console.log('\n✨ すべての必要なフィールドは既に存在しています！');
      return;
    }

    console.log(`\n📝 以下のフィールドを追加します:`);
    fieldsToAdd.forEach(field => {
      console.log(`   - ${field.label} (${field.code})`);
    });

    // 新しいフィールドを追加
    const newProperties = {};
    fieldsToAdd.forEach(field => {
      newProperties[field.code] = {
        type: field.type,
        code: field.code,
        label: field.label,
      };
    });

    console.log('\n🔧 フィールドを追加中...');
    await client.app.addFormFields({
      app: appId,
      properties: newProperties,
    });

    console.log('✅ フィールドの追加が完了しました（プレビュー環境）');

    // 設定を本番環境に反映
    console.log('\n🚀 設定を本番環境に反映中...');
    await client.app.deployApp({ apps: [{ app: appId }] });

    console.log('✅ 本番環境への反映が完了しました！');

    // デプロイの完了を待つ
    console.log('\n⏳ デプロイの完了を待機中...');
    let isDeploying = true;
    let retryCount = 0;
    const maxRetries = 30; // 最大30回（約30秒）

    while (isDeploying && retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const status = await client.app.getDeployStatus({ apps: [appId] });

      const appStatus = status.apps.find(app => app.app === appId.toString());
      if (appStatus && appStatus.status !== 'PROCESSING') {
        isDeploying = false;
        console.log('✅ デプロイが完了しました！');
      } else {
        retryCount++;
        process.stdout.write('.');
      }
    }

    if (retryCount >= maxRetries) {
      console.log('\n⚠️  デプロイの完了確認がタイムアウトしました。手動で確認してください。');
    }

    console.log('\n🎉 セットアップが正常に完了しました！');
    console.log('\n次のステップ:');
    console.log('  npm run push   # カスタマイズをアップロード');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    console.error(error.message);

    if (error.response) {
      console.error('詳細:', JSON.stringify(error.response.data, null, 2));
    }

    process.exit(1);
  }
}

// スクリプト実行
setupFields();
