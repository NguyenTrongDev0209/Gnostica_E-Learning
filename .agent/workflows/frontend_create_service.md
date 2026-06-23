---
description: Workflow for creating a new API service module in the gnostica-web frontend.
---

When adding communication with a new Backend REST API, prioritize scalability, encapsulation, and error resilience.

### 1. Service File Strategy
- Services are located in `gnostica-web/src/services/`.
- Name the file after the domain entity in camelCase (e.g., `courseService.js`, `orderService.js`).
- **Encapsulation Strategy:** Expose specific data-fetching and mutation async functions via default exports. Do not clutter the component layer with raw `axios` calls.

### 2. Clean Token Authentication (Refactoring Target)
- Gnostica currently uses manual token injection per method:
```javascript
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? { Authorization: `Bearer ${JSON.parse(userStr).token}` } : {};
};
```
- **Best Practice Alert:** Whenever writing loops or making concurrent requests, be mindful of this synchronous localStorage lookup. Moving toward a centralized **Axios Interceptor** is highly recommended for scalability, but stick to `getAuthHeaders()` immediately if maintaining legacy files.

### 3. API Method Standards
- Write functions corresponding to CRUD operations plus domain actions (e.g. `createItem`, `updateStatus`).
- **Pagination Contracts:** Always mirror Spring Boot's pagination parameters `page = 0` and `size = 10` uniformly across services.
- **Error Awareness:** Services should either catch and normalize errors (returning structured data) or intentionally throw so that UI components can catch them to display Toast notifications (`sonner`). Do not swallow errors silently.
