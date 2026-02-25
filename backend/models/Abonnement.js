const mongoose = require("mongoose");

const abonnement = new mongoose.Schema({
    id_boutique:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boutique',
        required: [true, "Boutique obligatoire"]
    },
    id_commission_type:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommissionType',
        required: [true, "Plan obligatoire"]
    },
    date_debut:{
        type: Date,
        default: Date.now
    },
    prochain_paiement:{
        type: Date,
        required: true
    },
    statut: {
        type: String,
        enum: ["ACTIVE", "CANCELLED", "EXPIRED"],
        default: "ACTIVE"
    }
}, { timestamps: true });

module.exports = mongoose.model("Abonnement", abonnement);