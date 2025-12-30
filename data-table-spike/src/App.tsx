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
            <Link to="/stocks-read-only">Stock Table (Read-Only)</Link>
            <span className="route-description">Basic virtualized table with all data loaded at once</span>
          </li>
          <li>
            <Link to="/stocks-infinite">Stock Table (Infinite Scroll)</Link>
            <span className="route-description">Paginated infinite scroll with 1,500 stocks</span>
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
