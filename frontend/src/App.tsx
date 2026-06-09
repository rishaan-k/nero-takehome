import { Routes, Route } from 'react-router-dom';
import { Landing } from './components/Landing';
import { PartyPage } from './components/PartyPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/party/:joinCode" element={<PartyPage />} />
    </Routes>
  );
}

export default App;
