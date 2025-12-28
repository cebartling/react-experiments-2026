Feature: UI Components
  As a user with a multi-form page
  I want a consistent and accessible user interface
  So that I can easily fill out and save all forms

  Background:
    Given I am on the multi-form editor page

  Scenario: All form sections are displayed
    Then I should see the User Information form
    And I should see the Address form
    And I should see the Preferences form

  Scenario: Save button is disabled when no forms are dirty
    Then the global save button should be disabled

  Scenario: Save button becomes enabled when a form has changes
    When I fill in the user name field with "John Doe"
    Then the global save button should be enabled
    And I should see the dirty form count indicator

  Scenario: Form displays validation error for invalid input
    When I fill in the user email field with "invalid-email"
    And I click the global save button
    Then I should see the validation error summary
    And the validation error summary should mention validation errors

  Scenario: Successful save shows success notification
    When I fill in the user name field with "John Doe"
    And I fill in the user email field with "john@example.com"
    And I fill in the address street field with "123 Main St"
    And I fill in the address city field with "New York"
    And I fill in the address state field with "NY"
    And I fill in the address zip field with "10001"
    And I click the global save button
    Then I should see a success notification
    And the global save button should be disabled

  Scenario: Error summary can be dismissed
    When I fill in the user name field with "John"
    And I click the global save button
    Then I should see the validation error summary
    When I click the dismiss error button
    Then I should not see the validation error summary

  Scenario: Form fields have proper labels
    Then the user name field should have a label "Name"
    And the user email field should have a label "Email"
    And the address street field should have a label "Street Address"

  Scenario: Required fields are marked with asterisk
    Then the user name field should be marked as required
    And the user email field should be marked as required
    And the address street field should be marked as required

  Scenario: Preferences form allows changing notification settings
    When I select "Important only" in the notifications dropdown
    Then the global save button should be enabled

  Scenario: Preferences form allows toggling newsletter subscription
    When I check the newsletter checkbox
    Then the global save button should be enabled
