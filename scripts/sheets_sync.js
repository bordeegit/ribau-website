import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncSheetsToCSV() {
  try {
    // Parse service account credentials from environment variable
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

    // Set up authentication
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Prodotti!A:J', // Adjust range if needed
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found in sheet');
      return;
    }

    // Convert to CSV
    const csv = rows.map(row =>
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = String(cell || '').replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      }).join(',')
    ).join('\n');

    // Ensure directory exists
    const csvDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }

    // Write CSV file
    const csvPath = path.join(csvDir, 'products.csv');
    fs.writeFileSync(csvPath, csv, 'utf8');

    console.log(`✓ Successfully synced ${rows.length - 1} products to CSV`);

    // Validate image files exist
    validateImages(rows);

  } catch (error) {
    console.error('Error syncing sheets:', error);
    process.exit(1);
  }
}

function validateImages(rows) {
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'products');

  if (!fs.existsSync(imagesDir)) {
    console.warn('⚠ Images directory does not exist:', imagesDir);
    return;
  }

  const headers = rows[0];
  const idIndex = headers.findIndex(h => h.toLowerCase() === 'id');

  if (idIndex === -1) return;

  let missingImages = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const id = rows[i][idIndex];
    if (!id) continue;

    // Check for up to 3 images
    for (let imgNum = 1; imgNum <= 3; imgNum++) {
      const imgPath = path.join(imagesDir, `${id}_${imgNum}.jpg`);
      const imgPathPng = path.join(imagesDir, `${id}_${imgNum}.png`);
      const imgPathJpeg = path.join(imagesDir, `${id}_${imgNum}.jpeg`);

      if (!fs.existsSync(imgPath) && !fs.existsSync(imgPathPng) && !fs.existsSync(imgPathJpeg)) {
        if (imgNum === 1) {
          // Only warn about missing first image (required)
          missingImages.push(`${id}_1.jpg`);
        }
      }
    }
  }

  if (missingImages.length > 0) {
    console.warn('⚠ Warning: Missing required images:');
    missingImages.forEach(img => console.warn(`  - ${img}`));
  }
}

syncSheetsToCSV();
