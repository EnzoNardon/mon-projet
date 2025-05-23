// ✅ ClosedForum.js — construit à partir de ValidationPage.js + OpenForum.js (filtrage local)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OpenForum.css';

export default function ClosedForum() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [parentLogins, setParentLogins] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      navigate('/');
      return;
    }

    fetch('http://localhost:3000/Allposts', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const visible = data.filter(post => post.visibility === 'closed' || post.visibility === 'both');

        setPosts(visible);
        setFilteredPosts(visible);

        const replies = visible.filter(post => post.parentId);
        const parentLoginMap = {};

        Promise.all(replies.map(async (reply) => {
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
        })).then(() => {
          setParentLogins(parentLoginMap);
          setLoading(false);
        });
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

  if (loading) {
    return (
      <div className="openforum-container">
        <p>Chargement du forum privé...</p>
      </div>
    );
  }

  return (
    <>
      <div className="header-bar">
        <div className="header-left">
          <span className="header-title">Organizz'Asso - ClosedForum 🔒</span>
        </div>

        <div className="header-right">
          <button className="logout-button" onClick={() => navigate('/closedforum')}>
            🔒 ClosedForum
          </button>
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
          Postez un message privé !
        </button>

        {filteredPosts.length === 0 ? (
          <p>Aucun message privé trouvé.</p>
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
