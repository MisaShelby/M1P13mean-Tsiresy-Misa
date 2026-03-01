const mongoose = require("mongoose");

const promotionProduitSchema = new mongoose.Schema({
    id_produit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produit",
        required: [true, "Le produit est obligatoire"]
    },
    id_boutique: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Boutique",
        required: [true, "La boutique est obligatoire"]
    },
    type_promotion: {
        type: String,
        required: [true, "Le type de promotion est obligatoire"],
        enum: {
            values: ["POURCENTAGE", "ACHETE_OFFERT", "CODE_PROMO"],
            message: "Type de promotion invalide"
        }
    },
    pourcentage: {
        type: Number,
        min: [0, "Le pourcentage ne peut pas être négatif"],
        max: [100, "Le pourcentage ne peut pas dépasser 100"],
        default: 0
    },
    code_promo: {
        type: String,
        trim: true,
        default: ""
    },
    date_debut: {
        type: Date,
        required: [true, "La date de début est obligatoire"]
    },
    date_fin: {
        type: Date,
        required: [true, "La date de fin est obligatoire"]
    },
    statut: {
        type: Number,
        enum: [0, 1], // 0 = inactive, 1 = active
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("PromotionProduit", promotionProduitSchema);
