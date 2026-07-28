import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * JDBC fallback for running seed_demo_data.sql when psql is not installed.
 * Run from gnostica-server with:
 * java --class-path postgresql.jar scripts/SeedDemoRunner.java
 */
public final class SeedDemoRunner {
    private SeedDemoRunner() {}

    public static void main(String[] args) throws Exception {
        Path envFile = Path.of(".env");
        boolean verifyOnly = args.length == 1 && "--verify".equals(args[0]);
        Path sqlFile = args.length == 1 ? Path.of(args[0]) : Path.of("scripts", "seed_demo_data.sql");
        Map<String, String> env = loadEnv(envFile);

        require(env, "DB_URL");
        require(env, "DB_USERNAME");
        require(env, "DB_PASSWORD");

        if (verifyOnly) {
            verify(env);
            return;
        }

        String sql = Files.readString(sqlFile);
        List<String> statements = splitSqlStatements(sql);
        System.out.println("Running demo seed statements. Database credentials are not displayed.");

        try (Connection connection = DriverManager.getConnection(
                env.get("DB_URL"), env.get("DB_USERNAME"), env.get("DB_PASSWORD"));
             Statement statement = connection.createStatement()) {
            for (String sqlStatement : statements) {
                if (!sqlStatement.isBlank()) {
                    statement.execute(sqlStatement);
                }
            }
            System.out.println("Demo seed completed successfully.");
        } catch (SQLException error) {
            System.err.println("Demo seed failed; PostgreSQL rolled back the open transaction.");
            System.err.println(error.getMessage());
            System.exit(1);
        }
    }

    private static void verify(Map<String, String> env) throws SQLException {
        String countSql = """
                SELECT 'accounts' AS entity, count(*) AS created FROM accounts WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
                UNION ALL SELECT 'categories', count(*) FROM categories WHERE slug LIKE 'seed-%'
                UNION ALL SELECT 'courses', count(*) FROM courses WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
                UNION ALL SELECT 'modules', count(*) FROM modules WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
                UNION ALL SELECT 'lessons', count(*) FROM lessons WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1'
                ORDER BY entity
                """;
        String allocationSql = """
                SELECT a.full_name, a.email, count(c.id) AS assigned_courses
                FROM courses c
                JOIN accounts a ON a.id = c.account_id
                WHERE c.metadata ->> 'seed_batch' = 'gnostica-demo-v1'
                GROUP BY a.id, a.full_name, a.email
                ORDER BY a.full_name, a.email
                """;
        String distributionSql = """
                SELECT 'accounts' AS entity, status, count(*) AS total, min(created_at)::date AS first_created, max(created_at)::date AS last_created
                FROM accounts WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1' GROUP BY status
                UNION ALL
                SELECT 'courses', status, count(*), min(created_at)::date, max(created_at)::date
                FROM courses WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1' GROUP BY status
                UNION ALL
                SELECT 'modules', status, count(*), min(created_at)::date, max(created_at)::date
                FROM modules WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1' GROUP BY status
                UNION ALL
                SELECT 'lessons', status, count(*), min(created_at)::date, max(created_at)::date
                FROM lessons WHERE metadata ->> 'seed_batch' = 'gnostica-demo-v1' GROUP BY status
                ORDER BY entity, status
                """;

        try (Connection connection = DriverManager.getConnection(
                env.get("DB_URL"), env.get("DB_USERNAME"), env.get("DB_PASSWORD"));
             Statement statement = connection.createStatement()) {
            connection.setReadOnly(true);
            try (var result = statement.executeQuery(countSql)) {
                while (result.next()) {
                    System.out.printf("%s=%d%n", result.getString("entity"), result.getLong("created"));
                }
            }
            try (var result = statement.executeQuery(allocationSql)) {
                while (result.next()) {
                    System.out.printf("%s <%s>: %d courses%n", result.getString("full_name"),
                            result.getString("email"), result.getLong("assigned_courses"));
                }
            }
            try (var result = statement.executeQuery(distributionSql)) {
                while (result.next()) {
                    System.out.printf("%s status %d: %d records (%s to %s)%n", result.getString("entity"),
                            result.getInt("status"), result.getLong("total"), result.getDate("first_created"),
                            result.getDate("last_created"));
                }
            }
        }
    }

    private static Map<String, String> loadEnv(Path envFile) throws IOException {
        if (!Files.exists(envFile)) {
            throw new IllegalArgumentException("Missing database environment file: " + envFile);
        }
        Map<String, String> values = new HashMap<>();
        for (String line : Files.readAllLines(envFile)) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
            int separator = trimmed.indexOf('=');
            if (separator < 1) continue;
            String value = trimmed.substring(separator + 1).trim();
            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                value = value.substring(1, value.length() - 1);
            }
            values.put(trimmed.substring(0, separator).trim(), value);
        }
        return values;
    }

    private static void require(Map<String, String> values, String key) {
        if (values.get(key) == null || values.get(key).isBlank()) {
            throw new IllegalArgumentException("Missing " + key + " in .env");
        }
    }

    /** Splits on statement terminators while preserving quoted and dollar-quoted bodies. */
    private static List<String> splitSqlStatements(String sql) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        String dollarDelimiter = null;
        boolean singleQuote = false;
        boolean doubleQuote = false;
        boolean lineComment = false;
        boolean blockComment = false;

        for (int index = 0; index < sql.length(); index++) {
            char character = sql.charAt(index);
            char next = index + 1 < sql.length() ? sql.charAt(index + 1) : '\0';

            if (lineComment) {
                current.append(character);
                if (character == '\n') lineComment = false;
                continue;
            }
            if (blockComment) {
                current.append(character);
                if (character == '*' && next == '/') {
                    current.append(next);
                    index++;
                    blockComment = false;
                }
                continue;
            }
            if (dollarDelimiter != null) {
                if (sql.startsWith(dollarDelimiter, index)) {
                    current.append(dollarDelimiter);
                    index += dollarDelimiter.length() - 1;
                    dollarDelimiter = null;
                } else {
                    current.append(character);
                }
                continue;
            }
            if (singleQuote) {
                current.append(character);
                if (character == '\'' && next == '\'') {
                    current.append(next);
                    index++;
                } else if (character == '\'') {
                    singleQuote = false;
                }
                continue;
            }
            if (doubleQuote) {
                current.append(character);
                if (character == '"' && next == '"') {
                    current.append(next);
                    index++;
                } else if (character == '"') {
                    doubleQuote = false;
                }
                continue;
            }
            if (character == '-' && next == '-') {
                current.append(character).append(next);
                index++;
                lineComment = true;
            } else if (character == '/' && next == '*') {
                current.append(character).append(next);
                index++;
                blockComment = true;
            } else if (character == '\'') {
                current.append(character);
                singleQuote = true;
            } else if (character == '"') {
                current.append(character);
                doubleQuote = true;
            } else if (character == '$') {
                int end = sql.indexOf('$', index + 1);
                String candidate = end > index ? sql.substring(index, end + 1) : null;
                if (candidate != null && candidate.matches("\\$[A-Za-z_][A-Za-z0-9_]*\\$|\\$\\$")) {
                    current.append(candidate);
                    index = end;
                    dollarDelimiter = candidate;
                } else {
                    current.append(character);
                }
            } else if (character == ';') {
                result.add(current.toString());
                current.setLength(0);
            } else {
                current.append(character);
            }
        }
        if (!current.toString().isBlank()) result.add(current.toString());
        return result;
    }
}
