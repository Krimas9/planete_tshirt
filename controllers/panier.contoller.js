const PanierModel = require("../models/panier.shema");
const OrderModel = require("../models/order.schema");
const ArticleModel = require("../models/article.schema");
const BoutiqueModel = require("../models/boutique.schema");

const AddArticleToCurrentPanier = async (req, res) => {
  // obtenir id du tshirt
  const { _id } = req.params;
  // obtenir la taille du tshirt
  const { size } = req.body;

  const user = req.session?.context?.user || null;
  try {
    // il n'y a pas d'utilisateur , pas des session
    if (!user) {
      req.session.context = {
        ...req.session.context,
        login_error: "vous devez vous connecter pour ajouter cet article",
      };
      return res.redirect("/connexion");
    }

    const existArticle = await ArticleModel.findOne({ _id });
    //il n'y a pas d'article
    if (!existArticle) {
      req.session.context = {
        ...req.session.context,
        article_error: "cet article n'existe pas",
      };
      return res.redirect("/article/one/" + _id);
    }

    const UnapprovedPanier = await PanierModel.findOne({
      idUser: user._id,
      approved: false,
    });

    const order = new OrderModel({
      idProduit: _id,
      idPanier: UnapprovedPanier._id,
      idUser: user._id,
      size: size,
      quantity: 1,
      date: new Date(),
    });

    const newOrder = await order.save();

    const updatedPanier = await PanierModel.findOneAndUpdate(
      { _id: UnapprovedPanier._id },
      { $inc: { totalprice: existArticle.price } }
    );

    if (!updatedPanier || !newOrder) {
      req.session.context = {
        ...req.session.context,
        article_error: "il y'a un erreur dans l'ajout de l'article au panier",
      };
      return res.redirect("/article/one/" + _id);
    }

    req.session.context = {
      ...req.session.context,
      panier: "article ajouter au panier",
      article_error: "",
    };
    return res.redirect("/panier");
  } catch (error) {
    console.log("##########:", error);
    req.session.context = {
      ...req.session.context,
      article_error: "il y'a un erreur d'ajout de cet aticle au panier",
    };
    return res.redirect("/article/one/" + _id);
  }
};

const ShowPanierPage = async (req, res) => {
  const user = req.session?.context?.user || null;
  try {
    // il n'y a pas d'utilisateur , pas des session
    if (!user) {
      req.session.context = {
        ...req.session.context,
        login_error: "Connectez vous pour accéder à votre panier",
      };
      return res.redirect("/connexion");
    }

    const panier = await PanierModel.findOne({
      idUser: user._id,
      approved: false,
    });

    if (!panier) {
      return res.render("panier", {
        panier: null,
        user: user,
        panier_error: "Le panier n'existe pas",
      });
    }

    const orders = await OrderModel.find({ idPanier: panier._id }).populate(
      "idProduit"
    );
    const boutiques = await BoutiqueModel.find();

    return res.render("panier", {
      panier: panier,
      orders: orders,
      user: user,
      boutiques: boutiques,
      panier_error: "",
    });
  } catch (error) {
    console.log("##########:", error);
    return res.render("panier", {
      panier: null,
      user: user,
      panier_error: "Le panier n'existe pas",
    });
  }
};

const ShowOldPaniersPage = async (req, res) => {
  const user = req.session?.context?.user || null;
  try {
    // il n'y a pas d'utilisateur , pas des session
    if (!user) {
      req.session.context = {
        ...req.session.context,
        login_error: "connectez vous pour accéder à votre panier",
      };
      return res.redirect("/connexion");
    }

    //obtenir tout les anciens panier
    const paniers = await PanierModel.find({
      idUser: user._id,
      approved: true,
    }).populate("idBoutique");

    let paniers_orders = [];

    for (let i = 0; i < paniers.length; i++) {
      const panier_orders = await OrderModel.find({
        idPanier: paniers[i]._id,
      }).populate("idProduit");
      paniers_orders.push({ ...paniers[i]._doc, orders: panier_orders });
    }
    console.log(paniers_orders);

    return res.render("historique", {
      ancienPaniers: paniers_orders,
      panier_error: "",
      user: user,
    });
  } catch (error) {
    console.log("##########:", error);
    return res.redirect("/panier");
  }
};

const DeleteOrderFromPanier = async (req, res) => {
  // obtenir id du tshirt
  try {
    const { _id } = req.params;
    const deletedOrder = await OrderModel.findOneAndDelete({ _id });
    if (!deletedOrder) {
      console.log("erreur de supression de l'article dans le panier");
      return res.redirect("/panier");
    }

    const relatedArticle = await ArticleModel.findOne({
      _id: deletedOrder.idProduit,
    });
    if (!relatedArticle) {
      console.log("article non trouver");
      return res.redirect("/panier");
    }

    const updatedPanier = await PanierModel.findOneAndUpdate(
      { _id: deletedOrder.idPanier },
      { $inc: { totalprice: -relatedArticle.price } }
    );
    if (!updatedPanier) {
      console.log("erreur de mise à jour du panier");
      return res.redirect("/panier");
    }

    return res.redirect("/panier");
  } catch (error) {
    console.log("##########:", error);
    return res.render("panier", {
      panier: null,
      user: user,
      panier_error: "panier n'existe pas ",
    });
  }
};

const ValidatePanier = async (req, res) => {
  try {
    // obtenir id de la boutique
    const { boutique, pick_up_date } = req.body;

    // if (!boutique) {
    //   req.session.context = {
    //     ...req.session.context,
    //     panier_error: "Selectionner une boutique",
    //   };
    //   return res.redirect("/panier");
    // }

    const user = req.session?.context?.user || null;
    // il n'y a pas d'utilisateur , pas des session
    if (!user) {
      req.session.context = {
        ...req.session.context,
        login_error: "Connectez vous pour ajouter cet article",
      };
      return res.redirect("/connexion");
    }

    const updatedPanier = await PanierModel.findOneAndUpdate(
      {
        idUser: user._id,
        approved: false, //prend la valeur du panier non validé
      },
      {
        approved: true,
        idBoutique: boutique,
        pick_up_date: pick_up_date,
      }
    );

    if (!updatedPanier) {
      req.session.context = {
        ...req.session.context,
        panier_error: "il y'a un erreur dans la validation du panier",
      };
      return res.redirect("/panier");
    }

    const panier = new PanierModel({
      idUser: user._id,
      totalprice: 0,
      approved: false,
    });

    const newpanier = await panier.save();
    console.log(newpanier);

    req.session.context = {
      ...req.session.context,
      panier_error: "",
    };
    return res.redirect("/panier/historique");
  } catch (error) {
    console.log("##########:", error);
    req.session.context = {
      ...req.session.context,
      panier_error: "il y'a un erreur dans la validation du panier",
    };
    return res.redirect("/panier");
  }
};

module.exports = {
  AddArticleToCurrentPanier,
  ShowPanierPage,
  DeleteOrderFromPanier,
  ValidatePanier,
  ShowOldPaniersPage,
};
