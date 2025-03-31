const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

const {MongoClient} = require('mongodb');
app.use(cors());
app.use(express.json()); // Pour lire les JSON dans le body des requêtes

const uri = "mongodb://localhost";
const dbName = "ma-base"; // nom de ta base
const collectionName = "utilisateurs"; // nom de ta collection

// Route POST pour ajouter un utilisateur
app.post('/add-user', async (req, res) => {
  const { nom, mail } = req.body;

  if (!nom || !mail) {
    return res.status(400).json({ message: "Nom et mail sont requis." });
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.insertOne({ nom, mail });

    res.status(201).json({
      message: "Utilisateur ajouté ✅",
      userId: result.insertedId,
    });
  } catch (e) {
    console.error("❌ Erreur MongoDB :", e);
    res.status(500).json({ message: "Erreur serveur." });
  } finally {
    await client.close();
  }
});

async function main() {
    const uri = "mongodb://localhost";
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      console.log("✅ Connecté à MongoDB");
  
      // Test : afficher les bases de données
      const databasesList = await client.db().admin().listDatabases();
      console.log("📂 Bases de données :");
      databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  
    } catch (e) {
      console.error("❌ Erreur de connexion à MongoDB :", e);
    } finally {
      await client.close();
    }
  }


  
app.listen(port, () => console.log('le serveur écoute le port 3000')); 