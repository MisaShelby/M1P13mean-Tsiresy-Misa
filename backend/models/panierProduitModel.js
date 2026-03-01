const mongoose = require("mongoose");

const panierProduitSchema = new mongoose.Schema({
      id_panier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Panier",
            required: [true, "Le panier est obligatoire!"]
      },
      id_produit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Produit",
            required: [true, "Le produit est obligatoire!"]
      },
      quantite: {
            type: Number,
            required: [true, "La quantité est obligatoire!"],
            min: [1, "La quantité doit être au moins 1"],
            default: 1
      },
      prix_unitaire: {
            type: Number,
            required: [true, "Le prix unitaire est obligatoire!"],
            min: [0, "Le prix ne peut pas être négatif"]
      },
      id_boutique: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Boutique",
            required: [true, "La boutique est obligatoire!"]
      }
}, {
      timestamps: true
});

panierProduitSchema.index({ id_panier: 1, id_produit: 1 }, { unique: true });

module.exports = mongoose.model("PanierProduit", panierProduitSchema);
