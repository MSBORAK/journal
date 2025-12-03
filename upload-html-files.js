/**
 * Supabase Storage'a HTML dosyalarını doğru Content-Type ile yüklemek için script
 * 
 * Kullanım:
 * 1. Supabase CLI kurulu olmalı: npm install -g supabase
 * 2. Supabase'e login ol: supabase login
 * 3. Script'i çalıştır: node upload-html-files.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Node.js'de Blob ve File için polyfill (eğer yoksa)
if (typeof Blob === 'undefined') {
  global.Blob = require('buffer').Blob;
}
if (typeof File === 'undefined') {
  global.File = class File extends Blob {
    constructor(blobParts, name, options = {}) {
      super(blobParts, options);
      this.name = name;
      this.lastModified = Date.now();
    }
  };
}

// Supabase credentials
const supabaseUrl = 'https://jblqkhgwitktbfeppume.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibHFraGd3aXRrdGJmZXBwdW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ1MDQsImV4cCI6MjA3NTI1MDUwNH0._TnZRl3PBrP5xqZ5HyQn4p6WTAzN1DCj1IG0QuM3Nl0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function uploadHTMLFile(bucketName, fileName, filePath) {
  try {
    console.log(`\n📤 Uploading ${fileName} to ${bucketName} bucket...`);
    
    // Dosyayı oku
    const fileData = fs.readFileSync(filePath);
    
    // Önce mevcut dosyayı sil (eğer varsa)
    try {
      await supabase.storage.from(bucketName).remove([fileName]);
      console.log(`   ✓ Existing file removed`);
    } catch (removeError) {
      // Dosya yoksa hata vermez, devam et
    }
    
    // Storage'a yükle (Content-Type: text/html ile)
    // Blob oluştur ve Content-Type'ı açıkça belirt
    const blob = new Blob([fileData], { type: 'text/html; charset=utf-8' });
    const file = new File([blob], fileName, { type: 'text/html; charset=utf-8' });
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: 'text/html; charset=utf-8',
        upsert: true, // Eğer dosya varsa üzerine yaz
        cacheControl: '3600',
      });

    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error.message);
      
      // Eğer bucket yoksa bilgi ver
      if (error.message.includes('Bucket not found')) {
        console.error(`\n⚠️  Bucket "${bucketName}" bulunamadı!`);
        console.error(`   Lütfen Supabase Dashboard'da "${bucketName}" bucket'ını oluşturun:`);
        console.error(`   1. Storage → "+ New Bucket"`);
        console.error(`   2. Bucket name: ${bucketName}`);
        console.error(`   3. Public bucket: ON`);
        console.error(`   4. Create`);
      }
      return false;
    }

    console.log(`✅ ${fileName} başarıyla yüklendi!`);
    console.log(`   URL: ${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`);
    return true;
  } catch (error) {
    console.error(`❌ Unexpected error:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Storage HTML Dosya Yükleme Scripti\n');
  console.log('='.repeat(50));

  const files = [
    {
      bucket: 'auth-reset',
      fileName: 'auth-reset.html',
      filePath: path.join(__dirname, 'public', 'auth-reset.html'),
    },
    {
      bucket: 'auth-confirm',
      fileName: 'auth-confirm.html',
      filePath: path.join(__dirname, 'public', 'auth-confirm.html'),
    },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(file.filePath)) {
      console.error(`\n❌ Dosya bulunamadı: ${file.filePath}`);
      failCount++;
      continue;
    }

    const success = await uploadHTMLFile(file.bucket, file.fileName, file.filePath);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Başarılı: ${successCount}`);
  console.log(`   ❌ Başarısız: ${failCount}`);

  if (failCount > 0) {
    console.log(`\n⚠️  Bazı dosyalar yüklenemedi. Lütfen bucket'ların oluşturulduğundan emin olun.`);
  } else {
    console.log(`\n🎉 Tüm dosyalar başarıyla yüklendi!`);
  }
}

main().catch(console.error);

