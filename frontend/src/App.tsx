import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Party } from './pages/Party';
import { WaveBackground } from './components/WaveBackground';

function App() {
  return (
    <BrowserRouter>
      <WaveBackground />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/party/:joinCode" element={<Party />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
