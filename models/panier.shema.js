const { Schema, model} = require("mongoose");

const panierSchema = Schema({
    idUser: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "UserABC",
    },
    idBoutique: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Boutique",
    },
    totalprice: {
      type: Number,
      required: true,
      default: 0,
    },
    approved: {
      type: Boolean,
      required: true,
      default: false,
    },
    pick_up_date: {
      type: Date,
      required: false,
    }  
});

module.exports = model("PanierABC", panierSchema);

