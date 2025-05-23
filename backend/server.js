// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const Users = require('./entities/users'); 
const Posts = require('./entities/Posts');

const app = express();
const port = 3000;
const uri = "mongodb://localhost";
const bcrypt = require('bcrypt');
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
    const user = await usersManager.getUserByLogin(login);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non existant !" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    
    if (!user.validated) {
      return res.status(403).json({ message: "Votre compte doit être validé par un administrateur." });
    }
    

    

    const token = jwt.sign(
      { userId: user._id.toString(), login: user.login, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: "Connexion réussie ✅", token, userId: user._id.toString() });

  } catch (e) {
    console.error("Erreur dans /connexion :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


app.get('/users/pending', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }

  try {
    const pendingUsers = await usersManager.getPendingUsers();
    res.status(200).json(pendingUsers);
  } catch (e) {
    console.error("Erreur dans /users/pending :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
app.put('/users/validate/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }

  try {
    const userId = req.params.id;
    await usersManager.validateUser(userId);
    res.status(200).json({ message: "Utilisateur validé ✅" });
  } catch (e) {
    console.error("Erreur dans /users/validate :", e);
    res.status(500).json({ message: "Erreur serveur" });
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

app.get('/Allposts', verifyToken, async (req, res) => {
  try {
    const posts = await postsManager.getAllPosts();
    res.status(200).json(posts);
  } catch (e) {
    console.error("Erreur dans /posts (GET) :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


app.post('/posts', verifyToken, async (req, res) => {
  const { content, parentId } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Le contenu du post est vide." });
  }

  try {
    const userId = req.user.userId;
    const login = req.user.login;

    let finalVisibility = 'open';

    if (parentId) {
      const parentPost = await postsManager.getPostById(parentId);
      if (!parentPost) return res.status(404).json({ message: "Message parent introuvable" });

      finalVisibility = parentPost.visibility;
    } else {
      finalVisibility = req.body.visibility || 'open';
    }

    const postId = await postsManager.createPost(userId, login, content, parentId, finalVisibility);

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

app.get('/posts/:postId', verifyToken, async (req, res) => {
  try {
    const post = await postsManager.getPostById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });
    res.status(200).json(post);
  } catch (e) {
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

app.get('/posts/replies/:parentId', verifyToken, async (req, res) => {
  try {
    const replies = await postsManager.getRepliesByParentId(req.params.parentId);
    res.status(200).json(replies);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur lors de la récupération des réponses" });
  }
});

app.get('/public/profil/:id', verifyToken, async (req, res) => {
  try {
    const user = await usersManager.get(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (e) {
    console.error("Erreur dans /public/profil/:id :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get('/public/posts/user/:userId', verifyToken, async (req, res) => {
  try {
    const posts = await postsManager.getPostsByUser(req.params.userId);
    res.status(200).json(posts);
  } catch (e) {
    console.error("Erreur dans /public/posts/user/:userId :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ✅ OpenForum : messages publics (ou les deux)
app.get('/posts/open', verifyToken, async (req, res) => {
  try {
    const posts = await postsManager.getVisiblePosts('open');
    res.status(200).json(posts);
  } catch (e) {
    console.error("Erreur dans /posts/open :", e);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get('/posts/closed', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès interdit (admin uniquement)" });
  }

  try {
    const posts = await postsManager.getVisiblePosts('closed');
    res.status(200).json(posts);
  } catch (e) {
    console.error("ERREUR dans /posts/closed :", e.message, e.stack);
    res.status(500).json({ message: "Erreur serveur (closed)" });
  }
});

app.post('/users/request-admin', verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    await usersManager.requestAdmin(userId);
    res.status(200).json({ message: "Demande envoyée avec succès." });
  } catch (e) {
    console.error("Erreur /users/request-admin :", e.message);
    res.status(400).json({ message: e.message });
  }
});

app.get('/users/admin-requests', verifyToken, async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== 'admin') {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const requests = await usersManager.getAdminRequests();
    res.status(200).json(requests);
  } catch (e) {
    console.error("Erreur /admin-requests :", e.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.put('/users/grant-admin/:userId', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès interdit" });
  }

  try {
    await usersManager.grantAdmin(req.params.userId);
    res.status(200).json({ message: "Utilisateur promu en admin." });
  } catch (e) {
    console.error("Erreur /grant-admin :", e.message);
    res.status(500).json({ message: e.message });
  }
});

app.put('/users/deny-admin/:userId', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès interdit" });
  }

  try {
    await usersManager.denyAdminRequest(req.params.userId);
    res.status(200).json({ message: "Demande refusée." });
  } catch (e) {
    console.error("Erreur /deny-admin :", e.message);
    res.status(500).json({ message: e.message });
  }
});

app.put('/users/revoke-admin/:userId', verifyToken, async (req, res) => {
  const requesterId = req.user.userId;
  const targetId = req.params.userId;

  if (requesterId === targetId) {
    return res.status(400).json({ message: "Kendi adminliğini kaldıramazsın." });
  }

  const requesterRole = req.user.role;
  if (requesterRole !== 'admin') {
    return res.status(403).json({ message: "Yetkisiz işlem." });
  }

  try {
    await usersManager.revokeAdmin(targetId);
    res.status(200).json({ message: "Admin rolü kaldırıldı." });
  } catch (e) {
    console.error("Erreur /revoke-admin:", e.message);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

app.get('/users/admins', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  try {
    const admins = await usersManager.getAdmins();
    res.status(200).json(admins);
  } catch (e) {
    console.error('Erreur /users/admins:', e.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.put('/users/revoke-admin/:userId', verifyToken, async (req, res) => {
  const requesterId = req.user.userId;
  const targetId = req.params.userId;

  if (requesterId === targetId) {
    return res.status(400).json({ message: "Tu ne peux pas retirer ton propre rôle." });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès interdit' });
  }

  try {
    await usersManager.revokeAdmin(targetId);
    res.status(200).json({ message: 'Rôle admin retiré.' });
  } catch (e) {
    console.error('Erreur /users/revoke-admin:', e.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.userId;

    const liked = await postsManager.toggleLike(postId, userId);
    res.status(200).json({ liked });
  } catch (e) {
    console.error("Erreur /posts/:postId/like:", e.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



app.listen(port, () => console.log(`🚀 Le serveur écoute sur http://localhost:${port}`));