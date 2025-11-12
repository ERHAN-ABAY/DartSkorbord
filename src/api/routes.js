const express = require('express');
const game = require('../game');
const db = require('../database/database');

const router = express.Router();

// ============ OYUN API'LERİ ============

// Yeni oyun başlat
router.post('/games', (req, res) => {
  try {
    const { name, finishLimit, players } = req.body;
    
    if (!players || !Array.isArray(players)) {
      return res.status(400).json({ error: 'Oyuncu listesi gerekli.' });
    }
    
    const result = game.startNewGame(name, finishLimit, players);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Aktif oyunları listele
router.get('/games', (req, res) => {
  try {
    const games = db.getActiveGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Oyun geçmişini getir (son 10 tamamlanmış oyun)
// NOT: Bu route /games/:gameId 'den ÖNCE olmalı (spesifik route önce)
router.get('/games/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const games = db.getFinishedGames(limit);
    
    // Her oyun için oyuncu detaylarını da ekle
    const gamesWithPlayers = games.map(game => {
      const players = db.getGamePlayers(game.id);
      return { ...game, players };
    });
    
    res.json(gamesWithPlayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Oyun durumunu getir
router.get('/games/:gameId', (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const state = game.getGameState(gameId);
    res.json(state);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Oyun istatistiklerini getir
router.get('/games/:gameId/stats', (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const stats = game.getGameStats(gameId);
    res.json(stats);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ============ ATIŞ API'LERİ ============

// Atış yap
router.post('/games/:gameId/throws', (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const { gamePlayerId, throws } = req.body;
    
    if (!gamePlayerId) {
      return res.status(400).json({ error: 'gamePlayerId gerekli.' });
    }
    
    if (!throws || !Array.isArray(throws)) {
      return res.status(400).json({ error: 'throws dizisi gerekli.' });
    }
    
    const result = game.makeThrows(gameId, gamePlayerId, throws);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Son atışı geri al (undo)
router.delete('/games/:gameId/players/:gamePlayerId/last-turn', (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const gamePlayerId = parseInt(req.params.gamePlayerId);
    
    const result = db.deleteLastTurn(gamePlayerId);
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    // Güncel oyun durumunu döndür
    const players = db.getGamePlayers(gameId);
    res.json({
      message: 'Son tur geri alındı',
      deletedTurn: result.turn,
      players
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Belirli bir turu sil
router.delete('/games/:gameId/turns/:turnId', (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const turnId = parseInt(req.params.turnId);
    
    const result = db.deleteTurn(turnId);
    
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    
    // Güncel oyun durumunu döndür
    const players = db.getGamePlayers(gameId);
    res.json({
      message: 'Tur silindi',
      deletedTurn: result.turn,
      players
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ OYUNCU API'LERİ ============

// Tüm oyuncuları listele
router.get('/players', (req, res) => {
  try {
    const players = db.getAllPlayers();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Oyuncu oluştur
router.post('/players', (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Oyuncu adı gerekli.' });
    }
    
    const player = db.createOrGetPlayer(name);
    res.json(player);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
