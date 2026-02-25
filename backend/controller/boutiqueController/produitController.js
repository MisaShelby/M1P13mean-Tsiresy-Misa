const Produit = require('../../models/produitModel');

const addProduit = async (req, res) => {
      try {
            const { nom, photo, description, prix_unitaire, type, statut } = req.body;

            const existingNomProduit = await Produit.findOne({ nom });
            if (existingNomProduit) {
                  return res.status(400).json({
                        success: false,
                        message: "Un produit avec ce nom existe déjà"
                  });
            }

            const produit = await Produit.create({
                  nom,
                  photo,
                  description,
                  prix_unitaire,
                  type,
                  statut
            });

            res.status(201).json({
                  success: true,
                  message: "Produit créé avec succès",
                  produit
            });

      } catch (error) {
            console.error("Erreur lors de la création du produit:", error);
            res.status(500).json({
                  success: false,
                  message: "Erreur serveur"
            });
      }
};

const getProduit = async (req, res) => {
      try {
            const produits = await Produit.find()
                  .sort({ createdAt: -1 });

            res.status(200).json({
                  success: true,
                  count: produits.length,
                  produits
            });

      } catch (error) {
            res.status(500).json({
                  success: false,
                  message: "Erreur serveur lors de la récupération des produits"
            });
      }
};

module.exports = {
      addProduit,
      getProduit
};
