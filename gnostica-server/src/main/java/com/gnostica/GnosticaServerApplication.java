package com.gnostica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import io.github.cdimascio.dotenv.Dotenv;

import java.time.ZoneId;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class GnosticaServerApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.directory("./")
				.ignoreIfMissing()
				.load();

		if (dotenv.entries().isEmpty()) {
			dotenv = Dotenv.configure()
					.directory("./gnostica-server")
					.ignoreIfMissing()
					.load();
		}

		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

		String appTimeZone = System.getProperty("APP_TIME_ZONE", "Asia/Ho_Chi_Minh");
		TimeZone.setDefault(TimeZone.getTimeZone(ZoneId.of(appTimeZone)));

		SpringApplication.run(GnosticaServerApplication.class, args);
	}

}
