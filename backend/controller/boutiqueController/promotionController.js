const PromotionProduit = require("../../models/promotionProduit");
const Produit = require("../../models/produitModel");

const addPromotion = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { id_produit, type_promotion, pourcentage, code_promo, date_debut, date_fin } = req.body;

        // Vérifier que le produit existe et appartient à la boutique
        const produit = await Produit.findOne({ _id: id_produit, boutique: boutiqueId });
        if (!produit) {
            return res.status(404).json({ success: false, message: "Produit introuvable ou non autorisé" });
        }

        // Validation des dates
        if (!date_debut || !date_fin) {
            return res.status(400).json({ success: false, message: "Les dates de début et de fin sont obligatoires" });
        }
        
        // Convertir les dates en objets Date pour comparaison
        const debut = new Date(date_debut);
        const fin = new Date(date_fin);
        
        // Vérifier que la date de fin n'est pas avant la date de début
        if (fin < debut) {
            return res.status(400).json({ success: false, message: "La date de fin ne peut pas être antérieure à la date de début" });
        }

        // Validations selon le type
        if (type_promotion === "POURCENTAGE") {
            if (!pourcentage || pourcentage <= 0 || pourcentage > 100) {
                return res.status(400).json({ success: false, message: "Pourcentage invalide (entre 1 et 100)" });
            }
        }

        if (type_promotion === "CODE_PROMO") {
            if (!code_promo || code_promo.trim() === "") {
                return res.status(400).json({ success: false, message: "Le code promo est obligatoire" });
            }
            if (!pourcentage || pourcentage <= 0 || pourcentage > 100) {
                return res.status(400).json({ success: false, message: "Pourcentage invalide (entre 1 et 100)" });
            }
        }

        // Déterminer le statut initial : actif seulement si on est dans l'intervalle
        const now = new Date();
        const isActive = now >= debut && now <= fin ? 1 : 0;

        const promotion = await PromotionProduit.create({
            id_produit,
            id_boutique: boutiqueId,
            type_promotion,
            pourcentage: type_promotion === "ACHETE_OFFERT" ? 0 : pourcentage,
            code_promo: type_promotion === "CODE_PROMO" ? code_promo.trim() : "",
            date_debut: debut,
            date_fin: fin,
            statut: isActive
        });

        return res.status(201).json({ success: true, message: "Promotion créée avec succès", promotion });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deactivateExpiredPromotions = async (boutiqueId) => {
    const now = new Date();
    await PromotionProduit.updateMany(
        { id_boutique: boutiqueId, statut: 1, date_fin: { $lt: now } },
        { $set: { statut: 0 } }
    );
};

const getPromotionsByProduit = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { id_produit } = req.params;
        await deactivateExpiredPromotions(boutiqueId);

        const promotions = await PromotionProduit.find({
            id_produit,
            id_boutique: boutiqueId
        }).populate("id_produit", "nom prix_unitaire").sort({ createdAt: -1 });

        return res.status(200).json({ success: true, promotions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAllPromotions = async (req, res) => {
    try {
        const boutiqueId = req.user.id;

        await deactivateExpiredPromotions(boutiqueId);

        const promotions = await PromotionProduit.find({
            id_boutique: boutiqueId
        }).populate("id_produit", "nom prix_unitaire photo type").sort({ createdAt: -1 });

        return res.status(200).json({ success: true, promotions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updatePromotion = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { id } = req.params;
        const { type_promotion, pourcentage, code_promo, statut } = req.body;

        const promotion = await PromotionProduit.findOne({ _id: id, id_boutique: boutiqueId });
        if (!promotion) {
            return res.status(404).json({ success: false, message: "Promotion introuvable" });
        }

        if (type_promotion) promotion.type_promotion = type_promotion;
        if (pourcentage !== undefined) promotion.pourcentage = pourcentage;
        if (code_promo !== undefined) promotion.code_promo = code_promo;
        
        if (req.body.date_debut && req.body.date_fin) {
            const debut = new Date(req.body.date_debut);
            const fin = new Date(req.body.date_fin);
            
            if (fin < debut) {
                return res.status(400).json({ success: false, message: "La date de fin ne peut pas être antérieure à la date de début" });
            }
            
            promotion.date_debut = debut;
            promotion.date_fin = fin;
        } else if (req.body.date_debut) {
            const debut = new Date(req.body.date_debut);
            if (promotion.date_fin && promotion.date_fin < debut) {
                return res.status(400).json({ success: false, message: "La date de début ne peut pas être après la date de fin existante" });
            }
            promotion.date_debut = debut;
        } else if (req.body.date_fin) {
            const fin = new Date(req.body.date_fin);
            if (promotion.date_debut && fin < promotion.date_debut) {
                return res.status(400).json({ success: false, message: "La date de fin ne peut pas être antérieure à la date de début" });
            }
            promotion.date_fin = fin;
        }

        if (statut !== undefined) promotion.statut = statut;

        if (promotion.date_fin && new Date(promotion.date_fin) < new Date()) {
            promotion.statut = 0;
        }

        await promotion.save();

        return res.status(200).json({ success: true, message: "Promotion modifiée", promotion });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deletePromotion = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { id } = req.params;

        const promotion = await PromotionProduit.findOneAndDelete({ _id: id, id_boutique: boutiqueId });
        if (!promotion) {
            return res.status(404).json({ success: false, message: "Promotion introuvable" });
        }

        return res.status(200).json({ success: true, message: "Promotion supprimée" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { addPromotion, getPromotionsByProduit, getAllPromotions, updatePromotion, deletePromotion };
