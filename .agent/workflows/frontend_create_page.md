---
description: Workflow for adding a new UI Page or Component to the gnostica-web application.
---

When building robust user interfaces for Gnostica Web:

### 1. Component vs Page Strategy (Scalable Folders)
- **Pages**: Store entirely isolated views in `src/pages/[role]/` (e.g., `admin/`, `instructor/`, `client/`).
- **Shared Components**: If an element is re-used (e.g., a Course Card), place it in `src/components/common/`.
- **UI Tooling**: Always check `src/components/ui/` for existing Shadcn atomic components (Buttons, Inputs, Dialogs) before building raw HTML/Tailwind alternatives.

### 2. Custom Hooks & Logic Encapsulation
- Keep UI components clean. If a page requires complex data fetching, complex state (filtering, sorting, pagination), or side-effects, extract this logic into a Custom Hook (`src/hooks/use[Feature].js`).
- Hooks should adhere strictly to the "Single Responsibility" principle.

### 3. Error Boundaries & Resilience
- Never assume an API call will succeed or data will be strictly typed. 
- Ensure proper use of Optional Chaining (`user?.name`).
- Wrap critical/complex route components or sub-features inside **Error Boundaries** to prevent unhandled JS exceptions from crashing the entire application into a white screen. Provide a fallback UI.
- Use `sonner` (Toast) for displaying non-blocking async errors to the user.

### 4. Implementation Guidelines
- **Form Handling:** Always pair `react-hook-form` with `zod` for robust, typed validation schemas. Never build manual, state-heavy form validation.
- **Routing:** A dedicated route must be added to the configuration in `src/routers/` for the page to be accessible.
