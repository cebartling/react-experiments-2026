Feature: Infinite Stock Table Page
  As a user
  I want to view the standard infinite scroll stock table
  So that I can browse paginated stock data

  Background:
    Given the application is running

  @e2e @stocks-infinite @navigation
  Scenario: Navigate to stocks infinite page from home
    Given I am on the home page
    When I click the "Stock Table (Infinite Scroll)" link
    Then I should be on the "/stocks-infinite" page
    And I should see the page title "Stock Table - Infinite Scroll"

  @e2e @stocks-infinite @loading
  Scenario: Initial load with default page size
    Given I am on the stocks infinite page
    Then I should see "50 of 1,500 stocks" in the row count

  @e2e @stocks-infinite @loading
  Scenario: Scrolling loads more data
    Given I am on the stocks infinite page
    When I scroll to the bottom of the table
    And I wait for data to load
    Then the stock count should be greater than 50
