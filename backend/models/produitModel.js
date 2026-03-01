const mongoose = require("mongoose");

const produitSchema = new mongoose.Schema({
      nom: {
            type: String,
            required: [true, "Le nom est obligatoire!"],
            trim: true,
            unique: true
      },
      photo: {
            type: String,
            default: ""
      },
      description: {
            type: String,
            trim: true
      },
      prix_unitaire: {
            type: Number,
            required: true,
            min: [0, "Le prix ne peut pas être négatif"]
      },
      type: {
            type: String,
            required: [true, "Le type est obligatoire!"],
            enum: {
                  values: ["Aliment", "Électronique", "Cosmétique", "Mobilier", "Informatique"],
                  message: "Type invalide!"
            }
      },
      statut: {
            type: Number,
            enum: [0, 1], // 0 = désactivé, 1 = activé
            default: 1,
            required: true
      },
      boutique: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Boutique",
            required: [true, "La boutique est obligatoire"]
      }
}, {
      timestamps: true
});

module.exports = mongoose.model("Produit", produitSchema);