import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OpenForum.css';

export default function Message() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    fetch(`http://localhost:3000/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(() => navigate('/openforum'));
  }, [postId, navigate, token]);

  useEffect(() => {
    if (post) {
      fetchReplies();
    }
  }, [post]);

  const fetchReplies = () => {
    fetch(`http://localhost:3000/posts/replies/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setReplies(data))
      .catch(err => console.error(err));
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyText,
          parentId: postId
        })
      });

      if (res.ok) {
        setReplyText('');
        setShowReplyForm(false);
        fetchReplies();
      }
    } catch (err) {
      console.error('Erreur lors de l’envoi de la réponse :', err);
    }
  };

  if (!post) return <p>Chargement du message...</p>;

  return (
    <>
      <div className="header-bar">
        <div className="header-left">
          <span className="header-title">Organizz'Asso</span>
        </div>
        <div className="header-right">
          <button className="logout-button" onClick={() => navigate('/openforum')}>
            🌍 OpenForum
          </button>
          <button className="logout-button" onClick={() => navigate('/profil')}>
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
        <div className="openforum-card">
          <p><strong>{post.login}</strong> a écrit :</p>
          <p>{post.content}</p>
          <div className="post-date">
            {new Date(post.createdAt).toLocaleString('fr-FR')}
          </div>
        </div>

        <button className="back-button" onClick={() => setShowReplyForm(!showReplyForm)}>
          💬 Répondre
        </button>

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
              <div key={reply._id} className="openforum-card reply-card">
                <p><strong>{reply.login}</strong> a répondu :</p>
                <p>{reply.content}</p>
                <div className="post-date">
                  {new Date(reply.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
