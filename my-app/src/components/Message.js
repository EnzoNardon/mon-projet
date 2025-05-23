import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Message.css';

export default function Message() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [parentPost, setParentPost] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showModal, setShowModal] = useState(false);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    setParentPost(null);

    fetch(`http://localhost:3000/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.visibility === 'closed' && role !== 'admin') {
          navigate('/openforum');
          return;
        }

        setPost(data);

        if (data.parentId) {
          fetch(`http://localhost:3000/posts/${data.parentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(parent => setParentPost(parent));
        }
      })
      .catch(() => navigate('/openforum'));
  }, [postId, navigate, token, role]);

  const fetchReplies = useCallback(() => {
    fetch(`http://localhost:3000/posts/replies/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setReplies(data) : setReplies([]));
  }, [postId, token]);

  useEffect(() => {
    if (post) fetchReplies();
  }, [post, fetchReplies]);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    await fetch(`http://localhost:3000/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: replyText, parentId: postId }),
    });

    setReplyText('');
    setShowReplyForm(false);
    fetchReplies();
  };

  const deletePost = async () => {
    try {
      await fetch(`http://localhost:3000/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/openforum');
    } catch (err) {
      console.error('Erreur lors de la suppression :', err);
    }
  };

  const handleSaveEdit = async () => {
    await fetch(`http://localhost:3000/posts/${postId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: editedContent }),
    });

    setEditing(false);
    setEditedContent('');
    const res = await fetch(`http://localhost:3000/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updated = await res.json();
    setPost(updated);
  };

  const handleLike = async () => {
    await fetch(`http://localhost:3000/posts/${post._id}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const res = await fetch(`http://localhost:3000/posts/${post._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const updated = await res.json();
    setPost(updated);
  };

  if (!post) return <p>Chargement...</p>;

  const isLiked = post.likes?.includes(userId);

  return (
    <>
      <div className="header-bar">
        <div className="header-left">
          <span className="header-title">Organizz'Asso</span>
        </div>
        <div className="header-right">
          {role === 'admin' && (
            <button className="logout-button" onClick={() => navigate('/closedforum')}>
              🔒 ClosedForum
            </button>
          )}
          <button className="logout-button" onClick={() => navigate('/openforum')}>
            🌍 OpenForum
          </button>
          <button className="logout-button" onClick={() => navigate(`/profil/${userId}`)}>
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

      <div className="openforum-container">
        <div className="message-thread">
          <div className={`openforum-card ${post.visibility === 'closed' ? 'closed-post' : ''}`}>
            <p>
              <Link to={`/profil/${post.userId}`} className="poster-name">
                <strong>{post.login}</strong>
              </Link> a écrit
              {parentPost &&
                <>
                  {' '}en réponse au {' '}
                  <span onClick={() => navigate(`/message/${parentPost._id}`)} className="poster-name">
                    message de <strong>{parentPost.login}</strong>
                  </span>
                </>
              }
              :
            </p>

            {editing ? (
              <>
                <textarea
                  className="edit-textarea"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={4}
                />
                <div className="edit-buttons">
                  <button onClick={handleSaveEdit}>💾 Enregistrer</button>
                  <button onClick={() => setEditing(false)}>❌ Annuler</button>
                </div>
              </>
            ) : (
              <>
                <p>{post.content}</p>
                <span className="post-date">{new Date(post.createdAt).toLocaleString('fr-FR')}
                  <br />
                  ❤️ {post.likes?.length || 0} like(s)
                </span>
                <div className="post-actions">
                  <button onClick={handleLike}>
                    {isLiked ? '💔 Unlike' : '❤️ Like'}
                  </button>
                  <button onClick={() => navigate(`/profil/${post.userId}`)}>👤 Visiter le profil</button>
                  {post.userId === userId && (
                    <>
                      <button onClick={() => setEditing(true)}>✏️ Modifier</button>
                      <button onClick={() => setShowModal(true)}>🗑️ Supprimer</button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="reply-button-wrapper">
            <button className="back-button" onClick={() => setShowReplyForm(!showReplyForm)}>
              💬 Répondre
            </button>
          </div>

          {showReplyForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReplySubmit();
              }}
              className="create-post-form"
              style={{ marginTop: '20px' }}
            >
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Écris ta réponse ici..."
                rows="4"
              />
              <button type="submit">Envoyer la réponse</button>
            </form>
          )}

          {replies.length > 0 && (
            <div className="replies-list">
              <h3>Réponses</h3>
              {replies.map(reply => (
                <div
                  key={reply._id}
                  className={`openforum-card reply-card ${reply.visibility === 'closed' ? 'closed-post' : ''}`}
                  onClick={() => navigate(`/message/${reply._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <p><strong>{reply.login}</strong> a répondu :</p>
                  <p>{reply.content}</p>
                  <div className="post-date">{new Date(reply.createdAt).toLocaleString('fr-FR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
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

      <button className="floating-create-button" onClick={() => navigate('/messages')}>
        +
      </button>
    </>
  );
}