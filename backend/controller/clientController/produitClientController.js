const Produit = require('../../models/produitModel');
const Boutique = require('../../models/userBoutiqueModel');
const Stock = require('../../models/stockModel');
const PromotionProduit = require('../../models/promotionProduit');

/**
 * Récupérer tous les produits de toutes les boutiques validées
 * Triés par tarif de commission de la boutique (plus grosse commission en premier)
 * Les boutiques avec tarif = 0 apparaissent en dernier
 */
const getProduitsClient = async (req, res) => {
    try {
        const { search, type, prixMin, prixMax, sortBy, sortOrder } = req.query;

        // Filtre de base : produits actifs uniquement
        const filter = { statut: 1 };

        // Filtre recherche texte
        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { nom: regex },
                { description: regex }
            ];
        }

        // Filtre par type
        if (type) {
            filter.type = type;
        }

        // Filtre par prix
        if (prixMin || prixMax) {
            filter.prix_unitaire = {};
            if (prixMin) filter.prix_unitaire.$gte = Number(prixMin);
            if (prixMax) filter.prix_unitaire.$lte = Number(prixMax);
        }

        // Récupérer les boutiques validées (statut_demande = 1, statut_general = 1)
        // avec leur commission_type peuplée
        const boutiquesValidees = await Boutique.find({
            statut_demande: 1,
            statut_general: 1
        })
            .select('_id nom_boutique photo commission_type portefeuille')
            .populate('commission_type');

        // Créer un map boutique_id -> boutique (avec commission info)
        const boutiqueMap = {};
        const boutiqueIds = [];
        boutiquesValidees.forEach(b => {
            boutiqueMap[b._id.toString()] = b;
            boutiqueIds.push(b._id);
        });

        // Filtrer les produits des boutiques validées uniquement
        filter.boutique = { $in: boutiqueIds };

        // Récupérer les produits
        const produits = await Produit.find(filter).populate('boutique', 'nom_boutique photo commission_type');

        // Récupérer les stocks pour tous ces produits
        const produitIds = produits.map(p => p._id);
        const stocks = await Stock.find({ id_produit: { $in: produitIds } });
        const stockMap = {};
        stocks.forEach(s => {
            stockMap[s.id_produit.toString()] = s.quantite;
        });

        // Récupérer les promotions actives
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

        // Construire le résultat enrichi
        let result = produits.map(p => {
            const pObj = p.toObject();
            const boutiqueId = pObj.boutique?._id?.toString() || pObj.boutique?.toString();
            const boutiqueInfo = boutiqueMap[boutiqueId];
            const commissionType = boutiqueInfo?.commission_type;

            return {
                ...pObj,
                stock: stockMap[pObj._id.toString()] ?? 0,
                promotions: promoMap[pObj._id.toString()] || [],
                boutique_info: {
                    _id: boutiqueInfo?._id,
                    nom_boutique: boutiqueInfo?.nom_boutique,
                    photo: boutiqueInfo?.photo
                },
                commission_info: {
                    nom: commissionType?.nom || 'Aucune',
                    tarif: commissionType?.tarif ?? 0,
                    description: commissionType?.description || ''
                }
            };
        });

        // Tri par défaut : tarif commission desc (plus gros tarif en premier, tarif 0 en dernier)
        if (!sortBy || sortBy === 'commission') {
            const order = sortOrder === 'asc' ? 1 : -1;
            result.sort((a, b) => {
                const tarifA = a.commission_info.tarif;
                const tarifB = b.commission_info.tarif;

                // Tarif 0 toujours en dernier (sauf si tri asc, alors en premier)
                if (order === -1) {
                    if (tarifA === 0 && tarifB !== 0) return 1;
                    if (tarifB === 0 && tarifA !== 0) return -1;
                } else {
                    if (tarifA === 0 && tarifB !== 0) return -1;
                    if (tarifB === 0 && tarifA !== 0) return 1;
                }

                return (tarifA - tarifB) * order;
            });
        } else if (sortBy === 'prix') {
            const order = sortOrder === 'asc' ? 1 : -1;
            result.sort((a, b) => (a.prix_unitaire - b.prix_unitaire) * order);
        } else if (sortBy === 'nom') {
            const order = sortOrder === 'asc' ? 1 : -1;
            result.sort((a, b) => a.nom.localeCompare(b.nom) * order);
        } else if (sortBy === 'date') {
            const order = sortOrder === 'asc' ? 1 : -1;
            result.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * order);
        }

        res.status(200).json({
            success: true,
            count: result.length,
            produits: result
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des produits client:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération des produits"
        });
    }
};

/**
 * Récupérer la liste de toutes les boutiques validées
 * avec le nombre de produits et la commission
 */
const getBoutiquesClient = async (req, res) => {
    try {
        const boutiques = await Boutique.find({
            statut_demande: 1,
            statut_general: 1
        })
            .select('nom_boutique photo email nom_gerant telephone_gerant commission_type createdAt')
            .populate('commission_type');

        // Pour chaque boutique, compter les produits actifs
        const result = await Promise.all(boutiques.map(async (b) => {
            const bObj = b.toObject();
            const produitCount = await Produit.countDocuments({ boutique: b._id, statut: 1 });
            return {
                ...bObj,
                nombre_produits: produitCount,
                commission_info: {
                    nom: b.commission_type?.nom || 'Aucune',
                    tarif: b.commission_type?.tarif ?? 0,
                    description: b.commission_type?.description || ''
                }
            };
        }));

        res.status(200).json({
            success: true,
            count: result.length,
            boutiques: result
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des boutiques client:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération des boutiques"
        });
    }
};

/**
 * Récupérer le détail d'une boutique avec ses produits et la statistique du produit le plus vendu
 * (basé sur la quantité de stock la plus basse = le plus vendu)
 */
const getBoutiqueDetailClient = async (req, res) => {
    try {
        const { id } = req.params;
        const boutique = await Boutique.findOne({
            _id: id,
            statut_demande: 1,
            statut_general: 1
        })
            .select('nom_boutique photo email nom_gerant telephone_gerant commission_type createdAt')
            .populate('commission_type');

        if (!boutique) {
            return res.status(404).json({ success: false, message: "Boutique introuvable" });
        }

        // Récupérer les produits actifs de cette boutique
        const produits = await Produit.find({ boutique: id, statut: 1 });
        const produitIds = produits.map(p => p._id);

        // Stocks
        const stocks = await Stock.find({ id_produit: { $in: produitIds } });
        const stockMap = {};
        stocks.forEach(s => {
            stockMap[s.id_produit.toString()] = s.quantite;
        });

        // Promotions actives
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

        // Construire la liste des produits enrichie
        const produitsEnrichis = produits.map(p => {
            const pObj = p.toObject();
            return {
                ...pObj,
                stock: stockMap[pObj._id.toString()] ?? 0,
                promotions: promoMap[pObj._id.toString()] || []
            };
        });

        // Trouver le produit le plus vendu (stock le plus bas, car les ventes réduisent le stock)
        let produitPlusVendu = null;
        if (stocks.length > 0) {
            const stockTrie = [...stocks].sort((a, b) => a.quantite - b.quantite);
            const meilleurStockId = stockTrie[0].id_produit.toString();
            const produitTrouve = produits.find(p => p._id.toString() === meilleurStockId);
            if (produitTrouve) {
                produitPlusVendu = {
                    ...produitTrouve.toObject(),
                    stock: stockTrie[0].quantite,
                    promotions: promoMap[meilleurStockId] || []
                };
            }
        }

        const bObj = boutique.toObject();
        res.status(200).json({
            success: true,
            boutique: {
                ...bObj,
                commission_info: {
                    nom: boutique.commission_type?.nom || 'Aucune',
                    tarif: boutique.commission_type?.tarif ?? 0,
                    description: boutique.commission_type?.description || ''
                },
                nombre_produits: produits.length,
                produits: produitsEnrichis,
                produit_plus_vendu: produitPlusVendu
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du détail boutique client:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la récupération du détail de la boutique"
        });
    }
};

module.exports = { getProduitsClient, getBoutiquesClient, getBoutiqueDetailClient };
