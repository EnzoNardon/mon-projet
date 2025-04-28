// Users.js
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

class Users {
  constructor(client) {
    this.client = client;
    this.db = client.db("ma-base");
    this.collection = this.db.collection("utilisateurs");
  }

  async create(login, password, lastname, firstname) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = {
        login,
        password: hashedPassword,
        lastname,
        firstname,
        role: 'user',          // ✅ Par défaut
        validated: false,      // ✅ Pas encore validé
      };
  
      const result = await this.collection.insertOne(newUser);
      return result.insertedId;
    } catch (e) {
      throw new Error("Erreur lors de la création de l'utilisateur : " + e.message);
    }
  }
  
  async get(userid) {
    try {
      const user = await this.collection.findOne({ _id: new ObjectId(userid) });
      return user;
    } catch (e) {
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
  }

  async exists(login) {
    try {
      const user = await this.collection.findOne({ login });
      return !!user;
    } catch (e) {
      throw new Error("Erreur lors de la vérification du login");
    }
  }

  async checkpassword(login, password) {
    try {
      const user = await this.collection.findOne({ login });
      if (!user) return null;
  
      const match = await bcrypt.compare(password, user.password);
      return match ? user._id : null;
    } catch (e) {
      throw new Error("Erreur lors de la vérification du mot de passe");
    }
  }
  async getUserByLogin(login) {
    try {
      const user = await this.collection.findOne({ login });
      return user;
    } catch (e) {
      throw new Error("Erreur lors de la récupération de l'utilisateur");
    }
  }
  async getPendingUsers() {
    try {
      const users = await this.collection.find({ validated: false }).toArray();
      return users;
    } catch (e) {
      throw new Error("Erreur lors de la récupération des utilisateurs en attente");
    }
  }
  async validateUser(userId) {
    try {
      await this.collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { validated: true } }
      );
    } catch (e) {
      throw new Error("Erreur lors de la validation de l'utilisateur");
    }
  }
  
}

module.exports = Users;

  