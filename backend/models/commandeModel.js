const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema({
      id_panier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Panier",
            required: [true, "Le panier est obligatoire!"]
      },
      id_client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Le client est obligatoire!"]
      },
      paiement: {
            type: String,
            enum: ["Mvola", "Visa"],
            required: [true, "Le mode de paiement est obligatoire!"]
      },
      statut: {
            type: String,
            enum: ["en cours de preparation", "expedie", "deja livre"],
            default: "en cours de preparation",
            required: true
      },
      adresse_livraison: {
            type: String,
            required: [true, "L'adresse de livraison est obligatoire!"],
            trim: true
      },
      total_prix: {
            type: Number,
            required: true,
            min: [0, "Le total ne peut pas être négatif"]
      },
      date_paiement: {
            type: Date,
            default: null
      },
      date_commande: {
            type: Date,
            default: Date.now
      },
      date_livraison: {
            type: Date,
            default: null
      }
}, {
      timestamps: true
});

module.exports = mongoose.model("Commande", commandeSchema);
