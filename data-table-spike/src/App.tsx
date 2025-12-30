import { Routes, Route, Link } from 'react-router-dom';
import { StockTable, InfiniteStockTable } from './components/StockTable';
import './App.css';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Data Table Spike</h1>
      <p className="description">
        Explore different approaches to rendering large datasets in React.
      </p>
      <nav>
        <ul>
          <li>
            <Link to="/stocks-read-only" className="nav-card">
              <span className="nav-card-title">Stock Table (Read-Only)</span>
              <span className="nav-card-description">Basic virtualized table with all data loaded at once</span>
            </Link>
          </li>
          <li>
            <Link to="/stocks-infinite" className="nav-card">
              <span className="nav-card-title">Stock Table (Infinite Scroll)</span>
              <span className="nav-card-description">Paginated infinite scroll with 1,500 stocks</span>
            </Link>
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
      <Route path="/stocks-infinite" element={<InfiniteStockTable />} />
    </Routes>
  );
}

export default App;
