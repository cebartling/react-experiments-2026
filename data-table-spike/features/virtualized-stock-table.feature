Feature: Virtualized Stock Table Component
  As a user
  I want to view large stock datasets in a virtualized table
  So that I can scroll through thousands of rows smoothly

  Background:
    Given the virtualized stock table is rendered with mock data

  @ui @virtualization
  Scenario: Display virtualized stock data in tabular format
    Then I should see the virtualized stock table
    And I should see virtualized column headers for Symbol, Company, Price, Change, Change %, Volume, and Market Cap
    And I should see virtualized stock data rows with formatted values

  @ui @virtualization @rendering
  Scenario: Only render visible rows plus overscan buffer
    Given the virtualized table has 1000 rows
    Then the DOM should contain fewer rendered rows than total rows
    And scrolling should maintain smooth performance

  @ui @virtualization @sticky-header
  Scenario: Header remains fixed during scroll
    Given the virtualized table has many rows
    When I scroll down the table
    Then the header should remain visible at the top
    And column headers should still be clickable for sorting

  @ui @virtualization @sorting
  Scenario: Sort columns by clicking headers
    When I click on the virtualized "Symbol" column header
    Then the virtualized table should be sorted by Symbol
    And the virtualized sort direction indicator should show ascending

  @ui @virtualization @sorting
  Scenario: Toggle sort direction in virtualized table
    When I click on the virtualized "Symbol" column header
    And I click on the virtualized "Symbol" column header again
    Then the virtualized sort direction indicator should show descending

  @ui @virtualization @filtering
  Scenario: Filter virtualized stocks using search input
    When I enter "Apple" in the virtualized search filter
    Then I should only see stocks matching "Apple" in the virtualized table
    And the virtualized stock count should update to reflect filtered results

  @ui @virtualization @filtering
  Scenario: Clear search filter in virtualized table
    Given I have entered "Apple" in the virtualized search filter
    When I click the clear search button in the virtualized table
    Then I should see all stocks in the virtualized table
    And the virtualized search input should be empty

  @ui @virtualization @accessibility
  Scenario: Virtualized table is keyboard accessible
    Then sortable column headers in virtualized table should have tabIndex
    And sortable column headers in virtualized table should support keyboard navigation
    And sort indicators should be aria-hidden

  @ui @virtualization @accessibility
  Scenario: Virtualized table has proper ARIA attributes
    Then the virtualized table should have proper table role
    And the virtualized table should have an accessible label
    And rows should have proper row roles
    And cells should have proper cell roles

  @ui @virtualization @performance
  Scenario: Performance overlay displays metrics
    Given the performance overlay is visible
    Then I should see FPS metric
    And I should see rendered rows metric
    And I should see render ratio metric
    And I should see average render time metric

  @ui @virtualization @performance
  Scenario: FPS indicator shows appropriate color
    Given the performance overlay is visible
    When FPS is above 55
    Then the FPS value should be displayed in green

  @ui @virtualization @loading
  Scenario: Display loading state for virtualized table
    Given the virtualized stock data is loading
    Then I should see a loading skeleton
    And the loading state should have proper accessibility attributes

  @ui @virtualization @error
  Scenario: Display error state with retry button for virtualized table
    Given there is an error loading virtualized stock data
    Then I should see an error message
    And I should see a retry button
    When I click the retry button
    Then the refetch function should be called
