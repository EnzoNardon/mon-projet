import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './MyMessages.css';

export default function MyMessages() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const navigate = useNavigate();

  const fetchPosts = useCallback(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      navigate('/');
      return;
    }

    fetch(`http://localhost:3000/posts/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch((err) => {
        console.error(err);
        navigate('/');
      });
  }, [navigate]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim() === '') return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:3000/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newPost }),
      });

      if (res.ok) {
        setNewPost('');
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeletePost = (postId) => {
    setPostIdToDelete(postId);
    setShowModal(true);
  };

  const deletePost = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:3000/posts/${postIdToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowModal(false);
      setPostIdToDelete(null);
    }
  };

  const saveEdit = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:3000/posts/${editingPostId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editingContent }),
      });

      if (res.ok) {
        setEditingPostId(null);
        setEditingContent('');
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="header-bar">
        <Link to="/" className="header-icon">
          🏠
        </Link>
        <Link to="/profil" className="header-icon">
          👤
        </Link>
      </div>

      <div className="messages-container">
        <h2>📬 Mes Messages</h2>

        <form onSubmit={handlePostSubmit} className="create-post-form">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Quoi de neuf ?"
            rows="4"
          />
          <button type="submit">Publier</button>
        </form>

        {posts.length === 0 ? (
          <p>Pas encore de messages...</p>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post._id} className="post-card">
                <p><strong>{post.login}</strong> a écrit :</p>

                {editingPostId === post._id ? (
                  <>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows="3"
                    />
                    <div className="edit-buttons">
                      <button onClick={saveEdit}>💾 Enregistrer</button>
                      <button onClick={() => setEditingPostId(null)}>❌ Annuler</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>{post.content}</p>
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleString('fr-FR')}
                    </span>
                    <div className="post-actions">
                      <button onClick={() => confirmDeletePost(post._id)}>
                        🗑️ Supprimer
                      </button>
                      <button onClick={() => {
                        setEditingPostId(post._id);
                        setEditingContent(post.content);
                      }}>
                        ✏️ Modifier
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <Link to="/profil" className="back-button">
          ⬅️ Retour au profil
        </Link>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirmation</h3>
              <p>Es-tu sûr de vouloir supprimer ce message ?</p>
              <div className="modal-buttons">
                <button onClick={deletePost}>✅ Oui, supprimer</button>
                <button onClick={() => setShowModal(false)}>❌ Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}