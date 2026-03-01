const Commande = require('../../models/commandeModel');
const CommandeBoutique = require('../../models/commandeBoutiqueModel');
const Panier = require('../../models/panierModel');
const PanierProduit = require('../../models/panierProduitModel');
const User = require('../../models/userClientModel');

/**
 * Créer une commande à partir d'un panier
 */
const creerCommande = async (req, res) => {
    try {
        const { id_panier, paiement, adresse_livraison } = req.body;
        const id_client = req.user.id;

        if (!id_panier || !paiement || !adresse_livraison) {
            return res.status(400).json({
                success: false,
                message: "Panier, mode de paiement et adresse de livraison sont obligatoires"
            });
        }

        if (!['Mvola', 'Visa'].includes(paiement)) {
            return res.status(400).json({ success: false, message: "Mode de paiement invalide (Mvola ou Visa)" });
        }

        // Vérifier que le panier appartient au client
        const panier = await Panier.findOne({ _id: id_panier, id_client });
        if (!panier) {
            return res.status(404).json({ success: false, message: "Panier non trouvé" });
        }

        // Vérifier qu'il n'y a pas déjà une commande pour ce panier
        const commandeExistante = await Commande.findOne({ id_panier });
        if (commandeExistante) {
            return res.status(400).json({ success: false, message: "Ce panier a déjà une commande associée" });
        }

        // Vérifier que le panier contient des produits
        const produits = await PanierProduit.find({ id_panier });
        if (produits.length === 0) {
            return res.status(400).json({ success: false, message: "Le panier est vide" });
        }

        // Sauvegarder l'adresse de livraison dans le profil utilisateur
        await User.findByIdAndUpdate(id_client, { adresse_livraison });

        // Utiliser le total_prix du panier
        const totalPrix = panier.total_prix || 0;

        const commande = await Commande.create({
            id_panier,
            id_client,
            paiement,
            statut: 'en cours de preparation',
            adresse_livraison,
            total_prix: totalPrix,
            date_paiement: new Date(),
            date_commande: new Date(),
            date_livraison: null
        });

        // Créer les entrées CommandeBoutique pour chaque boutique impliquée
        try {
            const boutiquesUniques = [...new Set(produits.map(p => p.id_boutique.toString()))];
            await Promise.all(boutiquesUniques.map(boutiqueId =>
                CommandeBoutique.create({
                    id_commande: commande._id,
                    id_boutique: boutiqueId,
                    statut: 'en attente',
                    date_confirmation: null
                })
            ));
        } catch (errCB) {
            // Si la création des CommandeBoutique échoue, supprimer la commande pour éviter un état incohérent
            console.error("Erreur lors de la création des CommandeBoutique, rollback de la commande:", errCB);
            await Commande.findByIdAndDelete(commande._id);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la création de la commande (rollback effectué)"
            });
        }

        res.status(201).json({
            success: true,
            message: 'Commande créée avec succès',
            commande
        });
    } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la création de la commande" });
    }
};

/**
 * Récupérer toutes les commandes du client avec détails panier
 */
const getMesCommandes = async (req, res) => {
    try {
        const id_client = req.user.id;

        const commandes = await Commande.find({ id_client })
            .populate({
                path: 'id_panier',
                select: 'nom total_prix'
            })
            .sort({ createdAt: -1 });

        // Enrichir avec les produits de chaque panier
        const result = await Promise.all(commandes.map(async (cmd) => {
            const cmdObj = cmd.toObject();

            const panierProduits = await PanierProduit.find({ id_panier: cmd.id_panier._id || cmd.id_panier })
                .populate('id_produit', 'nom photo description type prix_unitaire')
                .populate('id_boutique', 'nom_boutique photo');

            // Récupérer l'état de confirmation par boutique
            const commandesBoutique = await CommandeBoutique.find({ id_commande: cmd._id })
                .populate('id_boutique', 'nom_boutique photo');

            return {
                ...cmdObj,
                produits: panierProduits,
                nombre_produits: panierProduits.length,
                confirmations_boutiques: commandesBoutique.map(cb => ({
                    boutique: cb.id_boutique,
                    statut: cb.statut,
                    date_confirmation: cb.date_confirmation
                }))
            };
        }));

        res.status(200).json({
            success: true,
            count: result.length,
            commandes: result
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

/**
 * Récupérer le détail d'une commande
 */
const getCommandeDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const id_client = req.user.id;

        const commande = await Commande.findOne({ _id: id, id_client })
            .populate({
                path: 'id_panier',
                select: 'nom total_prix'
            });

        if (!commande) {
            return res.status(404).json({ success: false, message: "Commande non trouvée" });
        }

        const panierProduits = await PanierProduit.find({ id_panier: commande.id_panier._id || commande.id_panier })
            .populate('id_produit', 'nom photo description type prix_unitaire')
            .populate('id_boutique', 'nom_boutique photo');

        const cmdObj = commande.toObject();

        res.status(200).json({
            success: true,
            commande: {
                ...cmdObj,
                produits: panierProduits,
                nombre_produits: panierProduits.length
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du détail commande:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

/**
 * Mettre à jour le statut d'une commande (pour admin/boutique)
 */
const updateStatutCommande = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        if (!['en cours de preparation', 'expedie', 'deja livre'].includes(statut)) {
            return res.status(400).json({ success: false, message: "Statut invalide" });
        }

        const updateData = { statut };

        // Si le statut est "deja livre", mettre la date de livraison
        if (statut === 'deja livre') {
            updateData.date_livraison = new Date();
        }

        const commande = await Commande.findByIdAndUpdate(id, updateData, { new: true });

        if (!commande) {
            return res.status(404).json({ success: false, message: "Commande non trouvée" });
        }

        res.status(200).json({
            success: true,
            message: `Commande mise à jour: "${statut}"`,
            commande
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

module.exports = {
    creerCommande,
    getMesCommandes,
    getCommandeDetail,
    updateStatutCommande
};
