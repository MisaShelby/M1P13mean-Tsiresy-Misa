const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const mongoose = require('mongoose');
const authRoutes = require('./routes/routes');

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
const connectDB = require('./config/db.config');
const CommissionType = require('./models/CommissionType');

async function seedCommissionGratuit() {
      const exists = await CommissionType.findOne({ nom: 'Gratuit' });
      if (!exists) {
            await CommissionType.create({
                  nom: 'Gratuit',
                  tarif: 0,
                  description: 'Plan gratuit'
            });
            console.log('Commission "Gratuit" créée avec succès');
      }
}

connectDB().then(async () => {
      await seedCommissionGratuit();
      app.listen(PORT);
}).catch((error) => {
      process.exit(1);
});