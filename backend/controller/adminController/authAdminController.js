const Admin = require('../../models/userAdminModel');
const Boutique = require('../../models/userBoutiqueModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
      });
};

const registerAdmin = async (req, res) => {
      try {
            const { nom_complet, email, telephone, mdp } = req.body;

            const existingEmail = await Admin.findOne({ email });
            if (existingEmail) {
                  return res.status(400).json({
                        success: false,
                        message: 'Un compte avec cet email existe déjà'
                  });
            }

            const existingPhone = await Admin.findOne({ telephone });
            if (existingPhone) {
                  return res.status(400).json({
                        success: false,
                        message: 'Un compte avec ce numéro de téléphone existe déjà'
                  });
            }

            const admin = await Admin.create({
                  nom_complet,
                  email,
                  telephone,
                  mdp
            });

            const token = generateToken(admin._id);

            const adminResponse = admin.toObject();
            delete adminResponse.mdp;

            res.status(201).json({
                  success: true,
                  message: 'Administrateur créé avec succès',
                  token,
                  admin: adminResponse
            });

      } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);

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
                  message: 'Erreur serveur lors de l\'inscription'
            });
      }
};

const loginAdmin = async (req, res) => {
      try {
            const { email, mdp } = req.body;

            const admin = await Admin.findOne({ email }).select('+mdp');

            if (!admin) {
                  return res.status(401).json({
                        success: false,
                        message: 'Email ou mot de passe incorrect'
                  });
            }

            const isPasswordValid = await admin.comparePassword(mdp);

            if (!isPasswordValid) {
                  return res.status(401).json({
                        success: false,
                        message: 'Email ou mot de passe incorrect'
                  });
            }

            const token = generateToken(admin._id);

            const adminResponse = admin.toObject();
            delete adminResponse.mdp;

            res.status(200).json({
                  success: true,
                  message: 'Connexion réussie',
                  token,
                  admin: adminResponse
            });

      } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({
                  success: false,
                  message: 'Erreur serveur lors de la connexion'
            });
      }
};

const getProfile = async (req, res) => {
      try {
            const admin = await Admin.findById(req.admin.id).select('-mdp');

            if (!admin) {
                  return res.status(404).json({
                        success: false,
                        message: 'Administrateur non trouvé'
                  });
            }

            res.status(200).json({
                  success: true,
                  admin
            });

      } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                  success: false,
                  message: 'Erreur serveur'
            });
      }
};

const getBoutiquesEnAttente = async (req, res) => {
      try {
            const boutiques = await Boutique.find({ statut_demande: 2 })
                  .select('-mdp')
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

const validerBoutique = async (req, res) => {
      try {
            const { id } = req.body; 

            const boutique = await Boutique.findByIdAndUpdate(
                  id, 
                  { statut_demande: 1 },
                  { new: true }
            );

            if (!boutique) {
                  return res.status(404).json({
                        success: false,
                        message: "Boutique introuvable"
                  });
            }

            res.json({
                  success: true,
                  message: "Boutique validée",
                  boutique
            });
      } catch (err) {
            res.status(500).json({
                  success: false,
                  message: "Erreur serveur"
            });
      }
};

const refuserBoutique = async (req, res) => {
      try {
            const { id } = req.body; 

            const boutique = await Boutique.findByIdAndUpdate(
                  id, 
                  { statut_demande: 0 },
                  { new: true }
            );

            if (!boutique) {
                  return res.status(404).json({
                        success: false,
                        message: "Boutique introuvable"
                  });
            }

            res.json({
                  success: true,
                  message: "Demande refusée",
                  boutique
            });
      } catch (err) {
            res.status(500).json({
                  success: false,
                  message: "Erreur serveur"
            });
      }
};

module.exports = {
      registerAdmin,
      loginAdmin,
      getProfile,
      getBoutiquesEnAttente,
      validerBoutique,
      refuserBoutique
};