const { ObjectId } = require('mongodb');

class Posts {
  constructor(client) {
    this.client = client;
    this.db = client.db("ma-base");
    this.collection = this.db.collection("posts"); // Nouvelle collection "posts"
  }

  async createPost(userId, login, content) {
    try {
      const newPost = {
        userId: new ObjectId(userId),
        login: login, // 👈 Ajout du login
        content: content,
        likes: [],
        createdAt: new Date()
      };
  
      const result = await this.collection.insertOne(newPost);
      return result.insertedId;
    } catch (e) {
      throw new Error("Erreur lors de la création du post : " + e.message);
    }
  }
  

  async getPostsByUser(userId) {
    try {
      const posts = await this.collection.find({ userId: new ObjectId(userId) }).toArray();
      return posts;
    } catch (e) {
      throw new Error("Erreur lors de la récupération des posts");
    }
  }

  async getAllPosts() {
    try {
      const posts = await this.collection.find().toArray();
      return posts;
    } catch (e) {
      throw new Error("Erreur lors de la récupération de tous les posts");
    }
  }
  async getPostById(postId) {
    try {
      const post = await this.collection.findOne({ _id: new ObjectId(postId) });
      return post;
    } catch (e) {
      throw new Error("Erreur lors de la récupération du post");
    }
  }
  
  async deletePost(postId) {
    try {
      await this.collection.deleteOne({ _id: new ObjectId(postId) });
    } catch (e) {
      throw new Error("Erreur lors de la suppression du post");
    }
  }
  
  async updatePost(postId, newContent) {
    try {
      await this.collection.updateOne(
        { _id: new ObjectId(postId) },
        { $set: { content: newContent } }
      );
    } catch (e) {
      throw new Error("Erreur lors de la mise à jour du post");
    }
  }
  
}


module.exports = Posts;
