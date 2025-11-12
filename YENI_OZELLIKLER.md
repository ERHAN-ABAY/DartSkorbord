# 🎯 Dark Skorbord - Yeni Özellikler Kılavuzu

## 📊 Oyun Geçmişi Özelliği

### Nasıl Kullanılır?

1. **Ana Menüden Erişim**
   - Ana menüde "📊 Oyun Geçmişi" butonuna tıklayın
   - Son 10 tamamlanmış oyun görüntülenir

2. **Geçmiş Bilgileri**
   Her oyun için şu bilgiler gösterilir:
   - Oyun adı ve ID
   - Tamamlanma tarihi ve saati
   - Bitiş limiti (301/501/701)
   - Kazanan oyuncu (🏆 işaretiyle)
   - Tüm oyuncular ve kalan puanları

3. **Görsel Özellikler**
   - Kazanan oyuncu yeşil kenarlıkla vurgulanır
   - Her oyun kartı üzerine gelindiğinde efekt gösterir
   - Tarih formatı: GG.AA.YYYY SS:DD

### API Kullanımı

```javascript
// Son 10 oyunu getir
GET /api/games/history

// Limit belirleyerek getir
GET /api/games/history?limit=20

// Yanıt formatı
[
  {
    "id": 1,
    "name": "Akşam Maçı",
    "finish_limit": 501,
    "started_at": "2025-11-12 20:30:00",
    "finished_at": "2025-11-12 21:15:00",
    "winner_player_id": 2,
    "winner_name": "Bora",
    "players": [
      {
        "id": 1,
        "player_id": 1,
        "name": "Ali",
        "current_score": 45,
        "seat": 1
      },
      {
        "id": 2,
        "player_id": 2,
        "name": "Bora",
        "current_score": 0,
        "seat": 2
      }
    ]
  }
]
```

---

## ↶ Atış Geri Alma Özelliği

### Nasıl Kullanılır?

1. **Oyun Sırasında**
   - Oyun ekranında "↶ Son Atışı Geri Al" butonuna tıklayın
   - Onay penceresi çıkacaktır

2. **Ne Olur?**
   - Son atış yapan oyuncunun atışı iptal edilir
   - Puanlar eski haline döner
   - Sıra o oyuncuya geri verilir
   - Tur geçmişinden silinir

3. **Önemli Notlar**
   - ⚠️ Sadece son atış geri alınabilir
   - ⚠️ BUST olan atışlar da geri alınabilir
   - ⚠️ Oyun bittiğinde geri alma yapılamaz
   - ⚠️ İşlem geri alınamaz!

### Kullanım Senaryoları

#### Senaryo 1: Yanlış Skor Girişi
```
1. Ali 60 puan kazandı ama yanlışlıkla 160 girildi
2. "Son Atışı Geri Al" butonuna tıkla
3. Doğru skoru (60) tekrar gir
```

#### Senaryo 2: Sıra Karışması
```
1. Yanlışlıkla Bora'nın sırasında Ali'nin puanı girildi
2. "Son Atışı Geri Al" butonuna tıkla
3. Doğru oyuncu için puanı gir
```

#### Senaryo 3: Bust Kontrolü
```
1. Ali bust oldu ama sistem algılamadı (veya doğru çalıştı)
2. "Son Atışı Geri Al" ile geri al
3. Doğru puanları tekrar gir
```

### API Kullanımı

```javascript
// Son atışı geri al
DELETE /api/games/{gameId}/players/{gamePlayerId}/last-turn

// Örnek İstek
fetch('http://localhost:3000/api/games/1/players/2/last-turn', {
  method: 'DELETE'
});

// Yanıt
{
  "message": "Son tur geri alındı",
  "deletedTurn": {
    "id": 15,
    "game_id": 1,
    "game_player_id": 2,
    "turn_index": 5,
    "total_score": 81,
    "is_bust": 0
  },
  "players": [
    // Güncel oyuncu durumları
  ]
}
```

### Belirli Bir Turu Silme (Gelişmiş)

```javascript
// Belirli bir turu sil
DELETE /api/games/{gameId}/turns/{turnId}

// Örnek İstek
fetch('http://localhost:3000/api/games/1/turns/15', {
  method: 'DELETE'
});
```

---

## 🔧 Teknik Detaylar

### Veritabanı İşlemleri

#### Geri Alma (Undo) Mekanizması

1. **Transaction Kullanımı**
   - Tüm işlemler atomik olarak yapılır
   - Hata durumunda otomatik rollback

2. **Skor Geri Yükleme**
   ```javascript
   // Bust olmayan atış için
   current_score = current_score + deleted_turn.total_score
   
   // Bust olan atış için
   // Skor zaten değişmemişti, sadece tur kaydı silinir
   ```

3. **İlişkili Kayıtlar**
   - Tur silinindiğinde, o tura ait tüm atışlar otomatik silinir
   - Foreign key constraints sayesinde veri tutarlılığı korunur

### Performans Optimizasyonları

1. **Geçmiş Sorgulama**
   - LIMIT ile sadece son 10 oyun çekilir
   - LEFT JOIN ile kazanan bilgisi tek sorguda gelir
   - Index'ler sayesinde hızlı sıralama

2. **Memory Management**
   - Frontend'de sadece görüntülenen oyunlar tutulur
   - Infinite scroll için gelecek versiyonda pagination eklenebilir

---

## 🎨 UI/UX İyileştirmeleri

### Görsel Geri Bildirimler

1. **Animasyonlar**
   - Geri alma işlemi sırasında yumuşak geçişler
   - Başarılı işlem sonrası pulse animasyonu

2. **Renk Kodlaması**
   - 🟢 Yeşil: Kazanan oyuncu
   - 🔴 Kırmızı: Geri alma butonu (dikkat çeker)
   - 🔵 Mavi: Sıradaki oyuncu

3. **Onay Pencereleri**
   - Kritik işlemler için onay istenir
   - Oyuncu adı onay mesajında belirtilir

---

## 📱 Responsive Tasarım

Her iki özellik de mobil cihazlarda sorunsuz çalışır:

- Oyun geçmişi kartları mobilde tek sütun olur
- Geri alma butonu touch-friendly boyuttadır
- Onay diyalogları mobil ekrana uyumludur

---

## 🐛 Hata Senaryoları ve Çözümleri

### Problem 1: "Silinecek tur bulunamadı"
**Çözüm**: Hiç atış yapılmamıştır, geri alınacak bir şey yoktur.

### Problem 2: "Geçmiş yüklenemedi"
**Çözüm**: 
- Sunucunun çalıştığından emin olun
- Veritabanının bozulmadığını kontrol edin: `npm run init-db`

### Problem 3: Geri alma sonrası skorlar yanlış
**Çözüm**: 
- Sayfayı yenileyin (F5)
- Eğer sorun devam ederse, veritabanı tutarsızlığı olabilir

---

## 💡 İpuçları

### Oyun Geçmişi
- 📊 İstatistik analizi için geçmişi kullanın
- 🏆 En başarılı oyuncuları tespit edin
- 📈 Performans trendlerini gözlemleyin

### Geri Alma
- ⚡ Atış yapmadan önce iki kez kontrol edin
- 🎯 Sadece son atış geri alınabilir, önceki turlar için olmaz
- 💾 Kritik maçlarda her turdan sonra ekran görüntüsü alabilirsiniz

---

## 🔮 Gelecek Geliştirmeler

### Planlanan Özellikler
1. **Çoklu Geri Alma**: Birden fazla tur geri alabilme
2. **Geçmiş Detayları**: Her oyunun tur-tur detaylarını görüntüleme
3. **İstatistik Grafikler**: Geçmiş verilerden grafik oluşturma
4. **Export/Import**: Geçmişi JSON olarak dışa aktarma
5. **Oyun Devam Ettirme**: Yarım kalan oyunları sürdürme

### Topluluk İstekleri
- Oyun paylaşma özelliği
- Turnuva modu
- Çoklu dil desteği

---

**Yeni özelliklerin tadını çıkarın! 🎯**

Son Güncelleme: 12 Kasım 2025
