import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OpenForum.css';

export default function OpenForum() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Token: ", token);
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
        setLoading(false);
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
        <p>Chargement du forum...</p>
      </div>
    );
  }

  return (
    <>
      <div className="header-bar">
        <div className="header-icon" onClick={() => navigate('/profil')}>👤</div>
        <div className="header-icon" onClick={() => navigate('/')}>🏠</div>
      </div>

      <div className="openforum-container">
        <input
          type="text"
          placeholder="Rechercher par contenu ou utilisateur..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar"
        />

        {filteredPosts.length === 0 ? (
          <p>Aucun message trouvé.</p>
        ) : (
          filteredPosts.map(post => (
            <div key={post._id} className="openforum-card">
              <p><strong>{post.login}</strong> a écrit :</p>
              <p>{post.content}</p>
              <div className="post-date">
                {post.createdAt ? new Date(post.createdAt).toLocaleString('fr-FR') : 'Date inconnue'}
              </div>
            </div>
          ))
        )}

        <button onClick={() => navigate('/messages')} className="back-button">
          Postez un message !
        </button>
      </div>
    </>
  );
}