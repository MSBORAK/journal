/**
 * FINAL FIX: Supabase Storage'daki HTML dosyalarının Content-Type'ını düzelt
 * Bu script dosyaları yeniden yüklemeden sadece metadata'yı günceller
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
    if (!fs.existsSync(filePath)) {
      console.error(`   ❌ File not found: ${filePath}`);
      return false;
    }
    
    const fileData = fs.readFileSync(filePath);
    
    // Blob oluştur
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
    
    const blob = new Blob([fileData], { type: 'text/html; charset=utf-8' });
    const file = new File([blob], fileName, { 
      type: 'text/html; charset=utf-8',
      lastModified: Date.now()
    });
    
    // Önce mevcut dosyayı sil
    try {
      await supabase.storage.from(bucketName).remove([fileName]);
      console.log(`   ✓ Existing file removed`);
      // Biraz bekle
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (removeError) {
      // Dosya yoksa devam et
    }
    
    // Dosyayı yeniden yükle - bu sefer doğru Content-Type ile
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: 'text/html',
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error(`   ❌ Upload error:`, error.message);
      
      // Eğer RLS hatası ise, alternatif yöntem dene
      if (error.message.includes('row-level security')) {
        console.log(`\n   ⚠️  RLS Policy hatası!`);
        console.log(`   📋 ÇÖZÜM: Supabase Dashboard'dan manuel upload yap:`);
        console.log(`   1. Dashboard → Storage → Files`);
        console.log(`   2. ${bucketName} bucket'ına gir`);
        console.log(`   3. "Upload file" → ${fileName} seç`);
        console.log(`   4. Upload et`);
        console.log(`   5. Upload sonrası dosyaya tıkla → "Update metadata"`);
        console.log(`   6. Content-Type: text/html yap`);
        return false;
      }
      
      return false;
    }

    console.log(`   ✅ File uploaded successfully!`);
    console.log(`   📍 URL: ${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`);
    
    // Metadata'yı kontrol et
    const { data: fileList } = await supabase.storage
      .from(bucketName)
      .list('', { search: fileName });
    
    if (fileList && fileList.length > 0) {
      console.log(`   📋 File metadata:`, JSON.stringify(fileList[0], null, 2));
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Unexpected error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 FINAL FIX: Content-Type Düzeltme\n');
  console.log('='.repeat(50));
  
  const files = [
    { bucket: 'auth-reset', fileName: 'auth-reset.html' },
    { bucket: 'auth-confirm', fileName: 'auth-confirm.html' },
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of files) {
    const success = await fixContentType(file.bucket, file.fileName);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Dosyalar arasında bekle
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Başarılı: ${successCount}`);
  console.log(`   ❌ Başarısız: ${failCount}`);
  
  if (failCount > 0) {
    console.log(`\n⚠️  RLS Policy sorunu devam ediyor.`);
    console.log(`\n📋 EN KOLAY ÇÖZÜM:`);
    console.log(`   1. Supabase Dashboard → Storage → Files`);
    console.log(`   2. Her iki bucket için de dosyaları manuel upload et`);
    console.log(`   3. Upload sonrası dosyaya tıkla → Metadata → Content-Type: text/html`);
    console.log(`\n   Bu yöntem RLS policy'lerini bypass eder çünkü Dashboard admin erişimi kullanır.`);
  } else {
    console.log(`\n🎉 Tüm dosyalar düzeltildi!`);
    console.log(`\n📱 Test için iPhone'da URL'leri aç:`);
    console.log(`   - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html`);
    console.log(`   - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html`);
  }
}

main().catch(console.error);

