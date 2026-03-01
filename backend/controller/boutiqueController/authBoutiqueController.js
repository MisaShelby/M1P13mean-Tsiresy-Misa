const Boutique = require('../../models/userBoutiqueModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
      });
};

const registerBoutique = async (req, res) => {
      try {
            const { nom_boutique, photo, email, nom_gerant, telephone_gerant, mdp } = req.body;

            const existingEmail = await Boutique.findOne({ email });
            if (existingEmail) {
                  return res.status(400).json({
                        success: false,
                        message: 'Un compte avec cet email existe déjà'
                  });
            }

            const existingPhone = await Boutique.findOne({ telephone_gerant });
            if (existingPhone) {
                  return res.status(400).json({
                        success: false,
                        message: 'Un compte avec ce numéro de téléphone existe déjà'
                  });
            }

            const boutique = await Boutique.create({
                  nom_boutique,
                  photo,
                  email,
                  nom_gerant,
                  telephone_gerant,
                  mdp,
                  statut_demande: 2,
                  statut_general: 1
            });

            const token = generateToken(boutique._id);

            const boutiqueResponse = boutique.toObject();
            delete boutiqueResponse.mdp;

            res.status(201).json({
                  success: true,
                  message: 'Boutique créée avec succès',
                  token,
                  boutique: boutiqueResponse
            });

      } catch (error) {
            console.error('Erreur lors de l\'inscription de la boutique:', error);

            if (error.name === 'ValidationError') {
                  const errors = Object.values(error.errors).map(err => ({
                        field: err.path,
                        message: err.message
                  }));

                  return res.status(400).json({
                        success: false,
                        message: 'Erreur de validation',
                        errors
                  });
            }

            res.status(500).json({
                  success: false,
                  message: 'Erreur serveur lors de l\'inscription de la boutique'
            });
      }
};

const loginBoutique = async (req, res) => {
      try {
            const { nom_boutique, mdp } = req.body;

            const boutique = await Boutique
                  .findOne({ nom_boutique })
                  .select('+mdp')
                  .populate('commission_type');

            if (!boutique) {
                  return res.status(401).json({
                        success: false,
                        message: 'Nom de la Boutique ou mot de passe incorrect'
                  });
            }

            if (boutique.statut_demande !== 1) {
                  return res.status(403).json({
                        success: false,
                        message: 'Votre compte n\'a pas encore été validé par l\'administration. Veuillez contacter l\'administrateur.',
                        code: 'ACCOUNT_NOT_VALIDATED'
                  });
            }

            const isPasswordValid = await boutique.comparePassword(mdp);

            if (!isPasswordValid) {
                  return res.status(401).json({
                        success: false,
                        message: 'Nom de la Boutique ou mot de passe incorrect'
                  });
            }

            const token = generateToken(boutique._id);

            const boutiqueResponse = boutique.toObject();
            delete boutiqueResponse.mdp;

            // Si la boutique n'a pas encore choisi son type de commission => première connexion
            const requires_setup = !boutique.commission_type;

            res.status(200).json({
                  success: true,
                  message: 'Connexion réussie',
                  token,
                  boutique: boutiqueResponse,
                  requires_setup
            });

      } catch (error) {
            console.error('Erreur lors de la connexion de la boutique:', error);
            res.status(500).json({
                  success: false,
                  message: 'Erreur serveur lors de la connexion de la boutique'
            });
      }
};

const getProfileBoutique = async (req, res) => {
      try {
            const boutique = await Boutique.findById(req.boutique.id).select('-mdp');

            if (!boutique) {
                  return res.status(404).json({
                        success: false,
                        message: 'Boutique non trouvée'
                  });
            }

            res.status(200).json({
                  success: true,
                  boutique
            });

      } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                  success: false,
                  message: 'Erreur serveur'
            });
      }
};

module.exports = {
      registerBoutique,
      loginBoutique,
      getProfileBoutique
}