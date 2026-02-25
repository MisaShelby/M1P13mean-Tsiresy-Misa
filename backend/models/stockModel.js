const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
      id_produit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produit",
            required: [true, "Le produit est obligatoire!"]
      },
      id_boutique: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Boutique",
            required: [true, "La boutique est obligatoire!"]
      },
      quantite: {
            type: Number,
            required: [true, "La quantité est obligatoire!"],
            min: [0, "La quantité ne peut pas être négative!"],
            default: 0
      }
}, {
      timestamps: true
});

stockSchema.index({ id_produit: 1, id_boutique: 1 }, { unique: true });

module.exports = mongoose.model("Stock", stockSchema);