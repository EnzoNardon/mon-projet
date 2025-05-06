import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OpenForum.css';

export default function OpenForum() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
      .then(data => {
        setPosts(data);
        setFilteredPosts(data);
      })
      .catch(err => {
        console.error(err);
        navigate('/');
      });
  }, [navigate]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.content.toLowerCase().includes(term) ||
        post.login.toLowerCase().includes(term)
      );
      setFilteredPosts(filtered);
    }
  };

  return (
    <div className="forum-container">
      <h2>🌍 OpenForum</h2>

      <input
        type="text"
        placeholder="Rechercher par contenu ou par utilisateur..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />

      {filteredPosts.length === 0 ? (
        <p>Aucun message trouvé.</p>
      ) : (
        <div className="posts-list">
          {filteredPosts.map(post => (
            <div key={post._id} className="post-card">
              <p><strong>{post.login}</strong> a écrit :</p>
              <p>{post.content}</p>
              <span className="post-date">
                {new Date(post.createdAt).toLocaleString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/profil')} className="back-button">
        ⬅️ Retour au profil
      </button>
    </div>
  );
}
