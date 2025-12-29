Feature: Stock API Client
  As a developer
  I want a robust API client for fetching stock data
  So that I can integrate stock information into the application

  Background:
    Given the API server is available

  @api @stocks
  Scenario: Successfully fetch all stocks
    Given the API returns a list of stocks
    When I fetch all stocks
    Then I should receive an array of stock data
    And each stock should have required properties

  @api @stocks
  Scenario: Successfully fetch a single stock by symbol
    Given the API returns stock data for "AAPL"
    When I call the API to fetch stock "AAPL"
    Then I should receive the stock data for "AAPL"

  @api @error-handling
  Scenario: Handle unauthorized error
    Given the API returns a 401 unauthorized error
    When I attempt to fetch all stocks
    Then I should receive an unauthorized error
    And the error should indicate unauthorized access

  @api @error-handling
  Scenario: Handle not found error for single stock
    Given the API returns a 404 not found error
    When I attempt to fetch the stock with symbol "INVALID"
    Then I should receive a not found error

  @api @error-handling
  Scenario: Handle rate limiting
    Given the API returns a 429 rate limit error
    When I attempt to fetch all stocks
    Then I should receive a rate limited error
    And the error should indicate rate limiting

  @api @error-handling
  Scenario: Handle network errors
    Given the API server is unavailable
    When I attempt to fetch all stocks
    Then I should receive a network error
