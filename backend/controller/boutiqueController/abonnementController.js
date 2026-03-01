const Boutique = require('../../models/userBoutiqueModel');
const CommissionType = require('../../models/CommissionType');
const Abonnement = require('../../models/Abonnement');
const Paiement = require('../../models/Paiement');

/**
 * Déduit un montant du portefeuille d'une boutique.
 * Retourne la boutique mise à jour ou lève une erreur si solde insuffisant.
 * @param {Object} boutique - Document Mongoose de la boutique
 * @param {number} montant  - Montant à déduire
 */
const deduirePortefeuille = async (boutique, montant) => {
    if (boutique.portefeuille < montant) {
        const err = new Error(
            `Solde insuffisant. Solde actuel : ${boutique.portefeuille} Ar, montant requis : ${montant} Ar`
        );
        err.code = 'SOLDE_INSUFFISANT';
        throw err;
    }
    boutique.portefeuille -= montant;
    await boutique.save();
    return boutique;
};

/**
 * POST /boutique-setup
 * Appelé lors de la première connexion de la boutique.
 * - Choisit son type de commission
 * - Déduit le tarif du portefeuille
 * - Crée l'abonnement (premier mois)
 * - Crée le paiement correspondant
 * - Met à jour le champ commission_type de la boutique
 */
const souscriptionPremierMois = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { commission_type_id } = req.body;

        if (!commission_type_id) {
            return res.status(400).json({
                success: false,
                message: 'Le type de commission est obligatoire'
            });
        }

        // Vérifier que la boutique existe
        const boutique = await Boutique.findById(boutiqueId);
        if (!boutique) {
            return res.status(404).json({ success: false, message: 'Boutique introuvable' });
        }

        // Vérifier que le setup n'a pas déjà été fait
        if (boutique.commission_type) {
            return res.status(400).json({
                success: false,
                message: 'Votre boutique a déjà un type de commission configuré'
            });
        }

        // Vérifier que le type de commission existe
        const commissionType = await CommissionType.findById(commission_type_id);
        if (!commissionType) {
            return res.status(404).json({ success: false, message: 'Type de commission introuvable' });
        }

        // Déduire le montant du portefeuille (lève une erreur si solde insuffisant)
        await deduirePortefeuille(boutique, commissionType.tarif);

        const maintenant = new Date();
        const prochainPaiement = new Date(maintenant);
        prochainPaiement.setMonth(prochainPaiement.getMonth() + 1);

        // Créer l'abonnement
        const abonnement = await Abonnement.create({
            id_boutique: boutiqueId,
            id_commission_type: commission_type_id,
            date_debut: maintenant,
            prochain_paiement: prochainPaiement,
            statut: 'ACTIVE'
        });

        // Créer le paiement du premier mois
        await Paiement.create({
            abonnement: abonnement._id,
            tarif: commissionType.tarif,
            date_paiement: maintenant
        });

        // Lier le type de commission à la boutique
        boutique.commission_type = commission_type_id;
        await boutique.save();

        const boutiqueResponse = boutique.toObject();
        delete boutiqueResponse.mdp;

        res.status(201).json({
            success: true,
            message: 'Configuration effectuée avec succès. Bienvenue !',
            boutique: boutiqueResponse,
            abonnement
        });

    } catch (error) {
        if (error.code === 'SOLDE_INSUFFISANT') {
            return res.status(402).json({
                success: false,
                message: error.message,
                code: 'SOLDE_INSUFFISANT'
            });
        }
        console.error('Erreur lors de la souscription:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la configuration'
        });
    }
};

/**
 * GET /mon-abonnement
 * Retourne l'abonnement actif + historique des paiements de la boutique connectée.
 */
const getMonAbonnement = async (req, res) => {
    try {
        const boutiqueId = req.user.id;

        const boutique = await Boutique.findById(boutiqueId)
            .select('-mdp')
            .populate('commission_type');

        if (!boutique) {
            return res.status(404).json({ success: false, message: 'Boutique introuvable' });
        }

        const abonnement = await Abonnement.findOne({
            id_boutique: boutiqueId,
            statut: 'ACTIVE'
        }).populate('id_commission_type').sort({ createdAt: -1 });

        const paiements = abonnement
            ? await Paiement.find({ abonnement: abonnement._id }).sort({ date_paiement: -1 })
            : [];

        res.status(200).json({
            success: true,
            boutique,
            abonnement,
            paiements
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'abonnement:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

/**
 * PUT /changer-abonnement
 * Permet à une boutique de changer son type de commission.
 * - Désactive l'ancien abonnement
 * - Déduit le tarif du nouveau plan du portefeuille
 * - Crée un nouvel abonnement + paiement
 * - Met à jour le commission_type de la boutique
 */
const changerAbonnement = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { commission_type_id } = req.body;

        if (!commission_type_id) {
            return res.status(400).json({
                success: false,
                message: 'Le type de commission est obligatoire'
            });
        }

        const boutique = await Boutique.findById(boutiqueId);
        if (!boutique) {
            return res.status(404).json({ success: false, message: 'Boutique introuvable' });
        }

        // Vérifier que le type de commission existe
        const commissionType = await CommissionType.findById(commission_type_id);
        if (!commissionType) {
            return res.status(404).json({ success: false, message: 'Type de commission introuvable' });
        }

        // Vérifier que ce n'est pas le même plan
        if (boutique.commission_type && boutique.commission_type.toString() === commission_type_id) {
            return res.status(400).json({
                success: false,
                message: 'Vous êtes déjà abonné à ce plan'
            });
        }

        // Déduire le montant du portefeuille
        await deduirePortefeuille(boutique, commissionType.tarif);

        // Désactiver l'ancien abonnement actif
        await Abonnement.updateMany(
            { id_boutique: boutiqueId, statut: 'ACTIVE' },
            { statut: 'CANCELLED' }
        );

        const maintenant = new Date();
        const prochainPaiement = new Date(maintenant);
        prochainPaiement.setMonth(prochainPaiement.getMonth() + 1);

        // Créer le nouvel abonnement
        const abonnement = await Abonnement.create({
            id_boutique: boutiqueId,
            id_commission_type: commission_type_id,
            date_debut: maintenant,
            prochain_paiement: prochainPaiement,
            statut: 'ACTIVE'
        });

        // Créer le paiement
        await Paiement.create({
            abonnement: abonnement._id,
            tarif: commissionType.tarif,
            date_paiement: maintenant
        });

        // Mettre à jour le type de commission de la boutique
        boutique.commission_type = commission_type_id;
        await boutique.save();

        const boutiqueResponse = boutique.toObject();
        delete boutiqueResponse.mdp;

        // Peupler le type de commission dans l'abonnement
        await abonnement.populate('id_commission_type');

        // Récupérer les paiements mis à jour
        const paiements = await Paiement.find({ abonnement: abonnement._id }).sort({ date_paiement: -1 });

        res.status(200).json({
            success: true,
            message: `Abonnement changé vers le plan "${commissionType.nom}" avec succès`,
            boutique: boutiqueResponse,
            abonnement,
            paiements
        });

    } catch (error) {
        if (error.code === 'SOLDE_INSUFFISANT') {
            return res.status(402).json({
                success: false,
                message: error.message,
                code: 'SOLDE_INSUFFISANT'
            });
        }
        console.error('Erreur lors du changement d\'abonnement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du changement d\'abonnement'
        });
    }
};

/**
 * POST /recharger-portefeuille
 * Permet à une boutique d'ajouter de l'argent dans son portefeuille.
 */
const rechargerPortefeuille = async (req, res) => {
    try {
        const boutiqueId = req.user.id;
        const { montant } = req.body;

        if (!montant || montant <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Le montant doit être supérieur à 0'
            });
        }

        const boutique = await Boutique.findById(boutiqueId);
        if (!boutique) {
            return res.status(404).json({ success: false, message: 'Boutique introuvable' });
        }

        boutique.portefeuille += montant;
        await boutique.save();

        const boutiqueResponse = boutique.toObject();
        delete boutiqueResponse.mdp;

        res.status(200).json({
            success: true,
            message: `Rechargement de ${montant} Ar effectué avec succès`,
            boutique: boutiqueResponse,
            nouveau_solde: boutique.portefeuille
        });

    } catch (error) {
        console.error('Erreur lors du rechargement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du rechargement'
        });
    }
};

module.exports = { souscriptionPremierMois, deduirePortefeuille, getMonAbonnement, changerAbonnement, rechargerPortefeuille };
