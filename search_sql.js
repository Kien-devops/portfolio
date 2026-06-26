const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'portfolio.sql');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('INSERT INTO [dbo].[blogs]')) {
    console.log(`Line ${index + 1}: ${line.slice(0, 100)}...`);
  }
});
