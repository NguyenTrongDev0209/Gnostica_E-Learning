---
description: Workflow for handling database adjustments and migrations.
---

When making database alterations for new features (e.g., adding a table, adding a column) in `gnostica-server`:

### 1. Update the JPA Model
- Add the fields or the new class in `src/main/java/com/gnostica/model/`.
- Use correct annotations (e.g., `@Column(name = "some_col")`, `@ManyToOne(fetch = FetchType.LAZY)`)

### 2. Verify Database Synchonization
- The project currently relies on Spring Boot's internal `spring.jpa.hibernate.ddl-auto=update` mechanism or manual execution (Check `application.properties`/`.env` if unsure).
- DO NOT accidentally drop tables.

### 3. Create Corresponding Repository
- If a new entity was created, create a repository extending `JpaRepository` in `com.gnostica.repository`.

### 4. Provide Sample SQL Data (If necessary)
- If the feature requires default data, ensure you provide standard INSERT statements or use a database seeder if one exists.
