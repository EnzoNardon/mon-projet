import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Profil from './components/Profil';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/profil" element={<Profil />} />
      </Routes>
    </Router>
  );
}

export default App;
