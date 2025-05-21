package com.shtilmanilan.ai_promote_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@Configuration
public class GPT4ApiKeyConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(GPT4ApiKeyConfig.class);
    
    @Bean(name = "gpt4ApiKey")
    public String gpt4ApiKey(Environment environment) {
        // Try to get the API key from Spring environment
        String apiKey = environment.getProperty("GPT4_API_KEY");
        
        // If not found, try from system environment
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getenv("GPT4_API_KEY");
        }
        
        // If still not found, try to read directly from .env file
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = readApiKeyFromEnvFile("GPT4_API_KEY");
        }
        
        // Log API key status
        logger.info("GPT-4 API key: {}", apiKey != null ? "found" : "not found");
        
        return apiKey;
    }
    
    private String readApiKeyFromEnvFile(String keyName) {
        try {
            File envFile = new File(".env");
            if (envFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith(keyName + "=")) {
                            return line.substring(keyName.length() + 1).trim();
                        }
                    }
                }
            }
        } catch (IOException e) {
            logger.error("Error reading .env file", e);
        }
        return null;
    }
} 