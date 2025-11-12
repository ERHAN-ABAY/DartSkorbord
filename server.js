const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./src/database/init-db');
const apiRoutes = require('./src/api/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Veritabanını başlat
try {
  initDatabase();
  console.log('✅ Veritabanı başlatıldı.');
} catch (error) {
  console.error('❌ Veritabanı başlatma hatası:', error);
  process.exit(1);
}

// API Routes
app.use('/api', apiRoutes);

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Hata yakalama
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası oluştu.' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🎯 DARK SKORBORD BAŞLATILDI 🎯     ║
╠════════════════════════════════════════╣
║  Sunucu: http://localhost:${PORT}         ║
║  API:    http://localhost:${PORT}/api     ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
