import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import MyMessages from './components/MyMessages';
import ValidationPage from './components/ValidationPage';
import SignupPage from './components/SignupPage';
import OpenForum from './components/OpenForum';
import Message from './components/Message';
import UserProfile from './components/UserProfile';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/profil/:userId" element={<UserProfile />} />
        <Route path= "/messages" element={<MyMessages/>}/>
        <Route path="/validation" element={<ValidationPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/OpenForum" element={<OpenForum/>} />
        <Route path="/message/:postId" element={<Message />} />
      </Routes>
    </Router>
  );
}

export default App;
