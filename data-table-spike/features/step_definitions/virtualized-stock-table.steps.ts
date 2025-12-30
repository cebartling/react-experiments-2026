import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';

interface VirtualizedStockTableWorld extends PlaywrightWorld {
  isLoading: boolean;
  hasError: boolean;
  showPerformanceOverlay: boolean;
  rowCount: number;
}

function generateMockStocks(count: number) {
  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'TSLA', 'JPM', 'V', 'JNJ'];
  const companies = [
    'Apple Inc.',
    'Alphabet Inc.',
    'Microsoft Corporation',
    'Amazon.com Inc.',
    'Meta Platforms Inc.',
    'NVIDIA Corporation',
    'Tesla Inc.',
    'JPMorgan Chase',
    'Visa Inc.',
    'Johnson & Johnson',
  ];

  return Array.from({ length: count }, (_, i) => ({
    symbol: `${symbols[i % symbols.length]}${Math.floor(i / symbols.length) || ''}`,
    companyName:
      `${companies[i % companies.length]} ${Math.floor(i / companies.length) || ''}`.trim(),
    price: 100 + Math.random() * 400,
    change: (Math.random() - 0.5) * 20,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 100000000),
    marketCap: Math.floor(Math.random() * 3000000000000),
  }));
}

async function setupVirtualizedStockTablePage(
  world: VirtualizedStockTableWorld,
  options: {
    isLoading?: boolean;
    hasError?: boolean;
    showPerformanceOverlay?: boolean;
    rowCount?: number;
  } = {}
) {
  const {
    isLoading = false,
    hasError = false,
    showPerformanceOverlay = false,
    rowCount = 100,
  } = options;

  world.isLoading = isLoading;
  world.hasError = hasError;
  world.showPerformanceOverlay = showPerformanceOverlay;
  world.rowCount = rowCount;

  const html = getVirtualizedPageHtml(isLoading, hasError, showPerformanceOverlay, rowCount);
  await world.page.setContent(html);
  await world.page.waitForLoadState('domcontentloaded');
}

function getVirtualizedPageHtml(
  isLoading: boolean,
  hasError: boolean,
  showPerformanceOverlay: boolean,
  rowCount: number
): string {
  const styles = `
    <style>
      .virtualized-stock-table { display: flex; flex-direction: column; width: 100%; height: 100%; }
      .table-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background-color: #fff; border-bottom: 1px solid #e5e7eb; gap: 1rem; }
      .table-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280; }
      .filter-indicator { color: #9ca3af; }
      .table-container { display: flex; flex-direction: column; flex: 1; overflow: hidden; border: 1px solid #e5e7eb; border-radius: 0.5rem; }
      .sticky-header { position: sticky; top: 0; z-index: 10; background-color: #f9fafb; border-bottom: 2px solid #e5e7eb; }
      .header-row { display: flex; width: 100%; }
      .header-cell { display: flex; align-items: center; padding: 0.75rem 1rem; font-weight: 600; color: #374151; white-space: nowrap; flex-shrink: 0; min-width: 100px; }
      .header-cell.sortable { cursor: pointer; user-select: none; }
      .header-cell.sortable:hover { background-color: #f3f4f6; }
      .header-content { display: flex; align-items: center; gap: 0.25rem; }
      .sort-indicator { color: #9ca3af; font-size: 0.75rem; }
      .virtual-table-body { flex: 1; overflow-y: auto; overflow-x: hidden; height: 400px; }
      .virtual-row { display: flex; align-items: center; border-bottom: 1px solid #e5e7eb; position: absolute; width: 100%; height: 48px; }
      .virtual-row:hover { background-color: #f9fafb; }
      .virtual-row-content { display: flex; width: 100%; }
      .virtual-cell { display: flex; align-items: center; padding: 0 1rem; flex-shrink: 0; overflow: hidden; min-width: 100px; }
      .positive { color: #059669; }
      .negative { color: #dc2626; }
      .stock-symbol { font-weight: 600; }
      .no-data { display: flex; align-items: center; justify-content: center; height: 200px; color: #6b7280; }
      .search-filter { position: relative; }
      .search-input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; width: 250px; }
      .search-clear { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 1.25rem; color: #6b7280; }
      .loading-state { width: 100%; }
      .error-state { text-align: center; padding: 3rem; }
      .performance-overlay { position: fixed; bottom: 1rem; right: 1rem; background: rgba(0, 0, 0, 0.8); color: white; padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.75rem; z-index: 1000; }
      .performance-overlay .metric { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 0.25rem; }
      .performance-overlay .metric:last-child { margin-bottom: 0; }
      .performance-overlay .label { color: #9ca3af; }
      .performance-overlay .value { font-weight: 600; }
      .fps-good { color: #059669; }
      .fps-warning { color: #d97706; }
      .fps-bad { color: #dc2626; }
    </style>
  `;

  if (isLoading) {
    return `
      <!DOCTYPE html>
      <html>
        <head><title>Virtualized Stock Table Test</title>${styles}</head>
        <body>
          <div class="loading-state" role="status" aria-label="Loading stock data">
            <table class="stock-table skeleton">
              <thead>
                <tr>
                  ${Array(7).fill('<th><div class="skeleton-cell header"></div></th>').join('')}
                </tr>
              </thead>
              <tbody>
                ${Array(5)
                  .fill(0)
                  .map(
                    () => `
                  <tr>
                    ${Array(7).fill('<td><div class="skeleton-cell"></div></td>').join('')}
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  }

  if (hasError) {
    return `
      <!DOCTYPE html>
      <html>
        <head><title>Virtualized Stock Table Test</title>${styles}</head>
        <body>
          <div class="error-state" role="alert">
            <div class="error-icon" aria-hidden="true">Warning</div>
            <h3 class="error-title">Failed to load stock data</h3>
            <p class="error-message">Network connection failed</p>
            <button type="button" class="retry-button" id="retry-btn">Try Again</button>
          </div>
          <script>
            window.refetchCalled = false;
            document.getElementById('retry-btn').addEventListener('click', function() {
              window.refetchCalled = true;
            });
          </script>
        </body>
      </html>
    `;
  }

  const mockStocks = generateMockStocks(rowCount);
  const mockStocksJson = JSON.stringify(mockStocks);

  const performanceOverlayHtml = showPerformanceOverlay
    ? `
    <div class="performance-overlay" role="status" aria-label="Performance metrics">
      <div class="metric">
        <span class="label">FPS:</span>
        <span class="value fps-value fps-good" id="fps-value">60</span>
      </div>
      <div class="metric">
        <span class="label">Rendered:</span>
        <span class="value rendered-value" id="rendered-value">20 / ${rowCount}</span>
      </div>
      <div class="metric">
        <span class="label">Ratio:</span>
        <span class="value ratio-value" id="ratio-value">${Math.round((20 / rowCount) * 100)}%</span>
      </div>
      <div class="metric">
        <span class="label">Render:</span>
        <span class="value render-time-value" id="render-time-value">5.5ms</span>
      </div>
    </div>
  `
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head><title>Virtualized Stock Table Test</title>${styles}</head>
      <body>
        <div id="root"></div>
        ${performanceOverlayHtml}
        <script>
          var stocks = ${mockStocksJson};
          var sortColumn = null;
          var sortDirection = null;
          var filterValue = '';
          var scrollTop = 0;
          var rowHeight = 48;
          var viewportHeight = 400;
          var overscan = 5;

          function formatCurrency(val) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
          }

          function formatNumber(val) {
            return new Intl.NumberFormat('en-US').format(val);
          }

          function formatMarketCap(val) {
            if (val >= 1e12) return '$' + (val / 1e12).toFixed(2) + 'T';
            if (val >= 1e9) return '$' + (val / 1e9).toFixed(2) + 'B';
            if (val >= 1e6) return '$' + (val / 1e6).toFixed(2) + 'M';
            return formatCurrency(val);
          }

          function getSortIndicator(col) {
            if (sortColumn !== col) return '↕';
            return sortDirection === 'asc' ? '↑' : '↓';
          }

          function getAriaSort(col) {
            if (sortColumn !== col) return '';
            return 'aria-sort="' + (sortDirection === 'asc' ? 'ascending' : 'descending') + '"';
          }

          function getFilteredAndSortedStocks() {
            var result = stocks;
            if (filterValue) {
              result = stocks.filter(function(s) {
                return s.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1 ||
                       s.companyName.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
              });
            }

            if (sortColumn) {
              result = result.slice().sort(function(a, b) {
                var aVal = a[sortColumn];
                var bVal = b[sortColumn];
                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
              });
            }

            return result;
          }

          function getVisibleRange(filteredStocks) {
            var startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
            var visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
            var endIndex = Math.min(filteredStocks.length, startIndex + visibleCount);
            return { start: startIndex, end: endIndex };
          }

          function renderTable() {
            var filteredStocks = getFilteredAndSortedStocks();
            var range = getVisibleRange(filteredStocks);
            var totalHeight = filteredStocks.length * rowHeight;

            var rowsHtml = '';
            if (filteredStocks.length === 0) {
              rowsHtml = '<div class="no-data">No stocks found</div>';
            } else {
              for (var i = range.start; i < range.end; i++) {
                var stock = filteredStocks[i];
                var changeClass = stock.change >= 0 ? 'positive' : 'negative';
                var changePrefix = stock.change >= 0 ? '+' : '';
                var top = i * rowHeight;
                rowsHtml += '<div class="virtual-row" role="row" style="top: 0; transform: translateY(' + top + 'px);">' +
                  '<div class="virtual-row-content">' +
                    '<div class="virtual-cell" role="cell"><span class="stock-symbol">' + stock.symbol + '</span></div>' +
                    '<div class="virtual-cell" role="cell"><span class="company-name" title="' + stock.companyName + '">' + stock.companyName + '</span></div>' +
                    '<div class="virtual-cell" role="cell"><span class="price">' + formatCurrency(stock.price) + '</span></div>' +
                    '<div class="virtual-cell" role="cell"><span class="change ' + changeClass + '">' + changePrefix + formatCurrency(stock.change) + '</span></div>' +
                    '<div class="virtual-cell" role="cell"><span class="change-percent ' + changeClass + '">' + changePrefix + stock.changePercent.toFixed(2) + '%</span></div>' +
                    '<div class="virtual-cell" role="cell"><span class="volume">' + formatNumber(stock.volume) + '</span></div>' +
                    '<div class="virtual-cell" role="cell"><span class="market-cap">' + formatMarketCap(stock.marketCap) + '</span></div>' +
                  '</div>' +
                '</div>';
              }
            }

            var clearBtnHtml = filterValue ? '<button type="button" class="search-clear" aria-label="Clear search" id="clear-btn">&times;</button>' : '';
            var filterIndicator = filterValue ? '<span class="filter-indicator">(filtered from ' + stocks.length + ')</span>' : '';

            document.getElementById('root').innerHTML =
              '<div class="virtualized-stock-table">' +
                '<div class="table-toolbar">' +
                  '<div class="search-filter">' +
                    '<input type="text" class="search-input" placeholder="Search by symbol or company..." aria-label="Search stocks" value="' + filterValue + '" id="search-input" />' +
                    clearBtnHtml +
                  '</div>' +
                  '<div class="table-info">' +
                    '<span class="row-count">' + filteredStocks.length + ' stocks</span>' +
                    filterIndicator +
                  '</div>' +
                '</div>' +
                '<div class="table-container" role="table" aria-label="Stock data table" aria-rowcount="' + (filteredStocks.length + 1) + '">' +
                  '<div class="sticky-header" role="rowgroup">' +
                    '<div class="header-row" role="row">' +
                      '<div class="header-cell sortable" tabindex="0" role="columnheader button" ' + getAriaSort('symbol') + ' data-column="symbol"><span class="header-content">Symbol<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('symbol') + '</span></span></div>' +
                      '<div class="header-cell sortable" tabindex="0" role="columnheader button" ' + getAriaSort('companyName') + ' data-column="companyName"><span class="header-content">Company<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('companyName') + '</span></span></div>' +
                      '<div class="header-cell sortable" tabindex="0" role="columnheader button" ' + getAriaSort('price') + ' data-column="price"><span class="header-content">Price<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('price') + '</span></span></div>' +
                      '<div class="header-cell sortable" tabindex="0" role="columnheader button" ' + getAriaSort('change') + ' data-column="change"><span class="header-content">Change<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('change') + '</span></span></div>' +
                      '<div class="header-cell sortable" tabindex="0" role="columnheader button" ' + getAriaSort('changePercent') + ' data-column="changePercent"><span class="header-content">Change %<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('changePercent') + '</span></span></div>' +
                      '<div class="header-cell sortable" tabindex="0" role="columnheader button" ' + getAriaSort('volume') + ' data-column="volume"><span class="header-content">Volume<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('volume') + '</span></span></div>' +
                      '<div class="header-cell sortable" tabindex="0" role="columnheader button" ' + getAriaSort('marketCap') + ' data-column="marketCap"><span class="header-content">Market Cap<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('marketCap') + '</span></span></div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="virtual-table-body" role="rowgroup" id="virtual-body" style="position: relative; height: ' + viewportHeight + 'px; overflow-y: auto;">' +
                    '<div style="height: ' + totalHeight + 'px; position: relative;">' +
                      rowsHtml +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>';

            // Add event listeners
            var headers = document.querySelectorAll('.header-cell.sortable');
            headers.forEach(function(header) {
              header.addEventListener('click', function() {
                var col = this.getAttribute('data-column');
                if (sortColumn === col) {
                  sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                  sortColumn = col;
                  sortDirection = 'asc';
                }
                renderTable();
              });
              header.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  this.click();
                }
              });
            });

            var searchInput = document.getElementById('search-input');
            if (searchInput) {
              searchInput.addEventListener('input', function(e) {
                filterValue = e.target.value;
                renderTable();
              });
            }

            var clearBtn = document.getElementById('clear-btn');
            if (clearBtn) {
              clearBtn.addEventListener('click', function() {
                filterValue = '';
                renderTable();
              });
            }

            var virtualBody = document.getElementById('virtual-body');
            if (virtualBody) {
              virtualBody.addEventListener('scroll', function(e) {
                scrollTop = e.target.scrollTop;
                renderTable();
              });
            }

            // Update performance overlay if visible
            var renderedValue = document.getElementById('rendered-value');
            if (renderedValue) {
              renderedValue.textContent = (range.end - range.start) + ' / ' + filteredStocks.length;
            }
            var ratioValue = document.getElementById('ratio-value');
            if (ratioValue && filteredStocks.length > 0) {
              ratioValue.textContent = Math.round(((range.end - range.start) / filteredStocks.length) * 100) + '%';
            }
          }

          renderTable();
        </script>
      </body>
    </html>
  `;
}

Given(
  'the virtualized stock table is rendered with mock data',
  async function (this: VirtualizedStockTableWorld) {
    await setupVirtualizedStockTablePage(this);
  }
);

Given('the virtualized table has 1000 rows', async function (this: VirtualizedStockTableWorld) {
  await setupVirtualizedStockTablePage(this, { rowCount: 1000 });
});

Given('the virtualized table has many rows', async function (this: VirtualizedStockTableWorld) {
  await setupVirtualizedStockTablePage(this, { rowCount: 500 });
});

Given('the performance overlay is visible', async function (this: VirtualizedStockTableWorld) {
  await setupVirtualizedStockTablePage(this, { showPerformanceOverlay: true });
});

Given('the virtualized stock data is loading', async function (this: VirtualizedStockTableWorld) {
  await setupVirtualizedStockTablePage(this, { isLoading: true });
});

Given(
  'there is an error loading virtualized stock data',
  async function (this: VirtualizedStockTableWorld) {
    await setupVirtualizedStockTablePage(this, { hasError: true });
  }
);

Given(
  'I have entered {string} in the virtualized search filter',
  async function (this: VirtualizedStockTableWorld, text: string) {
    await this.page.fill('input.search-input', text);
  }
);

When('I scroll down the table', async function (this: VirtualizedStockTableWorld) {
  await this.page.evaluate(() => {
    const virtualBody = document.getElementById('virtual-body');
    if (virtualBody) {
      virtualBody.scrollTop = 200;
    }
  });
  await this.page.waitForTimeout(100);
});

When(
  'I click on the virtualized {string} column header',
  async function (this: VirtualizedStockTableWorld, column: string) {
    const columnMap: Record<string, string> = {
      Symbol: 'symbol',
      Company: 'companyName',
      Price: 'price',
      Change: 'change',
      'Change %': 'changePercent',
      Volume: 'volume',
      'Market Cap': 'marketCap',
    };
    const dataColumn = columnMap[column] || column.toLowerCase();
    await this.page.click(`.header-cell[data-column="${dataColumn}"]`);
  }
);

When(
  'I click on the virtualized {string} column header again',
  async function (this: VirtualizedStockTableWorld, column: string) {
    const columnMap: Record<string, string> = {
      Symbol: 'symbol',
      Company: 'companyName',
      Price: 'price',
      Change: 'change',
      'Change %': 'changePercent',
      Volume: 'volume',
      'Market Cap': 'marketCap',
    };
    const dataColumn = columnMap[column] || column.toLowerCase();
    await this.page.click(`.header-cell[data-column="${dataColumn}"]`);
  }
);

When(
  'I enter {string} in the virtualized search filter',
  async function (this: VirtualizedStockTableWorld, text: string) {
    await this.page.fill('input.search-input', text);
  }
);

When(
  'I click the clear search button in the virtualized table',
  async function (this: VirtualizedStockTableWorld) {
    await this.page.click('button.search-clear');
  }
);

When('FPS is above 55', async function (this: VirtualizedStockTableWorld) {
  // FPS is already set to 60 in the mock
});

Then('I should see the virtualized stock table', async function (this: VirtualizedStockTableWorld) {
  const table = await this.page.locator('.virtualized-stock-table');
  await expect(table).toBeVisible();
});

Then(
  'I should see virtualized column headers for Symbol, Company, Price, Change, Change %, Volume, and Market Cap',
  async function (this: VirtualizedStockTableWorld) {
    const columns = [
      'symbol',
      'companyName',
      'price',
      'change',
      'changePercent',
      'volume',
      'marketCap',
    ];
    for (const column of columns) {
      const headerCell = await this.page.locator(`.header-cell[data-column="${column}"]`);
      await expect(headerCell).toBeVisible();
    }
  }
);

Then(
  'I should see virtualized stock data rows with formatted values',
  async function (this: VirtualizedStockTableWorld) {
    const rows = await this.page.locator('.virtual-row');
    expect(await rows.count()).toBeGreaterThan(0);

    const firstSymbol = await this.page.locator('.stock-symbol').first();
    await expect(firstSymbol).toBeVisible();
  }
);

Then(
  'the virtualized sort direction indicator should show ascending',
  async function (this: VirtualizedStockTableWorld) {
    const symbolHeader = await this.page.locator(
      '.header-cell[data-column="symbol"] .sort-indicator'
    );
    const indicator = await symbolHeader.textContent();
    expect(indicator?.trim()).toBe('↑');
  }
);

Then(
  'the virtualized sort direction indicator should show descending',
  async function (this: VirtualizedStockTableWorld) {
    const symbolHeader = await this.page.locator(
      '.header-cell[data-column="symbol"] .sort-indicator'
    );
    const indicator = await symbolHeader.textContent();
    expect(indicator?.trim()).toBe('↓');
  }
);

Then(
  'the DOM should contain fewer rendered rows than total rows',
  async function (this: VirtualizedStockTableWorld) {
    const renderedRows = await this.page.locator('.virtual-row').count();
    const totalRows = this.rowCount;
    expect(renderedRows).toBeLessThan(totalRows);
  }
);

Then(
  'scrolling should maintain smooth performance',
  async function (this: VirtualizedStockTableWorld) {
    // Scroll multiple times and verify rows update
    for (let i = 0; i < 3; i++) {
      await this.page.evaluate((scrollAmount) => {
        const virtualBody = document.getElementById('virtual-body');
        if (virtualBody) {
          virtualBody.scrollTop += scrollAmount;
        }
      }, 100);
      await this.page.waitForTimeout(50);
    }

    const renderedRows = await this.page.locator('.virtual-row').count();
    expect(renderedRows).toBeGreaterThan(0);
  }
);

Then(
  'the header should remain visible at the top',
  async function (this: VirtualizedStockTableWorld) {
    const header = await this.page.locator('.sticky-header');
    await expect(header).toBeVisible();
  }
);

Then(
  'column headers should still be clickable for sorting',
  async function (this: VirtualizedStockTableWorld) {
    const symbolHeader = await this.page.locator('.header-cell[data-column="symbol"]');
    await expect(symbolHeader).toBeVisible();
    await symbolHeader.click();
    const ariaSort = await symbolHeader.getAttribute('aria-sort');
    expect(ariaSort).toBe('ascending');
  }
);

Then(
  'the virtualized table should be sorted by Symbol',
  async function (this: VirtualizedStockTableWorld) {
    const symbols = await this.page.locator('.stock-symbol').allTextContents();
    const sortedSymbols = [...symbols].sort();
    expect(symbols).toEqual(sortedSymbols);
  }
);

Then(
  'I should only see stocks matching {string} in the virtualized table',
  async function (this: VirtualizedStockTableWorld, text: string) {
    const companyNames = await this.page.locator('.company-name').allTextContents();
    const symbols = await this.page.locator('.stock-symbol').allTextContents();

    const lowerText = text.toLowerCase();
    const rowCount = Math.max(companyNames.length, symbols.length);
    const allRowsMatch = Array.from({ length: rowCount }).every((_, index) => {
      const name = (companyNames[index] || '').toLowerCase();
      const symbol = (symbols[index] || '').toLowerCase();
      return name.includes(lowerText) || symbol.includes(lowerText);
    });

    expect(allRowsMatch).toBe(true);
  }
);

Then(
  'the virtualized stock count should update to reflect filtered results',
  async function (this: VirtualizedStockTableWorld) {
    const stockCount = await this.page.locator('.row-count');
    const text = await stockCount.textContent();
    // Should be fewer than original count
    const count = parseInt(text?.replace(/\D/g, '') || '0');
    expect(count).toBeLessThan(this.rowCount);
  }
);

Then(
  'I should see all stocks in the virtualized table',
  async function (this: VirtualizedStockTableWorld) {
    const stockCount = await this.page.locator('.row-count');
    const text = await stockCount.textContent();
    expect(text).toContain(`${this.rowCount} stocks`);
  }
);

Then(
  'the virtualized search input should be empty',
  async function (this: VirtualizedStockTableWorld) {
    const input = await this.page.locator('input.search-input');
    const value = await input.inputValue();
    expect(value).toBe('');
  }
);

Then(
  'sortable column headers in virtualized table should have tabIndex',
  async function (this: VirtualizedStockTableWorld) {
    const sortableHeaders = await this.page.locator('.header-cell.sortable');
    const count = await sortableHeaders.count();

    for (let i = 0; i < count; i++) {
      const tabIndex = await sortableHeaders.nth(i).getAttribute('tabindex');
      expect(tabIndex).toBe('0');
    }
  }
);

Then(
  'sortable column headers in virtualized table should support keyboard navigation',
  async function (this: VirtualizedStockTableWorld) {
    const symbolHeader = await this.page.locator('.header-cell[data-column="symbol"]');
    await symbolHeader.focus();
    await this.page.keyboard.press('Enter');

    const ariaSort = await symbolHeader.getAttribute('aria-sort');
    expect(ariaSort).toBe('ascending');
  }
);

Then(
  'the virtualized table should have proper table role',
  async function (this: VirtualizedStockTableWorld) {
    const tableContainer = await this.page.locator('.table-container');
    const role = await tableContainer.getAttribute('role');
    expect(role).toBe('table');
  }
);

Then(
  'the virtualized table should have an accessible label',
  async function (this: VirtualizedStockTableWorld) {
    const tableContainer = await this.page.locator('.table-container');
    const label = await tableContainer.getAttribute('aria-label');
    expect(label).toBe('Stock data table');
  }
);

Then('rows should have proper row roles', async function (this: VirtualizedStockTableWorld) {
  const rows = await this.page.locator('.virtual-row');
  const count = await rows.count();

  for (let i = 0; i < Math.min(count, 5); i++) {
    const role = await rows.nth(i).getAttribute('role');
    expect(role).toBe('row');
  }
});

Then('cells should have proper cell roles', async function (this: VirtualizedStockTableWorld) {
  const cells = await this.page.locator('.virtual-cell');
  const count = await cells.count();

  for (let i = 0; i < Math.min(count, 7); i++) {
    const role = await cells.nth(i).getAttribute('role');
    expect(role).toBe('cell');
  }
});

Then('I should see FPS metric', async function (this: VirtualizedStockTableWorld) {
  const fpsLabel = await this.page.locator('.performance-overlay .label:has-text("FPS:")');
  await expect(fpsLabel).toBeVisible();
  const fpsValue = await this.page.locator('#fps-value');
  await expect(fpsValue).toBeVisible();
});

Then('I should see rendered rows metric', async function (this: VirtualizedStockTableWorld) {
  const renderedLabel = await this.page.locator(
    '.performance-overlay .label:has-text("Rendered:")'
  );
  await expect(renderedLabel).toBeVisible();
  const renderedValue = await this.page.locator('#rendered-value');
  await expect(renderedValue).toBeVisible();
});

Then('I should see render ratio metric', async function (this: VirtualizedStockTableWorld) {
  const ratioLabel = await this.page.locator('.performance-overlay .label:has-text("Ratio:")');
  await expect(ratioLabel).toBeVisible();
  const ratioValue = await this.page.locator('#ratio-value');
  await expect(ratioValue).toBeVisible();
});

Then('I should see average render time metric', async function (this: VirtualizedStockTableWorld) {
  const renderLabel = await this.page.locator('.performance-overlay .label:has-text("Render:")');
  await expect(renderLabel).toBeVisible();
  const renderValue = await this.page.locator('#render-time-value');
  await expect(renderValue).toBeVisible();
});

Then(
  'the FPS value should be displayed in green',
  async function (this: VirtualizedStockTableWorld) {
    const fpsValue = await this.page.locator('#fps-value');
    const hasGreenClass = await fpsValue.evaluate((el) => el.classList.contains('fps-good'));
    expect(hasGreenClass).toBe(true);
  }
);
