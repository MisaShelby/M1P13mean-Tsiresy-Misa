const Panier = require('../../models/panierModel');
const PanierProduit = require('../../models/panierProduitModel');
const Produit = require('../../models/produitModel');
const PromotionProduit = require('../../models/promotionProduit');

/**
 * Créer un nouveau panier
 */
const creerPanier = async (req, res) => {
    try {
        const { nom } = req.body;
        const id_client = req.user.id;

        if (!nom) {
            return res.status(400).json({ success: false, message: "Le nom du panier est obligatoire" });
        }

        const panier = await Panier.create({
            nom,
            id_client,
            total_prix: 0
        });

        res.status(201).json({
            success: true,
            message: 'Panier créé avec succès',
            panier
        });
    } catch (error) {
        console.error("Erreur lors de la création du panier:", error);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la création du panier" });
    }
};

/**
 * Recalculer le total_prix d'un panier
 */
const recalculerTotalPanier = async (panierId) => {
    const panierProduits = await PanierProduit.find({ id_panier: panierId });
    
    // Récupérer les promotions actives
    const produitIds = panierProduits.map(pp => pp.id_produit);
    const now = new Date();
    const promotions = await PromotionProduit.find({
        id_produit: { $in: produitIds },
        statut: 1,
        date_debut: { $lte: now },
        date_fin: { $gte: now }
    });
    const promoMap = {};
    promotions.forEach(p => {
        if (!promoMap[p.id_produit.toString()]) {
            promoMap[p.id_produit.toString()] = [];
        }
        promoMap[p.id_produit.toString()].push(p);
    });

    let total = 0;
    panierProduits.forEach(pp => {
        let prixEffectif = pp.prix_unitaire;
        const promos = promoMap[pp.id_produit.toString()] || [];
        if (promos.length > 0) {
            const promo = promos[0];
            if (promo.type_promotion === 'POURCENTAGE' && promo.pourcentage > 0) {
                prixEffectif = pp.prix_unitaire * (1 - promo.pourcentage / 100);
            }
        }
        total += prixEffectif * pp.quantite;
    });

    await Panier.findByIdAndUpdate(panierId, { total_prix: total });
    return total;
};

/**
 * Créer un panier ET ajouter un produit en une seule opération
 */
const creerPanierAvecProduit = async (req, res) => {
    try {
        const { nom, id_produit, quantite, prix_unitaire, id_boutique } = req.body;
        const id_client = req.user.id;

        if (!nom) {
            return res.status(400).json({ success: false, message: "Le nom du panier est obligatoire" });
        }
        if (!id_produit || !prix_unitaire || !id_boutique) {
            return res.status(400).json({ success: false, message: "Produit, prix et boutique sont obligatoires" });
        }

        const panier = await Panier.create({
            nom,
            id_client,
            total_prix: 0
        });

        const panierProduit = await PanierProduit.create({
            id_panier: panier._id,
            id_produit,
            quantite: quantite || 1,
            prix_unitaire,
            id_boutique
        });

        // Recalculer le total
        const total = await recalculerTotalPanier(panier._id);

        res.status(201).json({
            success: true,
            message: 'Panier créé et produit ajouté avec succès',
            panier: { ...panier.toObject(), total_prix: total },
            panierProduit
        });
    } catch (error) {
        console.error("Erreur lors de la création du panier avec produit:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

/**
 * Récupérer les paniers du client (sans commande associée = paniers actifs)
 */
const getPaniersActifs = async (req, res) => {
    try {
        const id_client = req.user.id;
        const Commande = require('../../models/commandeModel');

        const paniers = await Panier.find({ id_client }).sort({ createdAt: -1 });

        // Filtrer ceux qui n'ont pas de commande
        const paniersAvecCommande = await Commande.find({ id_client }).select('id_panier');
        const panierIdsAvecCommande = new Set(paniersAvecCommande.map(c => c.id_panier.toString()));

        const paniersActifs = paniers.filter(p => !panierIdsAvecCommande.has(p._id.toString()));

        res.status(200).json({
            success: true,
            count: paniersActifs.length,
            paniers: paniersActifs
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des paniers actifs:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

/**
 * Récupérer tous les paniers du client (sans commande) avec les produits et le total
 */
const getTousPaniers = async (req, res) => {
    try {
        const id_client = req.user.id;
        const Commande = require('../../models/commandeModel');

        const paniers = await Panier.find({ id_client }).sort({ createdAt: -1 });

        // Filtrer ceux qui n'ont pas de commande
        const paniersAvecCommande = await Commande.find({ id_client }).select('id_panier');
        const panierIdsAvecCommande = new Set(paniersAvecCommande.map(c => c.id_panier.toString()));

        const paniersSansCommande = paniers.filter(p => !panierIdsAvecCommande.has(p._id.toString()));

        // Pour chaque panier, récupérer les produits et calculer le total
        const result = await Promise.all(paniersSansCommande.map(async (panier) => {
            const panierObj = panier.toObject();

            const panierProduits = await PanierProduit.find({ id_panier: panier._id })
                .populate('id_produit', 'nom photo description type prix_unitaire')
                .populate('id_boutique', 'nom_boutique photo');

            // Récupérer les promotions actives pour les produits du panier
            const produitIds = panierProduits.map(pp => pp.id_produit?._id).filter(Boolean);
            const now = new Date();
            const promotions = await PromotionProduit.find({
                id_produit: { $in: produitIds },
                statut: 1,
                date_debut: { $lte: now },
                date_fin: { $gte: now }
            });
            const promoMap = {};
            promotions.forEach(p => {
                if (!promoMap[p.id_produit.toString()]) {
                    promoMap[p.id_produit.toString()] = [];
                }
                promoMap[p.id_produit.toString()].push(p);
            });

            // Calculer le total avec promotions
            let total = 0;
            const produitsEnrichis = panierProduits.map(pp => {
                const ppObj = pp.toObject();
                const promos = promoMap[ppObj.id_produit?._id?.toString()] || [];
                let prixEffectif = ppObj.prix_unitaire;

                if (promos.length > 0) {
                    const promo = promos[0];
                    if (promo.type_promotion === 'POURCENTAGE' && promo.pourcentage > 0) {
                        prixEffectif = ppObj.prix_unitaire * (1 - promo.pourcentage / 100);
                    }
                }

                const sousTotal = prixEffectif * ppObj.quantite;
                total += sousTotal;

                return {
                    ...ppObj,
                    promotions: promos,
                    prix_effectif: prixEffectif,
                    sous_total: sousTotal
                };
            });

            // Mettre à jour le total_prix dans le panier
            await Panier.findByIdAndUpdate(panier._id, { total_prix: total });

            return {
                ...panierObj,
                produits: produitsEnrichis,
                nombre_produits: panierProduits.length,
                total_prix: total,
                total
            };
        }));

        res.status(200).json({
            success: true,
            count: result.length,
            paniers: result
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des paniers:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

/**
 * Ajouter un produit à un panier existant
 */
const ajouterProduitAuPanier = async (req, res) => {
    try {
        const { id_panier, id_produit, quantite, prix_unitaire, id_boutique } = req.body;
        const id_client = req.user.id;

        // Vérifier que le panier appartient au client
        const panier = await Panier.findOne({ _id: id_panier, id_client });
        if (!panier) {
            return res.status(404).json({ success: false, message: "Panier non trouvé" });
        }

        // Vérifier si le produit existe déjà dans le panier
        const existant = await PanierProduit.findOne({ id_panier, id_produit });
        if (existant) {
            existant.quantite += (quantite || 1);
            await existant.save();
            await recalculerTotalPanier(id_panier);

            return res.status(200).json({
                success: true,
                message: 'Quantité mise à jour dans le panier',
                panierProduit: existant
            });
        }

        const panierProduit = await PanierProduit.create({
            id_panier,
            id_produit,
            quantite: quantite || 1,
            prix_unitaire,
            id_boutique
        });

        await recalculerTotalPanier(id_panier);

        res.status(201).json({
            success: true,
            message: 'Produit ajouté au panier avec succès',
            panierProduit
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout du produit au panier:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

/**
 * Supprimer un produit du panier
 */
const supprimerProduitDuPanier = async (req, res) => {
    try {
        const { id } = req.params;
        const id_client = req.user.id;

        const panierProduit = await PanierProduit.findById(id).populate('id_panier');
        if (!panierProduit || panierProduit.id_panier.id_client.toString() !== id_client) {
            return res.status(404).json({ success: false, message: "Produit du panier non trouvé" });
        }

        const panierId = panierProduit.id_panier._id;
        await PanierProduit.findByIdAndDelete(id);
        await recalculerTotalPanier(panierId);

        res.status(200).json({
            success: true,
            message: 'Produit supprimé du panier'
        });
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

/**
 * Supprimer un panier et ses produits
 */
const supprimerPanier = async (req, res) => {
    try {
        const { id } = req.params;
        const id_client = req.user.id;

        const panier = await Panier.findOne({ _id: id, id_client });
        if (!panier) {
            return res.status(404).json({ success: false, message: "Panier non trouvé" });
        }

        await PanierProduit.deleteMany({ id_panier: id });
        await Panier.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Panier supprimé avec succès'
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du panier:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

module.exports = {
    creerPanier,
    creerPanierAvecProduit,
    getPaniersActifs,
    getTousPaniers,
    ajouterProduitAuPanier,
    supprimerProduitDuPanier,
    supprimerPanier
};
