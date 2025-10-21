#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Tüm ekran dosyalarını bul
const screensDir = path.join(__dirname, '../src/screens');
const screenFiles = fs.readdirSync(screensDir).filter(file => file.endsWith('.tsx'));

console.log(`Found ${screenFiles.length} screen files`);

// Her ekran dosyası için çok dilli destek ekle
screenFiles.forEach(file => {
  const filePath = path.join(screensDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // useLanguage import'u ekle
  if (content.includes('useTheme') && !content.includes('useLanguage')) {
    content = content.replace(
      /import { useTheme } from '\.\.\/contexts\/ThemeContext';/,
      `import { useTheme } from '../contexts/ThemeContext';\nimport { useLanguage } from '../contexts/LanguageContext';`
    );
  }
  
  // useLanguage hook'unu ekle
  if (content.includes('const { currentTheme } = useTheme();') && !content.includes('const { t } = useLanguage();')) {
    content = content.replace(
      /const { currentTheme } = useTheme\(\);/,
      `const { currentTheme } = useTheme();\n  const { t } = useLanguage();`
    );
  }
  
  // Dosyayı kaydet
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${file}`);
});

console.log('🎉 All screens updated with multilingual support!');
