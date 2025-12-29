Feature: Stock Table Component
  As a user
  I want to view stock data in a sortable and filterable table
  So that I can analyze stock information efficiently

  Background:
    Given the stock table is rendered with mock data

  @ui @stock-table
  Scenario: Display stock data in tabular format
    Then I should see the stock table with all columns
    And I should see column headers for Symbol, Company, Price, Change, Change %, Volume, and Market Cap
    And I should see stock data rows with formatted values

  @ui @stock-table @formatting
  Scenario: Display positive changes in green
    Then stocks with positive changes should display in green
    And positive change values should have a plus prefix

  @ui @stock-table @formatting
  Scenario: Display negative changes in red
    Then stocks with negative changes should display in red

  @ui @stock-table @sorting
  Scenario: Sort columns by clicking headers
    When I click on the "Symbol" column header
    Then the table should be sorted by Symbol
    And the sort direction indicator should show ascending

  @ui @stock-table @sorting
  Scenario: Toggle sort direction
    When I click on the "Symbol" column header
    And I click on the "Symbol" column header again
    Then the sort direction indicator should show descending

  @ui @stock-table @filtering
  Scenario: Filter stocks using search input
    When I enter "Apple" in the search filter
    Then I should only see stocks matching "Apple"
    And the stock count should update to reflect filtered results

  @ui @stock-table @filtering
  Scenario: Clear search filter
    Given I have entered "Apple" in the search filter
    When I click the clear search button
    Then I should see all stocks
    And the search input should be empty

  @ui @stock-table @accessibility
  Scenario: Table is keyboard accessible
    Then sortable column headers should have tabIndex
    And sortable column headers should have button role
    And sort indicators should be aria-hidden

  @ui @stock-table @accessibility
  Scenario: Table has proper ARIA attributes
    When I sort by Symbol ascending
    Then the Symbol column header should have aria-sort ascending

  @ui @stock-table @loading
  Scenario: Display loading state
    Given the stock data is loading
    Then I should see a loading skeleton
    And the loading state should have proper accessibility attributes

  @ui @stock-table @error
  Scenario: Display error state with retry button
    Given there is an error loading stock data
    Then I should see an error message
    And I should see a retry button
    When I click the retry button
    Then the refetch function should be called
