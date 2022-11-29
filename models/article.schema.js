const { Schema, model } = require("mongoose");

const articleSchema = Schema({
  libelle: {
    type: String,
    require: true,
  },
  image: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    minLengh: 1,
    require: true,
  },

});

module.exports = model("ArticleABC", articleSchema);

