# 🎯 Dark Skorbord

Modern ve kullanıcı dostu bir dart skorboard uygulaması. 1-4 oyuncu desteği, çoklu dil seçeneği ve detaylı oyun geçmişi takibi ile dart oyununuzu bir üst seviyeye taşıyın.

## ✨ Özellikler

### Oyun Özellikleri
- 🎮 **1-4 Oyuncu Desteği** - Tek başına veya arkadaşlarınızla oynayın
- 🎯 **Esnek Bitiş Limiti** - 301/501/701 preset'leri veya özel limit (1-9999)
- ⚡ **Otomatik Bust Kontrolü** - Negatif puan durumları otomatik yönetilir
- 📊 **Oyun Geçmişi** - Son 10 oyununuzu kaydedin ve inceleyin
- ↶ **Geri Alma** - Hatalı girişleri kolayca düzeltin

### Arayüz Özellikleri
- 🌍 **Çoklu Dil** - Türkçe ve İngilizce destek
- ⌨️ **Sayısal Klavye** - Hızlı ve kolay skor girişi
- 📱 **Responsive Tasarım** - Mobil ve masaüstü uyumlu
- 🎨 **Modern UI** - Dark tema ile göz yormayan arayüz

### Teknik Özellikler
- 💾 **SQLite Veritabanı** - Yerel veri saklama
- 🚀 **RESTful API** - Geliştiriciler için kolay entegrasyon
- ⚙️ **Gerçek Zamanlı** - Anlık skor güncellemeleri

## � Hızlı Başlangıç

### Gereksinimler
- Node.js v14 veya üzeri
- npm veya yarn

### Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/ERHAN-ABAY/DarkSkorbord.git
cd DarkSkorbord

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm start
```

Tarayıcınızda `http://localhost:3000` adresini açın.

### Geliştirme Modu

```bash
npm run dev
```

## 🎮 Nasıl Oynanır?

### 1️⃣ Yeni Oyun Başlatma
- Oyun adı girin (opsiyonel)
- Bitiş limitini seçin (301/501/701 veya özel)
- Oyuncu sayısını ve isimlerini belirleyin
- "Oyunu Başlat" butonuna tıklayın

### 2️⃣ Atış Yapma
- Skor giriş alanlarına atış değerlerini girin
- Sayısal klavyeyi veya fiziksel klavyenizi kullanın
- "Atışı Kaydet" ile onaylayın

### 3️⃣ Oyun Kuralları
- Her oyuncu 3 dart atar
- Kalan puan tam 0 olunca kazanırsınız
- Negatif puan = BUST (tur iptal)
- Son atışı geri alabilirsiniz

## � Ekran Görüntüleri

### Ana Menü
- Yeni oyun başlatma
- Oyun geçmişi görüntüleme
- Dil seçimi (TR/EN)

### Oyun Ekranı
- Oyuncu skorları
- Sıradaki oyuncu göstergesi
- Sayısal klavye
- Atış geri alma butonu

### Oyun Geçmişi
- Son 10 oyun
- Kazanan vurgulaması
- Detaylı istatistikler

## 🔌 API Kullanımı

### Oyun İşlemleri

```javascript
// Yeni oyun başlat
POST /api/games
{
  "name": "Akşam Maçı",
  "finishLimit": 501,
  "players": ["Ali", "Bora", "Cem"]
}

// Oyun durumunu getir
GET /api/games/:id

// Oyun geçmişi
GET /api/games/history?limit=10
```

### Atış İşlemleri

```javascript
// Atış yap
POST /api/games/:id/throws
{
  "gamePlayerId": 1,
  "throws": [60, 20, 1]
}

// Son atışı geri al
DELETE /api/games/:id/players/:playerId/last-turn
```

Tüm API endpoint'leri için [API Dokümantasyonu](#-api-endpoints) bölümüne bakın.

## 🗄️ Veritabanı Yapısı

Uygulama 5 ana tablo kullanır:

| Tablo | Açıklama |
|-------|----------|
| `players` | Oyuncu profilleri |
| `games` | Oyun oturumları |
| `game_players` | Oyun-oyuncu ilişkileri |
| `turns` | Tur kayıtları |
| `throws` | Atış detayları |

<details>
<summary>Detaylı Şema Görüntüle</summary>

```sql
-- Oyuncu Profilleri
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Oyun Oturumları
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  finish_limit INTEGER NOT NULL,
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT,
  winner_player_id INTEGER
);

-- Oyun-Oyuncu İlişkisi
CREATE TABLE game_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  seat INTEGER NOT NULL,
  starting_score INTEGER NOT NULL,
  current_score INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Turlar
CREATE TABLE turns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  game_player_id INTEGER NOT NULL,
  turn_index INTEGER NOT NULL,
  total_score INTEGER DEFAULT 0,
  is_bust INTEGER DEFAULT 0,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (game_player_id) REFERENCES game_players(id)
);

-- Atışlar
CREATE TABLE throws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turn_id INTEGER NOT NULL,
  throw_index INTEGER NOT NULL,
  value INTEGER NOT NULL,
  FOREIGN KEY (turn_id) REFERENCES turns(id)
);
```
</details>

## 📂 Proje Yapısı

```
DarkSkorbord/
├── src/
│   ├── database/
│   │   ├── schema.sql       # Veritabanı şeması
│   │   ├── init-db.js       # DB başlatma scripti
│   │   └── database.js      # DB işlemleri ve sorgular
│   ├── api/
│   │   └── routes.js        # REST API endpoint'leri
│   └── game.js              # Oyun mantığı ve kuralları
├── public/
│   ├── index.html           # Ana HTML dosyası
│   ├── styles.css           # Stil tanımlamaları
│   ├── app.js               # Frontend JavaScript
│   └── i18n.js              # Çoklu dil desteği
├── data/
│   └── dartscoreboard.db    # SQLite veritabanı (otomatik oluşur)
├── server.js                # Express sunucu
├── package.json             # Proje bağımlılıkları
└── README.md                # Bu dosya
```

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Backend** | Node.js, Express.js |
| **Veritabanı** | SQLite3 (better-sqlite3) |
| **Frontend** | Vanilla JavaScript (ES6+) |
| **Stil** | CSS3 (Custom Properties) |
| **API** | RESTful Architecture |

## 🎯 API Endpoints

### Oyun Yönetimi
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/games` | Yeni oyun başlat |
| GET | `/api/games` | Aktif oyunları listele |
| GET | `/api/games/history` | Tamamlanan oyunlar (son 10) |
| GET | `/api/games/:id` | Oyun detayları |
| GET | `/api/games/:id/stats` | Oyun istatistikleri |

### Atış Yönetimi
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/games/:id/throws` | Yeni atış kaydet |
| DELETE | `/api/games/:id/players/:playerId/last-turn` | Son atışı geri al |
| DELETE | `/api/games/:id/turns/:turnId` | Belirli turu sil |

### Oyuncu Yönetimi
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/players` | Tüm oyuncular |
| POST | `/api/players` | Yeni oyuncu ekle |

## 📝 Sürüm Geçmişi

### v1.2.0 (Mevcut)
- ✅ Çoklu dil desteği (TR/EN)
- ✅ Sayısal klavye
- ✅ Özel bitiş limiti girişi

### v1.1.0
- ✅ Oyun geçmişi
- ✅ Atış geri alma

### v1.0.0
- ✅ Temel oyun özellikleri
- ✅ SQLite entegrasyonu
- ✅ REST API

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Bu depoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Erhan ABAY**

## 🙏 Teşekkürler

Bu projeyi kullandığınız için teşekkürler! Sorularınız veya önerileriniz için issue açmaktan çekinmeyin.

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐**

Made with ❤️ by Erhan ABAY

Version 1.2.0 | Last Updated: 12 Kasım 2025

</div>

