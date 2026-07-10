package com.gnostica.core.config;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;

@Configuration
public class FlywayConfig {

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        return Flyway.configure()
                .baselineOnMigrate(true)
                .locations("classpath:db/migration")
                .dataSource(dataSource)
                .load();
    }

    @Bean
    public static BeanFactoryPostProcessor flywayDependsOnPostProcessor() {
        return beanFactory -> {
            String[] jpaBeans = beanFactory.getBeanNamesForType(EntityManagerFactory.class, true, false);
            for (String jpaBean : jpaBeans) {
                BeanDefinition definition = 
                    ((DefaultListableBeanFactory) beanFactory).getBeanDefinition(jpaBean);
                definition.setDependsOn(StringUtils.addStringToArray(definition.getDependsOn(), "flyway"));
            }
        };
    }
}
