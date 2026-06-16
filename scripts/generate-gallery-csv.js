import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
if (process.env.CI !== 'true') {
  dotenv.config({ path: path.join(__dirname, '../.env.local') });
}

// Category mapping from Vision API labels
const categoryMapping = {
  places: ['Landmark', 'Mountain', 'Street', 'Building', 'Nature', 'Landscape', 'Coast', 'Water', 'Sky', 'Field', 'Forest', 'Beach', 'Desert', 'Hill', 'Valley', 'Canyon', 'River', 'Lake', 'Ocean', 'Sea', 'Waterfall', 'Urban', 'Metropolitan area', 'Downtown', 'Architecture', 'Town', 'City'],
  people: ['Person', 'Face', 'Portrait', 'Head', 'Eye', 'Smile', 'Expression', 'Emotion', 'Human', 'Man', 'Woman', 'Child', 'Group', 'Family', 'Crowd', 'people'],
  food: ['Food', 'Dish', 'Meal', 'Cuisine', 'Drink', 'Beverage', 'Fruit', 'Vegetable', 'Bread', 'Meat', 'Fish', 'Dessert', 'Cake', 'Cookie', 'Restaurant', 'Table', 'Dinner', 'Lunch', 'Breakfast', 'Brunch'],
  dailyLife: ['Indoor', 'Room', 'Home', 'Furniture', 'Flower', 'Plant', 'Pet', 'Dog', 'Cat', 'Bird', 'Art', 'Painting', 'Sculpture', 'Music', 'Instrument', 'Book', 'Sport', 'Recreation', 'Play', 'Clothing', 'Fashion', 'Toy', 'Chair', 'Bed', 'Window', 'Door']
};

function categorizeImage(labels) {
  const labelNames = labels.map(l => l.description.toLowerCase());

  let scores = {
    'Places': 0,
    'Daily Life': 0,
    'People': 0,
    'Food': 0
  };

  labelNames.forEach(label => {
    if (categoryMapping.places.some(cat => label.includes(cat.toLowerCase()))) {
      scores['Places']++;
    }
    if (categoryMapping.people.some(cat => label.includes(cat.toLowerCase()))) {
      scores['People']++;
    }
    if (categoryMapping.food.some(cat => label.includes(cat.toLowerCase()))) {
      scores['Food']++;
    }
    if (categoryMapping.dailyLife.some(cat => label.includes(cat.toLowerCase()))) {
      scores['Daily Life']++;
    }
  });

  let maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    return 'Places'; // default
  }

  return Object.keys(scores).find(key => scores[key] === maxScore);
}

function generateCaption(labels) {
  // Top 3-5 labels を使用してキャプション生成
  const topLabels = labels.slice(0, 5).map(l => l.description);

  const labelJa = {
    'Landscape': '風景',
    'Nature': '自然',
    'Street': '街',
    'Building': '建物',
    'Person': '人物',
    'Portrait': 'ポートレート',
    'Food': '食べ物',
    'Dish': '料理',
    'Plant': '植物',
    'Flower': '花',
    'Indoor': '室内',
    'Outdoor': '屋外',
    'Art': 'アート',
    'Sunset': '夕焼け',
    'Sky': '空',
    'Water': '水',
    'Mountain': '山',
    'Beach': 'ビーチ',
    'Forest': '森',
    'River': '川',
    'City': '都市',
    'Village': '村',
    'Road': '道',
    'Path': '道',
    'Tree': '木',
    'Cloud': '雲',
    'Ocean': '海',
    'Island': '島',
    'Landmark': 'ランドマーク',
    'Architecture': '建築',
    'Coast': '海岸',
    'Urban': '都市',
    'Downtown': 'ダウンタウン',
    'Metropolitan area': '都会',
    'Face': '顔',
    'Head': '頭',
    'Smile': '笑顔',
    'Meal': '食事',
    'Cuisine': '料理',
    'Drink': '飲み物',
    'Beverage': '飲料',
    'Fruit': 'フルーツ',
    'Vegetable': '野菜',
    'Bread': 'パン',
    'Meat': '肉',
    'Fish': '魚',
    'Dessert': 'デザート',
    'Cake': 'ケーキ',
    'Cookie': 'クッキー',
    'Restaurant': 'レストラン',
    'Table': 'テーブル',
    'Dinner': 'ディナー',
    'Lunch': 'ランチ',
    'Breakfast': '朝食',
    'Brunch': 'ブランチ',
    'Room': '部屋',
    'Home': '家',
    'Furniture': '家具',
    'Pet': 'ペット',
    'Dog': '犬',
    'Cat': '猫',
    'Bird': '鳥',
    'Painting': '絵画',
    'Sculpture': '彫刻',
    'Music': '音楽',
    'Instrument': '楽器',
    'Book': '本',
    'Sport': 'スポーツ',
    'Recreation': 'レクリエーション',
    'Play': '遊び',
    'Clothing': '衣類',
    'Fashion': 'ファッション',
    'Toy': 'おもちゃ',
    'Chair': 'イス',
    'Bed': 'ベッド',
    'Window': '窓',
    'Door': 'ドア'
  };

  const translated = topLabels.map(label => labelJa[label] || label).join(', ');
  return translated || '写真';
}

function extractFilename(url) {
  // Extract filename from URL, handling query parameters
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const filename = pathname.split('/').pop();
  return filename;
}

async function analyzeImage(url) {
  try {
    console.log(`Analyzing: ${url}`);

    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const request = {
      requests: [
        {
          image: {
            source: {
              imageUri: url
            }
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10
            }
          ]
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data.responses[0];

    if (result.error) {
      throw new Error(result.error.message);
    }

    const labels = result.labelAnnotations || [];
    if (labels.length === 0) {
      console.warn(`  No labels detected for ${url}`);
    }

    const category = categorizeImage(labels);
    const caption = generateCaption(labels);
    const filename = extractFilename(url);

    console.log(`  ✓ ${filename}`);
    console.log(`    Caption: ${caption}`);
    console.log(`    Category: ${category}`);

    return {
      filename,
      caption,
      category,
      imageUrl: url
    };
  } catch (error) {
    console.error(`  ✗ Error analyzing ${url}:`, error.message);
    return null;
  }
}

async function main() {
  const urls = process.argv.slice(2);

  if (urls.length === 0) {
    console.error('Usage: npm run generate-gallery-csv -- <url1> <url2> <url3> ...');
    console.error('Example: npm run generate-gallery-csv -- "https://example.com/image1.jpg" "https://example.com/image2.jpg"');
    process.exit(1);
  }

  if (!process.env.GOOGLE_CLOUD_API_KEY) {
    console.error('Error: GOOGLE_CLOUD_API_KEY environment variable is not set');
    process.exit(1);
  }

  console.log(`Processing ${urls.length} image(s)...\n`);

  const items = [];

  for (const url of urls) {
    const item = await analyzeImage(url);
    if (item) {
      items.push(item);
    }
  }

  if (items.length === 0) {
    console.error('No images were successfully analyzed.');
    process.exit(1);
  }

  // Output CSV
  const csvPath = path.join(__dirname, '../keizo-gallery.csv');
  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'filename', title: 'Filename' },
      { id: 'caption', title: 'Caption' },
      { id: 'category', title: '選択' },
      { id: 'imageUrl', title: 'Image' }
    ]
  });

  await csvWriter.writeRecords(items);
  console.log(`\n✓ CSV generated: ${csvPath}`);
  console.log(`Total items: ${items.length}`);
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
