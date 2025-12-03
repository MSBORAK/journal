/**
 * Service Role Key ile Supabase Storage'a HTML dosyalarını yükle
 * ⚠️ UYARI: Service Role Key RLS policy'lerini bypass eder - sadece bir kere çalıştırılmalı!
 * 
 * Service Role Key'i Supabase Dashboard'dan al:
 * Settings → API → service_role key (secret)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jblqkhgwitktbfeppume.supabase.co';

// ⚠️ SERVICE ROLE KEY - Supabase Dashboard → Settings → API → service_role key
// Bu key'i buraya yapıştır:
const serviceRoleKey = 'YOUR_SERVICE_ROLE_KEY_HERE';

if (serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('❌ HATA: Service Role Key girmelisiniz!');
  console.error('📋 Adımlar:');
  console.error('   1. Supabase Dashboard → Settings → API');
  console.error('   2. "service_role" key\'i kopyala (secret)');
  console.error('   3. Bu script\'teki serviceRoleKey değişkenine yapıştır');
  process.exit(1);
}

// Service Role Key ile Supabase client oluştur (RLS bypass)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    
    if (!fs.existsSync(filePath)) {
      console.error(`   ❌ File not found: ${filePath}`);
      return false;
    }
    
    // Dosyayı oku
    const fileData = fs.readFileSync(filePath);
    
    // Blob ve File oluştur - Content-Type açıkça belirtilmiş
    const blob = new Blob([fileData], { type: 'text/html; charset=utf-8' });
    const file = new File([blob], fileName, { 
      type: 'text/html; charset=utf-8',
      lastModified: Date.now()
    });
    
    // Önce mevcut dosyayı sil (eğer varsa)
    try {
      await supabase.storage.from(bucketName).remove([fileName]);
      console.log(`   ✓ Existing file removed`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (removeError) {
      // Dosya yoksa devam et
    }
    
    // Dosyayı yükle - Content-Type açıkça belirtilmiş
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: 'text/html; charset=utf-8', // Kritik nokta
        upsert: true,
        cacheControl: '3600',
      });

    if (error) {
      console.error(`   ❌ Upload error:`, error.message);
      return false;
    }

    console.log(`   ✅ ${fileName} başarıyla yüklendi!`);
    console.log(`   📍 URL: ${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`);
    
    // Metadata'yı kontrol et
    const { data: fileList, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { search: fileName });
    
    if (!listError && fileList && fileList.length > 0) {
      console.log(`   📋 File metadata:`);
      console.log(`      - Name: ${fileList[0].name}`);
      console.log(`      - Size: ${fileList[0].metadata?.size || 'N/A'} bytes`);
      console.log(`      - Content-Type: ${fileList[0].metadata?.mimetype || fileList[0].metadata?.contentType || 'N/A'}`);
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Unexpected error:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Service Role Key ile HTML Dosya Yükleme\n');
  console.log('='.repeat(50));
  console.log('⚠️  UYARI: Service Role Key RLS policy\'lerini bypass eder!');
  console.log('⚠️  Bu script sadece bir kere çalıştırılmalı (dosyaları yüklemek için)');
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
    const success = await uploadFile(file.bucket, file.fileName, file.filePath);
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
  
  if (successCount === 2) {
    console.log(`\n🎉 Tüm dosyalar başarıyla yüklendi!`);
    console.log(`\n📱 Test için:`);
    console.log(`   1. iPhone Safari'yi aç`);
    console.log(`   2. Hard refresh yap (sayfayı aşağı çek)`);
    console.log(`   3. URL'leri test et:`);
    console.log(`      - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-reset/auth-reset.html`);
    console.log(`      - https://jblqkhgwitktbfeppume.supabase.co/storage/v1/object/public/auth-confirm/auth-confirm.html`);
    console.log(`\n⚠️  ÖNEMLİ: Service Role Key'i script'ten sil veya .gitignore'a ekle!`);
  } else {
    console.log(`\n❌ Bazı dosyalar yüklenemedi. Lütfen hataları kontrol edin.`);
  }
}

main().catch(console.error);

