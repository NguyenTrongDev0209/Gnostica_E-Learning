package com.gnostica.core.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Loads .env file properties into the Spring Environment BEFORE any beans are created.
 * This ensures properties like MONGODB_URI are available when Spring Boot auto-configures
 * the MongoClient, preventing it from falling back to localhost:27017.
 *
 * Registered via META-INF/spring.factories.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Dotenv dotenv = tryLoad("./");
        if (dotenv == null || dotenv.entries().isEmpty()) {
            dotenv = tryLoad("./gnostica-server");
        }

        if (dotenv == null) {
            return;
        }

        Map<String, Object> props = new HashMap<>();
        dotenv.entries().forEach(entry -> props.put(entry.getKey(), entry.getValue()));

        if (!props.isEmpty()) {
            // Add with lowest priority so explicit env vars still win
            environment.getPropertySources().addLast(
                    new MapPropertySource("dotenvProperties", props)
            );
        }
    }

    private Dotenv tryLoad(String directory) {
        try {
            return Dotenv.configure()
                    .directory(directory)
                    .ignoreIfMissing()
                    .load();
        } catch (Exception e) {
            return null;
        }
    }
}
