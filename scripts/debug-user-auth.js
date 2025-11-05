/**
 * ユーザー認証のデバッグスクリプト
 */

const { KintoneRestAPIClient } = require('@kintone/rest-api-client');
require('dotenv').config();

const baseUrl = process.env.KINTONE_BASE_URL;
const username = process.env.KINTONE_USERNAME;
const password = process.env.KINTONE_PASSWORD;
const appId = process.env.KINTONE_APP_ID;

console.log('🔍 デバッグ情報:');
console.log(`Base URL: ${baseUrl}`);
console.log(`Username: ${username}`);
console.log(`Password: ${password ? '***' + password.substring(password.length - 3) : 'なし'}`);
console.log(`App ID: ${appId}`);
console.log('');

async function debugAuth() {
  const client = new KintoneRestAPIClient({
    baseUrl: baseUrl,
    auth: {
      username: username,
      password: password,
    },
  });

  try {
    console.log('📖 テスト1: レコード読み取り...');
    const records = await client.record.getRecords({
      app: appId,
      query: 'limit 1'
    });
    console.log('✅ レコード読み取り成功！');
    console.log(`   レコード数: ${records.records.length}`);
    console.log('');
  } catch (error) {
    console.error('❌ レコード読み取り失敗:', error.message);
    if (error.response?.data) {
      console.error('   詳細:', error.response.data);
    }
    console.log('');
  }

  try {
    console.log('📋 テスト2: フィールド設定取得（プレビュー）...');
    const { properties } = await client.app.getFormFields({ app: appId, preview: true });
    console.log('✅ フィールド設定取得成功！');
    console.log(`   既存フィールド: ${Object.keys(properties).join(', ')}`);
    console.log('');
  } catch (error) {
    console.error('❌ フィールド設定取得失敗:', error.message);
    if (error.response?.data) {
      console.error('   詳細:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
  }

  try {
    console.log('🔐 テスト3: アプリ情報取得...');
    const appInfo = await client.app.getApp({ id: appId });
    console.log('✅ アプリ情報取得成功！');
    console.log(`   アプリ名: ${appInfo.name}`);
    console.log(`   スペースID: ${appInfo.spaceId || 'なし（通常アプリ）'}`);
    console.log('');
  } catch (error) {
    console.error('❌ アプリ情報取得失敗:', error.message);
    if (error.response?.data) {
      console.error('   詳細:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
  }

  console.log('💡 考えられる原因:');
  console.log('1. ユーザーがアプリの管理者ではない');
  console.log('2. パスワード認証が無効になっている（SSOのみ）');
  console.log('3. IPアドレス制限がかかっている');
  console.log('4. ゲストスペースのアプリ（特別なURL必要）');
}

debugAuth();
