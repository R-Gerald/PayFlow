package com.project.payflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class PayFlowApplication {

	public static void main(String[] args) {
		SpringApplication.run(PayFlowApplication.class, args);
	}

}
