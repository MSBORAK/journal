/**
 * Supabase Storage'daki HTML dosyalarının Content-Type'ını düzeltmek için script
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://jblqkhgwitktbfeppume.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibHFraGd3aXRrdGJmZXBwdW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzQ1MDQsImV4cCI6MjA3NTI1MDUwNH0._TnZRl3PBrP5xqZ5HyQn4p6WTAzN1DCj1IG0QuM3Nl0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixContentType(bucketName, fileName) {
  try {
    console.log(`\n🔧 Fixing Content-Type for ${bucketName}/${fileName}...`);
    
    // Dosyayı oku
    const filePath = `public/${fileName}`;
    const fileData = fs.readFileSync(filePath);
    
    // Blob oluştur (doğru Content-Type ile)
    const blob = new Blob([fileData], { type: 'text/html; charset=utf-8' });
    const file = new File([blob], fileName, { type: 'text/html; charset=utf-8' });
    
    // Önce mevcut dosyayı sil
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);
    
    if (deleteError && !deleteError.message.includes('not found')) {
      console.warn(`   ⚠️  Delete warning:`, deleteError.message);
    } else {
      console.log(`   ✓ Existing file removed`);
    }
    
    // Dosyayı yeniden yükle (doğru Content-Type ile)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: 'text/html; charset=utf-8',
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error(`   ❌ Error:`, error.message);
      return false;
    }

    console.log(`   ✅ File uploaded with correct Content-Type!`);
    console.log(`   📍 URL: ${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Unexpected error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Storage Content-Type Fix Script\n');
  console.log('='.repeat(50));

  const files = [
    { bucket: 'auth-reset', fileName: 'auth-reset.html' },
    { bucket: 'auth-confirm', fileName: 'auth-confirm.html' },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    // Node.js'de Blob ve File için polyfill
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

    const success = await fixContentType(file.bucket, file.fileName);
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

  if (successCount === 2) {
    console.log(`\n🎉 Tüm dosyalar doğru Content-Type ile yüklendi!`);
    console.log(`\n📋 Test için:`);
    console.log(`   1. Hard refresh yap (Cmd+Shift+R)`);
    console.log(`   2. URL'leri aç:`);
    console.log(`      - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html`);
    console.log(`      - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html`);
  }
}

main().catch(console.error);

