-- Flyway Migration V10: Add decision_type to refunds table
ALTER TABLE refunds ADD COLUMN decision_type VARCHAR(20);
