const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, initDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialiser la base de données au démarrage
initDatabase().catch(err => {
  console.error('Erreur lors de l\'initialisation de la base de données:', err);
  process.exit(1);
});


// Route pour récupérer toutes les tâches
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer une tâche spécifique
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tâche non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la tâche ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour créer une nouvelle tâche
app.post('/api/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Le titre est requis' });
    
    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      [title, false]
    );
    
    const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour mettre à jour une tâche
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, completed } = req.body;
    const id = req.params.id;
    
    // Vérifier si la tâche existe
    const [existingTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    // Préparer les champs à mettre à jour
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (completed !== undefined) updates.completed = completed;
    
    // Construire la requête dynamiquement
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    if (values.length === 0) return res.json(existingTask[0]); // Rien à mettre à jour
    
    // Exécuter la mise à jour
    await pool.query(`UPDATE tasks SET ${fields} WHERE id = ?`, [...values, id]);
    
    // Récupérer la tâche mise à jour
    const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updatedTask[0]);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la tâche ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour supprimer une tâche
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Vérifier si la tâche existe
    const [existingTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    // Supprimer la tâche
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    
    res.json(existingTask[0]);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la tâche ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: 'API opérationnelle' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api`);
});