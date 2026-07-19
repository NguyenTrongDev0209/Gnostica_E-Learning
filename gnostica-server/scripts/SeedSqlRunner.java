import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

public class SeedSqlRunner {
    public static void main(String[] args) throws Exception {
        Path envPath = Path.of(args.length > 0 ? args[0] : ".env");
        Path sqlPath = Path.of(args.length > 1 ? args[1] : "scripts/seed-course-catalog.sql");
        String instructorEmail = args.length > 2 ? args[2] : "goslink.team@gmail.com";

        Map<String, String> env = new HashMap<>();
        for (String rawLine : Files.readAllLines(envPath)) {
            String line = rawLine.trim();
            if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) continue;
            int separator = line.indexOf('=');
            env.put(line.substring(0, separator).trim(), line.substring(separator + 1).trim());
        }

        String jdbcUrl = required(env, "DB_URL");
        String username = required(env, "DB_USERNAME");
        String password = required(env, "DB_PASSWORD");
        String sql = Files.readString(sqlPath);

        try (Connection connection = DriverManager.getConnection(jdbcUrl, username, password)) {
            connection.setAutoCommit(false);
            try (Statement statement = connection.createStatement()) {
                statement.execute("SET LOCAL gnostica.seed_instructor_email = '" + instructorEmail.replace("'", "''") + "'");
                statement.execute(sql);
                connection.commit();
            } catch (Exception exception) {
                connection.rollback();
                throw exception;
            }
        }

        System.out.println("Course catalog seed completed successfully.");
    }

    private static String required(Map<String, String> env, String key) {
        String value = env.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing " + key + " in .env");
        }
        return value;
    }
}
