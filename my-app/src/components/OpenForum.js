// ✅ OpenForum.js — version complète avec bouton ClosedForum pour admin uniquement

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OpenForum.css';

export default function OpenForum() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [parentLogins, setParentLogins] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('token');

  if (!token) {
    navigate('/');
    return;
  }

  fetch('http://localhost:3000/Allposts', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(async data => {
      // ❌ Her zaman closed mesajları filtrele
      const visiblePosts = data.filter(post => post.visibility === 'open');

      setPosts(visiblePosts);
      setFilteredPosts(visiblePosts);
      setLoading(false);

      const replies = visiblePosts.filter(post => post.parentId);
      const parentLoginMap = {};

      await Promise.all(replies.map(async (reply) => {
        try {
          const res = await fetch(`http://localhost:3000/posts/${reply.parentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const parentPost = await res.json();
            parentLoginMap[reply._id] = parentPost.login;
          }
        } catch (err) {
          console.error(`Erreur récupération du parent pour ${reply._id}`, err);
        }
      }));

      setParentLogins(parentLoginMap);
    })
    .catch(err => {
      console.error(err);
      navigate('/');
    });
}, [navigate]);


  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = posts.filter(post => {
      const content = post.content?.toLowerCase() || '';
      const login = post.login?.toLowerCase() || '';
      return content.includes(term) || login.includes(term);
    });

    setFilteredPosts(filtered);
  };

  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  if (loading) {
    return (
      <div className="openforum-container">
        <p>Chargement du forum...</p>
      </div>
    );
  }

  return (
    <>
      <div className="header-bar">
        <div className="header-left">
          <span className="header-title">Organizz'Asso - OpenForum 🌍</span>
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

      <div className="openforum-container-only-of">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Rechercher par contenu ou utilisateur..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-bar"
          />
          <button className="search-icon-button">🔍</button>
        </div>

        <button onClick={() => navigate('/messages')} className="back-button">
          Postez un message !
        </button>

        {filteredPosts.length === 0 ? (
          <p>Aucun message trouvé.</p>
        ) : (
          filteredPosts.map(post => (
            <div
              key={post._id}
              className="openforum-card-only-of"
              onClick={() => navigate(`/message/${post._id}`)}
              style={{ cursor: 'pointer' }}
            >
              <p>
                <strong>{post.login}</strong> a écrit
                {post.parentId && parentLogins[post._id] && (
                  <> en réponse à <strong>{parentLogins[post._id]}</strong></>
                )}
                :
              </p>
              <p>{post.content}</p>
              <div className="post-date">
                {post.createdAt ? new Date(post.createdAt).toLocaleString('fr-FR') : 'Date inconnue'}
              </div>
            </div>
          ))
        )}
      </div>

      <button className="floating-create-button" onClick={() => navigate('/messages')}>
        +
      </button>
    </>
  );
}