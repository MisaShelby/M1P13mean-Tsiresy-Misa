const mongoose = require("mongoose");

const panierSchema = new mongoose.Schema({
      nom: {
            type: String,
            required: [true, "Le nom du panier est obligatoire!"],
            trim: true
      },
      id_client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Le client est obligatoire!"]
      },
      total_prix: {
            type: Number,
            default: 0,
            min: [0, "Le total ne peut pas être négatif"]
      }
}, {
      timestamps: true
});

module.exports = mongoose.model("Panier", panierSchema);
