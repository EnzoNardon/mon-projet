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
  const [visibility, setVisibility] = useState('open');
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  const fetchPosts = useCallback(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'admin');

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
        body: JSON.stringify({
          content: newPost,
          visibility: isAdmin ? visibility : 'open',
        }),
      });

      if (res.ok) {
        setNewPost('');
        setVisibility('open');
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
        <div className="header-left">
          <span className="header-title">Organizz'Asso</span>
        </div>
        <div className="header-right">
          {isAdmin && (
            <button className="logout-button" onClick={() => navigate('/closedforum')}>
              🔒 ClosedForum
            </button>
          )}
          <button className="logout-button" onClick={() => navigate('/openforum')}>
            🌍 OpenForum
          </button>
          <button className="logout-button" onClick={() => navigate(`/profil/${localStorage.getItem('userId')}`)}>
            👤 Mon profil
          </button>
          <button className="logout-button" onClick={() => {
            localStorage.clear();
            navigate('/');
          }}>
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <div className="messages-container-mm">
        <h2>Mes Publications 📬</h2>

        <form onSubmit={handlePostSubmit} className="create-post-form-mm">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Rédigez ici..."
            rows="4"
          />
          {isAdmin && (
            <select
              className={visibility === 'closed' ? 'select-closed' : 'select-open'}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="open">Forum public</option>
              <option value="closed">Forum fermé (admin)</option>
            </select>
          )}
          <button type="submit">Publier</button>
        </form>

        {posts.length === 0 ? (
          <div className="empty-notification">Pas encore de messages...</div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post._id} className={`post-card ${post.visibility === 'closed' ? 'closed-post' : ''}`}>
                <p><strong>{post.login}</strong> a écrit :</p>

                {editingPostId === post._id ? (
                  <>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows="3"
                    />
                    <div className="edit-buttons-mm">
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
                      <button onClick={() => navigate(`/message/${post._id}`)}>👁️ Voir les réponses</button>
                      <button onClick={() => {
                        setEditingPostId(post._id);
                        setEditingContent(post.content);
                      }}>✏️ Modifier</button>
                      <button onClick={() => confirmDeletePost(post._id)}>🗑️ Supprimer</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="back-button-wrapper">
          <Link to={`/profil/${localStorage.getItem('userId')}`} className="full-width-back-button">
            ⬅️ Retour au profil
          </Link>
        </div>

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
