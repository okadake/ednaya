import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.CI !== 'true') {
  dotenv.config({ path: path.join(__dirname, '../.env.local') });
}

const categoryMapping = {
  places: ['Landmark', 'Mountain', 'Street', 'Building', 'Nature', 'Landscape', 'Coast', 'Water', 'Sky', 'Field', 'Forest', 'Beach', 'Desert', 'Hill', 'Valley', 'Canyon', 'River', 'Lake', 'Ocean', 'Sea', 'Waterfall', 'Urban', 'Metropolitan area', 'Downtown', 'Architecture', 'Town', 'City'],
  people: ['Person', 'Face', 'Portrait', 'Head', 'Eye', 'Smile', 'Expression', 'Emotion', 'Human', 'Man', 'Woman', 'Child', 'Group', 'Family', 'Crowd', 'people'],
  food: ['Food', 'Dish', 'Meal', 'Cuisine', 'Drink', 'Beverage', 'Fruit', 'Vegetable', 'Bread', 'Meat', 'Fish', 'Dessert', 'Cake', 'Cookie', 'Restaurant', 'Table', 'Dinner', 'Lunch', 'Breakfast', 'Brunch'],
  dailyLife: ['Indoor', 'Room', 'Home', 'Furniture', 'Flower', 'Plant', 'Pet', 'Dog', 'Cat', 'Bird', 'Art', 'Painting', 'Sculpture', 'Music', 'Instrument', 'Book', 'Sport', 'Recreation', 'Play', 'Clothing', 'Fashion', 'Toy', 'Chair', 'Bed', 'Window', 'Door']
};

function categorizeImage(labels) {
  const labelNames = labels.map(l => l.description.toLowerCase());
  let scores = { 'Places': 0, 'Daily Life': 0, 'People': 0, 'Food': 0 };

  labelNames.forEach(label => {
    if (categoryMapping.places.some(cat => label.includes(cat.toLowerCase()))) scores['Places']++;
    if (categoryMapping.people.some(cat => label.includes(cat.toLowerCase()))) scores['People']++;
    if (categoryMapping.food.some(cat => label.includes(cat.toLowerCase()))) scores['Food']++;
    if (categoryMapping.dailyLife.some(cat => label.includes(cat.toLowerCase()))) scores['Daily Life']++;
  });

  let maxScore = Math.max(...Object.values(scores));
  return maxScore === 0 ? 'Places' : Object.keys(scores).find(key => scores[key] === maxScore);
}

function generateCaption(labels) {
  const topLabels = labels.slice(0, 5).map(l => l.description);
  const labelJa = {
    'Landscape': '風景', 'Nature': '自然', 'Street': '街', 'Building': '建物', 'Person': '人物',
    'Portrait': 'ポートレート', 'Food': '食べ物', 'Dish': '料理', 'Plant': '植物', 'Flower': '花',
    'Indoor': '室内', 'Outdoor': '屋外', 'Art': 'アート', 'Sunset': '夕焼け', 'Sky': '空',
    'Water': '水', 'Mountain': '山', 'Beach': 'ビーチ', 'Forest': '森', 'River': '川',
    'City': '都市', 'Village': '村', 'Road': '道', 'Path': '道', 'Tree': '木',
    'Cloud': '雲', 'Ocean': '海', 'Island': '島', 'Landmark': 'ランドマーク', 'Architecture': '建築',
    'Coast': '海岸', 'Urban': '都市', 'Downtown': 'ダウンタウン', 'Metropolitan area': '都会', 'Face': '顔',
    'Head': '頭', 'Smile': '笑顔', 'Meal': '食事', 'Cuisine': '料理', 'Drink': '飲み物',
    'Beverage': '飲料', 'Fruit': 'フルーツ', 'Vegetable': '野菜', 'Bread': 'パン', 'Meat': '肉',
    'Fish': '魚', 'Dessert': 'デザート', 'Cake': 'ケーキ', 'Cookie': 'クッキー', 'Restaurant': 'レストラン',
    'Table': 'テーブル', 'Dinner': 'ディナー', 'Lunch': 'ランチ', 'Breakfast': '朝食', 'Brunch': 'ブランチ',
    'Room': '部屋', 'Home': '家', 'Furniture': '家具', 'Pet': 'ペット', 'Dog': '犬',
    'Cat': '猫', 'Bird': '鳥', 'Painting': '絵画', 'Sculpture': '彫刻', 'Music': '音楽',
    'Instrument': '楽器', 'Book': '本', 'Sport': 'スポーツ', 'Recreation': 'レクリエーション', 'Play': '遊び',
    'Clothing': '衣類', 'Fashion': 'ファッション', 'Toy': 'おもちゃ', 'Chair': 'イス', 'Bed': 'ベッド',
    'Window': '窓', 'Door': 'ドア'
  };
  const translated = topLabels.map(label => labelJa[label] || label).join(', ');
  return translated || '写真';
}

function extractFilename(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  return pathname.split('/').pop();
}

async function analyzeImage(url) {
  try {
    console.log(`  Analyzing: ${url}`);
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const request = {
      requests: [{
        image: { source: { imageUri: url } },
        features: [{ type: 'LABEL_DETECTION', maxResults: 10 }]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data.responses[0];

    if (result.error) throw new Error(result.error.message);

    const labels = result.labelAnnotations || [];
    const category = categorizeImage(labels);
    const caption = generateCaption(labels);
    const filename = extractFilename(url);

    console.log(`    ✓ ${filename} → ${caption} / ${category}`);
    return { filename, caption, categories: [category], imageUrl: url };
  } catch (error) {
    console.error(`    ✗ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  const urlsFile = path.join(__dirname, '../gallery-urls.txt');
  const jsonPath = path.join(__dirname, '../src/data/keizo-gallery.json');
  const csvPath = path.join(__dirname, '../keizo-gallery.csv');

  if (!fs.existsSync(urlsFile)) {
    console.error(`Error: ${urlsFile} not found`);
    console.error('Usage: Add URLs to gallery-urls.txt (- prefix to delete, + prefix for new)');
    process.exit(1);
  }

  // バックアップを作成（失敗時復元用）
  const timestamp = new Date().toISOString().split('T')[0];
  const jsonBackup = `${jsonPath}.${timestamp}.bak`;
  const csvBackup = `${csvPath}.${timestamp}.bak`;
  if (fs.existsSync(jsonPath)) fs.copyFileSync(jsonPath, jsonBackup);
  if (fs.existsSync(csvPath)) fs.copyFileSync(csvPath, csvBackup);

  const content = fs.readFileSync(urlsFile, 'utf-8');
  const allUrls = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && (l.startsWith('http') || l.startsWith('/') || fs.existsSync(l)));

  // 実行前のアイテム数を記録（バリデーション用）
  let itemsBeforeCount = 0;
  if (fs.existsSync(jsonPath)) {
    const beforeItems = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    itemsBeforeCount = beforeItems.length;
  }

  // 重複チェック
  const seen = new Set();
  const duplicates = [];
  const currentUrls = [];

  for (const url of allUrls) {
    if (seen.has(url)) {
      duplicates.push(url);
    } else {
      seen.add(url);
      currentUrls.push(url);
    }
  }

  if (duplicates.length > 0) {
    console.log(`⚠ Found ${duplicates.length} duplicate URL(s):`);
    duplicates.forEach(url => console.log(`  - ${url}`));
    console.log('Removing duplicates...\n');
  }

  // JSON をロード（既分析画像を取得）
  let items = [];
  let existingUrls = [];

  if (fs.existsSync(jsonPath)) {
    items = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    existingUrls = items.map(item => item.imageUrl);
    console.log(`Found ${existingUrls.length} existing URLs in JSON`);
  }

  // 削除された URL（既存にあるが、currentUrls にない）を削除
  const deletedUrls = existingUrls.filter(url => !currentUrls.includes(url));
  if (deletedUrls.length > 0) {
    console.log(`\nRemoving ${deletedUrls.length} image(s)...\n`);
    items = items.filter(item => !deletedUrls.includes(item.imageUrl));
  }

  // 新規 URL（currentUrls にあるが、既存にない）を分析
  const newUrls = currentUrls.filter(url => !existingUrls.includes(url));

  if (newUrls.length === 0 && deletedUrls.length === 0) {
    console.log('No changes.');
    process.exit(0);
  }

  if (!process.env.GOOGLE_CLOUD_API_KEY) {
    console.error('Error: GOOGLE_CLOUD_API_KEY environment variable is not set');
    process.exit(1);
  }

  // 新規画像を分析して既存アイテムに追加
  if (newUrls.length > 0) {
    console.log(`\nProcessing ${newUrls.length} new image(s)...\n`);

    for (const url of newUrls) {
      const item = await analyzeImage(url);
      if (item) items.push(item);
    }
  }

  // gallery-urls.txt にないアイテムを削除
  items = items.filter(item => currentUrls.includes(item.imageUrl));

  if (items.length === 0) {
    console.error('No images in gallery.');
    process.exit(1);
  }

  // CSV を生成
  const csvRecords = items.map(item => ({
    filename: item.filename,
    caption: item.caption,
    categories: Array.isArray(item.categories) ? item.categories.join(';') : item.categories,
    imageUrl: item.imageUrl
  }));
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'filename', title: 'Filename' },
      { id: 'caption', title: 'Caption' },
      { id: 'categories', title: 'Categories' },
      { id: 'imageUrl', title: 'Image' }
    ]
  });

  await csvWriter.writeRecords(csvRecords);
  console.log(`\n✓ CSV generated: ${csvPath}\n`);

  // JSON を生成
  const jsonDir = path.dirname(jsonPath);
  if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
  }

  const jsonItems = items.map((item, index) => ({
    ...item,
    order: index + 1
  }));

  fs.writeFileSync(jsonPath, JSON.stringify(jsonItems, null, 2));
  console.log(`✓ JSON generated: ${jsonPath}`);
  console.log(`✓ Total items: ${jsonItems.length}`);

  // バリデーション：不審な削減がないか確認
  if (itemsBeforeCount > 0 && jsonItems.length < itemsBeforeCount * 0.8) {
    console.warn(`\n⚠ WARNING: Item count dropped significantly!`);
    console.warn(`  Before: ${itemsBeforeCount}, After: ${jsonItems.length}`);
    console.warn(`  Backup saved to: ${jsonBackup}`);
    console.error('Error: Data loss detected. Please review before deploying.');
    process.exit(1);
  }

  console.log(`\nNext: npm run build-deploy`);
}

main().catch(error => {
  console.error('Error:', error.message);
  console.error(`Backup available at: ${jsonBackup}`);
  process.exit(1);
});
