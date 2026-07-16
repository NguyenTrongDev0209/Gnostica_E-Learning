package com.gnostica.core.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import lombok.extern.slf4j.Slf4j;

/**
 * MongoDB configuration class.
 * Explicitly creates MongoClient bean to bypass Spring Boot auto-configuration,
 * which in Spring Boot 4 does NOT reliably use spring.data.mongodb.uri when
 * multiple Spring Data modules (JPA, Redis, MongoDB) are present.
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.gnostica.modules.integration.repository.mongo")
@Slf4j
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    /**
     * Explicit MongoClient bean. Because this bean exists, Spring Boot's
     * MongoAutoConfiguration (@ConditionalOnMissingBean) will NOT create
     * its own default MongoClient pointing to localhost:27017.
     */
    @Bean
    public MongoClient mongoClient() {
        log.info("=================================================");
        log.info("Creating MongoClient with Atlas URI: {}", mongoUri);
        log.info("=================================================");
        ConnectionString connectionString = new ConnectionString(mongoUri);
        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(connectionString)
                .build();
        return MongoClients.create(settings);
    }

    /**
     * Explicit MongoDatabaseFactory using the database name from the URI.
     */
    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory(MongoClient mongoClient) {
        // Extract database name from URI; default to "gnostica"
        ConnectionString cs = new ConnectionString(mongoUri);
        String db = cs.getDatabase();
        if (db == null || db.isBlank()) {
            db = "gnostica";
        }
        log.info("Using MongoDB database: {}", db);
        return new SimpleMongoClientDatabaseFactory(mongoClient, db);
    }

    /**
     * Explicit MongoTemplate so Spring Data uses our factory.
     */
    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory mongoDatabaseFactory) {
        return new MongoTemplate(mongoDatabaseFactory);
    }
}
