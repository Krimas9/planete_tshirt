const BoutiqueModel = require('../models/boutique.schema')

const AddBoutique = async (req, res) => {
    try {
      const { libelle, adress, city, telephone, postal_code, description } =
        req.body;
    
      // verifie si la boutique existe deja
      let existBoutique = await BoutiqueModel.findOne({ libelle });
      if (existBoutique) {
        return res.status(400).json({
          Message: "La boutique existe déjà",
          Success: false,
        });
      }
      // dans la cas ou il y a un probleme d'ajout de la boutique
      const boutique = new BoutiqueModel({
        libelle,
        adress,
        city,
        telephone,
        postal_code,
        description,
      });
      const newBoutique = await boutique.save();
  
      if (!newBoutique) {
        return res.status(400).json({
          Message: "problème dans l'ajout de la boutique",
          Success: false,
        });
      }
  
      return res.status(200).json({
        Message: "La boutique a bien été ajouté",
        Success: true,
      });
    } catch (error) {
      console.log("##########:", error);
      res.status(400).send({ Message: "problème dans l'ajout de la boutique", Error: error.message });
    }
  };
  
  const AllBoutiques = async (req, res) => {
    try {
      const boutiques = await BoutiqueModel.find();
      return res.status(200).json({
        Message: "tous boutiques",
        Success: true,
        data: { boutiques },
      });
    } catch (error) {
      console.log("##########:", error);
      res.status(400).send({ Message: "Server Error", Error: error.message });
    }
  };
  

  //renvoi un update ok meme si il n'est pas éfféctué
  const UpdateBoutique = async (req, res) => {
    try {
      const { _id } = req.params;
      const { libelle, adress, city, telephone, postal_code, description } =
        req.body;
      //--------------------------------------------------------------------------
      let updatedBoutique = await BoutiqueModel.findOneAndUpdate(
        { _id },
        { libelle, adress, city, telephone, postal_code, description },
        { new: true }
      );
  
      if (!updatedBoutique) {
        return res.status(400).json({
          Message: "problème dans la modification de la boutique",
          Success: false,
        });
      }
  
      return res.status(200).json({
        Message: "La boutique a bien été modifié",
        Success: true,
      });
    } catch (error) {
      console.log("##########:", error);
      res.status(400).send({ Message: "Server Error", Error: error.message });
    }
  };
  //renvoi un update ok meme si il n'est pas éfféctué

  const DeleteBoutique = async (req, res) => {
    try {
      const { _id } = req.query;
      const removedBoutique = await BoutiqueModel.remove({ _id });
      if (!removedBoutique) {
        return res
          .status(400)
          .json({ Message: "Probléme dans la suppression de la boutique" });
      }
      return res.status(200).json({ Message: "La boutique a bien été supprimé" });
    } catch (error) {
      console.log("##########:", error);
      res.status(500).send({ Message: "Server Error", Error: error.message });
    }
  };
  
  const BoutiquesPage = async (req, res) => {
    const user = req.session?.context?.user || null; // on test si l'utilisateur est connecté ou non pour la parti header de mon code
    try {
      const boutiques = await BoutiqueModel.find();
  
      if (!boutiques || boutiques.length === 0) {
        return res.render("boutiques", {
          boutiques: boutiques,
          user: user,
          boutiques_error: "il n'y a pas de  boutiques",
        });
      }
  
      return res.render("boutiques", {
        boutiques: boutiques,
        user: user,
        boutiques_error: "",
      });
    } catch (error) {
      console.log("##########:", error);
      res.status(400).send({ Message: "Server Error", Error: error.message });
    }
  };
  
  const OneBoutiquePage = async (req, res) => {
    const { _id } = req.params;
    const boutique_error = req?.session?.context?.boutique_error || "";
    const user = req.session?.context?.user || null;
    try {
      const boutique = await BoutiqueModel.findOne({ _id });
      // if (!boutique) {
      //   return res.render("boutique", {
      //     boutique: boutique,
      //     user: user,
      //     boutique_error: "La boutique n'existe pas",
      //   });
      // }
      return res.render("boutique", {
        boutique: boutique,
        user: user,
        boutique_error: boutique_error,
      });
    } catch (error) {
      console.log("##########:", error);
      return res.render("boutique", {
        boutique: {},
        user: user,
        boutique_error: "La boutique n'existe pas",
      });
    }
  };

  //partie administrateur:

  const ShowBoutiques = async (req, res) => {
    const user = req.session?.context?.user || null;
    if (!user || user?.role !== "admin") {
      return res.redirect("/acceuil");
    }
    try {
      const boutiques = await BoutiqueModel.find({ deleted: false });
      const user = req.session?.context?.user || null;
      return res.render("gestion/showboutiques", { boutiques, user });
    } catch (error) {
      console.log("##########:", error);
      res.status(400).send({ Message: "Server Error", Error: error.message });
    }
  };
  
  const CreateBoutique = async (req, res) => {
    const user = req.session?.context?.user || null;
    if (!user || user?.role !== "admin") {
      return res.redirect("/acceuil");
    }
    try {
      const { libelle, adress, city, telephone, postal_code, description } =
        req.body;
      //--------------------------------------------------------------------------
      // verifier si l'article existe deja
      let existBoutique = await BoutiqueModel.findOne({ libelle });
      if (existBoutique) {
        return res.redirect("/boutique/createpage");
      }
  
      const boutique = new BoutiqueModel({
        libelle,
        adress,
        city,
        telephone,
        postal_code,
        description,
      });
      const newBoutique = await boutique.save();
  
      if (!newBoutique) {
        return res.redirect("/boutique/createpage");
      }
  
      return res.redirect("/gestionBoutiques");
    } catch (error) {
      console.log("##########:", error);
      return res.status(400).json({
        Message: "problem dans l'ajout de boutique",
        Success: false,
      });
    }
  };
  
  const UpdateBoutiquePage = async (req, res) => {
    const user = req.session?.context?.user || null;
    if (!user || user?.role !== "admin") {
      return res.redirect("/acceuil");
    }
    try {
      const { _id } = req.params;
      const user = req.session?.context?.user || null;
      const boutiqueToUpdate = await BoutiqueModel.findById({ _id });
      if (!boutiqueToUpdate) {
        return res.redirect("/gestionBoutiques");
      }
      return res.render("gestion/updateboutique", {
        boutique: boutiqueToUpdate,
        user: user,
      });
    } catch (error) {
      console.log("##########:", error);
      res.status(500).send({ Message: "Server Error", Error: error.message });
    }
  };
  
  const UpdateBoutiqueFunction = async (req, res) => {
    try {
      const { _id } = req.params;
      const { libelle, adress, city, telephone, postal_code, description } =
        req.body;
  
      const updatedBoutique = await BoutiqueModel.findOneAndUpdate(
        { _id },
        {
          libelle,
          adress,
          city,
          telephone,
          postal_code,
          description,
        }
      );
  
      if (!updatedBoutique) {
        return res.redirect("/boutique/updatepage/" + _id);
      }
  
      return res.redirect("/gestionBoutiques");
    } catch (error) {
      console.log("##########:", error);
      return res.status(400).json({
        Message: "problem dans la modification de boutique",
        Success: false,
      });
    }
  };
  
  const DeleteBoutiqueAdmin = async (req, res) => {
      try {
      const { _id } = req.params;
      const removedBoutique = await BoutiqueModel.findOneAndUpdate(
        { _id },
        { deleted: true }
      );
      if (!removedBoutique) {
        return res.redirect("/gestionBoutiques");
      }
      return res.redirect("/gestionBoutiques");
    } catch (error) {
      console.log("##########:", error);
      res.status(500).send({ Message: "Server Error", Error: error.message });
    }
  };




  
  module.exports = {
    AddBoutique,
    AllBoutiques,
    UpdateBoutique,
    DeleteBoutique,
    BoutiquesPage,
    OneBoutiquePage,
    ShowBoutiques,
    DeleteBoutiqueAdmin,
    CreateBoutique,
    UpdateBoutiquePage,
    UpdateBoutiqueFunction,
  };