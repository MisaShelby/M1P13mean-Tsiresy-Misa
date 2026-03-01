const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controller/clientController/authController');
const { validateUserRegistration, validateUserLogin, validateBoutiqueRegistration, validateBoutiqueLogin } = require('../middlewares/validation');
const validateRequest = require('../middlewares/validate');
const { protect } = require('../middlewares/auth.middleware');
const { registerBoutique, loginBoutique } = require('../controller/boutiqueController/authBoutiqueController');
const { registerAdmin, loginAdmin, getBoutiquesEnAttente, validerBoutique, refuserBoutique } = require('../controller/adminController/authAdminController');
const { getBoutiques, getBoutiquesAdmin, getStatistiquesAdmin } = require('../controller/adminController/boutiqueAdminController');
const { getProduit, addProduit, updateProduit } = require('../controller/boutiqueController/produitController');
const { getStocksByBoutique, updateStock, ajouterStock } = require('../controller/boutiqueController/StockController');
const { addPromotion, getPromotionsByProduit, getAllPromotions, updatePromotion, deletePromotion } = require('../controller/boutiqueController/promotionController');
const commissionTypeController = require('../controller/boutiqueController/comissionController');
const { souscriptionPremierMois, getMonAbonnement, changerAbonnement, rechargerPortefeuille } = require('../controller/boutiqueController/abonnementController');
const { getProduitsClient, getBoutiquesClient, getBoutiqueDetailClient } = require('../controller/clientController/produitClientController');
const { creerPanier, creerPanierAvecProduit, getPaniersActifs, getTousPaniers, ajouterProduitAuPanier, supprimerProduitDuPanier, supprimerPanier } = require('../controller/clientController/panierController');
const { creerCommande, getMesCommandes, getCommandeDetail, updateStatutCommande } = require('../controller/clientController/commandeController');
const { getCommandesBoutique, confirmerPreparation } = require('../controller/boutiqueController/commandeBoutiqueController');

router.post('/register',
      validateUserRegistration,
      validateRequest,
      registerUser
);

router.post('/login',
      validateUserLogin,
      validateRequest,
      loginUser
);

router.post('/register-boutique',
      validateBoutiqueRegistration,
      validateRequest,
      registerBoutique
);

router.post('/login-boutique',
      validateBoutiqueLogin,
      validateRequest,
      loginBoutique
);

router.post('/register-admin',
      validateUserRegistration,
      validateRequest,
      registerAdmin
);

router.post('/login-admin',
      validateUserLogin,
      validateRequest,
      loginAdmin
);

router.get('/liste-validation-inscri-boutique',
      validateRequest,
      getBoutiquesEnAttente
);

router.post('/validation-inscri-boutique',
      validateRequest,
      validerBoutique
);

router.post('/refut-inscri-boutique',
      validateRequest,
      refuserBoutique
);
router.get('/liste-produit',
      protect,
      getProduit
);

router.post('/create-produit',
      protect,
      addProduit
)

router.put('/update-produit/:id',
      protect,
      updateProduit
)

router.get('/profile', protect, getProfile);

router.post('/commissionType', commissionTypeController.createCommissionType);
router.get('/commissionType', commissionTypeController.getAllCommissionTypes);
router.get('/commissionType/:id', commissionTypeController.getCommissionTypeById);
router.put('/commissionType/:id', commissionTypeController.updateCommissionType);
router.delete('/commissionType/:id', commissionTypeController.deleteCommissionType);

router.post('/boutique-setup', protect, souscriptionPremierMois);

router.get('/mon-abonnement', protect, getMonAbonnement);

router.put('/changer-abonnement', protect, changerAbonnement);

router.post('/recharger-portefeuille', protect, rechargerPortefeuille);

// Produits Client (public)
router.get('/produits-client', getProduitsClient);

// Boutiques Client (public)
router.get('/boutiques-client', getBoutiquesClient);
router.get('/boutique-detail-client/:id', getBoutiqueDetailClient);

// Stock
router.get('/stocks', protect, getStocksByBoutique);
router.put('/stock', protect, updateStock);
router.post('/stock/ajouter', protect, ajouterStock);

// Promotions
router.post('/promotion', protect, addPromotion);
router.get('/promotions', protect, getAllPromotions);
router.get('/promotions/:id_produit', protect, getPromotionsByProduit);
router.put('/promotion/:id', protect, updatePromotion);
router.delete('/promotion/:id', protect, deletePromotion);

// Panier Client
router.post('/panier', protect, creerPanier);
router.post('/panier-avec-produit', protect, creerPanierAvecProduit);
router.get('/paniers-actifs', protect, getPaniersActifs);
router.get('/paniers', protect, getTousPaniers);
router.post('/panier-produit', protect, ajouterProduitAuPanier);
router.delete('/panier-produit/:id', protect, supprimerProduitDuPanier);
router.delete('/panier/:id', protect, supprimerPanier);

// Commandes Client
router.post('/commande', protect, creerCommande);
router.get('/mes-commandes', protect, getMesCommandes);
router.get('/commande/:id', protect, getCommandeDetail);
router.put('/commande/:id/statut', protect, updateStatutCommande);

// Commandes Boutique
router.get('/commandes-boutique', protect, getCommandesBoutique);
router.put('/commande-boutique/:id_commande/confirmer', protect, confirmerPreparation);

// Admin - Boutiques
router.get('/admin/boutiques', getBoutiquesAdmin);
router.get('/admin/statistiques', getStatistiquesAdmin);

module.exports = router;