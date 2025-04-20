// Configuration de la connexion à la base de données MySQL
const mysql = require('mysql2/promise');

// Créer un pool de connexions
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',     // À modifier selon votre configuration
  password: '',     // À modifier selon votre configuration
  database: 'todo_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Fonction pour initialiser la base de données
async function initDatabase() {
  try {
    // Créer la base de données si elle n'existe pas
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',     // À modifier selon votre configuration
      password: ''      // À modifier selon votre configuration
    });
    
    await connection.query('CREATE DATABASE IF NOT EXISTS todo_app');
    await connection.end();
    
    // Créer la table des tâches si elle n'existe pas
    const [rows] = await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Base de données initialisée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    return false;
  }
}

module.exports = {
  pool,
  initDatabase
};