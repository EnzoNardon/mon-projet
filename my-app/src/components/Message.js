import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OpenForum.css';

export default function Message() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
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
  }, [postId, navigate]);

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

        <button className="back-button" onClick={() => alert('Fonction de réponse à implémenter')}>
          💬 Répondre
        </button>
      </div>
    </>
  );
}
