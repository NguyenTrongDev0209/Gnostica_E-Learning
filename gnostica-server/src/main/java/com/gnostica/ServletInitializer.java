package com.gnostica;

import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import io.github.cdimascio.dotenv.Dotenv;

public class ServletInitializer extends SpringBootServletInitializer {

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
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

		return application.sources(GnosticaServerApplication.class);
	}

}
