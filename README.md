# 🎯 Dark Skorbord - Profesyonel Dart Skorboard Uygulaması

**4 oyuncuya kadar** destekleyen, SQLite ile yerel çalışan modern bir dart skorboard uygulaması. Node.js + Express backend ve vanilla JavaScript frontend ile geliştirilmiştir.

## 🚀 Özellikler

- ✅ 1-4 oyuncu desteği
- ✅ Esnek bitiş limiti (301, 501, 701)
- ✅ Otomatik bust kontrolü
- ✅ Tur geçmişi takibi
- ✅ Gerçek zamanlı skor güncellemesi
- ✅ Oyun istatistikleri
- ✅ Modern ve responsive arayüz
- ✅ SQLite ile kalıcı veri saklama
- ✅ **YENİ:** Son 10 oyun geçmişi görüntüleme
- ✅ **YENİ:** Hatalı atışları geri alma özelliği

## 📦 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Veritabanını başlatın (opsiyonel, otomatik oluşturulacak):
```bash
npm run init-db
```

3. Uygulamayı başlatın:
```bash
npm start
```

4. Tarayıcınızda açın:
```
http://localhost:3000
```

## 💻 Geliştirme Modu

Auto-reload ile geliştirme yapmak için:
```bash
npm run dev
```

## 📂 Proje Yapısı

```
DarkSkorbord/
├── src/
│   ├── database/
│   │   ├── schema.sql       # Veritabanı şeması
│   │   ├── init-db.js       # DB başlatma
│   │   └── database.js      # DB işlemleri
│   ├── api/
│   │   └── routes.js        # API endpoints
│   └── game.js              # Oyun mantığı
├── public/
│   ├── index.html           # Ana sayfa
│   ├── styles.css           # Stil dosyası
│   └── app.js               # Frontend logic
├── data/
│   └── dartscoreboard.db    # SQLite DB (otomatik oluşur)
├── server.js                # Express sunucu
└── package.json

```

## 🎮 Kullanım

### Yeni Oyun Başlatma
1. Ana sayfada oyun adını girin (opsiyonel)
2. Bitiş limitini seçin (301/501/701)
3. Oyuncu sayısını belirleyin
4. Oyuncu isimlerini girin
5. "Oyunu Başlat" butonuna tıklayın

### Atış Yapma
1. Sıradaki oyuncunun adı görünecektir
2. 1-3 atış değerini girin
3. Hızlı butonları kullanabilirsiniz
4. "Atışı Kaydet" butonuna tıklayın

### Kurallar
- Her oyuncu sırayla 3 dart atma hakkına sahiptir
- Kalan puan tam 0 olursa oyuncu kazanır
- Negatif puan olursa BUST (o tur geri alınır)
- Son atış "↶ Geri Al" butonu ile iptal edilebilir

### Yeni Özellikler

#### 📊 Oyun Geçmişi
- Ana menüden "Oyun Geçmişi" butonuna tıklayın
- Son 10 tamamlanmış oyunu görüntüleyin
- Kazanan ve tüm oyuncuların skorlarını inceleyin

#### ↶ Atış Geri Alma
- Oyun sırasında yanlış giriş yaptıysanız
- "Son Atışı Geri Al" butonuna tıklayın
- Son atış iptal edilir ve sıra o oyuncuya geri verilir

**Detaylı bilgi için**: [YENI_OZELLIKLER.md](YENI_OZELLIKLER.md) dosyasına bakın

## 🔌 API Endpoints

### Oyun İşlemleri
- `POST /api/games` - Yeni oyun başlat
- `GET /api/games` - Aktif oyunları listele
- `GET /api/games/history` - Tamamlanmış oyun geçmişi (son 10)
- `GET /api/games/:id` - Oyun durumunu getir
- `GET /api/games/:id/stats` - Oyun istatistikleri

### Atış İşlemleri
- `POST /api/games/:id/throws` - Atış yap
- `DELETE /api/games/:id/players/:playerId/last-turn` - Son atışı geri al
- `DELETE /api/games/:id/turns/:turnId` - Belirli bir turu sil

### Oyuncu İşlemleri
- `GET /api/players` - Tüm oyuncuları listele
- `POST /api/players` - Yeni oyuncu ekle

## 🗄️ Veritabanı Yapısı

SQLite ile 5 ana tablo kullanılır:

### 1. `players` - Oyuncu Profilleri
```sql
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### 2. `games` - Oyun Oturumları
```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  finish_limit INTEGER NOT NULL,
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT,
  winner_player_id INTEGER
);
```

### 3. `game_players` - Oyun-Oyuncu İlişkisi
```sql
CREATE TABLE game_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  seat INTEGER NOT NULL, -- Sıra (1-4)
  starting_score INTEGER NOT NULL,
  current_score INTEGER NOT NULL
);
```

### 4. `turns` - Turlar
```sql
CREATE TABLE turns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  game_player_id INTEGER NOT NULL,
  turn_index INTEGER NOT NULL,
  total_score INTEGER DEFAULT 0,
  is_bust INTEGER DEFAULT 0
);
```

### 5. `throws` - Atışlar
```sql
CREATE TABLE throws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turn_id INTEGER NOT NULL,
  throw_index INTEGER NOT NULL, -- 1-3
  value INTEGER NOT NULL
);
```

## 🎯 Oyun Mantığı

### Temel Akış
- Oyun: Her oyuncu sırayla atış yapar (her tur 3 dart).
- Oyuncu sayısı: 1-4 arası.
- Bitiş limiti: Oyun başlangıcında belirlenir (ör. 301, 501, 701).
- Hedef: Puan toplamı veya kalan puan (uygulamaya göre) — burada **kalan puan** modeli kullanılmıştır (başlangıç = bitiş limiti, 0 veya negatif olunca bitiş kuralları uygulanır).
- Veri saklama: SQLite (yerel DB). Tüm oyun, oyuncu, tur ve atış bilgileri tutulur.

### Kullanıcı Akışı
1. Yeni oyun oluşturulur: oyuncu sayısı (1-4), oyuncu isimleri ve bitiş limiti girilir.
2. Oyun başladığında her oyuncunun başlangıç puanı = bitiş limiti.
3. Sıra gelen oyuncu 1-3 atış yapar (her atışın değeri kaydedilir).
4. Atışlar toplandığında oyuncunun kalan puanı güncellenir.
5. Bitiş kuralı: Kalan puan tam 0 olursa oyuncu kazanır; negatif olursa (bust) o turun puanları geri alınır.
6. Oyun tamamlandığında maç bilgisi veritabanına kaydedilmiş olur.

## 📊 Örnek Kullanım

### API ile Oyun Başlatma
```javascript
fetch('http://localhost:3000/api/games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Akşam Maçı',
    finishLimit: 501,
    players: ['Ali', 'Bora', 'Cem']
  })
});
```

### Atış Yapma
```javascript
fetch('http://localhost:3000/api/games/1/throws', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gamePlayerId: 1,
    throws: [60, 20, 1]
  })
});
```

## 🛠️ Teknolojiler

- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (better-sqlite3)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **API**: RESTful

## 📝 Notlar

- Bu model esnek tutuldu — örneğin bitiş kurallarını değiştirmek (double-out vs single-out) istersen `turns` tablosuna `finish_type` veya `throws` tablosuna `is_double` gibi sütunlar ekleyebilirsin.
- Performans: SQLite, tek kullanıcılı mobil/masaüstü uygulamalar için yeterlidir.
- Uygulama kapatılıp açıldığında SQLite DB üzerinden oyun devam ettirilebilir.

## 📄 Lisans

MIT

---

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açarak ne değiştirmek istediğinizi tartışın.

---

**Geliştirici**: Erhan ABAY  
**Versiyon**: 1.0.0  
**Son Güncelleme**: 2025

