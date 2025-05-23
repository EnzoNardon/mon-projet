const { ObjectId } = require('mongodb');

class Posts {
  constructor(client) {
    this.client = client;
    this.db = client.db("ma-base");
    this.collection = this.db.collection("posts");
  }

  // ✅ Création d’un post avec visibilité
  async createPost(userId, login, content, parentId, visibility = 'open') {
    try {
      const newPost = {
        userId: new ObjectId(userId),
        login: login,
        content: content,
        visibility: visibility, // 👈 nouveau champ
        likes: [],
        createdAt: new Date(),
        parentId: typeof parentId === 'string' ? new ObjectId(parentId) : null
      };

      const result = await this.collection.insertOne(newPost);
      return result.insertedId;
    } catch (e) {
      throw new Error("Erreur lors de la création du post : " + e.message);
    }
  }

  // 🔁 Tous les posts d’un utilisateur
  async getPostsByUser(userId) {
    try {
      const posts = await this.collection.find({ userId: new ObjectId(userId) }).toArray();
      return posts;
    } catch (e) {
      throw new Error("Erreur lors de la récupération des posts");
    }
  }

  // 🔁 Ancien : tous les posts (tous forums confondus)
  async getAllPosts() {
    try {
      const posts = await this.collection.find().toArray();
      return posts;
    } catch (e) {
      throw new Error("Erreur lors de la récupération de tous les posts");
    }
  }

  // ✅ NOUVEAU : filtres pour open/closed
  async getVisiblePosts(type) {
    let filter = {};

    if (type === 'closed') {
      filter = { visibility: 'closed' };
    } else if (type === 'open') {
      filter = { visibility: 'open' };
    }

    console.log("🔎 Filtre Mongo utilisé :", filter);

    try {
      const posts = await this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();

      console.log("✅ Posts récupérés :", posts.length);
      return posts;
    } catch (err) {
      console.error("❌ Erreur Mongo dans getVisiblePosts :", err.message);
      throw new Error("Erreur MongoDB dans getVisiblePosts : " + err.message);
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
      const postObjectId = new ObjectId(postId);
      await this.deleteRepliesRecursive(postObjectId);
      await this.collection.deleteOne({ _id: postObjectId });
    } catch (e) {
      throw new Error("Erreur lors de la suppression du post : " + e.message);
    }
  }

  async deleteRepliesRecursive(parentId) {
    const replies = await this.collection.find({ parentId }).toArray();
    for (const reply of replies) {
      await this.deleteRepliesRecursive(reply._id);
      await this.collection.deleteOne({ _id: reply._id });
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

  async getRepliesByParentId(parentId) {
    try {
      return await this.collection
        .find({ parentId: new ObjectId(parentId) })
        .sort({ createdAt: 1 })
        .toArray();
    } catch (err) {
      throw new Error("Erreur lors de la récupération des réponses : " + err.message);
    }
  }

  async toggleLike(postId, userId) {
    const postObjectId = new ObjectId(postId);
    const userObjectId = new ObjectId(userId);

    const post = await this.collection.findOne({ _id: postObjectId });
    if (!post) throw new Error("Post introuvable");

    const alreadyLiked = post.likes?.some(id => id.toString() === userId);

    const update = alreadyLiked
      ? { $pull: { likes: userObjectId } }
      : { $addToSet: { likes: userObjectId } };

    await this.collection.updateOne({ _id: postObjectId }, update);

    return !alreadyLiked;
  }

}

module.exports = Posts;
