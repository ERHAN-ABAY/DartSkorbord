const db = require('./database/database');

/**
 * Yeni oyun başlat
 * @param {string} gameName - Oyun adı (opsiyonel)
 * @param {number} finishLimit - Bitiş limiti (301, 501, 701 vb.)
 * @param {string[]} playerNames - Oyuncu isimleri (1-4 arası)
 * @returns {object} - Oyun bilgileri
 */
function startNewGame(gameName, finishLimit, playerNames) {
  if (!playerNames || playerNames.length < 1 || playerNames.length > 4) {
    throw new Error('Oyuncu sayısı 1-4 arasında olmalıdır.');
  }
  
  if (!finishLimit || finishLimit <= 0) {
    throw new Error('Geçerli bir bitiş limiti girilmelidir.');
  }
  
  const result = db.createGame(gameName || 'Yeni Oyun', finishLimit, playerNames);
  const game = db.getGame(result.gameId);
  const players = db.getGamePlayers(result.gameId);
  
  return {
    game,
    players,
    currentPlayerIndex: 0,
    message: 'Oyun başladı!'
  };
}

/**
 * Atış yap
 * @param {number} gameId - Oyun ID
 * @param {number} gamePlayerId - Oyuncu ID (game_players tablosundan)
 * @param {number[]} throwValues - Atış değerleri (1-3 adet)
 * @returns {object} - Güncel oyun durumu
 */
function makeThrows(gameId, gamePlayerId, throwValues) {
  if (!throwValues || throwValues.length === 0 || throwValues.length > 3) {
    throw new Error('1-3 arası atış yapılmalıdır.');
  }
  
  // Oyuncunun mevcut skorunu al
  const currentScore = db.getPlayerScore(gamePlayerId);
  if (currentScore === null) {
    throw new Error('Oyuncu bulunamadı.');
  }
  
  // Son turu al veya yeni tur oluştur
  let turn = db.getLastTurn(gamePlayerId);
  let turnIndex = 0;
  
  if (!turn) {
    // İlk tur
    const turnId = db.createTurn(gameId, gamePlayerId, 0);
    turn = db.getTurn(turnId);
  } else {
    // Yeni tur oluştur
    turnIndex = turn.turn_index + 1;
    const turnId = db.createTurn(gameId, gamePlayerId, turnIndex);
    turn = db.getTurn(turnId);
  }
  
  // Atışları kaydet
  let totalThrowScore = 0;
  throwValues.forEach((value, index) => {
    db.createThrow(turn.id, index + 1, value);
    totalThrowScore += value;
  });
  
  // Yeni skoru hesapla
  const newScore = currentScore - totalThrowScore;
  
  // Bust kontrolü (negatif olursa bust)
  let isBust = false;
  let finalScore = newScore;
  let gameStatus = 'ongoing';
  let winner = null;
  
  if (newScore < 0) {
    // BUST! Puan geri alınır
    isBust = true;
    finalScore = currentScore; // Eski skora geri dön
    db.updateTurnTotal(turn.id, totalThrowScore, 1);
    db.updatePlayerScore(gamePlayerId, currentScore);
  } else if (newScore === 0) {
    // KAZANDI!
    db.updateTurnTotal(turn.id, totalThrowScore, 0);
    db.updatePlayerScore(gamePlayerId, 0);
    
    // Oyunu bitir
    const player = db.getGamePlayers(gameId).find(p => p.id === gamePlayerId);
    db.finishGame(gameId, player.player_id);
    gameStatus = 'finished';
    winner = player;
  } else {
    // Normal skor güncellemesi
    db.updateTurnTotal(turn.id, totalThrowScore, 0);
    db.updatePlayerScore(gamePlayerId, newScore);
  }
  
  // Güncel oyun durumunu döndür
  const players = db.getGamePlayers(gameId);
  
  return {
    turn: {
      id: turn.id,
      totalScore: totalThrowScore,
      throws: throwValues,
      isBust
    },
    player: {
      id: gamePlayerId,
      previousScore: currentScore,
      newScore: finalScore,
      scoreChange: isBust ? 0 : -totalThrowScore
    },
    game: {
      id: gameId,
      status: gameStatus,
      winner: winner
    },
    allPlayers: players
  };
}

/**
 * Oyun durumunu getir
 * @param {number} gameId - Oyun ID
 * @returns {object} - Oyun durumu
 */
function getGameState(gameId) {
  const game = db.getGame(gameId);
  if (!game) {
    throw new Error('Oyun bulunamadı.');
  }
  
  const players = db.getGamePlayers(gameId);
  const turns = db.getGameTurns(gameId);
  
  return {
    game,
    players,
    turns,
    isFinished: game.finished_at !== null
  };
}

/**
 * Sıradaki oyuncuyu belirle
 * @param {number} gameId - Oyun ID
 * @param {number} currentPlayerIndex - Şu anki oyuncu indeksi
 * @returns {object} - Sonraki oyuncu bilgisi
 */
function getNextPlayer(gameId, currentPlayerIndex) {
  const players = db.getGamePlayers(gameId);
  const nextIndex = (currentPlayerIndex + 1) % players.length;
  
  return {
    nextPlayer: players[nextIndex],
    nextPlayerIndex: nextIndex
  };
}

/**
 * Oyun istatistikleri
 * @param {number} gameId - Oyun ID
 * @returns {object} - İstatistikler
 */
function getGameStats(gameId) {
  const players = db.getGamePlayers(gameId);
  const turns = db.getGameTurns(gameId);
  
  const stats = players.map(player => {
    const playerTurns = turns.filter(t => t.game_player_id === player.id);
    const totalTurns = playerTurns.length;
    const totalThrows = playerTurns.reduce((sum, t) => sum + t.total_score, 0);
    const bustCount = playerTurns.filter(t => t.is_bust).length;
    const average = totalTurns > 0 ? (totalThrows / totalTurns).toFixed(2) : 0;
    
    return {
      playerName: player.name,
      currentScore: player.current_score,
      totalTurns,
      totalThrows,
      bustCount,
      averagePerTurn: average,
      scoreProgress: player.starting_score - player.current_score
    };
  });
  
  return stats;
}

module.exports = {
  startNewGame,
  makeThrows,
  getGameState,
  getNextPlayer,
  getGameStats
};
