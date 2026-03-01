const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controller/clientController/authController');
const { validateUserRegistration, validateUserLogin, validateBoutiqueRegistration, validateBoutiqueLogin } = require('../middlewares/validation');
const validateRequest = require('../middlewares/validate');
const { protect } = require('../middlewares/auth.middleware');
const { registerBoutique, loginBoutique } = require('../controller/boutiqueController/authBoutiqueController');
const { registerAdmin, loginAdmin, getBoutiquesEnAttente, validerBoutique, refuserBoutique } = require('../controller/adminController/authAdminController');
const { getProduit, addProduit, updateProduit } = require('../controller/boutiqueController/produitController');
const { getStocksByBoutique, updateStock, ajouterStock } = require('../controller/boutiqueController/StockController');
const { addPromotion, getPromotionsByProduit, getAllPromotions, updatePromotion, deletePromotion } = require('../controller/boutiqueController/promotionController');
const commissionTypeController = require('../controller/boutiqueController/ComissionController');
const { souscriptionPremierMois, getMonAbonnement, changerAbonnement, rechargerPortefeuille } = require('../controller/boutiqueController/abonnementController');

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

module.exports = router;