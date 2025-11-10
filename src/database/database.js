const { db } = require('./init-db');

// ============ OYUNCU İŞLEMLERİ ============

// Yeni oyuncu oluştur veya var olanı getir
function createOrGetPlayer(name) {
  // Önce var mı kontrol et
  const existing = db.prepare('SELECT * FROM players WHERE name = ?').get(name);
  if (existing) return existing;
  
  // Yoksa oluştur
  const result = db.prepare('INSERT INTO players (name) VALUES (?)').run(name);
  return db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
}

// Tüm oyuncuları getir
function getAllPlayers() {
  return db.prepare('SELECT * FROM players ORDER BY name').all();
}

// ============ OYUN İŞLEMLERİ ============

// Yeni oyun oluştur
function createGame(gameName, finishLimit, playerNames) {
  const transaction = db.transaction((name, limit, players) => {
    // Oyunu oluştur
    const gameResult = db.prepare(
      'INSERT INTO games (name, finish_limit) VALUES (?, ?)'
    ).run(name, limit);
    const gameId = gameResult.lastInsertRowid;
    
    // Oyuncuları ekle
    const gamePlayerIds = [];
    players.forEach((playerName, index) => {
      const player = createOrGetPlayer(playerName);
      const gpResult = db.prepare(`
        INSERT INTO game_players (game_id, player_id, seat, starting_score, current_score)
        VALUES (?, ?, ?, ?, ?)
      `).run(gameId, player.id, index + 1, limit, limit);
      gamePlayerIds.push(gpResult.lastInsertRowid);
    });
    
    return { gameId, gamePlayerIds };
  });
  
  return transaction(gameName, finishLimit, playerNames);
}

// Oyun bilgilerini getir
function getGame(gameId) {
  return db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
}

// Aktif oyunları getir (bitmemiş)
function getActiveGames() {
  return db.prepare('SELECT * FROM games WHERE finished_at IS NULL ORDER BY started_at DESC').all();
}

// Oyun oyuncularını getir
function getGamePlayers(gameId) {
  return db.prepare(`
    SELECT gp.*, p.name
    FROM game_players gp
    JOIN players p ON p.id = gp.player_id
    WHERE gp.game_id = ?
    ORDER BY gp.seat
  `).all(gameId);
}

// Oyunu bitir (kazanan belirle)
function finishGame(gameId, winnerPlayerId) {
  return db.prepare(`
    UPDATE games 
    SET finished_at = datetime('now'), winner_player_id = ?
    WHERE id = ?
  `).run(winnerPlayerId, gameId);
}

// ============ TUR İŞLEMLERİ ============

// Yeni tur oluştur
function createTurn(gameId, gamePlayerId, turnIndex) {
  const result = db.prepare(`
    INSERT INTO turns (game_id, game_player_id, turn_index, total_score)
    VALUES (?, ?, ?, 0)
  `).run(gameId, gamePlayerId, turnIndex);
  return result.lastInsertRowid;
}

// Tur bilgisi getir
function getTurn(turnId) {
  return db.prepare('SELECT * FROM turns WHERE id = ?').get(turnId);
}

// Oyuncunun son turunu getir
function getLastTurn(gamePlayerId) {
  return db.prepare(`
    SELECT * FROM turns 
    WHERE game_player_id = ?
    ORDER BY turn_index DESC 
    LIMIT 1
  `).get(gamePlayerId);
}

// Tur toplamını güncelle
function updateTurnTotal(turnId, totalScore, isBust = 0) {
  return db.prepare(`
    UPDATE turns 
    SET total_score = ?, is_bust = ?
    WHERE id = ?
  `).run(totalScore, isBust, turnId);
}

// ============ ATIŞ İŞLEMLERİ ============

// Atış kaydet
function createThrow(turnId, throwIndex, value) {
  const result = db.prepare(`
    INSERT INTO throws (turn_id, throw_index, value)
    VALUES (?, ?, ?)
  `).run(turnId, throwIndex, value);
  return result.lastInsertRowid;
}

// Turun atışlarını getir
function getTurnThrows(turnId) {
  return db.prepare(`
    SELECT * FROM throws 
    WHERE turn_id = ?
    ORDER BY throw_index
  `).all(turnId);
}

// ============ SKOR GÜNCELLEMESİ ============

// Oyuncu skorunu güncelle
function updatePlayerScore(gamePlayerId, newScore) {
  return db.prepare(`
    UPDATE game_players 
    SET current_score = ?
    WHERE id = ?
  `).run(newScore, gamePlayerId);
}

// Oyuncu skorunu al
function getPlayerScore(gamePlayerId) {
  const result = db.prepare('SELECT current_score FROM game_players WHERE id = ?').get(gamePlayerId);
  return result ? result.current_score : null;
}

// ============ İSTATİSTİKLER ============

// Oyunun tüm turlarını getir
function getGameTurns(gameId) {
  return db.prepare(`
    SELECT t.*, gp.seat, p.name as player_name
    FROM turns t
    JOIN game_players gp ON gp.id = t.game_player_id
    JOIN players p ON p.id = gp.player_id
    WHERE t.game_id = ?
    ORDER BY t.turn_index, gp.seat
  `).all(gameId);
}

// Oyuncunun tüm turlarını getir
function getPlayerTurns(gamePlayerId) {
  return db.prepare(`
    SELECT * FROM turns 
    WHERE game_player_id = ?
    ORDER BY turn_index
  `).all(gamePlayerId);
}

module.exports = {
  // Oyuncu
  createOrGetPlayer,
  getAllPlayers,
  
  // Oyun
  createGame,
  getGame,
  getActiveGames,
  getGamePlayers,
  finishGame,
  
  // Tur
  createTurn,
  getTurn,
  getLastTurn,
  updateTurnTotal,
  
  // Atış
  createThrow,
  getTurnThrows,
  
  // Skor
  updatePlayerScore,
  getPlayerScore,
  
  // İstatistik
  getGameTurns,
  getPlayerTurns
};
