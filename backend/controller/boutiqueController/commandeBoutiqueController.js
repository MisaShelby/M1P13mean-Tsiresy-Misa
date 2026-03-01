const Commande = require('../../models/commandeModel');
const CommandeBoutique = require('../../models/commandeBoutiqueModel');
const PanierProduit = require('../../models/panierProduitModel');
const Stock = require('../../models/stockModel');
const Produit = require('../../models/produitModel');

/**
 * Récupérer toutes les commandes qui contiennent des produits de cette boutique
 * Chaque commande affiche UNIQUEMENT les produits de cette boutique
 */
const getCommandesBoutique = async (req, res) => {
    try {
        const boutiqueId = req.user.id;

        // Trouver tous les PanierProduit de cette boutique
        const mesPanierProduits = await PanierProduit.find({ id_boutique: boutiqueId });
        if (mesPanierProduits.length === 0) {
            return res.status(200).json({ success: true, count: 0, commandes: [] });
        }

        // Récupérer les panier IDs uniques
        const panierIds = [...new Set(mesPanierProduits.map(pp => pp.id_panier.toString()))];

        // Trouver les commandes liées à ces paniers
        const commandes = await Commande.find({ id_panier: { $in: panierIds } })
            .populate('id_panier', 'nom total_prix')
            .populate('id_client', 'nom_complet email telephone')
            .sort({ createdAt: -1 });

        if (commandes.length === 0) {
            return res.status(200).json({ success: true, count: 0, commandes: [] });
        }

        // Pour chaque commande, récupérer les produits de CETTE boutique seulement
        const result = await Promise.all(commandes.map(async (cmd) => {
            const cmdObj = cmd.toObject();

            // Produits de cette boutique dans cette commande
            const mesProduits = await PanierProduit.find({
                id_panier: cmd.id_panier._id || cmd.id_panier,
                id_boutique: boutiqueId
            })
                .populate('id_produit', 'nom photo description type prix_unitaire')
                .populate('id_boutique', 'nom_boutique photo');

            // Récupérer l'info de stock pour chaque produit
            const produitsAvecStock = await Promise.all(mesProduits.map(async (pp) => {
                const ppObj = pp.toObject();
                const stock = await Stock.findOne({
                    id_produit: pp.id_produit._id,
                    id_boutique: boutiqueId
                });
                return {
                    ...ppObj,
                    stock_disponible: stock ? stock.quantite : 0,
                    stock_suffisant: stock ? stock.quantite >= pp.quantite : false
                };
            }));

            // Calculer le sous-total pour les produits de cette boutique
            const sousTotalBoutique = produitsAvecStock.reduce((sum, pp) => {
                return sum + (pp.prix_unitaire * pp.quantite);
            }, 0);

            // Récupérer le statut de confirmation de cette boutique pour cette commande
            const commandeBoutique = await CommandeBoutique.findOne({
                id_commande: cmd._id,
                id_boutique: boutiqueId
            });

            // Nombre total de boutiques impliquées et combien ont confirmé
            const toutesCommandesBoutique = await CommandeBoutique.find({ id_commande: cmd._id });
            const nbBoutiques = toutesCommandesBoutique.length;
            const nbConfirmes = toutesCommandesBoutique.filter(cb => cb.statut === 'pret').length;

            return {
                ...cmdObj,
                produits_boutique: produitsAvecStock,
                nombre_produits_boutique: produitsAvecStock.length,
                sous_total_boutique: sousTotalBoutique,
                confirmation_statut: commandeBoutique ? commandeBoutique.statut : 'en attente',
                date_confirmation: commandeBoutique ? commandeBoutique.date_confirmation : null,
                nb_boutiques_total: nbBoutiques,
                nb_boutiques_confirmes: nbConfirmes
            };
        }));

        res.status(200).json({
            success: true,
            count: result.length,
            commandes: result
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes boutique:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

/**
 * Confirmer la préparation d'une commande pour cette boutique
 * - Vérifie les stocks
 * - Déduit les stocks
 * - Met à jour CommandeBoutique en "pret"
 * - Si TOUTES les boutiques ont confirmé → passe la commande en "expedie" + date_livraison = +2 jours
 */
const confirmerPreparation = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { id_commande } = req.params;

        // Vérifier que la commande existe et est en cours de préparation
        const commande = await Commande.findById(id_commande);
        if (!commande) {
            return res.status(404).json({ success: false, message: "Commande non trouvée" });
        }
        if (commande.statut !== 'en cours de preparation') {
            return res.status(400).json({ success: false, message: "Cette commande n'est plus en cours de préparation" });
        }

        // Vérifier que cette boutique a des produits dans cette commande
        const mesProduitsDansPanier = await PanierProduit.find({
            id_panier: commande.id_panier,
            id_boutique: boutiqueId
        });
        if (mesProduitsDansPanier.length === 0) {
            return res.status(404).json({ success: false, message: "Aucun produit de votre boutique dans cette commande" });
        }

        // Récupérer ou créer l'entrée CommandeBoutique (protection contre les données manquantes)
        let commandeBoutique = await CommandeBoutique.findOne({
            id_commande,
            id_boutique: boutiqueId
        });
        if (!commandeBoutique) {
            commandeBoutique = await CommandeBoutique.create({
                id_commande,
                id_boutique: boutiqueId,
                statut: 'en attente',
                date_confirmation: null
            });
        }
        if (commandeBoutique.statut === 'pret') {
            return res.status(400).json({ success: false, message: "Vous avez déjà confirmé cette commande" });
        }

        // Récupérer les produits de cette boutique dans cette commande
        const mesProduits = await PanierProduit.find({
            id_panier: commande.id_panier,
            id_boutique: boutiqueId
        });

        // Vérifier les stocks pour chaque produit
        const stockInsuffisant = [];
        for (const pp of mesProduits) {
            const stock = await Stock.findOne({
                id_produit: pp.id_produit,
                id_boutique: boutiqueId
            });
            if (!stock || stock.quantite < pp.quantite) {
                const produit = await Produit.findById(pp.id_produit);
                stockInsuffisant.push({
                    produit: produit ? produit.nom : 'Inconnu',
                    demande: pp.quantite,
                    disponible: stock ? stock.quantite : 0
                });
            }
        }

        if (stockInsuffisant.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Stock insuffisant pour certains produits",
                details: stockInsuffisant
            });
        }

        // Déduire les stocks
        for (const pp of mesProduits) {
            await Stock.findOneAndUpdate(
                { id_produit: pp.id_produit, id_boutique: boutiqueId },
                { $inc: { quantite: -pp.quantite } }
            );
        }

        // Mettre à jour CommandeBoutique en "pret"
        commandeBoutique.statut = 'pret';
        commandeBoutique.date_confirmation = new Date();
        await commandeBoutique.save();

        // Vérifier si TOUTES les boutiques ont confirmé
        const toutesCommandesBoutique = await CommandeBoutique.find({ id_commande });
        const toutesConfirmees = toutesCommandesBoutique.every(cb => cb.statut === 'pret');

        let commandeMiseAJour = commande;
        if (toutesConfirmees) {
            // Toutes les boutiques ont confirmé → passer en "expedie" + date_livraison = +2 jours
            const dateLivraison = new Date();
            dateLivraison.setDate(dateLivraison.getDate() + 2);

            commandeMiseAJour = await Commande.findByIdAndUpdate(id_commande, {
                statut: 'expedie',
                date_livraison: dateLivraison
            }, { new: true });
        }

        res.status(200).json({
            success: true,
            message: toutesConfirmees
                ? 'Préparation confirmée ! Toutes les boutiques ont confirmé, la commande est expédiée.'
                : 'Préparation confirmée ! En attente des autres boutiques.',
            toutes_confirmees: toutesConfirmees,
            commande: commandeMiseAJour,
            nb_confirmees: toutesCommandesBoutique.filter(cb => cb.statut === 'pret').length,
            nb_total: toutesCommandesBoutique.length
        });
    } catch (error) {
        console.error("Erreur lors de la confirmation de préparation:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

module.exports = {
    getCommandesBoutique,
    confirmerPreparation
};
