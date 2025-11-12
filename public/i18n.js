// Türkçe çeviriler
const tr = {
  // Genel
  appTitle: "Dark Skorbord",
  appSubtitle: "Profesyonel Dart Skorboard Uygulaması",
  
  // Ana Menü
  newGame: "Yeni Oyun Başlat",
  gameHistory: "📊 Oyun Geçmişi",
  gameName: "Oyun Adı (Opsiyonel)",
  finishLimit: "Bitiş Limiti",
  customLimit: "Özel Limit",
  selectedLimit: "Seçili Limit",
  playerCount: "Oyuncu Sayısı",
  players: "Oyuncu",
  practice: "Pratik",
  startGame: "Oyunu Başlat",
  backToMenu: "Ana Menü",
  
  // Oyun Ekranı
  currentTurn: "Sıra",
  remaining: "Kalan",
  throws: "Atışlar",
  throw: "Atış",
  total: "Toplam",
  saveThrow: "Atışı Kaydet",
  undoLastThrow: "↶ Son Atışı Geri Al",
  quickInputs: "Hızlı Girişler",
  recentTurns: "Son Turlar",
  
  // Manuel Giriş
  numericKeypad: "Sayısal Klavye",
  clear: "Temizle",
  delete: "Sil",
  
  // Oyun Geçmişi
  historyTitle: "Oyun Geçmişi",
  noGamesYet: "Henüz tamamlanmış oyun yok",
  winner: "Kazanan",
  game: "Oyun",
  limit: "Limit",
  
  // Oyun Sonu
  gameOver: "🏆 Oyun Bitti!",
  winnerIs: "Kazanan",
  newGameButton: "Yeni Oyun",
  statistics: "İstatistikler",
  averagePerTurn: "Tur Ortalaması",
  totalTurns: "Toplam Tur",
  bustCount: "Bust Sayısı",
  
  // Mesajlar
  bust: "BUST! Puan geri alındı.",
  pointsRecorded: "puan kaydedildi!",
  confirmBackToMenu: "Ana menüye dönmek istediğinize emin misiniz?",
  confirmUndo: "oyuncusunun son atışını geri almak istediğinize emin misiniz?",
  enterPlayerName: "Lütfen oyuncunun adını girin!",
  enterAtLeastOneThrow: "En az bir atış girmelisiniz!",
  noActiveGame: "Aktif bir oyun yok!",
  undoSuccess: "Son atış geri alındı!",
  
  // Hatalar
  error: "Hata",
  loadError: "Yüklenemedi",
  
  // Ayarlar
  settings: "Ayarlar",
  language: "Dil",
  turkish: "Türkçe",
  english: "English"
};

// İngilizce çeviriler
const en = {
  // General
  appTitle: "Dark Skorbord",
  appSubtitle: "Professional Dart Scoreboard Application",
  
  // Main Menu
  newGame: "Start New Game",
  gameHistory: "📊 Game History",
  gameName: "Game Name (Optional)",
  finishLimit: "Finish Limit",
  customLimit: "Custom Limit",
  selectedLimit: "Selected Limit",
  playerCount: "Number of Players",
  players: "Player",
  practice: "Practice",
  startGame: "Start Game",
  backToMenu: "Main Menu",
  
  // Game Screen
  currentTurn: "Current Turn",
  remaining: "Remaining",
  throws: "Throws",
  throw: "Throw",
  total: "Total",
  saveThrow: "Save Throw",
  undoLastThrow: "↶ Undo Last Throw",
  quickInputs: "Quick Inputs",
  recentTurns: "Recent Turns",
  
  // Manual Input
  numericKeypad: "Numeric Keypad",
  clear: "Clear",
  delete: "Delete",
  
  // Game History
  historyTitle: "Game History",
  noGamesYet: "No completed games yet",
  winner: "Winner",
  game: "Game",
  limit: "Limit",
  
  // Game Over
  gameOver: "🏆 Game Over!",
  winnerIs: "Winner",
  newGameButton: "New Game",
  statistics: "Statistics",
  averagePerTurn: "Average Per Turn",
  totalTurns: "Total Turns",
  bustCount: "Bust Count",
  
  // Messages
  bust: "BUST! Points reverted.",
  pointsRecorded: "points recorded!",
  confirmBackToMenu: "Are you sure you want to return to main menu?",
  confirmUndo: "Are you sure you want to undo the last throw of player",
  enterPlayerName: "Please enter the player's name!",
  enterAtLeastOneThrow: "You must enter at least one throw!",
  noActiveGame: "No active game!",
  undoSuccess: "Last throw undone!",
  
  // Errors
  error: "Error",
  loadError: "Failed to load",
  
  // Settings
  settings: "Settings",
  language: "Language",
  turkish: "Türkçe",
  english: "English"
};

// Dil yönetimi
const i18n = {
  currentLang: 'tr',
  translations: { tr, en },
  
  // Dili ayarla
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('darkskorbord_lang', lang);
      this.updateUI();
    }
  },
  
  // Çeviri al
  t(key) {
    return this.translations[this.currentLang][key] || key;
  },
  
  // Dili başlat
  init() {
    const savedLang = localStorage.getItem('darkskorbord_lang');
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    }
  },
  
  // UI'ı güncelle
  updateUI() {
    // Tüm data-i18n özellikli elementleri güncelle
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = this.t(key);
    });
    
    // Placeholder'ları güncelle
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });
    
    // Dil seçiciyi güncelle
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
      langSelect.value = this.currentLang;
    }
  }
};
