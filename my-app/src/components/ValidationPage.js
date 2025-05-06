import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ValidationPage.css';

export default function ValidationPage() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
      
        if (!token || role !== 'admin') {
          navigate('/');
          return;
        }
      
        fetch('http://localhost:3000/users/pending', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setPendingUsers(data))
          .catch(() => navigate('/'));
      }, [navigate]);
          

  const validateUser = async (userId) => {
    const token = localStorage.getItem('token');

    await fetch(`http://localhost:3000/users/validation/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });

    setPendingUsers(pendingUsers.filter(user => user._id !== userId));
  };

  return (
    <div className="validation-container">
      <h2>👮 Valider les utilisateurs</h2>
      {pendingUsers.length === 0 ? (
        <p>Aucun utilisateur à valider.</p>
      ) : (
        pendingUsers.map(user => (
          <div key={user._id} className="user-card">
            <p>{user.login} - {user.firstname} {user.lastname}</p>
            <button onClick={() => validateUser(user._id)}>✅ Valider</button>
          </div>
        ))
      )}
      <button onClick={() => navigate('/profil')}>⬅️ Retour au profil</button>
    </div>
  );
}
