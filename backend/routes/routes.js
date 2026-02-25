const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controller/clientController/authController');
const { validateUserRegistration, validateUserLogin, validateBoutiqueRegistration, validateBoutiqueLogin } = require('../middlewares/validation');
const validateRequest = require('../middlewares/validate');
const { protect } = require('../middlewares/auth.middleware');
const { registerBoutique, loginBoutique } = require('../controller/boutiqueController/authBoutiqueController');
const { registerAdmin, loginAdmin, getBoutiquesEnAttente, validerBoutique, refuserBoutique } = require('../controller/adminController/authAdminController');
const { getProduit, addProduit } = require('../controller/boutiqueController/produitController');
const commissionTypeController = require('../controller/boutiqueController/ComissionController');
const { souscriptionPremierMois, getMonAbonnement } = require('../controller/boutiqueController/abonnementController');

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
      getProduit
);

router.post('create-produit',
      addProduit
)

router.get('/profile', protect, getProfile);

router.post('/commissionType', commissionTypeController.createCommissionType);
router.get('/commissionType', commissionTypeController.getAllCommissionTypes);
router.get('/commissionType/:id', commissionTypeController.getCommissionTypeById);
router.put('/commissionType/:id', commissionTypeController.updateCommissionType);
router.delete('/commissionType/:id', commissionTypeController.deleteCommissionType);

// Premier lancement boutique : choisir type de commission + payer premier mois
router.post('/boutique-setup', protect, souscriptionPremierMois);

// Abonnement de la boutique connectée
router.get('/mon-abonnement', protect, getMonAbonnement);

module.exports = router;