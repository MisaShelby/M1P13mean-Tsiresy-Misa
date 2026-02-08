const { body } = require('express-validator');

const validateUserRegistration = [
    body('nom_complet')
        .trim()
        .notEmpty().withMessage('Le nom complet est obligatoire')
        .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),

    body('email')
        .trim()
        .toLowerCase()
        .notEmpty().withMessage('L\'email est obligatoire')
        .isEmail().withMessage('Format d\'email invalide'),

    body('telephone')
        .trim()
        .notEmpty().withMessage('Le numéro de téléphone est obligatoire')
        .matches(/^\+?[0-9\s\-\(\)]{10,}$/).withMessage('Format de téléphone invalide'),

    body('mdp')
        .notEmpty().withMessage('Le mot de passe est obligatoire')
        .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.mdp) {
                throw new Error('Les mots de passe ne correspondent pas');
            }
            return true;
        })
];

const validateUserLogin = [
    body('email')
        .trim()
        .toLowerCase()
        .notEmpty().withMessage('L\'email est obligatoire')
        .isEmail().withMessage('Format d\'email invalide'),

    body('mdp')
        .notEmpty().withMessage('Le mot de passe est obligatoire')
];

module.exports = { 
    validateUserRegistration, 
    validateUserLogin 
};