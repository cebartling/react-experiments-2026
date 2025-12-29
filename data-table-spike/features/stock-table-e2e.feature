Feature: Stock Table End-to-End Tests
  As a user
  I want to view and interact with the stock table
  So that I can analyze stock information in the application

  Background:
    Given the application is running

  @e2e @navigation
  Scenario: Navigate to stock table from home page
    Given I am on the home page
    When I click the "Stock Table (Read-Only)" link
    Then I should be on the "/stocks-read-only" page
    And I should see the stock table

  @e2e @navigation
  Scenario: Direct navigation to stock table
    When I navigate to "/stocks-read-only"
    Then I should see the stock table
    And I should see "10 stocks" in the stock count

  @e2e @display
  Scenario: Display all stock data columns
    Given I am on the stock table page
    Then I should see column headers:
      | Symbol     |
      | Company    |
      | Price      |
      | Change     |
      | Change %   |
      | Volume     |
      | Market Cap |
    And I should see 10 stock rows

  @e2e @display
  Scenario: Display formatted stock values
    Given I am on the stock table page
    Then I should see "AAPL" in the table
    And I should see "Apple Inc." in the table
    And prices should be formatted as currency
    And volumes should be formatted with commas

  @e2e @display @styling
  Scenario: Positive changes display in green with plus prefix
    Given I am on the stock table page
    Then stocks with positive changes should have green styling
    And positive change values should start with "+"

  @e2e @display @styling
  Scenario: Negative changes display in red
    Given I am on the stock table page
    Then stocks with negative changes should have red styling

  @e2e @sorting
  Scenario: Sort stocks by symbol ascending
    Given I am on the stock table page
    When I click the "Symbol" column to sort
    Then the stocks should be sorted by symbol in ascending order
    And the Symbol column should indicate ascending sort

  @e2e @sorting
  Scenario: Toggle sort direction
    Given I am on the stock table page
    When I click the "Symbol" column to sort
    And I click the "Symbol" column to sort
    Then the stocks should be sorted by symbol in descending order
    And the Symbol column should indicate descending sort

  @e2e @sorting
  Scenario: Sort stocks by price
    Given I am on the stock table page
    When I click the "Price" column to sort
    Then the stocks should be sorted by price in ascending order

  @e2e @filtering
  Scenario: Filter stocks by company name
    Given I am on the stock table page
    When I type "Apple" in the search filter
    And I wait for the filter to apply
    Then I should see 1 stock row
    And I should see "AAPL" in the table
    And I should see "1 stock" in the stock count

  @e2e @filtering
  Scenario: Filter stocks by symbol
    Given I am on the stock table page
    When I type "NVDA" in the search filter
    And I wait for the filter to apply
    Then I should see 1 stock row
    And I should see "NVIDIA" in the table

  @e2e @filtering
  Scenario: Filter with no matches shows empty state
    Given I am on the stock table page
    When I type "NONEXISTENT" in the search filter
    And I wait for the filter to apply
    Then I should see "No stocks found"
    And I should see "0 stocks" in the stock count

  @e2e @filtering
  Scenario: Clear search filter
    Given I am on the stock table page
    And I have filtered by "Apple"
    When I clear the search filter
    Then I should see 10 stock rows
    And the search filter should be cleared

  @e2e @accessibility
  Scenario: Table has proper accessibility attributes
    Given I am on the stock table page
    Then the table should have sortable column headers with button role
    And sort indicators should be hidden from screen readers

  @e2e @loading
  Scenario: Loading state displays while fetching data
    Given I navigate to "/stocks-read-only" with slow network
    Then I should see a loading indicator
    And the loading indicator should have proper accessibility attributes
