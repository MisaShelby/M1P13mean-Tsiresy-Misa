const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db.config');

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env' });
}

const app = express();
const PORT = process.env.PORT || 10000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:4200',  
  'http://localhost:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `L'origine ${origin} n'est pas autorisée par CORS`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/test', (req, res) => {
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
    message: 'Backend Express est opérationnel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
    mongoDB: {
      connected: mongoStatus === 1,
      status: mongoMessage,
      database: mongoose.connection.name || 'Non connecté',
      host: mongoose.connection.host || 'Non disponible'
    },
    endpoints: {
      test: '/test',
      health: '/health',
      api: '/v1'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

async function startServer() {
  try {
    await connectDB();
    console.log('✅ MongoDB connecté avec succès');
    
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`📊 MongoDB: ${mongoose.connection.host}`);
    });
    
  } catch (error) {
    console.error('❌ Échec du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();