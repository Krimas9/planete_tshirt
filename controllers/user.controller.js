const UserModel = require("../models/User.schema");
const PanierModel= require('../models/panier.shema');
const bcrypt = require("bcrypt");
const passGenerator = require("../functions/PassGenerator")
const mailer = require("../functions/mailer");

const Register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    console.log({ firstName, lastName, email, password });
    
    // verifier si l'utilisateur existe: 
    let existUser = await UserModel.findOne({ email });
    if (existUser) {
      req.session.context = {
        register_error: "Email est deja utilisée",
      };
      return res.redirect("/connexion");
    }

    //--------------------------------------------------------------------------
    const cryptedMdp = await bcrypt.hash(password, 10);

    const user = new UserModel({firstName, lastName, email, password: cryptedMdp});
    const newUser = await user.save();

    if (!newUser) {
      req.session.context = {
        register_error: "erreur dans la créaction de l'utilisateur",
      };
      return res.redirect("/connexion");
    }

    const panier = new PanierModel({
      idUser: newUser._id,
      totalprice: 0,
      approved: false,
    });

    //-----------------------------------
    // creation terminé

    const newpanier = await panier.save();
    

    req.session.context = {
      ...req.session.context,
      register_error: "",
      user: newUser,
    };
    return res.redirect("/acceuil");
  } catch (error) {
    console.log("##########:", error);

    req.session.context = {
      ...req.session.context,
      register_error: "erreur dans la creaction d'utilisateur",
    };
    return res.redirect("/connexion");
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log({ email, password });
    //--------------------------------------------------------------------------
    // Verifie l'utilisateur
    let existUser = await UserModel.findOne({ email });
    if (!existUser) {
      req.session.context = {
        ...req.session.context,
        login_error: "Verifiez votre email et password",
      };
      return res.redirect("/connexion");
    }

    //--------------------------------------------------------------------------
    // Verifie le mot de passe
    const passMatch = await bcrypt.compare(password, existUser?.password);
    if (!passMatch) {
      req.session.context = {
        ...req.session.context,
        login_error: "Verifier votre email et password",
      };
      return res.redirect("/connexion");
    }
    
    //Connexion de l'utilisateur
    req.session.context = {
      ...req.session.context,
      login_error:"",
      user: existUser,
    };
    return res.redirect("/Acceuil");
  } catch (error) {
    console.log("##########:", error);
    req.session.context = {
      ...req.session.context,
      login_error: "Verifier votre email et password",
    };
    return res.redirect("/connexion");
  }
};

//Déconnexion de l'utilisateur
const Deconnexion = async (req, res) => {
  req.session.destroy();
  return res.redirect("/connexion");
};

//reinitialisation du mot de passe
const ResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    let existUser = await UserModel.findOne({ email });
    if (!existUser) {
      req.session.context = {
        forget_error: "Verifiez votre email",
      };
      return res.redirect("/reinitialisation");
    }
    const generatedPass = passGenerator();
    const message = ` <h3>Votre nouveaux mot-de-passe est : ${generatedPass}  </h3> `;
    const resetPassMailResp = await mailer.sendMail(email, message);
    const cryptedMdp = await bcrypt.hash(generatedPass, 10);
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: existUser._id },
      { password: cryptedMdp}
    );
    if (!updatedUser) {
      req.session.context = {
        forget_error: "Problème de la sauvegarde du nouveau mot-de-passe",
      };
      return res.redirect("/reinitialisation");
    }
    req.session.context = {
      ...req.session.context,
      login_error: "un nouveau mot-de-passe a été envoyé dans votre e-mail",
    };
    return res.redirect("/connexion");
  } catch (error) {
    console.log("##########:", error);
    req.session.context = {
      forget_error: "Verifiez votre email",
    };
    return res.redirect("/reinitialisation");
  }
};

const Getprofil = async (req, res) => {
  try {
    const user = req.session?.context?.user || null;

    if (!user) {
      req.session.context = {
        ...req.session.context,
        login_error: "connectez vous pour accéder à votre profil",
      };
      return res.redirect("/connexion");
    }

    return res.render("session", {
      user: user,
    });
  } catch (error) {
    console.log("##########:", error);
    req.session.context = {
      login_error: "",
    };
    return res.redirect("/connexion");
  }
}

module.exports = {
  Register,
  Login,
  Deconnexion,
  ResetPassword,
  Getprofil,
};

