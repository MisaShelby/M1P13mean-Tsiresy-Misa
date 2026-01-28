const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔌 Tentative de connexion à MongoDB...');
    console.log(`📡 URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/centre_commercial'}`);

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/centre_commercial'
    );
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      console.error('\n💡 SOLUTIONS POSSIBLES :');
      console.error('   1. Assurez-vous que MongoDB est installé');
      console.error('   2. Démarrez MongoDB dans un terminal séparé :');
      console.error('      - Windows : mongod');
      console.error('      - Mac/Linux : sudo systemctl start mongod');
      console.error('   3. Ou vérifiez que le service MongoDB est en cours d\'exécution');
      console.error('   4. Testez la connexion avec : mongo --host localhost --port 27017');
    }
    
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('🗄️  Événement : MongoDB connecté avec succès');
});

mongoose.connection.on('error', (err) => {
  console.error(`🗄️  Événement : Erreur MongoDB - ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('🗄️  Événement : MongoDB déconnecté');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 Connexion MongoDB fermée');
  process.exit(0);
});

module.exports = connectDB;