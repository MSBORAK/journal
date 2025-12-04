import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Gemini API Key'i app.json'dan al
let GEMINI_API_KEY = '';
let genAI: GoogleGenerativeAI | null = null;

try {
  GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || '';
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'BURAYA_GOOGLE_AI_STUDIO_DAN_ALDIĞIN_API_KEY_GELECEK') {
    console.warn('⚠️ Gemini API Key bulunamadı! app.json dosyasına ekleyin.');
  } else {
    // Gemini AI client'ı oluştur
    try {
      genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      console.log('✅ Gemini API client initialized');
    } catch (initError: any) {
      console.error('❌ Gemini API client initialization failed:', initError?.message);
      genAI = null;
    }
  }
} catch (error: any) {
  console.error('❌ Gemini API initialization error:', error?.message);
  genAI = null;
}

/**
 * REST API ile Gemini çağrısı (React Native için daha güvenilir)
 */
const generateTextViaREST = async (prompt: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key yapılandırılmamış');
  }

  // Güncel ve desteklenen modelleri dene (models/ prefix ile)
  const apiVersions = ['v1beta', 'v1'];
  const modelNames = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-pro'];
  
  for (const apiVersion of apiVersions) {
    for (const modelName of modelNames) {
      try {
        // REST API'de models/ prefix'i gerekiyor
        const API_URL = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        console.log(`🔍 Deneniyor: ${apiVersion}/models/${modelName}`);
        console.log('🚀 REST API çağrısı başlatılıyor...');
        console.log('📝 Prompt uzunluğu:', prompt.length);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

        console.log(`✅ REST API response alındı (${apiVersion}/${modelName}), status:`, response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`❌ ${apiVersion}/${modelName} hatası:`, errorData);
          
          // Son kombinasyon değilse devam et
          const isLastCombination = apiVersions.indexOf(apiVersion) === apiVersions.length - 1 && 
                                     modelNames.indexOf(modelName) === modelNames.length - 1;
          
          if (!isLastCombination) {
            console.log(`⚠️ ${apiVersion}/${modelName} başarısız, bir sonraki kombinasyon deneniyor...`);
            continue;
          }
          
          throw new Error(`API hatası: ${response.status} - ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ REST API data parse edildi (${apiVersion}/${modelName})`);

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text || text.trim().length === 0) {
          throw new Error('AI\'dan boş yanıt alındı');
        }

        console.log(`✅ Metin çıkarıldı (${apiVersion}/${modelName}), uzunluk:`, text.length);
        return text;
      } catch (error: any) {
        // Son kombinasyon değilse devam et
        const isLastCombination = apiVersions.indexOf(apiVersion) === apiVersions.length - 1 && 
                                   modelNames.indexOf(modelName) === modelNames.length - 1;
        
        if (!isLastCombination) {
          console.log(`⚠️ ${apiVersion}/${modelName} hatası, bir sonraki kombinasyon deneniyor...`, error?.message);
          continue;
        }
        
        // Son kombinasyon da başarısız olduysa hatayı fırlat
        console.error('❌ Tüm REST API kombinasyonları başarısız:', error?.message);
        throw error;
      }
    }
  }
  
  // Hiçbir kombinasyon çalışmadıysa
  throw new Error('Tüm API kombinasyonları başarısız oldu');
};

/**
 * Gemini ile metin üretme (SDK veya REST API)
 */
export const generateText = async (prompt: string): Promise<string> => {
  try {
    // Önce SDK'yı dene, başarısız olursa REST API kullan
    if (genAI) {
      try {
        console.log('🚀 SDK ile Gemini API çağrısı başlatılıyor...');
        console.log('📝 Prompt uzunluğu:', prompt.length);
        
        // Güncel modelleri sırayla dene
        const sdkModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-pro'];
        let model;
        let lastError: any = null;
        
        for (const modelName of sdkModels) {
          try {
            console.log(`🔍 SDK model deneniyor: ${modelName}...`);
            model = genAI.getGenerativeModel({ model: modelName });
            console.log(`✅ ${modelName} modeli yüklendi`);
            break; // Başarılı olursa döngüden çık
          } catch (modelError: any) {
            console.log(`⚠️ ${modelName} başarısız:`, modelError?.message);
            lastError = modelError;
            // Son model değilse devam et
            if (sdkModels.indexOf(modelName) < sdkModels.length - 1) {
              continue;
            }
          }
        }
        
        if (!model) {
          throw new Error(`Tüm SDK modelleri başarısız. Son hata: ${lastError?.message || 'Bilinmeyen hata'}`);
        }
        
        console.log('📤 İçerik üretiliyor...');
        const result = await model.generateContent(prompt);
        console.log('✅ İçerik üretildi');
        
        const response = await result.response;
        console.log('✅ Response alındı');
        
        const text = response.text();
        console.log('✅ Metin çıkarıldı, uzunluk:', text?.length || 0);
        
        if (!text || text.trim().length === 0) {
          throw new Error('AI\'dan boş yanıt alındı');
        }
        
        return text;
      } catch (sdkError: any) {
        console.warn('⚠️ SDK hatası, REST API deneniyor...', sdkError?.message);
        // SDK başarısız olursa REST API'ye geç
        return await generateTextViaREST(prompt);
      }
    } else {
      // SDK yoksa direkt REST API kullan
      console.log('⚠️ SDK yok, REST API kullanılıyor...');
      return await generateTextViaREST(prompt);
    }
  } catch (error: any) {
    // Error objesini güvenli bir şekilde logla
    const errorMessage = error?.message || error?.toString() || 'Bilinmeyen hata';
    const errorName = error?.name || 'Error';
    const errorCode = error?.code || error?.status || error?.statusCode || 'N/A';
    const errorCause = error?.cause?.message || error?.cause || 'N/A';
    
    console.error('❌ Gemini API hatası:', errorMessage);
    console.error('❌ Hata tipi:', errorName);
    console.error('❌ Tam hata objesi:', {
      message: errorMessage,
      name: errorName,
      code: errorCode,
      cause: errorCause,
      stack: error?.stack ? error.stack.substring(0, 300) : 'Stack yok'
    });
    
    if (errorCode !== 'N/A') {
      console.error('❌ Hata kodu:', errorCode);
    }
    if (errorCause !== 'N/A') {
      console.error('❌ Hata nedeni:', errorCause);
    }
    
    // Daha açıklayıcı hata mesajları
    const lowerMessage = errorMessage.toLowerCase();
    
    if (lowerMessage.includes('api_key') || lowerMessage.includes('api key') || lowerMessage.includes('yapılandırılmamış')) {
      throw new Error('API anahtarı geçersiz veya eksik');
    } else if (lowerMessage.includes('quota') || lowerMessage.includes('429') || lowerMessage.includes('kota')) {
      throw new Error('API kotası aşıldı. Lütfen daha sonra tekrar deneyin.');
    } else if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('internet') || lowerMessage.includes('bağlantı')) {
      throw new Error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.');
    } else if (lowerMessage.includes('timeout') || lowerMessage.includes('zaman aşımı')) {
      throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
    } else if (errorMessage && errorMessage !== 'Bilinmeyen hata') {
      throw new Error(`API hatası: ${errorMessage}`);
    } else {
      throw new Error('AI analizi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
    }
  }
};

/**
 * Günlük yazısını analiz et ve öneriler sun
 */
export const analyzeDiaryEntry = async (diaryText: string): Promise<string> => {
  const prompt = `
Aşağıdaki günlük yazısını analiz et ve kullanıcıya:
1. Ruh halini değerlendir
2. Pozitif noktaları vurgula
3. İyileştirme önerileri sun
4. Motivasyonel bir mesaj ekle

Günlük yazısı:
${diaryText}

Lütfen samimi, sıcak ve destekleyici bir ton kullan. Türkçe cevap ver. 
ÖNEMLİ: Mesajın sonunda imza, isim veya "Uzman Psikolog", "Yaşam Koçu" gibi unvanlar ekleme. Sadece analiz ve önerilerini paylaş.
  `;

  return await generateText(prompt);
};

/**
 * Motivasyon mesajı oluştur
 */
export const generateMotivationMessage = async (userMood?: string, completedTasks?: number): Promise<string> => {
  const prompt = `
Bugün için kişisel ve samimi bir motivasyon mesajı oluştur.
${userMood ? `Kullanıcının ruh hali: ${userMood}` : ''}
${completedTasks !== undefined ? `Tamamlanan görev sayısı: ${completedTasks}` : ''}

Mesaj kısa, ilham verici ve güçlendirici olsun. Türkçe yaz.
  `;

  return await generateText(prompt);
};

/**
 * Görev önerileri oluştur
 */
export const suggestTasks = async (userGoals?: string[]): Promise<string[]> => {
  const prompt = `
Kullanıcı için bugün yapabileceği 3-5 görev öner. 
${userGoals && userGoals.length > 0 ? `Kullanıcının hedefleri: ${userGoals.join(', ')}` : ''}

Her görev kısa ve net olsun. Sadece görevleri listele, başka açıklama yapma.
Türkçe yaz.
  `;

  try {
    const response = await generateText(prompt);
    // Görevleri satırlara ayır ve temizle
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+\./)) // Numara işaretlerini kaldır
      .slice(0, 5); // Maksimum 5 görev
  } catch (error) {
    console.error('Görev önerisi hatası:', error);
    return [];
  }
};

/**
 * Ruh hali analizi
 */
export const analyzeMood = async (diaryText: string): Promise<{
  mood: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestions: string[];
}> => {
  const prompt = `
Aşağıdaki günlük yazısını analiz et ve JSON formatında cevap ver:
{
  "mood": "ruh hali (ör: mutlu, endişeli, huzurlu)",
  "sentiment": "positive | neutral | negative",
  "suggestions": ["öneri1", "öneri2", "öneri3"]
}

Günlük yazısı:
${diaryText}

Sadece JSON döndür, başka açıklama yapma.
  `;

  try {
    const response = await generateText(prompt);
    // JSON'u parse et
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Geçersiz JSON formatı');
  } catch (error) {
    console.error('Ruh hali analizi hatası:', error);
    return {
      mood: 'belirsiz',
      sentiment: 'neutral',
      suggestions: [],
    };
  }
};

/**
 * Gemini API'nin kullanılabilir olup olmadığını kontrol et
 */
export const isGeminiAvailable = (): boolean => {
  return !!genAI && !!GEMINI_API_KEY && GEMINI_API_KEY !== 'BURAYA_GOOGLE_AI_STUDIO_DAN_ALDIĞIN_API_KEY_GELECEK';
};

/**
 * Rate limiting: Kullanıcının bugün AI analizi kullanıp kullanmadığını kontrol et
 */
export const canUseAIAnalysis = async (userId: string): Promise<boolean> => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı
    const storageKey = `ai_analysis_${userId}_${today}`;
    const lastAnalysis = await AsyncStorage.getItem(storageKey);
    
    // Eğer bugün daha önce analiz yapılmışsa false döndür
    return !lastAnalysis;
  } catch (error) {
    console.error('Rate limiting kontrolü hatası:', error);
    // Hata durumunda güvenli tarafta kal, false döndür
    return false;
  }
};

/**
 * Rate limiting: AI analizi kullanıldığını kaydet
 */
export const markAIAnalysisUsed = async (userId: string): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `ai_analysis_${userId}_${today}`;
    await AsyncStorage.setItem(storageKey, new Date().toISOString());
  } catch (error) {
    console.error('AI analizi kayıt hatası:', error);
  }
};

