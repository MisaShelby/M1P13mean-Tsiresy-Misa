const mongoose = require("mongoose");

const comissiontype = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, "Le nom est obligatoire!"],
        trim: true,
        unique: true
    },
    tarif: {
        type: Number,
        required: true,
        min: [0, "Le tarif ne peut pas être négatif"]
    },
    description: {
        type: String,
        trim: true
    },

}, { timestamps: true });
module.exports = mongoose.model("CommissionType", comissiontype);