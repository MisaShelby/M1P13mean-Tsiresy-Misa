const Produit = require('../../models/produitModel');

const addProduit = async (req, res) => {
      try {
            const { nom, photo, description, prix_unitaire, type, statut } = req.body;
            const boutiqueId = req.user.id;

            const existingNomProduit = await Produit.findOne({ nom, boutique: boutiqueId });
            if (existingNomProduit) {
                  return res.status(400).json({
                        success: false,
                        message: "Un produit avec ce nom existe déjà dans votre boutique"
                  });
            }

            const produit = await Produit.create({
                  nom,
                  photo,
                  description,
                  prix_unitaire,
                  type,
                  statut,
                  boutique: boutiqueId
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
            const boutiqueId = req.user.id;
            const { search, type, statut, prixMin, prixMax, sortBy, sortOrder } = req.query;

            const filter = { boutique: boutiqueId };

            if (search) {
                  const regex = new RegExp(search, 'i');
                  filter.$or = [
                        { nom: regex },
                        { description: regex }
                  ];
            }

            if (type) {
                  filter.type = type;
            }

            if (statut !== undefined && statut !== '') {
                  filter.statut = Number(statut);
            }

            if (prixMin || prixMax) {
                  filter.prix_unitaire = {};
                  if (prixMin) filter.prix_unitaire.$gte = Number(prixMin);
                  if (prixMax) filter.prix_unitaire.$lte = Number(prixMax);
            }

            let sort = { createdAt: -1 };
            if (sortBy) {
                  const order = sortOrder === 'asc' ? 1 : -1;
                  sort = { [sortBy]: order };
            }

            const produits = await Produit.find(filter).sort(sort);

            res.status(200).json({
                  success: true,
                  count: produits.length,
                  produits
            });

      } catch (error) {
            console.error("Erreur lors de la récupération des produits:", error);
            res.status(500).json({
                  success: false,
                  message: "Erreur serveur lors de la récupération des produits"
            });
      }
};

const updateProduit = async (req, res) => {
      try {
            const { id } = req.params;
            const boutiqueId = req.user.id;
            const { nom, photo, description, prix_unitaire, type, statut } = req.body;

            const produit = await Produit.findOne({ _id: id, boutique: boutiqueId });
            if (!produit) {
                  return res.status(404).json({
                        success: false,
                        message: "Produit non trouvé ou non autorisé"
                  });
            }

            if (nom && nom !== produit.nom) {
                  const existingNom = await Produit.findOne({ nom, boutique: boutiqueId, _id: { $ne: id } });
                  if (existingNom) {
                        return res.status(400).json({
                              success: false,
                              message: "Un autre produit avec ce nom existe déjà dans votre boutique"
                        });
                  }
            }

            const updated = await Produit.findByIdAndUpdate(id, {
                  nom, photo, description, prix_unitaire, type, statut
            }, { new: true, runValidators: true });

            res.status(200).json({
                  success: true,
                  message: "Produit modifié avec succès",
                  produit: updated
            });

      } catch (error) {
            console.error("Erreur lors de la modification du produit:", error);
            res.status(500).json({
                  success: false,
                  message: "Erreur serveur"
            });
      }
};

module.exports = {
      addProduit,
      getProduit,
      updateProduit
};
