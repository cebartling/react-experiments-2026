# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Multi-Form Save Experiment**: A React 19 + TypeScript experiment demonstrating coordinated multi-form validation and
submission. The core challenge is managing multiple independent forms that share a single "Save All" button, with
validation gating submission.

## Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Type-check with TypeScript and build for production
- `npm run build:css` - Build Tailwind CSS
- `npm run lint` - Run ESLint on the codebase
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build locally
- `npm test` - Run Vitest unit tests
- `npm run test:acceptance` - Run Cucumber acceptance tests

## Tech Stack

| Library                   | Purpose                                               |
|---------------------------|-------------------------------------------------------|
| React 19                  | UI framework                                          |
| Vite (rolldown-vite)      | Dev server and bundler                                |
| React Router v7           | Client-side routing                                   |
| Zustand                   | Global state (dirty tracking, validation, submission) |
| React Hook Form           | Form state and field-level validation                 |
| Zod + @hookform/resolvers | Schema validation                                     |
| Tailwind CSS v4           | Styling                                               |
| MSW (Mock Service Worker) | API mocking                                           |
| Vitest + Testing Library  | Unit testing                                          |
| Cucumber.js + Playwright  | Acceptance testing                                    |

## Architecture

### Key Directories

```
src/
├── components/
│   ├── layout/          # Container, Card
│   ├── forms/           # FormField, UserInfoForm, AddressForm, PreferencesForm
│   ├── ParentContainer.tsx   # Orchestrates all forms
│   ├── SaveButton.tsx        # Global save with loading states
│   └── ErrorSummary.tsx      # Aggregated error display
├── hooks/
│   ├── useDirtyTracking.ts   # Reports form dirty state to store
│   ├── useSubmittableForm.ts # Main hook combining RHF + dirty + validation + submit
│   └── useErrorHandling.ts   # Error state access
├── stores/
│   ├── formCoordinationStore.ts  # Central store: dirty, validation, submission
│   └── errorStore.ts             # Error notifications
├── types/
│   ├── form-coordination.ts  # FormId, ValidationResult, SubmitResult
│   └── errors.ts             # Error type definitions
├── services/
│   └── formSubmissionService.ts  # API submission logic
├── utils/
│   └── validation-schemas.ts     # Zod schemas for each form
└── mocks/
    ├── handlers.ts     # MSW request handlers
    └── browser.ts      # MSW browser setup
```

### Core Pattern: Form Coordination

The system uses a Zustand store (`formCoordinationStore`) to coordinate multiple forms:

1. **Registration**: Each form registers with `useSubmittableForm` hook, providing `formId`, `displayName`,
   `validate()`, and `submit()` functions
2. **Dirty Tracking**: Forms report dirty state; store aggregates into `isDirty` boolean
3. **Validation**: `validateAllDirtyForms()` triggers parallel validation on all dirty forms
4. **Submission**: `submitAllDirtyForms()` runs only if all validations pass
5. **Orchestration**: `saveAllChanges()` chains validation → submission

### Key Types

```typescript
// Form identification
type FormId = string;  // e.g., 'userInfo', 'address', 'preferences'

// Validation
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];  // { field: string; message: string }
}

// Submission
interface SubmitResult {
  success: boolean;
  formId: FormId;
  error?: string;
}

// Form registry entry (what each form registers)
interface FormRegistryEntry {
  formId: FormId;
  displayName: string;
  validate: () => Promise<ValidationResult>;
  submit: () => Promise<SubmitResult>;
}
```

### State Flow

```
User modifies form → useDirtyTracking reports → store.dirtyForms updated → SaveButton enabled
User clicks Save → validateAllDirtyForms() → all valid? → submitAllDirtyForms() → reset dirty
                                            → has errors? → display in ErrorSummary
```

## Code Conventions

### Creating a New Form

1. Define Zod schema in `src/utils/validation-schemas.ts`
2. Create form component using `useSubmittableForm` hook:
   ```typescript
   const { register, formState: { errors } } = useSubmittableForm<MyFormData>({
     formId: 'myForm',
     displayName: 'My Form',
     resolver: zodResolver(mySchema),
     defaultValues: { ... },
   });
   ```
3. Add MSW handler in `src/mocks/handlers.ts` for the form's API endpoint
4. Register endpoint in `src/services/formSubmissionService.ts`

### Form Components

- Wrap in `<Card>` for consistent styling
- Use `<FormField>` + `<Input>` for proper label/error associations
- Use `<fieldset disabled={isSubmitting}>` to prevent edits during save
- Always include `aria-describedby` linking to error messages

### Zustand Store Access

```typescript
// Reading state (use selectors for performance)
const isDirty = useFormCoordinationStore(state => state.dirtyForms.size > 0);
const saveAllChanges = useFormCoordinationStore(state => state.saveAllChanges);

// Actions
await saveAllChanges();  // Returns boolean success
```

### Error Handling

- Validation errors: stored in `formCoordinationStore.validationErrors`
- Submission errors: stored in `formCoordinationStore.submissionSummary.failedForms`
- Network errors: stored in `errorStore.networkError`
- Use `useErrorHandling` hook for unified access

## Testing Patterns

### Unit Tests (Vitest)

- Store tests: verify state transitions for dirty/validation/submission
- Hook tests: use `renderHook` from Testing Library
- Component tests: use `render` + `userEvent`

### MSW Mocking

```typescript
// In tests, use server.use() to override handlers
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

server.use(
  http.post('/api/forms/user-info', () => {
    return HttpResponse.json({ success: false, error: 'Test error' }, { status: 500 });
  })
);
```

### Acceptance Tests (Cucumber + Playwright)

- Feature files in `features/`
- Step definitions in `features/step_definitions/`
- Run with `npm run test:acceptance`

## Documentation

Detailed implementation plans in `/documentation`:

- `features/FEATURE-001.md` - Complete feature spec with acceptance criteria
- `implementation-plans/IMPL-001-dirty-state-management.md`
- `implementation-plans/IMPL-002-validation-flow.md`
- `implementation-plans/IMPL-003-submission-flow.md`
- `implementation-plans/IMPL-004-error-handling.md`
- `implementation-plans/IMPL-005-ui-components.md`

## Common Tasks

| Task                    | How                                                                     |
|-------------------------|-------------------------------------------------------------------------|
| Add a new form          | Create component with `useSubmittableForm`, add schema, add MSW handler |
| Add validation rule     | Update Zod schema in `validation-schemas.ts`                            |
| Modify submission logic | Edit `formSubmissionService.ts` and `formCoordinationStore.ts`          |
| Add error notification  | Use `errorStore.addNotification()`                                      |
| Debug dirty state       | Check `formCoordinationStore.dirtyForms` in React DevTools              |
| Test API failure        | Override MSW handler with error response                                |

## TypeScript Configuration

Uses project references:

- `tsconfig.app.json` - Source code (ES2022, strict mode)
- `tsconfig.node.json` - Node.js tooling files
