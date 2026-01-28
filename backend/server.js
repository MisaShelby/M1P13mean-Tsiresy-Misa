const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const mongoose = require('mongoose');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  let mongoMessage = '';
  
  switch(mongoStatus) {
    case 0: mongoMessage = 'Déconnecté'; break;
    case 1: mongoMessage = 'Connecté'; break;
    case 2: mongoMessage = 'En cours de connexion'; break;
    case 3: mongoMessage = 'En cours de déconnexion'; break;
    default: mongoMessage = 'État inconnu';
  }

  res.json({ 
    status: 'OK', 
    message: 'Backend Express is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
    mongoDB: {
      connected: mongoStatus === 1,
      status: mongoMessage,
      database: mongoose.connection.name || 'Non connecté',
      host: mongoose.connection.host || 'Non disponible'
    }
  });
});
const connectDB = require('./config/db.config'); 
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Serveur Express démarré sur le port ${PORT}`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
    console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Non connecté'}`);
  });
}).catch((error) => {
  console.error('❌ Impossible de démarrer le serveur:', error);
  process.exit(1);
});