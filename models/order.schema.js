const { Schema, model } = require("mongoose");

const orderSchema = Schema({
  idProduit: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "ArticleABC",
  },
  idPanier: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "PanierABC",
  },
  idUser: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "UserABC",
  },
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = model("OrderABC", orderSchema);



