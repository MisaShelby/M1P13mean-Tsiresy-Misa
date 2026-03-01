const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
      nom_complet: {
            type: String,
            required: [true, "Le nom complet est obligatoire!"],
            trim: true,
            minlength: [2, "Le nom doit contenir au moins 2 caractères"],
            maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"]
      },
      email: {
            type: String,
            required: [true, "L'email est obligatoire!"],
            unique: true,
            trim: true,
            lowercase: true
      },
      telephone: {
            type: String,
            required: [true, "Le numéro de téléphone est obligatoire!"],
            unique: true,
            trim: true
      },
      mdp: {
            type: String,
            required: [true, "Le mot de passe est obligatoire!"],
            minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"]
      },
      adresse_livraison: {
            type: String,
            trim: true,
            default: ""
      }
}, {
      timestamps: true
});

userSchema.pre("save", async function () {
      if (!this.isModified("mdp")) return;
      const salt = await bcrypt.genSalt(10);
      this.mdp = await bcrypt.hash(this.mdp, salt);
});

userSchema.methods.comparePassword = async function (password) {
      return await bcrypt.compare(password, this.mdp);
};

module.exports = mongoose.model("User", userSchema);
