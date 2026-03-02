const mongoose = require('mongoose');

const connectDB = async () => {
      try {
            const uri = process.env.NODE_ENV === 'development'
                  ? process.env.MONGODB_URI_LOCAL
                  : process.env.MONGODB_URI;
            const conn = await mongoose.connect(uri);
            return conn;
      } catch (error) {
            console.error(`MongoDB Connection Error: ${error.message}`);
            throw error;
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

if (process.env.NODE_ENV !== 'production') {
      process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('Connexion MongoDB fermée');
            process.exit(0);
      });
}

module.exports = connectDB;