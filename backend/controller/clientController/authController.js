const User = require('../../models/userClientModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

const registerUser = async (req, res) => {
    try {
        const { nom_complet, email, telephone, mdp } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Un compte avec cet email existe déjà'
            });
        }

        const existingPhone = await User.findOne({ telephone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'Un compte avec ce numéro de téléphone existe déjà'
            });
        }

        const user = await User.create({
            nom_complet,
            email,
            telephone,
            mdp
        });

        const token = generateToken(user._id);

        const userResponse = user.toObject();
        delete userResponse.mdp;

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            token,
            user: userResponse
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

const loginUser = async (req, res) => {
    try {
        const { email, mdp } = req.body;

        const user = await User.findOne({ email }).select('+mdp');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        const isPasswordValid = await user.comparePassword(mdp);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email ou mot de passe incorrect'
            });
        }

        const token = generateToken(user._id);

        const userResponse = user.toObject();
        delete userResponse.mdp;

        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: userResponse
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
        const user = await User.findById(req.user.id).select('-mdp');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            user
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
    registerUser, 
    loginUser, 
    getProfile 
};