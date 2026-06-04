import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Party } from './pages/Party';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/party/:joinCode" element={<Party />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
