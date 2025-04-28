import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import Profil from './components/Profil';
import MyMessages from './components/MyMessages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/profil" element={<Profil />} />
        <Route path= "/messages" element={<MyMessages/>}/>
      </Routes>
    </Router>
  );
}

export default App;
