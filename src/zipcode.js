/**
 * Kintone 郵便番号検索カスタマイズ
 * 郵便番号を入力すると自動的に住所を検索して入力します
 */

(function() {
  'use strict';

  // 郵便番号APIのエンドポイント
  const ZIPCODE_API_URL = 'https://zipcloud.ibsnet.co.jp/api/search';

  /**
   * 郵便番号から住所を検索
   * @param {string} zipcode - 郵便番号（ハイフンあり・なし両対応）
   * @returns {Promise<Object>} 住所情報
   */
  async function searchAddress(zipcode) {
    // ハイフンを削除
    const cleanZipcode = zipcode.replace(/-/g, '');

    if (cleanZipcode.length !== 7) {
      throw new Error('郵便番号は7桁で入力してください');
    }

    const url = `${ZIPCODE_API_URL}?zipcode=${cleanZipcode}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 200 || !data.results) {
        throw new Error('住所が見つかりませんでした');
      }

      return data.results[0];
    } catch (error) {
      console.error('郵便番号検索エラー:', error);
      throw error;
    }
  }

  /**
   * レコード詳細画面の表示イベント
   */
  kintone.events.on(['app.record.detail.show', 'app.record.edit.show', 'app.record.create.show'], function(event) {
    const record = event.record;

    // 郵便番号フィールド（フィールドコードは環境に合わせて変更してください）
    const zipcodeFieldCode = '郵便番号';
    const prefectureFieldCode = '都道府県';
    const cityFieldCode = '市区町村';
    const addressFieldCode = '町域';

    // 郵便番号フィールドの要素を取得
    const zipcodeElement = kintone.app.record.getFieldElement(zipcodeFieldCode);

    if (zipcodeElement) {
      // 検索ボタンを追加
      const searchButton = document.createElement('button');
      searchButton.textContent = '住所検索';
      searchButton.className = 'zipcode-search-btn';
      searchButton.type = 'button';

      // ボタンのクリックイベント
      searchButton.addEventListener('click', async function() {
        const zipcode = record[zipcodeFieldCode].value;

        if (!zipcode) {
          alert('郵便番号を入力してください');
          return;
        }

        try {
          searchButton.disabled = true;
          searchButton.textContent = '検索中...';

          const result = await searchAddress(zipcode);

          // 住所をフィールドに設定
          if (prefectureFieldCode && record[prefectureFieldCode]) {
            record[prefectureFieldCode].value = result.address1 || '';
          }
          if (cityFieldCode && record[cityFieldCode]) {
            record[cityFieldCode].value = result.address2 || '';
          }
          if (addressFieldCode && record[addressFieldCode]) {
            record[addressFieldCode].value = result.address3 || '';
          }

          // レコードを更新
          kintone.app.record.set(event);

          alert('住所を入力しました');
        } catch (error) {
          alert('住所の取得に失敗しました: ' + error.message);
        } finally {
          searchButton.disabled = false;
          searchButton.textContent = '住所検索';
        }
      });

      // ボタンを郵便番号フィールドの横に追加
      zipcodeElement.appendChild(searchButton);
    }

    return event;
  });

})();
