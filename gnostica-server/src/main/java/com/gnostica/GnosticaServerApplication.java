package com.gnostica;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GnosticaServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(GnosticaServerApplication.class, args);
	}

}
