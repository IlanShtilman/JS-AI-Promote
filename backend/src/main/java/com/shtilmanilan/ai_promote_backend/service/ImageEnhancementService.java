package com.shtilmanilan.ai_promote_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationRequest;
import com.shtilmanilan.ai_promote_backend.model.TextGenerationResponse;

@Service
public class ImageEnhancementService {
    private static final Logger logger = LoggerFactory.getLogger(ImageEnhancementService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;
    private final GeminiService geminiService;

    @Value("${claidAi.api.url}")
    private String claidApiUrl;

    @Value("${claidAi.api.key}")
    private String claidApiKey;

    @Autowired
    public ImageEnhancementService(RestTemplate restTemplate, GeminiService geminiService) {
        this.restTemplate = restTemplate;
        this.geminiService = geminiService;
    }

    public String enhanceImage(String imageUrl) {
        try {
            // Step 1: Generate enhancement instructions using Gemini with user-provided prompt
            String prompt = String.format(
                    "For the following image: %s\n" +
                            "IMPORTANT: The goal is to enhance the image while keeping it looking natural and realistic. Avoid over-processing or artificial-looking results. " +
                            "Return the response in this exact JSON format:\n" +
                            "{\n" +
                            "  \"operations\": {\n" +
                            "    \"restorations\": {\n" +
                            "      \"upscale\": \"photo\" or \"faces\" or \"digital_art\" or \"smart_enhance\" or \"smart_resize\",\n" +
                            "      \"decompress\": \"moderate\" or \"strong\" or \"auto\",\n" +
                            "      \"polish\": true or false\n" +
                            "    },\n" +
                            "    \"adjustments\": {\n" +
                            "      \"hdr\": {\n" +
                            "        \"intensity\": number between 0-100,\n" +
                            "        \"stitching\": true or false\n" +
                            "      },\n" +
                            "      \"exposure\": number between -100 to 100,\n" +
                            "      \"saturation\": number between -100 to 100,\n" +
                            "      \"contrast\": number between -100 to 100,\n" +
                            "      \"sharpness\": number between 0 to 100\n" +
                            "    },\n" +
                            "    \"background\": {\n" +
                            "      \"blur\": {\n" +
                            "        \"category\": \"general\" or \"cars\" or \"products\",\n" +
                            "        \"type\": \"regular\" or \"lens\",\n" +
                            "        \"level\": \"low\"\n" +
                            "      }\n" +
                            "    }\n" +
                            "  }\n" +
                            "}", imageUrl
            );

            // Request to generate enhancement instructions
            TextGenerationRequest requestPromptClaid = new TextGenerationRequest();
            requestPromptClaid.setPrompt(prompt);
            TextGenerationResponse aiResponse = geminiService.generateText(requestPromptClaid);
            String responseText = aiResponse.getGeneratedText();
            logger.info("Gemini Enhancement configuration text: {}", responseText);

            // **Fix: Remove markdown formatting if present**
            if (responseText != null) {
                if (responseText.startsWith("```json")) {
                    responseText = responseText.substring(7);
                    if (responseText.endsWith("```")) {
                        responseText = responseText.substring(0, responseText.length() - 3);
                    }
                }
                responseText = responseText.trim();
            } else {
                throw new RuntimeException("Gemini response was null or empty.");
            }

            // Parse enhancement configuration from Gemini response
            JsonNode enhancementConfig = objectMapper.readTree(responseText);
            logger.info("Gemini Enhancement configuration JSON: {}", enhancementConfig);

            // If the config is wrapped in "operations", unwrap it
            if (enhancementConfig.has("operations")) {
                enhancementConfig = enhancementConfig.get("operations");
                logger.info("Unwrapped Gemini Enhancement configuration JSON: {}", enhancementConfig);
            }

            // Step 2: Prepare the request to the enhancement API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + claidApiKey);

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("input", imageUrl);

            ObjectNode operationsNode = objectMapper.createObjectNode();
            if (enhancementConfig.has("restorations")) {
                operationsNode.set("restorations", enhancementConfig.get("restorations"));
            }
            if (enhancementConfig.has("adjustments")) {
                operationsNode.set("adjustments", enhancementConfig.get("adjustments"));
            }
            if (enhancementConfig.has("background") && enhancementConfig.get("background").has("blur")) {
                operationsNode.set("background", enhancementConfig.get("background").get("blur"));
            }

            requestBody.set("operations", operationsNode);

            logger.info("ClaID API Request Body: {}", requestBody);

            HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);

            // Step 3: Call the enhancement API
            String enhancementResponse = restTemplate.postForObject(
                    claidApiUrl,
                    request,
                    String.class
            );

            // Step 4: Parse and validate the response
            JsonNode responseJson = objectMapper.readTree(enhancementResponse);
            logger.info("ClaID API Response: {}", responseJson);

            JsonNode dataNode = responseJson.get("data");
            if (dataNode != null) {
                JsonNode outputNode = dataNode.get("output");
                if (outputNode != null && outputNode.has("tmp_url")) {
                    return outputNode.get("tmp_url").asText();
                }
            }

             throw new RuntimeException("Invalid response from enhancement API: missing 'tmp_url'");

        } catch (Exception e) {
            logger.error("Error enhancing image: {}", e.getMessage(), e);
            logger.error("Full exception details: ", e);
            throw new RuntimeException("Failed to enhance image: " + e.getMessage());
        }
    }
}