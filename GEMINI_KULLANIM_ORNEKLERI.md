# 🤖 Gemini API ile Neler Yapabilirsin?

## 1. 📝 Günlük Yazılarını Analiz Et

**Şu an:** Kullanıcı günlük yazar, sadece kaydedilir.

**Gemini ile:**
- Günlük yazısını okur
- Ruh halini analiz eder
- Pozitif noktaları vurgular
- İyileştirme önerileri sunar
- Motivasyonel mesaj verir

**Örnek:**
```
Kullanıcı yazıyor: "Bugün çok yorucu bir gün oldu, işte çok stresliydim..."

Gemini analizi:
"Bugünkü günlüğünde stres ve yorgunluk hissettiğini görüyorum. 
Bu normal ve anlaşılır. Ancak şunu fark ettim: 
Günün sonunda bile günlük yazmaya zaman ayırdın, 
bu kendine özen göstermenin bir işareti! 💪

Önerilerim:
- Yarın için 10 dakika nefes egzersizi yapmayı dene
- İş molalarında kısa yürüyüşler yap
- Akşam rahatlatıcı bir müzik dinle

Unutma, zor günler geçer ama sen güçlüsün! 🌟"
```

## 2. 💪 Kişiselleştirilmiş Motivasyon Mesajları

**Şu an:** Sabit motivasyon mesajları var.

**Gemini ile:**
- Kullanıcının ruh haline göre özel mesaj
- Tamamlanan görevlere göre tebrik
- Kişiselleştirilmiş ilham verici sözler

**Örnek:**
```
Kullanıcı: 5 görev tamamladı, ruh hali: mutlu

Gemini mesajı:
"Harika bir gün geçiriyorsun! 5 görevi tamamlamışsın, 
bu muazzam bir başarı! 🎉 Sen gerçekten odaklanmış ve 
disiplinli birisin. Bu enerjini koru, sen harikasın! ✨"
```

## 3. 📋 Akıllı Görev Önerileri

**Şu an:** Kullanıcı kendi görevlerini ekler.

**Gemini ile:**
- Hedeflerine göre görev önerileri
- Günlük rutin önerileri
- Kişiselleştirilmiş görev listesi

**Örnek:**
```
Kullanıcının hedefleri: ["fitness", "okuma", "meditasyon"]

Gemini önerileri:
- 30 dakika yürüyüş yap
- 1 bölüm kitap oku
- 10 dakika meditasyon yap
- Su içmeyi unutma (2 litre)
- Sevdiklerinle konuş
```

## 4. 🧠 Ruh Hali Analizi

**Şu an:** Kullanıcı manuel olarak ruh halini seçer.

**Gemini ile:**
- Günlük yazısından otomatik ruh hali tespiti
- Duygu analizi
- Öneriler

**Örnek:**
```
Günlük yazısı: "Bugün çok mutluyum, harika haberler aldım..."

Gemini analizi:
{
  "mood": "mutlu ve heyecanlı",
  "sentiment": "positive",
  "suggestions": [
    "Bu pozitif enerjini koru",
    "Mutluluğunu paylaş",
    "Günü not et, ileride hatırlamak için"
  ]
}
```

## 5. 🎯 Hedef ve Hayaller İçin Öneriler

**Şu an:** Kullanıcı hedeflerini yazar.

**Gemini ile:**
- Hedeflere ulaşmak için adım adım plan
- Motivasyonel destek
- İlerleme önerileri

## 6. 📊 Günlük Özet ve İçgörüler

**Şu an:** Sadece veriler gösterilir.

**Gemini ile:**
- Günlük aktivitelerin analizi
- İyileştirme alanları
- Başarıların vurgulanması

---

## 🚀 Nasıl Kullanılacak?

### Senaryo 1: Günlük Yazısı Sonrası Analiz
```typescript
// WriteDiaryStep3Screen.tsx'de
import { analyzeDiaryEntry } from '../services/geminiService';

// Günlük kaydedildikten sonra
const analysis = await analyzeDiaryEntry(diaryText);
// Modal'da göster: "AI Analizi" butonu
```

### Senaryo 2: Dashboard'da Motivasyon
```typescript
// DashboardScreen.tsx'de
import { generateMotivationMessage } from '../services/geminiService';

// Her sabah veya görev tamamlandığında
const motivation = await generateMotivationMessage(userMood, completedTasks);
// MotivationCard'da göster
```

### Senaryo 3: Görev Önerileri
```typescript
// TasksAndRemindersScreen.tsx'de
import { suggestTasks } from '../services/geminiService';

// "AI Önerileri" butonu
const tasks = await suggestTasks(userGoals);
// Önerilen görevleri listele, tek tıkla ekle
```

---

## 💡 Avantajlar

✅ **Kişiselleştirilmiş Deneyim:** Her kullanıcıya özel
✅ **Akıllı Öneriler:** AI destekli içgörüler
✅ **Motivasyon:** Her zaman destekleyici mesajlar
✅ **Zaman Tasarrufu:** Otomatik analiz ve öneriler
✅ **Daha İyi İçgörüler:** Verilerden anlamlı sonuçlar

---

## ⚠️ Önemli Notlar

- API key güvenli saklanmalı (şu an app.json'da, production'da environment variable kullan)
- API çağrıları ücretli olabilir (Google'ın ücretsiz kotası var)
- İnternet bağlantısı gerektirir
- Hata durumunda uygulama çalışmaya devam eder (offline mod)

