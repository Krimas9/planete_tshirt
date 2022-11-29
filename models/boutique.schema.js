const { Schema, model } = require("mongoose");

const panierSchema = Schema({
  libelle: {
    type: String,
    required: true,
  },
  adress: {
    type: String,
    required: true,
    default: 0,
  },
  city: {
    type: String,
    required: true,
    default: 0,
  },
  telephone: {
    type: String,
    required: true,
    default: false,
  },
  postal_code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});

module.exports = model("Boutique", panierSchema);

