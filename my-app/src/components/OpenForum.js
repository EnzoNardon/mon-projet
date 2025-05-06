import React, { useState, useEffect } from 'react';
import './OpenForum.css';

export default function OpenForum() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/posts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Failed to fetch posts:', err));
  }, []);

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(search.toLowerCase()) ||
    post.login.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="openforum-container">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher par utilisateur ou mot-clé"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="forum-posts">
        {filteredPosts.length === 0 ? (
          <p>Aucun message trouvé.</p>
        ) : (
          filteredPosts.map(post => (
            <div key={post._id} className="forum-post-card">
              <p><strong>@{post.login}</strong></p>
              <p>{post.content}</p>
              <span className="forum-post-date">
                {new Date(post.createdAt).toLocaleString('fr-FR')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
