const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const boutiqueSchema = new mongoose.Schema({
    nom_boutique: {
        type: String,
        required: [true, "Le nom de la boutique est obligatoire!"],
        trim: true,
        minlength: [2, "Le nom de la boutique doit contenir au moins 2 caractères"],
        maxlength: [100, "Le nom de la boutique ne peut pas dépasser 100 caractères"]
    },
    photo: {
        type: String, 
        default: ""  
    },
    email: {
        type: String,
        required: [true, "L'email de la boutique est obligatoire!"],
        unique: true,
        trim: true,
        lowercase: true
    },
    nom_gerant: {
        type: String,
        required: [true, "Le nom du gérant est obligatoire!"],
        trim: true
    },
    telephone_gerant: {
        type: String,
        required: [true, "Le numéro du gérant est obligatoire!"],
        unique: true,
        trim: true
    },
    mdp: {
        type: String,
        required: [true, "Le mot de passe est obligatoire!"],
        minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"]
    },
    statut_demande: {
        type: Number,
        enum: [1, 2], // 2 = pas encore validé, 1 = validé
        default: 2,
        required: true
    },
    statut_general: {
        type: Number,
        enum: [0, 1], // 0 = désactivé, 1 = activé
        default: 0,
        required: true
    }
}, {
    timestamps: true
});

boutiqueSchema.pre("save", async function() {
    if (!this.isModified("mdp")) return;
    const salt = await bcrypt.genSalt(10);
    this.mdp = await bcrypt.hash(this.mdp, salt);
});

boutiqueSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.mdp);
};

module.exports = mongoose.model("Boutique", boutiqueSchema);
