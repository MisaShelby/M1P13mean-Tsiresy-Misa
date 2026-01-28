const mongoose = require('mongoose');

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(
        process.env.MONGODB_URI
      );
      return conn;
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
};

mongoose.connection.on('connected', () => {
  console.log('Événement : MongoDB connecté avec succès');
});

mongoose.connection.on('error', (err) => {
  console.error(`Événement : Erreur MongoDB - ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Événement : MongoDB déconnecté');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Connexion MongoDB fermée');
  process.exit(0);
});

module.exports = connectDB;