package com.gnostica.core.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoDB configuration class.
 * Explicitly scopes MongoDB repository scanning to only the mongo sub-packages,
 * preventing conflicts with Spring Data JPA in multi-datasource environments.
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.gnostica.modules.integration.repository.mongo")
public class MongoConfig {
    // Spring Boot auto-configures MongoClient and MongoTemplate from application.properties.
    // This class only exists to define the explicit base package for Mongo repositories,
    // resolving the "strict repository configuration mode" warning.
}
