---
description: Workflow for creating a new REST API endpoint in the gnostica-server backend.
---

When creating a new API endpoint, follow this strict Domain-Driven structure to maintain consistency, scalability, and resilience with the Gnostica architecture.

### 1. Architectural Integrity & Layer Separation
- **Resource-Oriented Naming:** Keep endpoints as nouns (e.g., `/api/courses`) not verbs. Action-oriented logic should use appropriate HTTP methods (POST, PUT, DELETE, PATCH).
- **Controller Layer:** Strictly for HTTP routing, request validation, and response mapping. Keep business logic out of here.
- **Service Layer (Interface + Impl):** Business logic resides entirely here. Services orchestrate models and repositories.
- **Repository Layer:** Data access via `JpaRepository`.

### 2. DTO (Data Transfer Object) Policy
- **Never expose JPA Entities directly.**
- Create bounded request DTOs in `src/main/java/com/gnostica/dto/request/`.
- Create clean response DTOs in `src/main/java/com/gnostica/dto/response/`.
- Use Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`) to eliminate boilerplate.

### 3. Defensive Validation
- Never trust client input. Use `jakarta.validation.constraints` (e.g. `@NotBlank`, `@Email`, `@Size`, `@Min`).
- Always tag the `@RequestBody` input with `@Valid` in the controller.

### 4. Resilient Error Handling
- Do not use scattered `try-catch` blocks that leak stack traces.
- Throw specific custom exceptions in the Service layer when business rules are violated.
- Rely on the Global Exception Handler (`@ControllerAdvice`) to intercept errors and map them to correct, standardized HTTP responses (e.g. 404 for Not Found, 400 for Validation Failure, 403 for Unauthorized).
- If manual error mapping is necessary, respond with structured JSON containing exactly what went wrong (e.g., `ResponseEntity.badRequest().body(Map.of("error", "..."))`).

### 5. Controller Implementation Example
```java
@RestController
@RequestMapping("/api/[entity]")
@RequiredArgsConstructor
public class EntityController {
    
    private final EntityService entityService;

    @PostMapping
    public ResponseEntity<EntityResponse> create(
            @Valid @RequestBody EntityRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(entityService.create(request, email));
    }
}
```

### 6. Verification
- Compile and run `./mvnw spring-boot:run` to ensure there are no compilation errors or mapping issues.
