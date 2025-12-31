Feature: Infinite Scroll Large Dataset
  As a user
  I want to view large datasets with infinite scrolling
  So that I can efficiently browse through thousands of records

  Background:
    Given the application is running

  @e2e @infinite-scroll @navigation
  Scenario: Navigate to infinite scroll page from home
    Given I am on the home page
    When I click the "Large Dataset (Optimized)" link
    Then I should be on the "/infinite-scroll" page
    And I should see the page title "Infinite Scroll - Large Dataset"
    And I should see the back link to home

  @e2e @infinite-scroll @navigation
  Scenario: Back link returns to home page
    Given I am on the infinite scroll page
    When I click the back link
    Then I should be on the "/" page

  @e2e @infinite-scroll @loading
  Scenario: Initial load shows partial data
    Given I am on the infinite scroll page
    Then I should see "25 of 1,500 stocks" in the row count
    And the progress bar should show approximately 2 percent

  @e2e @infinite-scroll @loading
  Scenario: Scrolling to bottom loads more data
    Given I am on the infinite scroll page
    And I should see "25 of 1,500 stocks" in the row count
    When I scroll to the bottom of the table
    And I wait for data to load
    Then the stock count should be greater than 25
    And the progress bar should have increased

  @e2e @infinite-scroll @loading
  Scenario: Multiple scrolls load multiple pages
    Given I am on the infinite scroll page
    When I scroll to the bottom of the table
    And I wait for data to load
    And I scroll to the bottom of the table
    And I wait for data to load
    And I scroll to the bottom of the table
    And I wait for data to load
    Then the stock count should be greater than 75

  @e2e @infinite-scroll @filtering
  Scenario: Search filter works with infinite scroll
    Given I am on the infinite scroll page
    When I type "AAPL" in the search filter
    And I wait for the filter to apply
    Then the filtered results should be displayed
    And I should see "AAPL" in the virtualized table

  @e2e @infinite-scroll @sorting
  Scenario: Sorting works with infinite scroll
    Given I am on the infinite scroll page
    When I click the "Symbol" column header to sort
    Then the table should indicate sorting is active

  @e2e @infinite-scroll @display
  Scenario: Loading indicator shows while fetching
    Given I am on the infinite scroll page
    When I scroll to the bottom of the table
    Then I should see the loading indicator "Loading more..."

  @e2e @infinite-scroll @accessibility
  Scenario: Table has proper ARIA attributes
    Given I am on the infinite scroll page
    Then the table should have role "table"
    And the table should have aria-rowcount attribute
