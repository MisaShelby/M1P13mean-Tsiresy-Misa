const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controller/clientController/authController');
const { validateUserRegistration, validateUserLogin, validateBoutiqueRegistration, validateBoutiqueLogin } = require('../middlewares/validation');
const validateRequest = require('../middlewares/validate');
const { protect } = require('../middlewares/auth.middleware');
const { registerBoutique, loginBoutique } = require('../controller/boutiqueController/authBoutiqueController');
const { registerAdmin, loginAdmin, getBoutiquesEnAttente, validerBoutique, refuserBoutique } = require('../controller/adminController/authAdminController');
const { getProduit, addProduit } = require('../controller/boutiqueController/produitController');

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

module.exports = router;