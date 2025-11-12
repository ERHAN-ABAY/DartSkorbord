# 📝 Dark Skorbord - Değişiklik Geçmişi (CHANGELOG)

## [1.1.0] - 2025-11-12

### ✨ Yeni Özellikler

#### 📊 Oyun Geçmişi Sistemi
- **Geçmiş Saklama**: Tamamlanan tüm oyunlar artık veritabanında saklanıyor
- **Son 10 Oyun**: Ana menüden son 10 tamamlanmış oyunu görüntüleyebilirsiniz
- **Detaylı Bilgiler**: Her oyun için kazanan, tarih, oyuncular ve skorlar gösteriliyor
- **Görsel Tasarım**: Kazanan oyuncu özel vurgulamayla gösteriliyor

#### ↶ Atış Geri Alma (Undo)
- **Son Atış İptali**: Yanlış girişleri düzeltmek için son atışı geri alabilme
- **Akıllı Sıra Yönetimi**: Geri alma sonrası sıra otomatik olarak ilgili oyuncuya dönüyor
- **Skor Düzeltme**: Puanlar otomatik olarak eski haline getiriliyor
- **Tur Geçmişi Senkronizasyonu**: Geri alınan atışlar tur geçmişinden de siliniyor

### 🔧 Teknik İyileştirmeler

#### Backend (API)
- `GET /api/games/history` - Tamamlanmış oyun geçmişi endpoint'i
- `DELETE /api/games/:id/players/:playerId/last-turn` - Son atışı geri alma
- `DELETE /api/games/:id/turns/:turnId` - Belirli tur silme
- `getFinishedGames()` - Veritabanı fonksiyonu eklendi
- `getAllGames()` - Tüm oyunları getirme fonksiyonu
- `deleteLastTurn()` - Transaction-based geri alma
- `deleteTurn()` - Belirli tur silme fonksiyonu

#### Frontend (UI)
- Yeni "Oyun Geçmişi" ekranı eklendi
- "📊 Oyun Geçmişi" butonu ana menüye eklendi
- "↶ Son Atışı Geri Al" butonu oyun ekranına eklendi
- Geçmiş oyun kartları için özel CSS stilleri
- Animasyonlu hover efektleri
- Responsive tasarım iyileştirmeleri

#### Database
- Tamamlanmış oyunlar için optimize edilmiş sorgular
- LEFT JOIN ile kazanan bilgisi tek sorguda
- Transaction kullanımı ile veri tutarlılığı
- Foreign key constraints ile ilişkisel bütünlük

### 🎨 UI/UX İyileştirmeleri
- Geri alma butonu dikkat çekici kırmızı renkte
- Onay diyalogları oyuncu adı ile kişiselleştirildi
- Oyun geçmişi kartlarında hover animasyonu
- Kazanan oyuncu yeşil kenarlık ile vurgulanıyor
- Tarih formatı Türkçe yerel formata göre

### 📄 Dokümantasyon
- `YENI_OZELLIKLER.md` - Detaylı özellik kılavuzu
- `CHANGELOG.md` - Versiyon geçmişi (bu dosya)
- `README.md` - Güncellenen API endpoint listesi
- API kullanım örnekleri eklendi

### 🐛 Düzeltmeler
- Modül import yolları düzeltildi (`./game` → `../game`)
- Sıra mantığı iyileştirildi
- Button group düzeni iyileştirildi

---

## [1.0.0] - 2025-11-12

### 🎉 İlk Sürüm

#### Temel Özellikler
- 1-4 oyuncu desteği
- Esnek bitiş limiti (301, 501, 701)
- Otomatik bust kontrolü
- Tur geçmişi takibi
- Gerçek zamanlı skor güncellemesi
- Oyun istatistikleri
- Modern ve responsive arayüz
- SQLite ile kalıcı veri saklama

#### Teknoloji Stack
- **Backend**: Node.js + Express.js
- **Database**: SQLite3 (better-sqlite3)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: RESTful architecture

#### Database Schema
- `players` - Oyuncu profilleri
- `games` - Oyun oturumları
- `game_players` - Oyun-oyuncu ilişkileri
- `turns` - Tur kayıtları
- `throws` - Atış kayıtları

#### API Endpoints
- Oyun yönetimi (create, read)
- Atış kaydetme
- Oyuncu yönetimi
- İstatistik sorgulama

#### UI Ekranları
- Yeni oyun başlatma
- Oyun ekranı (skorboard)
- Oyun bitişi ekranı
- Tur geçmişi görüntüleme

---

## 🔮 Gelecek Sürümler

### [1.2.0] - Planlanan
- [ ] Çoklu geri alma (birden fazla tur)
- [ ] Oyun devam ettirme (yarım kalan oyunlar)
- [ ] Gelişmiş istatistikler (grafikler)
- [ ] Export/Import (JSON)

### [1.3.0] - Planlanan
- [ ] Turnuva modu
- [ ] Çoklu dil desteği
- [ ] Tema seçenekleri (Dark/Light)
- [ ] Oyuncu avatarları

### [2.0.0] - Uzun Vadeli
- [ ] Çevrimiçi multiplayer
- [ ] Mobil uygulama (React Native)
- [ ] Cloud backup
- [ ] Sosyal özellikler (paylaşım, sıralama)

---

## 📊 Versiyon Numaralandırma

Bu proje [Semantic Versioning](https://semver.org/) kullanır:

- **MAJOR** version: Uyumsuz API değişiklikleri
- **MINOR** version: Geriye uyumlu yeni özellikler
- **PATCH** version: Geriye uyumlu hata düzeltmeleri

---

## 🤝 Katkıda Bulunanlar

- **v1.0.0**: Initial release
- **v1.1.0**: Oyun geçmişi ve geri alma özellikleri

---

## 📞 Destek

Sorularınız veya önerileriniz için:
- GitHub Issues: [Repository](https://github.com/yourusername/darkskorbord)
- Email: support@darkskorbord.com

---

**Her zaman oyununuzu bir üst seviyeye taşıyoruz! 🎯**
