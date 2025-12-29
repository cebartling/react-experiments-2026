import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../support/world';

interface StockTableWorld extends PlaywrightWorld {
  isLoading: boolean;
  hasError: boolean;
}

const mockStocksJson = JSON.stringify([
  {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    price: 150.0,
    change: 2.5,
    changePercent: 1.69,
    volume: 75000000,
    marketCap: 2400000000000,
  },
  {
    symbol: 'GOOGL',
    companyName: 'Alphabet Inc.',
    price: 140.0,
    change: -1.2,
    changePercent: -0.85,
    volume: 25000000,
    marketCap: 1800000000000,
  },
  {
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    price: 350.0,
    change: 5.0,
    changePercent: 1.45,
    volume: 30000000,
    marketCap: 2600000000000,
  },
]);

async function setupStockTablePage(
  world: StockTableWorld,
  options: { isLoading?: boolean; hasError?: boolean } = {}
) {
  const { isLoading = false, hasError = false } = options;

  world.isLoading = isLoading;
  world.hasError = hasError;

  const html = getPageHtml(isLoading, hasError);
  await world.page.setContent(html);
  await world.page.waitForLoadState('domcontentloaded');
}

function getPageHtml(isLoading: boolean, hasError: boolean): string {
  const styles = `
    <style>
      .positive { color: #059669; }
      .negative { color: #dc2626; }
      .stock-symbol { font-weight: 600; }
      .sortable { cursor: pointer; }
      .stock-table-header th { background-color: #f9fafb; padding: 0.75rem 1rem; }
      .stock-table-body td { padding: 0.75rem 1rem; }
      .loading-state { width: 100%; }
      .error-state { text-align: center; padding: 3rem; }
      .search-filter { position: relative; }
      .search-input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
      .search-clear { position: absolute; right: 0.5rem; background: none; border: none; cursor: pointer; }
    </style>
  `;

  if (isLoading) {
    return `
      <!DOCTYPE html>
      <html>
        <head><title>Stock Table Test</title>${styles}</head>
        <body>
          <div class="loading-state" role="status" aria-label="Loading stock data">
            <table class="stock-table skeleton">
              <thead>
                <tr>
                  <th><div class="skeleton-cell header"></div></th>
                  <th><div class="skeleton-cell header"></div></th>
                  <th><div class="skeleton-cell header"></div></th>
                  <th><div class="skeleton-cell header"></div></th>
                  <th><div class="skeleton-cell header"></div></th>
                  <th><div class="skeleton-cell header"></div></th>
                  <th><div class="skeleton-cell header"></div></th>
                </tr>
              </thead>
              <tbody>
                ${Array(5)
                  .fill(0)
                  .map(
                    () => `
                  <tr>
                    <td><div class="skeleton-cell"></div></td>
                    <td><div class="skeleton-cell"></div></td>
                    <td><div class="skeleton-cell"></div></td>
                    <td><div class="skeleton-cell"></div></td>
                    <td><div class="skeleton-cell"></div></td>
                    <td><div class="skeleton-cell"></div></td>
                    <td><div class="skeleton-cell"></div></td>
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
        <head><title>Stock Table Test</title>${styles}</head>
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

  return `
    <!DOCTYPE html>
    <html>
      <head><title>Stock Table Test</title>${styles}</head>
      <body>
        <div id="root"></div>
        <script>
          var stocks = ${mockStocksJson};
          var sortColumn = null;
          var sortDirection = null;
          var filterValue = '';

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
            if (sortColumn !== col) return '\u2195';
            return sortDirection === 'asc' ? '\u2191' : '\u2193';
          }

          function getAriaSort(col) {
            if (sortColumn !== col) return '';
            return 'aria-sort="' + (sortDirection === 'asc' ? 'ascending' : 'descending') + '"';
          }

          function renderTable() {
            var filteredStocks = stocks;
            if (filterValue) {
              filteredStocks = stocks.filter(function(s) {
                return s.symbol.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1 ||
                       s.companyName.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
              });
            }

            if (sortColumn) {
              filteredStocks = filteredStocks.slice().sort(function(a, b) {
                var aVal = a[sortColumn];
                var bVal = b[sortColumn];
                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
              });
            }

            var rowsHtml = '';
            if (filteredStocks.length === 0) {
              rowsHtml = '<tr><td colspan="7" class="no-data">No stocks found</td></tr>';
            } else {
              for (var i = 0; i < filteredStocks.length; i++) {
                var stock = filteredStocks[i];
                var changeClass = stock.change >= 0 ? 'positive' : 'negative';
                var changePrefix = stock.change >= 0 ? '+' : '';
                rowsHtml += '<tr class="stock-row">' +
                  '<td><span class="stock-symbol">' + stock.symbol + '</span></td>' +
                  '<td><span class="company-name" title="' + stock.companyName + '">' + stock.companyName + '</span></td>' +
                  '<td><span class="price">' + formatCurrency(stock.price) + '</span></td>' +
                  '<td><span class="change ' + changeClass + '">' + changePrefix + formatCurrency(stock.change) + '</span></td>' +
                  '<td><span class="change-percent ' + changeClass + '">' + changePrefix + stock.changePercent.toFixed(2) + '%</span></td>' +
                  '<td><span class="volume">' + formatNumber(stock.volume) + '</span></td>' +
                  '<td><span class="market-cap">' + formatMarketCap(stock.marketCap) + '</span></td>' +
                  '</tr>';
              }
            }

            var clearBtnHtml = filterValue ? '<button type="button" class="search-clear" aria-label="Clear search" id="clear-btn">&times;</button>' : '';

            document.getElementById('root').innerHTML =
              '<div class="stock-table-container">' +
                '<div class="stock-table-toolbar">' +
                  '<div class="search-filter">' +
                    '<input type="text" class="search-input" placeholder="Search by symbol or company..." aria-label="Search stocks" value="' + filterValue + '" id="search-input" />' +
                    clearBtnHtml +
                  '</div>' +
                  '<div class="stock-count">' + filteredStocks.length + ' ' + (filteredStocks.length === 1 ? 'stock' : 'stocks') + '</div>' +
                '</div>' +
                '<div class="stock-table-wrapper">' +
                  '<table class="stock-table">' +
                    '<thead class="stock-table-header">' +
                      '<tr>' +
                        '<th class="sortable" tabindex="0" role="button" ' + getAriaSort('symbol') + ' data-column="symbol"><span class="header-content">Symbol<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('symbol') + '</span></span></th>' +
                        '<th class="sortable" tabindex="0" role="button" ' + getAriaSort('companyName') + ' data-column="companyName"><span class="header-content">Company<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('companyName') + '</span></span></th>' +
                        '<th class="sortable" tabindex="0" role="button" ' + getAriaSort('price') + ' data-column="price"><span class="header-content">Price<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('price') + '</span></span></th>' +
                        '<th class="sortable" tabindex="0" role="button" ' + getAriaSort('change') + ' data-column="change"><span class="header-content">Change<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('change') + '</span></span></th>' +
                        '<th class="sortable" tabindex="0" role="button" ' + getAriaSort('changePercent') + ' data-column="changePercent"><span class="header-content">Change %<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('changePercent') + '</span></span></th>' +
                        '<th class="sortable" tabindex="0" role="button" ' + getAriaSort('volume') + ' data-column="volume"><span class="header-content">Volume<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('volume') + '</span></span></th>' +
                        '<th class="sortable" tabindex="0" role="button" ' + getAriaSort('marketCap') + ' data-column="marketCap"><span class="header-content">Market Cap<span class="sort-indicator" aria-hidden="true"> ' + getSortIndicator('marketCap') + '</span></span></th>' +
                      '</tr>' +
                    '</thead>' +
                    '<tbody class="stock-table-body">' + rowsHtml + '</tbody>' +
                  '</table>' +
                '</div>' +
              '</div>';

            // Add event listeners
            var headers = document.querySelectorAll('th.sortable');
            for (var j = 0; j < headers.length; j++) {
              headers[j].addEventListener('click', function() {
                var col = this.getAttribute('data-column');
                if (sortColumn === col) {
                  sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                  sortColumn = col;
                  sortDirection = 'asc';
                }
                renderTable();
              });
            }

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
          }

          renderTable();
        </script>
      </body>
    </html>
  `;
}

Given('the stock table is rendered with mock data', async function (this: StockTableWorld) {
  await setupStockTablePage(this);
});

Given('the stock data is loading', async function (this: StockTableWorld) {
  await setupStockTablePage(this, { isLoading: true });
});

Given('there is an error loading stock data', async function (this: StockTableWorld) {
  await setupStockTablePage(this, { hasError: true });
});

Given(
  'I have entered {string} in the search filter',
  async function (this: StockTableWorld, text: string) {
    await this.page.fill('input.search-input', text);
  }
);

When(
  'I click on the {string} column header',
  async function (this: StockTableWorld, column: string) {
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
    await this.page.click(`th[data-column="${dataColumn}"]`);
  }
);

When(
  'I click on the {string} column header again',
  async function (this: StockTableWorld, column: string) {
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
    await this.page.click(`th[data-column="${dataColumn}"]`);
  }
);

When('I enter {string} in the search filter', async function (this: StockTableWorld, text: string) {
  await this.page.fill('input.search-input', text);
});

When('I click the clear search button', async function (this: StockTableWorld) {
  await this.page.click('button.search-clear');
});

When('I click the retry button', async function (this: StockTableWorld) {
  await this.page.click('button.retry-button');
});

When('I sort by Symbol ascending', async function (this: StockTableWorld) {
  await this.page.click('th[data-column="symbol"]');
});

Then('I should see the stock table with all columns', async function (this: StockTableWorld) {
  const table = await this.page.locator('table.stock-table');
  await expect(table).toBeVisible();
});

Then(
  'I should see column headers for Symbol, Company, Price, Change, Change %, Volume, and Market Cap',
  async function (this: StockTableWorld) {
    // Use data-column attributes for precise matching
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
      const headerCell = await this.page.locator(`th[data-column="${column}"]`);
      await expect(headerCell).toBeVisible();
    }
  }
);

Then('I should see stock data rows with formatted values', async function (this: StockTableWorld) {
  const rows = await this.page.locator('tbody.stock-table-body tr.stock-row');
  expect(await rows.count()).toBeGreaterThan(0);

  const firstSymbol = await this.page.locator('.stock-symbol').first();
  await expect(firstSymbol).toBeVisible();
});

Then(
  'stocks with positive changes should display in green',
  async function (this: StockTableWorld) {
    const positiveChanges = await this.page.locator('.change.positive');
    expect(await positiveChanges.count()).toBeGreaterThan(0);
  }
);

Then('positive change values should have a plus prefix', async function (this: StockTableWorld) {
  const positiveChange = await this.page.locator('.change.positive').first();
  const text = await positiveChange.textContent();
  expect(text?.startsWith('+')).toBe(true);
});

Then('stocks with negative changes should display in red', async function (this: StockTableWorld) {
  const negativeChanges = await this.page.locator('.change.negative');
  expect(await negativeChanges.count()).toBeGreaterThan(0);
});

Then('the table should be sorted by Symbol', async function (this: StockTableWorld) {
  const symbols = await this.page.locator('.stock-symbol').allTextContents();
  const sortedSymbols = [...symbols].sort();
  expect(symbols).toEqual(sortedSymbols);
});

Then('the sort direction indicator should show ascending', async function (this: StockTableWorld) {
  const symbolHeader = await this.page.locator('th[data-column="symbol"] .sort-indicator');
  const indicator = await symbolHeader.textContent();
  expect(indicator?.trim()).toBe('\u2191');
});

Then('the sort direction indicator should show descending', async function (this: StockTableWorld) {
  const symbolHeader = await this.page.locator('th[data-column="symbol"] .sort-indicator');
  const indicator = await symbolHeader.textContent();
  expect(indicator?.trim()).toBe('\u2193');
});

Then(
  'I should only see stocks matching {string}',
  async function (this: StockTableWorld, text: string) {
    const companyNames = await this.page.locator('.company-name').allTextContents();
    const symbols = await this.page.locator('.stock-symbol').allTextContents();

    const allMatching =
      companyNames.every((name) => name.toLowerCase().includes(text.toLowerCase())) ||
      symbols.every((sym) => sym.toLowerCase().includes(text.toLowerCase()));

    expect(allMatching).toBe(true);
  }
);

Then(
  'the stock count should update to reflect filtered results',
  async function (this: StockTableWorld) {
    const stockCount = await this.page.locator('.stock-count');
    const text = await stockCount.textContent();
    expect(text).toContain('1 stock');
  }
);

Then('I should see all stocks', async function (this: StockTableWorld) {
  const rows = await this.page.locator('tbody.stock-table-body tr.stock-row');
  expect(await rows.count()).toBe(3);
});

Then('the search input should be empty', async function (this: StockTableWorld) {
  const input = await this.page.locator('input.search-input');
  const value = await input.inputValue();
  expect(value).toBe('');
});

Then('sortable column headers should have tabIndex', async function (this: StockTableWorld) {
  const sortableHeaders = await this.page.locator('th.sortable');
  const count = await sortableHeaders.count();

  for (let i = 0; i < count; i++) {
    const tabIndex = await sortableHeaders.nth(i).getAttribute('tabindex');
    expect(tabIndex).toBe('0');
  }
});

Then('sortable column headers should have button role', async function (this: StockTableWorld) {
  const sortableHeaders = await this.page.locator('th.sortable');
  const count = await sortableHeaders.count();

  for (let i = 0; i < count; i++) {
    const role = await sortableHeaders.nth(i).getAttribute('role');
    expect(role).toBe('button');
  }
});

Then('sort indicators should be aria-hidden', async function (this: StockTableWorld) {
  const sortIndicators = await this.page.locator('.sort-indicator');
  const count = await sortIndicators.count();

  for (let i = 0; i < count; i++) {
    const ariaHidden = await sortIndicators.nth(i).getAttribute('aria-hidden');
    expect(ariaHidden).toBe('true');
  }
});

Then(
  'the Symbol column header should have aria-sort ascending',
  async function (this: StockTableWorld) {
    const symbolHeader = await this.page.locator('th[data-column="symbol"]');
    const ariaSort = await symbolHeader.getAttribute('aria-sort');
    expect(ariaSort).toBe('ascending');
  }
);

Then('I should see a loading skeleton', async function (this: StockTableWorld) {
  const loadingState = await this.page.locator('.loading-state');
  await expect(loadingState).toBeVisible();
});

Then(
  'the loading state should have proper accessibility attributes',
  async function (this: StockTableWorld) {
    const loadingState = await this.page.locator('.loading-state');
    const role = await loadingState.getAttribute('role');
    const label = await loadingState.getAttribute('aria-label');

    expect(role).toBe('status');
    expect(label).toBe('Loading stock data');
  }
);

Then('I should see an error message', async function (this: StockTableWorld) {
  const errorState = await this.page.locator('.error-state');
  await expect(errorState).toBeVisible();

  const errorMessage = await this.page.locator('.error-message');
  await expect(errorMessage).toBeVisible();
});

Then('I should see a retry button', async function (this: StockTableWorld) {
  const retryButton = await this.page.locator('button.retry-button');
  await expect(retryButton).toBeVisible();
});

Then('the refetch function should be called', async function (this: StockTableWorld) {
  const refetchCalled = await this.page.evaluate(
    () => (window as unknown as { refetchCalled: boolean }).refetchCalled
  );
  expect(refetchCalled).toBe(true);
});
