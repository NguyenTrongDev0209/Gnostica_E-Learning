package com.gnostica.core.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

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

    private static final String ENVIRONMENT_PROPERTY_SOURCE = "gnosticaEnvironment";
    private static final String DEVELOPMENT = "development";
    private static final String PRODUCTION = "production";

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

        String appEnvironment = environment.getProperty("APP_ENV", DEVELOPMENT).trim().toLowerCase();
        Map<String, Object> environmentProperties = createEnvironmentProperties(appEnvironment);

        // System environment variables remain the highest priority. The selected
        // application environment overrides values loaded from the local .env file.
        environment.getPropertySources().addAfter(
                StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                new MapPropertySource(ENVIRONMENT_PROPERTY_SOURCE, environmentProperties)
        );
    }

    private Map<String, Object> createEnvironmentProperties(String appEnvironment) {
        Map<String, Object> props = new HashMap<>();

        if (DEVELOPMENT.equals(appEnvironment)) {
            props.put("APP_PUBLIC_URL", "http://localhost:5173");
            props.put("APP_CORS_ALLOWED_ORIGIN_PATTERNS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:*");
            props.put("GOOGLE_REDIRECT_URI", "http://localhost:8080/api/login/oauth2/code/google");
            props.put("VNPAY_RETURN_URL", "http://localhost:8080/api/payment/vnpay/return");
            props.put("VNPAY_FRONTEND_RETURN_URL", "http://localhost:5173/checkout/success");
            return props;
        }

        if (PRODUCTION.equals(appEnvironment)) {
            props.put("APP_PUBLIC_URL", "https://gnostica.io.vn");
            props.put("APP_CORS_ALLOWED_ORIGIN_PATTERNS", "https://gnostica.io.vn");
            props.put("GOOGLE_REDIRECT_URI", "https://gnostica.io.vn/api/login/oauth2/code/google");
            props.put("VNPAY_RETURN_URL", "https://gnostica.io.vn/api/payment/vnpay/return");
            props.put("VNPAY_FRONTEND_RETURN_URL", "https://gnostica.io.vn/checkout/success");
            return props;
        }

        throw new IllegalStateException(
                "APP_ENV must be 'development' or 'production', but was: " + appEnvironment
        );
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
