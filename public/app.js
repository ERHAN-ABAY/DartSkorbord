// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Global State
let currentGame = null;
let currentPlayers = [];
let currentPlayerIndex = 0;
let turnHistory = [];

// ============ YENİ OYUN BAŞLATMA ============

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  generatePlayerInputs(2); // Varsayılan 2 oyuncu
  
  // Oyuncu sayısı değiştiğinde
  document.getElementById('playerCount').addEventListener('change', (e) => {
    generatePlayerInputs(parseInt(e.target.value));
  });
  
  // Atış inputları için auto-calculate
  ['throw1', 'throw2', 'throw3'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateThrowTotal);
  });
});

// Oyuncu input alanlarını oluştur
function generatePlayerInputs(count) {
  const container = document.getElementById('playerInputs');
  container.innerHTML = '';
  
  for (let i = 1; i <= count; i++) {
    const div = document.createElement('div');
    div.className = 'player-input-group';
    div.innerHTML = `
      <label>Oyuncu ${i}:</label>
      <input type="text" id="player${i}" placeholder="Oyuncu ${i}" required>
    `;
    container.appendChild(div);
  }
}

// Oyunu başlat
async function startGame() {
  const gameName = document.getElementById('gameName').value || 'Yeni Oyun';
  const finishLimit = parseInt(document.getElementById('finishLimit').value);
  const playerCount = parseInt(document.getElementById('playerCount').value);
  
  const players = [];
  for (let i = 1; i <= playerCount; i++) {
    const playerName = document.getElementById(`player${i}`).value.trim();
    if (!playerName) {
      alert(`Lütfen ${i}. oyuncunun adını girin!`);
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
      throw new Error(data.error || 'Oyun başlatılamadı');
    }
    
    currentGame = data.game;
    currentPlayers = data.players;
    currentPlayerIndex = 0;
    turnHistory = [];
    
    showScreen('gameScreen');
    updateGameUI();
  } catch (error) {
    alert('Hata: ' + error.message);
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
    alert('En az bir atış girmelisiniz!');
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
      throw new Error(data.error || 'Atış kaydedilemedi');
    }
    
    // Sonucu işle
    handleThrowResult(data);
  } catch (error) {
    alert('Hata: ' + error.message);
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
    showNotification('BUST! Puan geri alındı.', 'danger');
  } else if (data.game.status === 'finished') {
    // Oyun bitti
    showGameEnd(data.game.winner);
    return;
  } else {
    showNotification(`${data.turn.totalScore} puan kaydedildi!`, 'success');
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
    container.innerHTML = '<p style="text-align: center; color: #a0a0a0;">Henüz atış yapılmadı</p>';
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
        <span>Ortalama: ${stat.averagePerTurn} | Turlar: ${stat.totalTurns} | Bust: ${stat.bustCount}</span>
      </div>
    `).join('');
    
    document.getElementById('finalStats').innerHTML = statsHTML;
  } catch (error) {
    console.error('İstatistikler alınamadı:', error);
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
  if (confirm('Ana menüye dönmek istediğinize emin misiniz?')) {
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
      throw new Error('Geçmiş yüklenemedi');
    }
    
    renderGameHistory(games);
    showScreen('historyScreen');
  } catch (error) {
    alert('Hata: ' + error.message);
  }
}

// Geçmişi render et
function renderGameHistory(games) {
  const container = document.getElementById('historyList');
  
  if (games.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #a0a0a0;">Henüz tamamlanmış oyun yok</p>';
    return;
  }
  
  container.innerHTML = games.map(game => {
    const date = new Date(game.finished_at);
    const formattedDate = date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const playersHTML = game.players.map(player => `
      <div class="history-player ${player.player_id === game.winner_player_id ? 'winner' : ''}">
        <div>${player.name}</div>
        <div style="font-size: 0.9rem; color: #a0a0a0;">${player.current_score} kalan</div>
      </div>
    `).join('');
    
    return `
      <div class="history-item">
        <div class="history-header">
          <span class="history-title">${game.name || 'Oyun #' + game.id}</span>
          <span class="history-date">${formattedDate}</span>
        </div>
        <div style="color: #a0a0a0; margin-bottom: 10px;">
          Limit: ${game.finish_limit}
        </div>
        <div class="history-winner">
          🏆 Kazanan: <span class="history-winner-name">${game.winner_name || 'Bilinmiyor'}</span>
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
    alert('Aktif bir oyun yok!');
    return;
  }
  
  // Son atış yapan oyuncuyu bul (bir önceki oyuncu)
  const lastPlayerIndex = (currentPlayerIndex - 1 + currentPlayers.length) % currentPlayers.length;
  const lastPlayer = currentPlayers[lastPlayerIndex];
  
  if (!confirm(`${lastPlayer.name} oyuncusunun son atışını geri almak istediğinize emin misiniz?`)) {
    return;
  }
  
  try {
    const response = await fetch(
      `${API_BASE}/games/${currentGame.id}/players/${lastPlayer.id}/last-turn`,
      { method: 'DELETE' }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Geri alma başarısız');
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
    
    showNotification('Son atış geri alındı!', 'success');
  } catch (error) {
    alert('Hata: ' + error.message);
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
