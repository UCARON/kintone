/**
 * APIトークンの動作確認スクリプト
 */

const { KintoneRestAPIClient } = require('@kintone/rest-api-client');
require('dotenv').config();

const baseUrl = process.env.KINTONE_BASE_URL;
const apiToken = process.env.KINTONE_API_TOKEN;
const appId = process.env.KINTONE_APP_ID;

console.log('🔍 デバッグ情報:');
console.log(`Base URL: ${baseUrl}`);
console.log(`API Token: ${apiToken ? apiToken.substring(0, 10) + '...' : 'なし'}`);
console.log(`App ID: ${appId}`);
console.log('');

async function debugToken() {
  const client = new KintoneRestAPIClient({
    baseUrl: baseUrl,
    auth: {
      apiToken: apiToken,
    },
  });

  try {
    // まずレコード取得を試す（読み取り権限のテスト）
    console.log('📖 レコード読み取りテスト...');
    const records = await client.record.getRecords({ app: appId, query: 'limit 1' });
    console.log('✅ レコード読み取り成功！');
    console.log(`   レコード数: ${records.records.length}`);
    console.log('');

    // フィールド設定取得を試す
    console.log('📋 フィールド設定取得テスト...');
    const { properties } = await client.app.getFormFields({ app: appId });
    console.log('✅ フィールド設定取得成功！');
    console.log(`   既存フィールド: ${Object.keys(properties).join(', ')}`);
    console.log('');

    console.log('🎉 APIトークンは正常に動作しています！');
    console.log('⚠️  しかし、フィールド追加には「アプリ管理」権限が必要です。');
    console.log('');
    console.log('確認事項:');
    console.log('1. APIトークンに「アプリ管理」権限がチェックされているか');
    console.log('2. 「保存」→「アプリを更新」を実行したか');
    console.log('3. アプリ更新が完了したか（処理中でないか）');

  } catch (error) {
    console.error('❌ エラー:', error.message);
    if (error.response) {
      console.error('詳細:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugToken();
