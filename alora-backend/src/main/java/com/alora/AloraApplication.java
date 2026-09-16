package com.alora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AloraApplication {

    public static void main(String[] args) {
        System.out.println("Starting ALORA Smart Campus Backend...");
        SpringApplication.run(AloraApplication.class, args);
        System.out.println("ALORA Backend is running on port 8080!");
    }
}
