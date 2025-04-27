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
public class ClaudeApiKeyConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(ClaudeApiKeyConfig.class);
    
    @Bean
    public String claudeApiKey(Environment environment) {
        // Try to get the API key from Spring environment
        String apiKey = environment.getProperty("CLAUDE_API_KEY");
        
        // If not found, try from system environment
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = System.getenv("CLAUDE_API_KEY");
        }
        
        // If still not found, try to read directly from .env file
        if (apiKey == null || apiKey.isEmpty()) {
            apiKey = readApiKeyFromEnvFile();
        }
        
        // Log API key status
        logger.info("Claude API key: {}", apiKey != null ? "found" : "not found");
        
        return apiKey;
    }
    
    private String readApiKeyFromEnvFile() {
        // Try both root and backend directories for .env file
        String[] paths = {".env", "backend/.env"};
        
        for (String path : paths) {
            File envFile = new File(path);
            if (envFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("CLAUDE_API_KEY=")) {
                            return line.substring("CLAUDE_API_KEY=".length()).trim();
                        }
                    }
                } catch (IOException e) {
                    logger.error("Error reading .env file: {}", e.getMessage());
                }
            }
        }
        return null;
    }
} 