import { BrowserRouter, Routes, Route } from 'react-router';
import { ParentContainer } from './components/ParentContainer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app bg-surface-50">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ParentContainer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
