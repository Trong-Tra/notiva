const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'AppContext.js');
const marker = '    // CLEAR-DATA-MARKER';
const clearLine = '    await storage.clearAll(); // CLEAR-DATA-MARKER';

function addClear() {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(clearLine)) {
    console.log('🗑️  Data wipe is already queued. Reload the app in Expo Go to wipe.');
    return;
  }
  content = content.replace(
    /const loadData = async \(\) => \{/,
    `const loadData = async () => {\n${clearLine}`
  );
  fs.writeFileSync(filePath, content);
  console.log('🗑️  Data wipe queued!');
  console.log('👉 Reload the app in Expo Go (shake → Reload, or pull down).');
  console.log('👉 After you see onboarding, run: node clear-data.js --restore');
}

function removeClear() {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(clearLine)) {
    console.log('✅ Nothing to restore. App is already in normal mode.');
    return;
  }
  content = content.replace(clearLine + '\n', '');
  fs.writeFileSync(filePath, content);
  console.log('✅ Restore complete. App will now save data normally.');
}

const arg = process.argv[2];
if (arg === '--restore') {
  removeClear();
} else {
  addClear();
}
