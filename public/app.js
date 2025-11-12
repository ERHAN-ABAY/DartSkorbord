// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Global State
let currentGame = null;
let currentPlayers = [];
let currentPlayerIndex = 0;
let turnHistory = [];
let activeThrowInput = null; // Aktif atış input'u (sayısal klavye için)

// ============ DİL YÖNETİMİ ============

// Dili değiştir
function changeLanguage(lang) {
  i18n.setLanguage(lang);
}

// ============ BİTİŞ LİMİTİ YÖNETİMİ ============

// Bitiş limitini ayarla
function setFinishLimit(value) {
  document.getElementById('finishLimit').value = value;
  document.getElementById('currentLimitDisplay').textContent = value;
  document.getElementById('customLimit').value = '';
  
  // Aktif butonu güncelle
  document.querySelectorAll('.btn-limit').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Tıklanan butonu aktif yap
  event.target.classList.add('active');
}

// Özel limit güncelle
function updateCustomLimit(value) {
  if (value && parseInt(value) > 0) {
    document.getElementById('finishLimit').value = value;
    document.getElementById('currentLimitDisplay').textContent = value;
    
    // Tüm preset butonlarını pasif yap
    document.querySelectorAll('.btn-limit').forEach(btn => {
      btn.classList.remove('active');
    });
  } else if (!value) {
    // Boşsa varsayılan 501'e dön
    setFinishLimit(501);
    document.querySelectorAll('.btn-limit')[1].classList.add('active');
  }
}

// ============ SAYISAL KLAVYE ============

// Rakam ekle
function addDigit(digit) {
  // Eğer aktif input yoksa, ilk boş input'u bul
  if (!activeThrowInput) {
    const inputs = ['throw1', 'throw2', 'throw3'];
    for (const id of inputs) {
      const input = document.getElementById(id);
      if (!input.value || input.value === '0') {
        activeThrowInput = input;
        break;
      }
    }
  }
  
  if (activeThrowInput) {
    const currentValue = activeThrowInput.value || '0';
    let newValue = currentValue === '0' ? digit : currentValue + digit;
    
    // Maksimum 180 kontrolü
    if (parseInt(newValue) <= 180) {
      activeThrowInput.value = newValue;
      calculateThrowTotal();
    }
  }
}

// Rakam sil (backspace)
function deleteDigit() {
  if (!activeThrowInput) return;
  
  const currentValue = activeThrowInput.value || '';
  if (currentValue.length > 0) {
    activeThrowInput.value = currentValue.slice(0, -1) || '0';
    calculateThrowTotal();
  }
}

// Mevcut input'u temizle
function clearCurrentInput() {
  if (activeThrowInput) {
    activeThrowInput.value = '';
    calculateThrowTotal();
  } else {
    // Hepsini temizle
    clearThrowInputs();
  }
}

// Input focus olayları
function setupInputListeners() {
  ['throw1', 'throw2', 'throw3'].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('focus', () => {
      activeThrowInput = input;
    });
  });
}

// ============ YENİ OYUN BAŞLATMA ============

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  // Dil sistemini başlat
  i18n.init();
  i18n.updateUI();
  
  // Oyuncu input'larını oluştur
  generatePlayerInputs(2); // Varsayılan 2 oyuncu
  
  // Oyuncu sayısı değiştiğinde
  document.getElementById('playerCount').addEventListener('change', (e) => {
    generatePlayerInputs(parseInt(e.target.value));
  });
  
  // Atış inputları için auto-calculate
  ['throw1', 'throw2', 'throw3'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateThrowTotal);
  });
  
  // Input listener'ları kur (sayısal klavye için)
  setupInputListeners();
});

// Oyuncu input alanlarını oluştur
function generatePlayerInputs(count) {
  const container = document.getElementById('playerInputs');
  container.innerHTML = '';
  
  for (let i = 1; i <= count; i++) {
    const div = document.createElement('div');
    div.className = 'player-input-group';
    div.innerHTML = `
      <label>${i18n.t('players')} ${i}:</label>
      <input type="text" id="player${i}" placeholder="${i18n.t('players')} ${i}" required>
    `;
    container.appendChild(div);
  }
}

// Oyunu başlat
async function startGame() {
  const gameName = document.getElementById('gameName').value || i18n.t('newGame');
  const finishLimit = parseInt(document.getElementById('finishLimit').value);
  const playerCount = parseInt(document.getElementById('playerCount').value);
  
  const players = [];
  for (let i = 1; i <= playerCount; i++) {
    const playerName = document.getElementById(`player${i}`).value.trim();
    if (!playerName) {
      alert(i18n.t('enterPlayerName').replace('oyuncunun', `${i}. ${i18n.t('players').toLowerCase()}`));
      return;
    }
    players.push(playerName);
  }
  
  try {
    const response = await fetch(`${API_BASE}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: gameName, finishLimit, players })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || i18n.t('error'));
    }
    
    currentGame = data.game;
    currentPlayers = data.players;
    currentPlayerIndex = 0;
    turnHistory = [];
    
    showScreen('gameScreen');
    updateGameUI();
  } catch (error) {
    alert(i18n.t('error') + ': ' + error.message);
  }
}

// ============ OYUN EKRANI ============

// Oyun arayüzünü güncelle
function updateGameUI() {
  // Oyun başlığı
  document.getElementById('gameTitle').textContent = currentGame.name || 'Oyun';
  
  // Oyuncu skorları
  renderPlayerScores();
  
  // Mevcut oyuncu
  const currentPlayer = currentPlayers[currentPlayerIndex];
  document.getElementById('currentPlayerName').textContent = currentPlayer.name;
  document.getElementById('currentPlayerScore').textContent = currentPlayer.current_score;
  
  // Atış alanlarını temizle
  clearThrowInputs();
  
  // Tur geçmişini göster
  renderTurnHistory();
}

// Oyuncu skor kartlarını render et
function renderPlayerScores() {
  const container = document.getElementById('playerScores');
  container.innerHTML = '';
  
  currentPlayers.forEach((player, index) => {
    const card = document.createElement('div');
    card.className = `player-card ${index === currentPlayerIndex ? 'active' : ''}`;
    card.innerHTML = `
      <h3>${player.name}</h3>
      <span class="label">Kalan Puan</span>
      <div class="score">${player.current_score}</div>
    `;
    container.appendChild(card);
  });
}

// Atış toplamını hesapla
function calculateThrowTotal() {
  const throw1 = parseInt(document.getElementById('throw1').value) || 0;
  const throw2 = parseInt(document.getElementById('throw2').value) || 0;
  const throw3 = parseInt(document.getElementById('throw3').value) || 0;
  
  const total = throw1 + throw2 + throw3;
  document.getElementById('throwTotal').textContent = total;
}

// Hızlı skor girişi
function quickScore(score) {
  // İlk boş alana yaz
  const inputs = ['throw1', 'throw2', 'throw3'];
  for (const id of inputs) {
    const input = document.getElementById(id);
    if (!input.value) {
      input.value = score;
      calculateThrowTotal();
      return;
    }
  }
  // Hepsi doluysa, hepsini temizle ve birinciye yaz
  clearThrowInputs();
  document.getElementById('throw1').value = score;
  calculateThrowTotal();
}

// Atış inputlarını temizle
function clearThrowInputs() {
  document.getElementById('throw1').value = '';
  document.getElementById('throw2').value = '';
  document.getElementById('throw3').value = '';
  document.getElementById('throwTotal').textContent = '0';
}

// Atışları kaydet
async function submitThrows() {
  const throw1 = parseInt(document.getElementById('throw1').value) || 0;
  const throw2 = parseInt(document.getElementById('throw2').value) || 0;
  const throw3 = parseInt(document.getElementById('throw3').value) || 0;
  
  const throws = [];
  if (throw1 > 0) throws.push(throw1);
  if (throw2 > 0) throws.push(throw2);
  if (throw3 > 0) throws.push(throw3);
  
  if (throws.length === 0) {
    alert(i18n.t('enterAtLeastOneThrow'));
    return;
  }
  
  const currentPlayer = currentPlayers[currentPlayerIndex];
  
  try {
    const response = await fetch(`${API_BASE}/games/${currentGame.id}/throws`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gamePlayerId: currentPlayer.id,
        throws: throws
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || i18n.t('error'));
    }
    
    // Sonucu işle
    handleThrowResult(data);
  } catch (error) {
    alert(i18n.t('error') + ': ' + error.message);
  }
}

// Atış sonucunu işle
function handleThrowResult(data) {
  // Tur geçmişine ekle
  turnHistory.unshift({
    playerName: currentPlayers[currentPlayerIndex].name,
    score: data.turn.totalScore,
    isBust: data.turn.isBust
  });
  
  // Oyuncuları güncelle
  currentPlayers = data.allPlayers;
  
  // Bust kontrolü
  if (data.turn.isBust) {
    showNotification(i18n.t('bust'), 'danger');
  } else if (data.game.status === 'finished') {
    // Oyun bitti
    showGameEnd(data.game.winner);
    return;
  } else {
    showNotification(`${data.turn.totalScore} ${i18n.t('pointsRecorded')}`, 'success');
  }
  
  // Sıradaki oyuncuya geç
  currentPlayerIndex = (currentPlayerIndex + 1) % currentPlayers.length;
  
  // UI'ı güncelle
  updateGameUI();
}

// Bildirim göster
function showNotification(message, type = 'info') {
  // Basit alert kullanıyoruz, gelişmiş bir toast sistemi eklenebilir
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Görsel feedback
  const scoreDisplay = document.getElementById('currentPlayerScore');
  scoreDisplay.style.animation = 'none';
  setTimeout(() => {
    scoreDisplay.style.animation = 'pulse 0.5s';
  }, 10);
}

// Tur geçmişini render et
function renderTurnHistory() {
  const container = document.getElementById('turnHistoryList');
  
  if (turnHistory.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: #a0a0a0;">${i18n.t('noGamesYet')}</p>`;
    return;
  }
  
  container.innerHTML = turnHistory.slice(0, 10).map(turn => `
    <div class="turn-item ${turn.isBust ? 'bust' : ''}">
      <span class="player-name">${turn.playerName}</span>
      <span class="turn-score">${turn.isBust ? 'BUST' : turn.score}</span>
    </div>
  `).join('');
}

// ============ OYUN BİTİŞİ ============

// Oyun bitişini göster
async function showGameEnd(winner) {
  document.getElementById('winnerName').textContent = winner.name;
  
  // İstatistikleri al
  try {
    const response = await fetch(`${API_BASE}/games/${currentGame.id}/stats`);
    const stats = await response.json();
    
    const statsHTML = stats.map(stat => `
      <div class="stat-row">
        <strong>${stat.playerName}</strong>
        <span>${i18n.t('averagePerTurn')}: ${stat.averagePerTurn} | ${i18n.t('totalTurns')}: ${stat.totalTurns} | ${i18n.t('bustCount')}: ${stat.bustCount}</span>
      </div>
    `).join('');
    
    document.getElementById('finalStats').innerHTML = statsHTML;
  } catch (error) {
    console.error(i18n.t('loadError') + ':', error);
  }
  
  showScreen('gameEndScreen');
}

// ============ NAVİGASYON ============

// Ekran geçişi
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// Ana menüye dön
function backToMenu() {
  if (confirm(i18n.t('confirmBackToMenu'))) {
    currentGame = null;
    currentPlayers = [];
    currentPlayerIndex = 0;
    turnHistory = [];
    showScreen('newGameScreen');
  }
}

// ============ OYUN GEÇMİŞİ ============

// Oyun geçmişini göster
async function showGameHistory() {
  try {
    const response = await fetch(`${API_BASE}/games/history`);
    const games = await response.json();
    
    if (!response.ok) {
      throw new Error(i18n.t('loadError'));
    }
    
    renderGameHistory(games);
    showScreen('historyScreen');
  } catch (error) {
    alert(i18n.t('error') + ': ' + error.message);
  }
}

// Geçmişi render et
function renderGameHistory(games) {
  const container = document.getElementById('historyList');
  
  if (games.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: #a0a0a0;">${i18n.t('noGamesYet')}</p>`;
    return;
  }
  
  container.innerHTML = games.map(game => {
    const date = new Date(game.finished_at);
    const formattedDate = date.toLocaleDateString(i18n.currentLang === 'tr' ? 'tr-TR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const playersHTML = game.players.map(player => `
      <div class="history-player ${player.player_id === game.winner_player_id ? 'winner' : ''}">
        <div>${player.name}</div>
        <div style="font-size: 0.9rem; color: #a0a0a0;">${player.current_score} ${i18n.t('remaining').toLowerCase()}</div>
      </div>
    `).join('');
    
    return `
      <div class="history-item">
        <div class="history-header">
          <span class="history-title">${game.name || i18n.t('game') + ' #' + game.id}</span>
          <span class="history-date">${formattedDate}</span>
        </div>
        <div style="color: #a0a0a0; margin-bottom: 10px;">
          ${i18n.t('limit')}: ${game.finish_limit}
        </div>
        <div class="history-winner">
          🏆 ${i18n.t('winner')}: <span class="history-winner-name">${game.winner_name || i18n.t('noGamesYet')}</span>
        </div>
        <div class="history-players">
          ${playersHTML}
        </div>
      </div>
    `;
  }).join('');
}

// ============ GERİ ALMA İŞLEMLERİ ============

// Son atışı geri al
async function undoLastThrow() {
  if (!currentGame || currentPlayers.length === 0) {
    alert(i18n.t('noActiveGame'));
    return;
  }
  
  // Son atış yapan oyuncuyu bul (bir önceki oyuncu)
  const lastPlayerIndex = (currentPlayerIndex - 1 + currentPlayers.length) % currentPlayers.length;
  const lastPlayer = currentPlayers[lastPlayerIndex];
  
  if (!confirm(`${lastPlayer.name} ${i18n.t('confirmUndo')}`)) {
    return;
  }
  
  try {
    const response = await fetch(
      `${API_BASE}/games/${currentGame.id}/players/${lastPlayer.id}/last-turn`,
      { method: 'DELETE' }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || i18n.t('error'));
    }
    
    // Oyuncuları güncelle
    currentPlayers = data.players;
    
    // Geçmişten sil
    if (turnHistory.length > 0) {
      turnHistory.shift();
    }
    
    // Sırayı geri al
    currentPlayerIndex = lastPlayerIndex;
    
    // UI'ı güncelle
    updateGameUI();
    
    showNotification(i18n.t('undoSuccess'), 'success');
  } catch (error) {
    alert(i18n.t('error') + ': ' + error.message);
  }
}

// Animasyon
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;
document.head.appendChild(style);
