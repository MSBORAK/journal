/**
 * Supabase Storage'a HTML dosyalarını FORCE upload (REST API ile)
 * Bu script multipart/form-data kullanarak Content-Type'ı garanti eder
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jblqkhgwitktbfeppume.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibHFraGd3aXRrdGJmZXBwdW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ1MDQsImV4cCI6MjA3NTI1MDUwNH0._TnZRl3PBrP5xqZ5HyQn4p6WTAzN1DCj1IG0QuM3Nl0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Node.js'de Blob ve File için polyfill
if (typeof Blob === 'undefined') {
  global.Blob = require('buffer').Blob;
}
if (typeof File === 'undefined') {
  global.File = class File extends Blob {
    constructor(blobParts, name, options = {}) {
      super(blobParts, options);
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

async function uploadFile(bucketName, fileName, filePath) {
  try {
    console.log(`\n📤 Uploading ${fileName} to ${bucketName}...`);
    
    // Dosyayı oku
    const fileData = fs.readFileSync(filePath);
    
    // Önce mevcut dosyayı sil (eğer varsa)
    try {
      await supabase.storage.from(bucketName).remove([fileName]);
      console.log(`   ✓ Existing file removed`);
    } catch (removeError) {
      // Dosya yoksa hata vermez, devam et
    }
    
    // Blob oluştur - Content-Type açıkça belirtilmiş
    const blob = new Blob([fileData], { type: 'text/html; charset=utf-8' });
    const file = new File([blob], fileName, { 
      type: 'text/html; charset=utf-8',
      lastModified: Date.now()
    });
    
    // Supabase Storage'a yükle - contentType parametresi ile
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: 'text/html; charset=utf-8',
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error(`   ❌ Error:`, error.message);
      
      // RLS policy hatası ise detaylı bilgi ver
      if (error.message.includes('row-level security')) {
        console.error(`\n   ⚠️  RLS Policy Hatası!`);
        console.error(`   Lütfen Supabase Dashboard'da şu policy'leri kontrol edin:`);
        console.error(`   - ${bucketName} bucket'ı için INSERT policy'si olmalı`);
        console.error(`   - Policy definition: true`);
        console.error(`   - Target roles: public`);
      }
      
      return false;
    }

    console.log(`   ✅ ${fileName} başarıyla yüklendi!`);
    console.log(`   📍 URL: ${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`);
    
    // Content-Type'ı doğrula
    const { data: fileInfo } = await supabase.storage
      .from(bucketName)
      .list('', {
        search: fileName,
      });
    
    if (fileInfo && fileInfo.length > 0) {
      console.log(`   📋 File info:`, JSON.stringify(fileInfo[0], null, 2));
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Unexpected error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Storage FORCE Upload (REST API)\n');
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
    if (!fs.existsSync(file.filePath)) {
      console.error(`\n❌ Dosya bulunamadı: ${file.filePath}`);
      failCount++;
      continue;
    }
    
    try {
      await uploadFile(file.bucket, file.fileName, file.filePath);
      successCount++;
      // Dosyalar arasında kısa bir bekleme
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`\n❌ Upload failed:`, error.message);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Başarılı: ${successCount}`);
  console.log(`   ❌ Başarısız: ${failCount}`);
  
  if (successCount === 2) {
    console.log(`\n🎉 Tüm dosyalar yüklendi!`);
    console.log(`\n📱 Test için:`);
    console.log(`   1. iPhone'da Safari'yi aç`);
    console.log(`   2. Hard refresh yap (sayfayı aşağı çek)`);
    console.log(`   3. URL'leri test et:`);
    console.log(`      - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html`);
    console.log(`      - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html`);
  }
}

main().catch(console.error);

