import { Routes, Route, Link } from 'react-router-dom';
import { StockTable } from './components/StockTable';
import './App.css';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Data Table Spike</h1>
      <nav>
        <ul>
          <li>
            <Link to="/stocks-read-only">Stock Table (Read-Only)</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/stocks-read-only" element={<StockTable />} />
    </Routes>
  );
}

export default App;
