const mongoose = require("mongoose");

const commandeBoutiqueSchema = new mongoose.Schema({
      id_commande: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Commande",
            required: [true, "La commande est obligatoire!"]
      },
      id_boutique: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Boutique",
            required: [true, "La boutique est obligatoire!"]
      },
      statut: {
            type: String,
            enum: ["en attente", "pret"],
            default: "en attente",
            required: true
      },
      date_confirmation: {
            type: Date,
            default: null
      }
}, {
      timestamps: true
});

commandeBoutiqueSchema.index({ id_commande: 1, id_boutique: 1 }, { unique: true });

module.exports = mongoose.model("CommandeBoutique", commandeBoutiqueSchema);
