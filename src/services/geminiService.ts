import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

// Gemini API Key'i app.json'dan al
let GEMINI_API_KEY = '';
let genAI: GoogleGenerativeAI | null = null;

try {
  GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || '';
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'BURAYA_GOOGLE_AI_STUDIO_DAN_ALDIĞIN_API_KEY_GELECEK') {
    console.warn('⚠️ Gemini API Key bulunamadı! app.json dosyasına ekleyin.');
  } else {
    // Gemini AI client'ı oluştur
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log('✅ Gemini API client initialized');
  }
} catch (error) {
  console.error('❌ Gemini API initialization error:', error);
  genAI = null;
}

/**
 * Gemini ile metin üretme
 */
export const generateText = async (prompt: string): Promise<string> => {
  if (!genAI) {
    throw new Error('Gemini API Key yapılandırılmamış');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API hatası:', error);
    throw error;
  }
};

/**
 * Günlük yazısını analiz et ve öneriler sun
 */
export const analyzeDiaryEntry = async (diaryText: string): Promise<string> => {
  const prompt = `
Sen bir psikolog ve yaşam koçusun. Aşağıdaki günlük yazısını analiz et ve kullanıcıya:
1. Ruh halini değerlendir
2. Pozitif noktaları vurgula
3. İyileştirme önerileri sun
4. Motivasyonel bir mesaj ekle

Günlük yazısı:
${diaryText}

Lütfen samimi, sıcak ve destekleyici bir ton kullan. Türkçe cevap ver.
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

