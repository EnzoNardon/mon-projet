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
      const result = await this.collection.insertOne({ login, password: hashedPassword, lastname, firstname });
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
      return match;
    } catch (e) {
      throw new Error("Erreur lors de la vérification du mot de passe");
    }
  }
}

module.exports = Users;

  