const ArticleModel = require("../models/article.schema");

const AddArticle = async (req, res) => {
  try {
    const { libelle, image, description, price } = req.body;
    console.log({ libelle, image, description, price });
    //--------------------------------------------------------------------------
    // verifier si l'article existe deja
    let existArticle = await ArticleModel.findOne({ libelle });
    if (existArticle) {
      return res.status(400).json({
        Message: "produit déjà existant",
        Success: false,
      });
    }

    const article = new ArticleModel({
      libelle,
      image,
      description,
      price,
    });
    const newArticle = await article.save();

    if (!newArticle) {
      return res.status(400).json({
        Message: "probleme dans l'ajout de l'article",
        Success: false,
      });
    }

    return res.status(200).json({
      Message: "l'article a été ajouté",
      Success: true,
    });
  } catch (error) {
    console.log("##########:", error);
    return res.status(400).json({
      Message: "probleme dans l'ajout de l'article",
      Success: false,
    });
  }
};

const AllArticles = async (req, res) => {
  try {
    const articles = await ArticleModel.find();
    return res.status(200).json({
      Message: "tous articles",
      Success: true,
      data: { articles },
    });
  } catch (error) {
    console.log("##########:", error);
    res.status(400).send({ Message: "Server Error", Error: error.message });
  }
};

const UpdateArticle = async (req, res) => {
  try {
    const { _id } = req.params;
    const { libelle, image, description, price } = req.body;
    console.log({ libelle, image, description, price });
    //--------------------------------------------------------------------------
    let updatedArticle = await ArticleModel.findOneAndUpdate(
      { _id },
      { libelle, image, description, price },
      { new: true }
    );

    if (!updatedArticle) {
      return res.status(400).json({
        Message: "problème dans la modification de l'article",
        Success: false,
      });
    }

    return res.status(200).json({
      Message: "aricle a été modifié",
      Success: true,
    });
  } catch (error) {
    console.log("##########:", error);
    return res.status(400).json({
      Message: "problème dans la modification de l'article",
      Success: false,
    });
  }
};

const DeleteArticle = async (req, res) => {
  try {
    const { _id } = req.params;
    const removedArticle = await ArticleModel.findOneAndDelete({ _id });
    if (!removedArticle) {
      return res
        .status(400)
        .json({ Message: "Probleme dans la suppression de l'article" });
    }
    return res.status(200).json({ Message: "l'article a été supprimé" });
  } catch (error) {
    console.log("##########:", error);
    res.status(500).send({ Message: "Server Error", Error: error.message });
  }
};

const CataloguePage = async (req, res) => {
  try {
    const user = req.session?.context?.user || null;
    const articles = await ArticleModel.find();

    if (articles?.length === 0 || !articles) {
      return res.render("catalogue", {
        articles: [],
        user: user,
        articles_error: "il n'y a pas d'articles",
      });
    }
    return res.render("catalogue", { articles: articles, user: user });
  } catch (error) {
    console.log("##########:", error);
    res.status(400).send({ Message: "Server Error", Error: error.message });
  }
};

const OneArticlePage = async (req, res) => {
  const { _id } = req.params;
  const article_error = req?.session?.context?.article_error || "";
  const user = req.session?.context?.user || null;
  try {
    const article = await ArticleModel.findOne({ _id });
    if (!article) {
      return res.render("article", {
        article: article,
        user: user,
        article_error: "l'article n'existe pas",
      });
    }
    return res.render("article", {
      article: article,
      article_error: article_error,
      user: user,
    });
  } catch (error) {
    console.log("##########:", error);
    return res.render("article", {
      article: {},
      user: user,
      article_error: "l'article n'existe pas",
    });
  }
};

//Pour l'administrateur du site:

const ShowArticles = async (req, res) => {
  const user = req.session?.context?.user || null;
  if (!user || user?.role !== "admin") {
    return res.redirect("/acceuil");
  }
  try {
    const articles = await ArticleModel.find();
    const user = req.session?.context?.user || null;
    return res.render("gestion/showArticle", { articles, user });
  } catch (error) {
    console.log("##########:", error);
    res.status(400).send({ Message: "Server Error", Error: error.message });
  }
};

const CreateArticle = async (req, res) => {
  const user = req.session?.context?.user || null;
  if (!user || user?.role !== "admin") {
    return res.redirect("/acceuil");
  }
  try {
    const { libelle, image, description, price } = req.body;
    let existArticle = await ArticleModel.findOne({ libelle });
    if (existArticle) {
      return res.redirect("/article/createpage");
    }
    const article = new ArticleModel({
      libelle,
      image,
      description,
      price,
    });
    const newArticle = await article.save();
    if (!newArticle) {
      return res.redirect("/article/createpage");
    }
    return res.redirect("/gestionArticles");
  } catch (error) {
    console.log("##########:", error);
    return res.status(400).json({
      Message: "problem dans l'ajout de l'article",
      Success: false,
    });
  }
};

const UpdateArticlePage = async (req, res) => {
  const user = req.session?.context?.user || null;
  if (!user || user?.role !== "admin") {
    return res.redirect("/acceuil");
  }
  try {
    const { _id } = req.params;
    const user = req.session?.context?.user || null;
    const articleToUpdate = await ArticleModel.findById({ _id });
    if (!articleToUpdate) {
      return res.redirect("/gestionArticles");
    }
    return res.render("gestion/updateArticle", {
      article: articleToUpdate,
      user: user,
    });
  } catch (error) {
    console.log("##########:", error);
    res.status(500).send({ Message: "Server Error", Error: error.message });
  }
};

const UpdateArticleFunction = async (req, res) => {
  try {
    const { _id } = req.params;
    const { libelle, image, description, price } = req.body;
    const updatedArticle = await ArticleModel.findOneAndUpdate(
      { _id },
      {
        libelle,
        image,
        description,
        price,
      }
    );
    if (!updatedArticle) {
      return res.redirect("/article/updatepage/" + _id);
    }
    return res.redirect("/gestionArticles");
  } catch (error) {
    console.log("##########:", error);
    return res.status(400).json({
      Message: "problem dans l'ajout de l'article",
      Success: false,
    });
  }
};

const DeleteArticleAdmin = async (req, res) => {

  try {
    const { _id } = req.params;
    const removedArticle = await ArticleModel.findOneAndDelete(
      { _id },
      { deleted: true }
    );
    if (!removedArticle) {
      return res.redirect("/gestionArticles");
    }
    return res.redirect("/gestionArticles");
  } catch (error) {
    console.log("##########:", error);
    res.status(500).send({ Message: "Server Error", Error: error.message });
  }
};

module.exports = {
  AddArticle,
  AllArticles,
  UpdateArticle,
  DeleteArticle,
  CataloguePage,
  OneArticlePage,
  ShowArticles,
  CreateArticle,
  DeleteArticleAdmin,
  UpdateArticlePage,
  UpdateArticleFunction,
};
