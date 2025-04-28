// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const Users = require('./entities/users'); 
const Posts = require('./entities/Posts');

const app = express();
const port = 3000;
const uri = "mongodb://localhost";
const jwt = require('jsonwebtoken'); 
const verifyToken = require('./Middlewares/authMiddleware');
require('dotenv').config();




app.use(cors());
app.use(express.json());

let usersManager;
let postsManager;

async function init() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Connecté à MongoDB");

    usersManager = new Users(client);
    postsManager = new Posts(client); // ✅ instanciation ici
  } catch (e) {
    console.error("❌ Erreur de connexion MongoDB :", e);
  }
}
init();


// Route POST pour créer un utilisateur (inscription)
app.post('/add-user', async (req, res) => {
  const { login, password, lastname, firstname } = req.body;

  if (!login || !password || !lastname || !firstname) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  try {
    const exist = await usersManager.exists(login);
    if (exist) return res.status(409).json({ message: "Utilisateur déjà existant" });

    const userId = await usersManager.create(login, password, lastname, firstname);
    res.status(201).json({ message: "Utilisateur créé", userId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
  }
});

// Route pour se connecter(connexion)
app.post('/connexion', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  try {
    const exist = await usersManager.exists(login);
    if (!exist) {
      return res.status(404).json({ message: "Utilisateur non existant !" });
    }

    const userId = await usersManager.checkpassword(login, password);
    if (!userId) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    const token = jwt.sign(
      { userId: userId.toString(), login },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Authentification réussie
    res.status(200).json({
      message: "Connexion réussie ✅",
      token,
      userId: userId.toString() 
    });
    
  } catch (e) {
    console.error("❌ Erreur dans /connexion :", e);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
});



app.get('/profil/:id', verifyToken, async (req, res) => {
  const userId = req.user.userId;

  if (!userId) {
    return res.status(403).json({ message: "Accès interdit" });
  }
  //console.log(req)
  try {
    const user = await usersManager.get(req.params.id);
    console.log(user);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (e) {
    console.error("Erreur dans /profil :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post('/posts', verifyToken, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Le contenu du post est vide." });
  }

  try {
    const userId = req.user.userId; // récupéré du token
    const login = req.user.login;   // 👈 récupéré aussi depuis le token

    const postId = await postsManager.createPost(userId, login, content);

    res.status(201).json({ message: "Post créé ✅", postId });
  } catch (e) {
    console.error("Erreur dans /posts :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


app.get('/posts/user/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (req.user.userId !== userId) {
    return res.status(403).json({ message: "Accès interdit" });
  }

  try {
    const posts = await postsManager.getPostsByUser(userId);
    res.status(200).json(posts);
  } catch (e) {
    console.error("Erreur dans /posts/user/:userId :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.delete('/posts/:postId', verifyToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId; // Récupéré depuis le token

  try {
    const post = await postsManager.getPostById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    // Vérifie que l'utilisateur est bien le propriétaire du post
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Accès interdit : ce post n'est pas à toi" });
    }

    await postsManager.deletePost(postId);

    res.status(200).json({ message: "Post supprimé ✅" });
  } catch (e) {
    console.error("Erreur dans /posts/:postId (DELETE) :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.put('/posts/:postId', verifyToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content) {
    return res.status(400).json({ message: "Le contenu est requis pour la mise à jour." });
  }

  try {
    const post = await postsManager.getPostById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post non trouvé" });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Accès interdit : tu ne peux modifier que tes posts" });
    }

    await postsManager.updatePost(postId, content);

    res.status(200).json({ message: "Post mis à jour ✅" });
  } catch (e) {
    console.error("Erreur dans /posts/:postId (PUT) :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



app.listen(port, () => console.log(`🚀 Le serveur écoute sur http://localhost:${port}`));
