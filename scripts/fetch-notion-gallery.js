import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local を読み込む
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = '3806ec5bf404805f85cfe914b07c06ea';

function makeNotionRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.notion.com',
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function fetchGalleryData() {
  try {
    console.log('Fetching data from Notion Database...');

    const response = await makeNotionRequest(
      `/v1/databases/${DATABASE_ID}/query`,
      'POST',
      { page_size: 100 }
    );

    if (response.status !== 200) {
      throw new Error(
        `Notion API error: ${response.status} - ${JSON.stringify(response.data)}`
      );
    }

    const galleryItems = response.data.results
      .filter(page => page.properties.Image?.files?.length > 0)
      .map(page => {
        const props = page.properties;

        let imageUrl = '';
        let filename = '';
        if (props.Image?.files?.length > 0) {
          const file = props.Image.files[0];
          imageUrl = file.type === 'external'
            ? file.external.url
            : file.file.url;
          filename = file.name || '';
        }

        return {
          filename: filename,
          caption: props.Caption?.rich_text[0]?.plain_text || '',
          order: props.Order?.number || 999,
          category: props['選択']?.select?.name || '',
          imageUrl: imageUrl,
        };
      })
      .sort((a, b) => a.order - b.order);

    return galleryItems;
  } catch (error) {
    console.error('Error fetching Notion data:', error.message);
    process.exit(1);
  }
}

async function main() {
  if (!NOTION_API_KEY) {
    console.error('Error: NOTION_API_KEY environment variable is not set');
    process.exit(1);
  }

  const galleryData = await fetchGalleryData();
  const outputPath = path.join(__dirname, '../src/data/keizo-gallery.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(galleryData, null, 2));
  console.log(`✓ Generated ${outputPath} with ${galleryData.length} items`);
}

main();
