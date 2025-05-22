import React, { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import './Profil.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'admin')
    
    if (!token || !userId) {
      navigate('/');
      return;
    }

    fetch(`http://localhost:3000/profil/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Non autorisé');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => {
        navigate('/');
      });

    fetch(`http://localhost:3000/posts/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Erreur récupération des posts :', err));

  }, [navigate]);

  if (!user) return <p>Chargement...</p>;

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

    <div className="profile-container">

      <div className="profile-card">
        <h2 className="profile-username">@{user.login}</h2>
        <div className="profile-detail"><strong>Nom :</strong> {user.lastname}</div>
        <div className="profile-detail"><strong>Prénom :</strong> {user.firstname}</div>
        <div className="profile-detail"><strong>Messages publiés :</strong> {totalMessages}</div>
        <div className="profile-detail"><strong>Likes reçus :</strong> {totalLikes}</div>
      </div>

      <div className="profile-buttons">
        <button onClick={() => navigate('/messages')}>Accéder à mes publications 📬</button>
        {isAdmin && (
          <button onClick={() => navigate('/validation')} className="back-button">
            Gérer les validations 👑 
          </button>
        )}
      </div>
    </div>

    <button className="floating-create-button" onClick={() => navigate('/messages')}>
      +
    </button>
  </>
  );
}