-- Oyuncu tabloları (kalıcı profil)
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Oyun oturumu
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, -- isteğe bağlı oyun başlığı
  finish_limit INTEGER NOT NULL, -- ör: 301, 501, 701
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT, -- oyun bitince doldurulur
  winner_player_id INTEGER, -- oyun bittiğinde doldurulur
  FOREIGN KEY (winner_player_id) REFERENCES players(id)
);

-- Bir oyuna hangi oyuncular katıldı (sıra bilgisini de içerir)
CREATE TABLE IF NOT EXISTS game_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  player_id INTEGER NOT NULL,
  seat INTEGER NOT NULL, -- 1..4, sırayı tutmak için
  starting_score INTEGER NOT NULL, -- oyun başındaki skor (finish_limit)
  current_score INTEGER NOT NULL, -- anlık kalan skor
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Her oyuncunun turu (bir tur, oyuncunun 1-3 atışını kapsar)
CREATE TABLE IF NOT EXISTS turns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  game_player_id INTEGER NOT NULL,
  turn_index INTEGER NOT NULL, -- oyundaki tura göre artar (0,1,2...)
  total_score INTEGER DEFAULT 0, -- bu turdaki toplam atış puanı
  created_at TEXT DEFAULT (datetime('now')),
  is_bust INTEGER DEFAULT 0, -- 1 ise bust oldu ve puan geri alınır
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (game_player_id) REFERENCES game_players(id)
);

-- Her bir dart atış kaydı
CREATE TABLE IF NOT EXISTS throws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turn_id INTEGER NOT NULL,
  throw_index INTEGER NOT NULL, -- 1..3
  value INTEGER NOT NULL, -- atışın puanı (0-180 arası)
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (turn_id) REFERENCES turns(id)
);
