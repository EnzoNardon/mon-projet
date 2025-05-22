import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './UserProfile.css';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loggedInUserId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    setCurrentUserId(loggedInUserId);
    setIsAdmin(role === 'admin');

    if (!token || !userId) {
      navigate('/');
      return;
    }

    // Fetch user profile
    fetch(`http://localhost:3000/public/profil/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Non autorisé');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => navigate('/'));

    // Fetch user posts
    fetch(`http://localhost:3000/public/posts/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Erreur récupération des posts :', err));
  }, [userId, navigate]);

  if (!user) return <p className="loading-text">Chargement du profil...</p>;

  const totalMessages = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);

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
          <button
            className="logout-button"
            onClick={() => navigate(`/profil/${localStorage.getItem('userId')}`)}
          >
            👤 Mon profil
          </button>
          <button
            className="logout-button"
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <h2 className="profile-username">@{user.login}</h2>
          <div className="profile-detail">
            <strong>Nom :</strong> {user.lastname}
          </div>
          <div className="profile-detail">
            <strong>Prénom :</strong> {user.firstname}
          </div>
          <div className="profile-detail">
            <strong>Messages publiés :</strong> {totalMessages}
          </div>
          <div className="profile-detail">
            <strong>Likes reçus :</strong> {totalLikes}
          </div>
        </div>

        {(currentUserId === userId) && (
          <div className="profile-buttons">
            <button onClick={() => navigate('/messages')}>
              Créer / Gérer mes publications 📬
            </button>
            {isAdmin && (
              <button onClick={() => navigate('/validation')} className="back-button">
                Validations / Rôles 👑
              </button>
            )}
          </div>
        )}

        <div className="user-messages">
          <h3>Messages publiés</h3>
          {posts.length === 0 ? (
            <p className="empty-notification">
              Cet utilisateur n'a pas encore publié de message.
            </p>
          ) : (
            posts.map(post => (
              <div
                key={post._id}
                className="openforum-card-reply"
                onClick={() => navigate(`/message/${post._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <p>
                  <strong>{post.login}</strong> a écrit :
                </p>
                <p>{post.content}</p>
                <div className="post-date">
                  {new Date(post.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button className="floating-create-button" onClick={() => navigate('/messages')}>
        +
      </button>
    </>
  );
}
