import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profil() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

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
  }, [navigate]);

  if (!user) return <p>Chargement du profil...</p>;

  return (
    <div style={{ padding: '30px' }}>
      <h2>👤 Mon Profil</h2>
      <p><strong>Login :</strong> {user.login}</p>
      <p><strong>Nom :</strong> {user.lastname}</p>
      <p><strong>Prénom :</strong> {user.firstname}</p>
    </div>
  );
}
