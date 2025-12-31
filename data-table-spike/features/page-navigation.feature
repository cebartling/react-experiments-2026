Feature: Page Navigation and Layout
  As a user
  I want consistent navigation across all pages
  So that I can easily move between different table views

  Background:
    Given the application is running

  @e2e @navigation @stocks-read-only
  Scenario: Stock table page has title and back link
    Given I am on the stock table page
    Then I should see the page title "Stock Table - Read Only"
    And I should see the back link to home

  @e2e @navigation @stocks-read-only
  Scenario: Stock table back link returns to home
    Given I am on the stock table page
    When I click the back link
    Then I should be on the "/" page

  @e2e @navigation @home
  Scenario: Home page displays all navigation options
    Given I am on the home page
    Then I should see "Stock Table (Read-Only)" link
    And I should see "Stock Table (Infinite Scroll)" link
    And I should see "Large Dataset (Optimized)" link
