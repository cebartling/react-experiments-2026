import type { Stock } from '../types/stock';

/**
 * Real company data for generating realistic mock stocks.
 * Includes actual S&P 500 and major exchange companies.
 */
const realCompanies = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', sector: 'Financial' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Defensive' },
  { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Defensive' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Consumer Defensive' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive' },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Consumer Cyclical' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology' },
  { symbol: 'ACN', name: 'Accenture plc', sector: 'Technology' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare' },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare' },
  { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology' },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'DIS', name: 'Walt Disney Company', sector: 'Communication' },
  { symbol: 'VZ', name: 'Verizon Communications', sector: 'Communication' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', sector: 'Technology' },
  { symbol: 'TXN', name: 'Texas Instruments Inc.', sector: 'Technology' },
  { symbol: 'IBM', name: 'International Business Machines', sector: 'Technology' },
  { symbol: 'INTU', name: 'Intuit Inc.', sector: 'Technology' },
  { symbol: 'AMAT', name: 'Applied Materials Inc.', sector: 'Technology' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', sector: 'Technology' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financial' },
  { symbol: 'BKNG', name: 'Booking Holdings Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'ISRG', name: 'Intuitive Surgical Inc.', sector: 'Healthcare' },
  { symbol: 'ADP', name: 'Automatic Data Processing', sector: 'Technology' },
  { symbol: 'GILD', name: 'Gilead Sciences Inc.', sector: 'Healthcare' },
  { symbol: 'MDLZ', name: 'Mondelez International', sector: 'Consumer Defensive' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', sector: 'Healthcare' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals', sector: 'Healthcare' },
  { symbol: 'ADI', name: 'Analog Devices Inc.', sector: 'Technology' },
  { symbol: 'PANW', name: 'Palo Alto Networks', sector: 'Technology' },
  { symbol: 'SNPS', name: 'Synopsys Inc.', sector: 'Technology' },
  { symbol: 'KLAC', name: 'KLA Corporation', sector: 'Technology' },
  { symbol: 'CDNS', name: 'Cadence Design Systems', sector: 'Technology' },
  { symbol: 'LRCX', name: 'Lam Research Corporation', sector: 'Technology' },
  { symbol: 'MRVL', name: 'Marvell Technology Inc.', sector: 'Technology' },
  { symbol: 'FTNT', name: 'Fortinet Inc.', sector: 'Technology' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology' },
  { symbol: 'DDOG', name: 'Datadog Inc.', sector: 'Technology' },
  { symbol: 'ZS', name: 'Zscaler Inc.', sector: 'Technology' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology' },
  { symbol: 'NET', name: 'Cloudflare Inc.', sector: 'Technology' },
  { symbol: 'TEAM', name: 'Atlassian Corporation', sector: 'Technology' },
  { symbol: 'WDAY', name: 'Workday Inc.', sector: 'Technology' },
  { symbol: 'SPLK', name: 'Splunk Inc.', sector: 'Technology' },
  { symbol: 'MDB', name: 'MongoDB Inc.', sector: 'Technology' },
  { symbol: 'OKTA', name: 'Okta Inc.', sector: 'Technology' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Technology' },
  { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Technology' },
  { symbol: 'SQ', name: 'Block Inc.', sector: 'Financial' },
  { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology' },
  { symbol: 'SPOT', name: 'Spotify Technology', sector: 'Communication' },
  { symbol: 'ROKU', name: 'Roku Inc.', sector: 'Communication' },
  { symbol: 'ZM', name: 'Zoom Video Communications', sector: 'Technology' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', sector: 'Technology' },
  { symbol: 'TWLO', name: 'Twilio Inc.', sector: 'Technology' },
  { symbol: 'BA', name: 'Boeing Company', sector: 'Industrials' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials' },
  { symbol: 'GE', name: 'General Electric Company', sector: 'Industrials' },
  { symbol: 'HON', name: 'Honeywell International', sector: 'Industrials' },
  { symbol: 'UPS', name: 'United Parcel Service', sector: 'Industrials' },
  { symbol: 'RTX', name: 'Raytheon Technologies', sector: 'Industrials' },
  { symbol: 'LMT', name: 'Lockheed Martin Corp.', sector: 'Industrials' },
  { symbol: 'DE', name: 'Deere & Company', sector: 'Industrials' },
  { symbol: 'MMM', name: '3M Company', sector: 'Industrials' },
  { symbol: 'GD', name: 'General Dynamics Corp.', sector: 'Industrials' },
  { symbol: 'FDX', name: 'FedEx Corporation', sector: 'Industrials' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy' },
  { symbol: 'SLB', name: 'Schlumberger Limited', sector: 'Energy' },
  { symbol: 'EOG', name: 'EOG Resources Inc.', sector: 'Energy' },
  { symbol: 'PXD', name: 'Pioneer Natural Resources', sector: 'Energy' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financial' },
  { symbol: 'GS', name: 'Goldman Sachs Group', sector: 'Financial' },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial' },
  { symbol: 'C', name: 'Citigroup Inc.', sector: 'Financial' },
  { symbol: 'AXP', name: 'American Express Company', sector: 'Financial' },
  { symbol: 'BLK', name: 'BlackRock Inc.', sector: 'Financial' },
  { symbol: 'SCHW', name: 'Charles Schwab Corp.', sector: 'Financial' },
  { symbol: 'PNC', name: 'PNC Financial Services', sector: 'Financial' },
  { symbol: 'USB', name: 'U.S. Bancorp', sector: 'Financial' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare' },
  { symbol: 'AMGN', name: 'Amgen Inc.', sector: 'Healthcare' },
  { symbol: 'CVS', name: 'CVS Health Corporation', sector: 'Healthcare' },
  { symbol: 'CI', name: 'Cigna Corporation', sector: 'Healthcare' },
  { symbol: 'ELV', name: 'Elevance Health Inc.', sector: 'Healthcare' },
  { symbol: 'HUM', name: 'Humana Inc.', sector: 'Healthcare' },
  { symbol: 'MCK', name: 'McKesson Corporation', sector: 'Healthcare' },
  { symbol: 'ZTS', name: 'Zoetis Inc.', sector: 'Healthcare' },
  { symbol: 'SYK', name: 'Stryker Corporation', sector: 'Healthcare' },
  { symbol: 'BDX', name: 'Becton Dickinson and Co.', sector: 'Healthcare' },
  { symbol: 'BSX', name: 'Boston Scientific Corp.', sector: 'Healthcare' },
  { symbol: 'EW', name: 'Edwards Lifesciences', sector: 'Healthcare' },
  { symbol: 'BIIB', name: 'Biogen Inc.', sector: 'Healthcare' },
  { symbol: 'ILMN', name: 'Illumina Inc.', sector: 'Healthcare' },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication' },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', sector: 'Communication' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication' },
  { symbol: 'CHTR', name: 'Charter Communications', sector: 'Communication' },
  { symbol: 'EA', name: 'Electronic Arts Inc.', sector: 'Communication' },
  { symbol: 'TTWO', name: 'Take-Two Interactive', sector: 'Communication' },
  { symbol: 'ATVI', name: 'Activision Blizzard', sector: 'Communication' },
  { symbol: 'WBD', name: 'Warner Bros. Discovery', sector: 'Communication' },
  { symbol: 'PARA', name: 'Paramount Global', sector: 'Communication' },
  { symbol: 'FOX', name: 'Fox Corporation', sector: 'Communication' },
  { symbol: 'TGT', name: 'Target Corporation', sector: 'Consumer Cyclical' },
  { symbol: 'LOW', name: "Lowe's Companies Inc.", sector: 'Consumer Cyclical' },
  { symbol: 'TJX', name: 'TJX Companies Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'ROST', name: 'Ross Stores Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Cyclical' },
  { symbol: 'CMG', name: 'Chipotle Mexican Grill', sector: 'Consumer Cyclical' },
  { symbol: 'YUM', name: 'Yum! Brands Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'DPZ', name: "Domino's Pizza Inc.", sector: 'Consumer Cyclical' },
  { symbol: 'MAR', name: 'Marriott International', sector: 'Consumer Cyclical' },
  { symbol: 'HLT', name: 'Hilton Worldwide Holdings', sector: 'Consumer Cyclical' },
  { symbol: 'GM', name: 'General Motors Company', sector: 'Consumer Cyclical' },
  { symbol: 'F', name: 'Ford Motor Company', sector: 'Consumer Cyclical' },
  { symbol: 'RIVN', name: 'Rivian Automotive Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'LCID', name: 'Lucid Group Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'NIO', name: 'NIO Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'CL', name: 'Colgate-Palmolive Co.', sector: 'Consumer Defensive' },
  { symbol: 'EL', name: 'Estee Lauder Companies', sector: 'Consumer Defensive' },
  { symbol: 'KMB', name: 'Kimberly-Clark Corp.', sector: 'Consumer Defensive' },
  { symbol: 'GIS', name: 'General Mills Inc.', sector: 'Consumer Defensive' },
  { symbol: 'K', name: 'Kellogg Company', sector: 'Consumer Defensive' },
  { symbol: 'HSY', name: 'Hershey Company', sector: 'Consumer Defensive' },
  { symbol: 'SJM', name: 'J.M. Smucker Company', sector: 'Consumer Defensive' },
  { symbol: 'CPB', name: 'Campbell Soup Company', sector: 'Consumer Defensive' },
  { symbol: 'KHC', name: 'Kraft Heinz Company', sector: 'Consumer Defensive' },
  { symbol: 'MO', name: 'Altria Group Inc.', sector: 'Consumer Defensive' },
  { symbol: 'PM', name: 'Philip Morris International', sector: 'Consumer Defensive' },
  { symbol: 'STZ', name: 'Constellation Brands', sector: 'Consumer Defensive' },
  { symbol: 'TAP', name: 'Molson Coors Beverage', sector: 'Consumer Defensive' },
  { symbol: 'BUD', name: 'Anheuser-Busch InBev', sector: 'Consumer Defensive' },
  { symbol: 'DEO', name: 'Diageo plc', sector: 'Consumer Defensive' },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', sector: 'Utilities' },
  { symbol: 'SO', name: 'Southern Company', sector: 'Utilities' },
  { symbol: 'D', name: 'Dominion Energy Inc.', sector: 'Utilities' },
  { symbol: 'AEP', name: 'American Electric Power', sector: 'Utilities' },
  { symbol: 'EXC', name: 'Exelon Corporation', sector: 'Utilities' },
  { symbol: 'SRE', name: 'Sempra Energy', sector: 'Utilities' },
  { symbol: 'XEL', name: 'Xcel Energy Inc.', sector: 'Utilities' },
  { symbol: 'ED', name: 'Consolidated Edison', sector: 'Utilities' },
  { symbol: 'WEC', name: 'WEC Energy Group Inc.', sector: 'Utilities' },
  { symbol: 'AMT', name: 'American Tower Corp.', sector: 'Real Estate' },
  { symbol: 'PLD', name: 'Prologis Inc.', sector: 'Real Estate' },
  { symbol: 'CCI', name: 'Crown Castle International', sector: 'Real Estate' },
  { symbol: 'EQIX', name: 'Equinix Inc.', sector: 'Real Estate' },
  { symbol: 'PSA', name: 'Public Storage', sector: 'Real Estate' },
  { symbol: 'SPG', name: 'Simon Property Group', sector: 'Real Estate' },
  { symbol: 'O', name: 'Realty Income Corporation', sector: 'Real Estate' },
  { symbol: 'WELL', name: 'Welltower Inc.', sector: 'Real Estate' },
  { symbol: 'AVB', name: 'AvalonBay Communities', sector: 'Real Estate' },
  { symbol: 'EQR', name: 'Equity Residential', sector: 'Real Estate' },
  { symbol: 'LIN', name: 'Linde plc', sector: 'Materials' },
  { symbol: 'APD', name: 'Air Products and Chemicals', sector: 'Materials' },
  { symbol: 'SHW', name: 'Sherwin-Williams Company', sector: 'Materials' },
  { symbol: 'ECL', name: 'Ecolab Inc.', sector: 'Materials' },
  { symbol: 'FCX', name: 'Freeport-McMoRan Inc.', sector: 'Materials' },
  { symbol: 'NEM', name: 'Newmont Corporation', sector: 'Materials' },
  { symbol: 'NUE', name: 'Nucor Corporation', sector: 'Materials' },
  { symbol: 'DOW', name: 'Dow Inc.', sector: 'Materials' },
  { symbol: 'DD', name: 'DuPont de Nemours Inc.', sector: 'Materials' },
  { symbol: 'PPG', name: 'PPG Industries Inc.', sector: 'Materials' },
];

/**
 * Prefixes for generating additional synthetic company names
 */
const companyPrefixes = [
  'Global', 'Advanced', 'Premier', 'Dynamic', 'Strategic', 'Innovative',
  'Digital', 'Smart', 'Tech', 'Prime', 'Elite', 'Alpha', 'Beta', 'Gamma',
  'Delta', 'Omega', 'Quantum', 'Nexus', 'Apex', 'Vertex', 'Peak', 'Summit',
  'Core', 'Edge', 'Nova', 'Stellar', 'Fusion', 'Synergy', 'Unity', 'Vector',
];

/**
 * Suffixes for generating additional synthetic company names
 */
const companySuffixes = [
  'Technologies', 'Systems', 'Solutions', 'Industries', 'Holdings', 'Group',
  'Corporation', 'Enterprises', 'Partners', 'Capital', 'Dynamics', 'Networks',
  'Innovations', 'Ventures', 'Labs', 'Works', 'Digital', 'Analytics', 'Cloud',
  'Data', 'AI', 'Bio', 'Pharma', 'Med', 'Health', 'Energy', 'Power', 'Materials',
];


/**
 * Seeded random number generator for consistent data generation
 */
function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * Generates a random stock symbol
 */
function generateSymbol(index: number, random: () => number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const length = Math.floor(random() * 2) + 3; // 3-4 characters
  let symbol = '';
  for (let i = 0; i < length; i++) {
    symbol += letters[Math.floor(random() * letters.length)];
  }
  return `${symbol}${index}`;
}

/**
 * Generates a synthetic company name
 */
function generateCompanyName(random: () => number): string {
  const prefix = companyPrefixes[Math.floor(random() * companyPrefixes.length)];
  const suffix = companySuffixes[Math.floor(random() * companySuffixes.length)];
  return `${prefix} ${suffix} Inc.`;
}

/**
 * Generates realistic stock price based on market cap tier
 */
function generatePrice(marketCapTier: number, random: () => number): number {
  const basePrices = [5, 25, 75, 150, 300, 500];
  const base = basePrices[Math.min(marketCapTier, basePrices.length - 1)];
  const variance = base * 0.5;
  return Math.round((base + (random() - 0.5) * variance) * 100) / 100;
}

/**
 * Generates realistic market cap based on tier
 */
function generateMarketCap(tier: number, random: () => number): number {
  const caps = [
    [100_000_000, 500_000_000], // Micro cap
    [500_000_000, 2_000_000_000], // Small cap
    [2_000_000_000, 10_000_000_000], // Mid cap
    [10_000_000_000, 50_000_000_000], // Large cap
    [50_000_000_000, 200_000_000_000], // Mega cap
    [200_000_000_000, 3_000_000_000_000], // Ultra mega cap
  ];
  const [min, max] = caps[Math.min(tier, caps.length - 1)];
  return Math.floor(min + random() * (max - min));
}

/**
 * Generates a single stock with realistic data
 */
function generateStock(
  index: number,
  random: () => number,
  realCompany?: (typeof realCompanies)[number]
): Stock {
  const marketCapTier = Math.floor(random() * 6);
  const price = realCompany ? generatePrice(5, random) : generatePrice(marketCapTier, random);
  const changePercent = (random() - 0.5) * 10; // -5% to +5%
  const change = Math.round(price * (changePercent / 100) * 100) / 100;

  const baseVolume = [50_000, 500_000, 2_000_000, 10_000_000, 30_000_000, 80_000_000];
  const volume = Math.floor(
    baseVolume[Math.min(marketCapTier, baseVolume.length - 1)] * (0.5 + random())
  );

  const marketCap = realCompany
    ? generateMarketCap(4 + Math.floor(random() * 2), random)
    : generateMarketCap(marketCapTier, random);

  const high52Week = Math.round(price * (1 + random() * 0.4) * 100) / 100;
  const low52Week = Math.round(price * (1 - random() * 0.3) * 100) / 100;

  return {
    symbol: realCompany?.symbol ?? generateSymbol(index, random),
    companyName: realCompany?.name ?? generateCompanyName(random),
    price,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    volume,
    marketCap,
    high52Week,
    low52Week,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Generates a large dataset of realistic stock data.
 *
 * @param count - Total number of stocks to generate (default: 1500)
 * @param seed - Random seed for consistent generation (default: 42)
 * @returns Array of stock objects
 *
 * @example
 * ```ts
 * const stocks = generateStockDataset(1000);
 * console.log(stocks.length); // 1000
 * ```
 */
export function generateStockDataset(count: number = 1500, seed: number = 42): Stock[] {
  const random = seededRandom(seed);
  const stocks: Stock[] = [];
  const usedSymbols = new Set<string>();

  // First, add all real companies
  for (const company of realCompanies) {
    if (stocks.length >= count) break;
    const stock = generateStock(stocks.length, random, company);
    stocks.push(stock);
    usedSymbols.add(stock.symbol);
  }

  // Then generate synthetic companies to reach the target count
  while (stocks.length < count) {
    const stock = generateStock(stocks.length, random);

    // Ensure unique symbols
    if (!usedSymbols.has(stock.symbol)) {
      stocks.push(stock);
      usedSymbols.add(stock.symbol);
    }
  }

  // Sort by market cap (largest first) for realistic ordering
  stocks.sort((a, b) => b.marketCap - a.marketCap);

  return stocks;
}

/**
 * Pre-generated dataset of 1500 stocks for use in MSW handlers.
 * Uses a fixed seed for consistent data across app restarts.
 */
export const largeStockDataset = generateStockDataset(1500, 42);
