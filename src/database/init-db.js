const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Veritabanı dosya yolu
const DB_PATH = path.join(__dirname, '../../data/dartscoreboard.db');

// Data klasörünü oluştur
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Veritabanı bağlantısı
const db = new Database(DB_PATH);

// Foreign key desteğini aktif et
db.pragma('foreign_keys = ON');

// Şemayı yükle ve tabloları oluştur
function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // SQL ifadelerini ayır ve çalıştır
  const statements = schema.split(';').filter(s => s.trim());
  
  statements.forEach(statement => {
    if (statement.trim()) {
      db.exec(statement);
    }
  });
  
  console.log('Veritabanı başarıyla oluşturuldu.');
}

// Eğer script doğrudan çalıştırılırsa init et
if (require.main === module) {
  initDatabase();
}

module.exports = { db, initDatabase };
