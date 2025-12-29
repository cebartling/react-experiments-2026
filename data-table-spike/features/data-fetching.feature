Feature: Data Fetching with TanStack Query
  As a developer
  I want efficient data fetching with caching
  So that the application performs well and provides a good user experience

  Background:
    Given the application is loaded

  @data-fetching @cache
  Scenario: Data is cached after initial fetch
    Given the API returns stock data
    When the stock data is fetched
    Then the data should be cached
    And subsequent requests should use cached data

  @data-fetching @cache
  Scenario: Stale data is shown while fresh data is fetched
    Given the stock data is already cached
    And the cache data is stale
    When the component requests stock data
    Then the stale data should be shown immediately
    And fresh data should be fetched in the background

  @data-fetching @refetch
  Scenario: Data automatically refetches at configured interval
    Given the stock data is fetched successfully
    When the refetch interval elapses
    Then the data should be refetched automatically

  @data-fetching @error-handling
  Scenario: Failed requests are retried automatically
    Given the API fails on first request
    And the API succeeds on second request
    When the stock data is fetched
    Then the fetch should be retried
    And the data should be received successfully

  @data-fetching @invalidation
  Scenario: Cache can be invalidated manually
    Given the stock data is cached
    When the cache is invalidated
    Then a fresh fetch should be triggered
    And the new data should replace the old data

  @data-fetching @prefetch
  Scenario: Data can be prefetched
    Given no stock data is cached
    When stocks are prefetched
    Then the data should be available in cache
    And subsequent queries should use the prefetched data

  @data-fetching @single-stock
  Scenario: Single stock can be fetched by symbol
    Given the API returns data for stock "AAPL"
    When I fetch the stock with symbol "AAPL"
    Then I should receive the stock data
    And the data should be cached with the correct key
