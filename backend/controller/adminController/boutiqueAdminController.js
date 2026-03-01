const Boutique = require('../../models/userBoutiqueModel');
const Produit = require('../../models/produitModel');
const Stock = require('../../models/stockModel');
const Commande = require('../../models/commandeModel');
const CommandeBoutique = require('../../models/commandeBoutiqueModel');
const Abonnement = require('../../models/Abonnement');
const CommissionType = require('../../models/CommissionType');
const PanierProduit = require('../../models/panierProduitModel');
const Panier = require('../../models/panierModel');

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

/**
 * Récupérer toutes les boutiques (toutes, pas seulement validées) avec détails complets pour l'admin
 */
const getBoutiquesAdmin = async (req, res) => {
      try {
            const boutiques = await Boutique.find()
                  .select('-mdp')
                  .populate('commission_type')
                  .sort({ createdAt: -1 });

            const result = await Promise.all(boutiques.map(async (b) => {
                  const bObj = b.toObject();

                  // Nombre de produits (tous statuts)
                  const nombreProduits = await Produit.countDocuments({ boutique: b._id });
                  const nombreProduitsActifs = await Produit.countDocuments({ boutique: b._id, statut: 1 });

                  // Nombre total de commandes pour cette boutique
                  const nombreCommandes = await CommandeBoutique.countDocuments({ id_boutique: b._id });

                  // Chiffre d'affaires estimé : somme des prix dans les PanierProduit liés aux commandes de cette boutique
                  const commandesBoutique = await CommandeBoutique.find({ id_boutique: b._id }).select('id_commande');
                  const commandeIds = commandesBoutique.map(cb => cb.id_commande);
                  const commandes = await Commande.find({ _id: { $in: commandeIds } });
                  const chiffreAffaires = commandes.reduce((sum, c) => sum + (c.total_prix || 0), 0);

                  // Abonnement actif
                  const abonnement = await Abonnement.findOne({ id_boutique: b._id, statut: 'ACTIVE' })
                        .populate('id_commission_type');

                  return {
                        ...bObj,
                        nombre_produits: nombreProduits,
                        nombre_produits_actifs: nombreProduitsActifs,
                        nombre_commandes: nombreCommandes,
                        chiffre_affaires: chiffreAffaires,
                        commission_info: {
                              nom: b.commission_type?.nom || 'Aucune',
                              tarif: b.commission_type?.tarif ?? 0,
                              description: b.commission_type?.description || ''
                        },
                        abonnement_info: abonnement ? {
                              plan: abonnement.id_commission_type?.nom || 'Inconnu',
                              tarif: abonnement.id_commission_type?.tarif ?? 0,
                              statut: abonnement.statut,
                              date_debut: abonnement.date_debut,
                              prochain_paiement: abonnement.prochain_paiement
                        } : null
                  };
            }));

            res.status(200).json({
                  success: true,
                  count: result.length,
                  boutiques: result
            });

      } catch (error) {
            console.error('Erreur getBoutiquesAdmin:', error);
            res.status(500).json({
                  success: false,
                  message: 'Erreur serveur lors de la récupération des boutiques'
            });
      }
};

/**
 * Statistiques globales pour l'admin
 */
const getStatistiquesAdmin = async (req, res) => {
      try {
            // --- Compteurs globaux ---
            const totalBoutiques = await Boutique.countDocuments();
            const boutiquesValidees = await Boutique.countDocuments({ statut_demande: 1, statut_general: 1 });
            const boutiquesEnAttente = await Boutique.countDocuments({ statut_demande: 2 });
            const boutiquesRefusees = await Boutique.countDocuments({ statut_demande: 0 });
            const totalProduits = await Produit.countDocuments();
            const produitsActifs = await Produit.countDocuments({ statut: 1 });
            const totalCommandes = await Commande.countDocuments();

            // Chiffre d'affaires total
            const allCommandes = await Commande.find();
            const chiffreAffairesTotal = allCommandes.reduce((sum, c) => sum + (c.total_prix || 0), 0);

            // --- Répartition des statuts boutiques (pie chart) ---
            const statutBoutiques = {
                  validees: boutiquesValidees,
                  en_attente: boutiquesEnAttente,
                  refusees: boutiquesRefusees,
                  desactivees: await Boutique.countDocuments({ statut_demande: 1, statut_general: 0 })
            };

            // --- Commandes par statut (pie/bar chart) ---
            const commandesParStatut = {
                  en_cours: await Commande.countDocuments({ statut: 'en cours de preparation' }),
                  expedie: await Commande.countDocuments({ statut: 'expedie' }),
                  livre: await Commande.countDocuments({ statut: 'deja livre' })
            };

            // --- Top 10 boutiques par nombre de produits ---
            const allBoutiques = await Boutique.find({ statut_demande: 1 }).select('nom_boutique').lean();
            const topBoutiquesParProduits = await Promise.all(allBoutiques.map(async (b) => {
                  const count = await Produit.countDocuments({ boutique: b._id });
                  return { nom: b.nom_boutique, nombre_produits: count };
            }));
            topBoutiquesParProduits.sort((a, b) => b.nombre_produits - a.nombre_produits);
            const top10Produits = topBoutiquesParProduits.slice(0, 10);

            // --- Top 10 boutiques par chiffre d'affaires ---
            const topBoutiquesParCA = await Promise.all(allBoutiques.map(async (b) => {
                  const cmdBoutique = await CommandeBoutique.find({ id_boutique: b._id }).select('id_commande');
                  const cmdIds = cmdBoutique.map(cb => cb.id_commande);
                  const cmds = await Commande.find({ _id: { $in: cmdIds } });
                  const ca = cmds.reduce((sum, c) => sum + (c.total_prix || 0), 0);
                  return { nom: b.nom_boutique, chiffre_affaires: ca };
            }));
            topBoutiquesParCA.sort((a, b) => b.chiffre_affaires - a.chiffre_affaires);
            const top10CA = topBoutiquesParCA.slice(0, 10);

            // --- Répartition des produits par type (pie chart) ---
            const types = ["Aliment", "Électronique", "Cosmétique", "Mobilier", "Informatique"];
            const produitsParType = {};
            for (const t of types) {
                  produitsParType[t] = await Produit.countDocuments({ type: t });
            }

            // --- Commandes par mois (line chart - 12 derniers mois) ---
            const commandesParMois = [];
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
                  const debut = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const fin = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
                  const count = await Commande.countDocuments({
                        date_commande: { $gte: debut, $lte: fin }
                  });
                  const caMonth = await Commande.find({
                        date_commande: { $gte: debut, $lte: fin }
                  });
                  const caMois = caMonth.reduce((sum, c) => sum + (c.total_prix || 0), 0);
                  commandesParMois.push({
                        mois: debut.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
                        nombre_commandes: count,
                        chiffre_affaires: caMois
                  });
            }

            // --- Répartition abonnements par plan ---
            const commissionTypes = await CommissionType.find();
            const abonnementsParPlan = await Promise.all(commissionTypes.map(async (ct) => {
                  const count = await Abonnement.countDocuments({ id_commission_type: ct._id, statut: 'ACTIVE' });
                  return { plan: ct.nom, tarif: ct.tarif, nombre: count };
            }));

            // --- Top 10 boutiques par nombre de commandes ---
            const topBoutiquesParCommandes = await Promise.all(allBoutiques.map(async (b) => {
                  const count = await CommandeBoutique.countDocuments({ id_boutique: b._id });
                  return { nom: b.nom_boutique, nombre_commandes: count };
            }));
            topBoutiquesParCommandes.sort((a, b) => b.nombre_commandes - a.nombre_commandes);
            const top10Commandes = topBoutiquesParCommandes.slice(0, 10);

            // --- Moyenne portefeuille boutiques ---
            const boutiquesActives = await Boutique.find({ statut_demande: 1, statut_general: 1 }).select('portefeuille');
            const moyennePortefeuille = boutiquesActives.length > 0
                  ? boutiquesActives.reduce((sum, b) => sum + (b.portefeuille || 0), 0) / boutiquesActives.length
                  : 0;

            res.status(200).json({
                  success: true,
                  statistiques: {
                        compteurs: {
                              total_boutiques: totalBoutiques,
                              boutiques_validees: boutiquesValidees,
                              boutiques_en_attente: boutiquesEnAttente,
                              boutiques_refusees: boutiquesRefusees,
                              total_produits: totalProduits,
                              produits_actifs: produitsActifs,
                              total_commandes: totalCommandes,
                              chiffre_affaires_total: chiffreAffairesTotal,
                              moyenne_portefeuille: Math.round(moyennePortefeuille)
                        },
                        statut_boutiques: statutBoutiques,
                        commandes_par_statut: commandesParStatut,
                        top10_boutiques_produits: top10Produits,
                        top10_boutiques_ca: top10CA,
                        top10_boutiques_commandes: top10Commandes,
                        produits_par_type: produitsParType,
                        commandes_par_mois: commandesParMois,
                        abonnements_par_plan: abonnementsParPlan
                  }
            });

      } catch (error) {
            console.error('Erreur getStatistiquesAdmin:', error);
            res.status(500).json({
                  success: false,
                  message: 'Erreur serveur lors de la récupération des statistiques'
            });
      }
};

module.exports = {
      getBoutiques,
      getBoutiquesAdmin,
      getStatistiquesAdmin
};