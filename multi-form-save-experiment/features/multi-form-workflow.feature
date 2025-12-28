Feature: Multi-Form Workflow
  As a user with multiple forms on a page
  I want to complete common workflows
  So that I can efficiently manage my profile data

  Scenario: Complete user profile workflow - fill all required fields
    Given I am on the multi-form editor page
    When I fill in all user information fields:
      | field | value            |
      | name  | Jane Smith       |
      | email | jane@example.com |
    And I fill in all address fields:
      | field  | value         |
      | street | 456 Oak Ave   |
      | city   | Los Angeles   |
      | state  | CA            |
      | zip    | 90001         |
    And I click the global save button
    Then I should see a success notification
    And the global save button should be disabled
    And I should not see the dirty form count indicator

  Scenario: Partial form completion shows correct dirty count
    Given I am on the multi-form editor page
    When I fill in the user name field with "Test User"
    Then the dirty form count should show "1"
    When I fill in the address street field with "123 Test St"
    Then the dirty form count should show "2"
    When I check the newsletter checkbox
    Then the dirty form count should show "3"

  Scenario: Theme preference can be changed
    Given I am on the multi-form editor page
    When I select "Dark" in the theme dropdown
    Then the global save button should be enabled
    And I should see the dirty form count indicator

  Scenario: Theme preference persists after save
    Given I am on the multi-form editor page
    When I select "Dark" in the theme dropdown
    And I click the global save button
    Then the global save button should be disabled
    And the theme dropdown should show "Dark"

  Scenario: Multiple validation errors shown for incomplete forms
    Given I am on the multi-form editor page
    When I fill in the user name field with "Test"
    And I fill in the address city field with "Boston"
    And I click the global save button
    Then I should see the validation error summary
    And the validation error summary should include "User Information"
    And the validation error summary should include "Address"

  Scenario: Form data is preserved when switching between forms
    Given I am on the multi-form editor page
    When I fill in the user name field with "Preserved Name"
    And I fill in the address street field with "Preserved Street"
    And I fill in the user email field with "preserved@example.com"
    Then the user name field should contain "Preserved Name"
    And the address street field should contain "Preserved Street"
    And the user email field should contain "preserved@example.com"

  Scenario: Clear all form fields by saving valid data
    Given I am on the multi-form editor page
    When I fill in all user information fields:
      | field | value            |
      | name  | Clear Test       |
      | email | clear@example.com|
    And I fill in all address fields:
      | field  | value         |
      | street | 789 Clear Rd  |
      | city   | Clear City    |
      | state  | CC            |
      | zip    | 11111         |
    And I click the global save button
    Then I should see a success notification
    And the global save button should be disabled

  Scenario: Page header displays correctly
    Given I am on the multi-form editor page
    Then I should see the page title "Multi-Form Editor"
    And I should see the save all button in the header

  Scenario: All form sections are visible and properly structured
    Given I am on the multi-form editor page
    Then I should see the User Information form section
    And the User Information form should have description "Enter your personal details"
    And I should see the Address form section
    And the Address form should have description "Enter your mailing address"
    And I should see the Preferences form section
    And the Preferences form should have description "Customize your experience"
