const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const paiement = new mongoose.Schema({
    abonnement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Abonnement',
        required: [true, "Abonnement obligatoire"]
    },
    tarif: {
        type: Number,
        required: true,
    },
    date_paiement:{
        type: Date,
        default: Date.now
    }
}, { timestamps: true });
module.exports = mongoose.model("Paiement", paiement);