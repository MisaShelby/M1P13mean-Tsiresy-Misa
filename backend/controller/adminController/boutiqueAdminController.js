const Boutique = require('../../models/userBoutiqueModel');

const getBoutiques = async (req, res) => {
      try {
            const boutiques = await Boutique.find({ statut_demande: 1 })
                  .sort({ createdAt: -1 });

            res.status(200).json({
                  success: true,
                  count: boutiques.length,
                  boutiques
            });

      } catch (error) {
            res.status(500).json({
                  success: false,
                  message: 'Erreur serveur lors de la récupération des boutiques en attente'
            });
      }
};

module.exports = {
      getBoutiques
};