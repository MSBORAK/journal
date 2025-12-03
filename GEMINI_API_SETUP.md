# Gemini API Entegrasyonu Rehberi

## 1. Google AI Studio'dan API Key Alma

1. **Google AI Studio'ya Git**: https://aistudio.google.com
2. **API Key Al**:
   - Sağ üstte "API anahtarını al" (Get API key) butonuna tıkla
   - Yeni bir API key oluştur veya mevcut birini kullan
   - API key'i kopyala (örnek: `AIzaSy...`)

## 2. API Key'i Güvenli Şekilde Saklama

API key'i `app.json` dosyasına ekleyelim (Supabase key'leri gibi):

```json
"extra": {
  "supabaseUrl": "...",
  "supabaseAnonKey": "...",
  "geminiApiKey": "BURAYA_API_KEY_GELECEK"
}
```

## 3. Gemini SDK Kurulumu

```bash
npm install @google/generative-ai
```

## 4. Gemini Service Oluşturma

`src/services/geminiService.ts` dosyası oluşturulacak.

## 5. Kullanım Örnekleri

- Günlük yazıları analiz etme
- Motivasyon mesajları oluşturma
- Görev önerileri
- Ruh hali analizi

