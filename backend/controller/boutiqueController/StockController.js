const Stock = require('../../models/stockModel');
const Produit = require('../../models/produitModel');

// Récupérer tous les stocks de la boutique (avec infos produit)
const getStocksByBoutique = async (req, res) => {
    try {
        const boutiqueId = req.user.id;

        const stocks = await Stock.find({ id_boutique: boutiqueId })
            .populate('id_produit', 'nom photo type prix_unitaire statut')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: stocks.length,
            stocks
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des stocks:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération des stocks"
        });
    }
};

// Mettre à jour la quantité d'un stock (ou créer si inexistant)
const updateStock = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { id_produit, quantite } = req.body;

        if (quantite === undefined || quantite < 0) {
            return res.status(400).json({
                success: false,
                message: "La quantité doit être un nombre positif ou zéro"
            });
        }

        // Vérifier que le produit appartient à la boutique
        const produit = await Produit.findOne({ _id: id_produit, boutique: boutiqueId });
        if (!produit) {
            return res.status(404).json({
                success: false,
                message: "Produit non trouvé ou non autorisé"
            });
        }

        const stock = await Stock.findOneAndUpdate(
            { id_produit, id_boutique: boutiqueId },
            { quantite },
            { new: true, upsert: true, runValidators: true }
        ).populate('id_produit', 'nom photo type prix_unitaire statut');

        res.status(200).json({
            success: true,
            message: "Stock mis à jour avec succès",
            stock
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du stock:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

// Ajouter du stock (incrémenter)
const ajouterStock = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { id_produit, quantite } = req.body;

        if (!quantite || quantite <= 0) {
            return res.status(400).json({
                success: false,
                message: "La quantité à ajouter doit être supérieure à 0"
            });
        }

        // Vérifier que le produit appartient à la boutique
        const produit = await Produit.findOne({ _id: id_produit, boutique: boutiqueId });
        if (!produit) {
            return res.status(404).json({
                success: false,
                message: "Produit non trouvé ou non autorisé"
            });
        }

        const stock = await Stock.findOneAndUpdate(
            { id_produit, id_boutique: boutiqueId },
            { $inc: { quantite: quantite } },
            { new: true, upsert: true, runValidators: true }
        ).populate('id_produit', 'nom photo type prix_unitaire statut');

        res.status(200).json({
            success: true,
            message: `${quantite} unité(s) ajoutée(s) au stock`,
            stock
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout au stock:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

module.exports = {
    getStocksByBoutique,
    updateStock,
    ajouterStock
};