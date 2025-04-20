-- Script d'initialisation de la base de données

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS todo_app;

-- Utilisation de la base de données
USE todo_app;

-- Création de la table des tâches
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de quelques données de test
INSERT INTO tasks (title, completed) VALUES
  ('Apprendre Express', false),
  ('Créer une API REST', false),
  ('Connecter à MySQL', false);