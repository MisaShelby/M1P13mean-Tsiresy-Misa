const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const mongoose = require('mongoose');
const authRoutes = require('./routes/routes');
const connectDB = require('./config/db.config');
const CommissionType = require('./models/CommissionType');

let isConnected = false;
let connectionPromise = null;

async function startServer() {
      if (!isConnected) {
            await connectDB();
            const exists = await CommissionType.findOne({ nom: 'Gratuit' });
            if (!exists) {
                  await CommissionType.create({ nom: 'Gratuit', tarif: 0, description: 'Plan gratuit' });
                  console.log('Commission "Gratuit" créée avec succès');
            }
            isConnected = true;
      }
}

app.use(async (req, res, next) => {
      try {
            if (!connectionPromise) {
                  connectionPromise = startServer();
            }
            await connectionPromise;
            next();
      } catch (err) {
            console.error('Erreur connexion DB:', err.message);
            res.status(503).json({ error: 'Service indisponible - connexion DB échouée' });
      }
});

app.use(cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/auth', authRoutes);

app.get('/test', (req, res) => {
      const mongoStatus = mongoose.connection.readyState;
      let mongoMessage = '';

      switch (mongoStatus) {
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


if (require.main === module) {
      startServer().then(() => {
            app.listen(PORT, () => {
                  console.log(`Serveur démarré sur le port ${PORT}`);
            });
      }).catch((error) => {
            console.error('Erreur de démarrage:', error);
            process.exit(1);
      });
}

module.exports = app;