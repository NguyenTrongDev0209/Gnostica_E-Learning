import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/gnostica-database";
        String user = "postgres";
        String password = "123";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("Connected to the PostgreSQL server successfully.");
            ResultSet rs = stmt.executeQuery("SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;");
            while (rs.next()) {
                System.out.println("Rank: " + rs.getInt("installed_rank") +
                        ", Version: " + rs.getString("version") +
                        ", Description: " + rs.getString("description") +
                        ", Success: " + rs.getBoolean("success") + 
                        ", Installed On: " + rs.getTimestamp("installed_on") +
                        ", Checksum: " + rs.getInt("checksum"));
            }
            
            System.out.println("Dropping columns so Flyway can add them cleanly...");
            stmt.executeUpdate("ALTER TABLE notifications DROP COLUMN IF EXISTS type;");
            stmt.executeUpdate("ALTER TABLE notifications DROP COLUMN IF EXISTS reference_id;");
            System.out.println("Columns dropped successfully!");
            
            // Also delete the bad flyway record so it doesn't cause checksum mismatch later if Flyway validates it
            stmt.executeUpdate("DELETE FROM flyway_schema_history WHERE version = '9';");
            System.out.println("Deleted bad flyway record.");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
