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
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class ImageEnhancementService {
    private static final Logger logger = LoggerFactory.getLogger(ImageEnhancementService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;
    private final LlamaService llamaService;

    @Value("${claidAi.api.url}")
    private String claidApiUrl;

    @Value("${claidAi.api.key}")
    private String claidApiKey;

    private String generateConfigHash(String imageUrl, JsonNode config) {
        try {
            // Combine image URL and config to ensure uniqueness
            String combinedInput = imageUrl + "|" + config.toString();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(combinedInput.getBytes("UTF-8"));
            return Base64.getEncoder().encodeToString(hash).substring(0, 16);
        } catch (Exception e) {
            logger.error("Error generating config hash", e);
            return "hash-error";
        }
    }

    @Autowired
    public ImageEnhancementService(RestTemplate restTemplate, LlamaService llamaService) {
        this.restTemplate = restTemplate;
        this.llamaService = llamaService;
    }

    public String enhanceImage(String imageUrl) {
        String requestId = java.util.UUID.randomUUID().toString().substring(0, 8);
        logger.info("\n\n=== ENHANCEMENT REQUEST START ===");
        logger.info("[Request {}] Starting enhancement for image: {}", requestId, imageUrl);
        
        try {
            logger.info("\n\nDEBUG: Starting image enhancement process for image: {}\n\n", imageUrl);

            // Create a more specific prompt for Llama that encourages varied responses
            String imageEnhancementPrompt = String.format(
                "You are an expert image enhancement AI. Analyze this image URL and provide specific enhancement instructions: %s\n\n" +
                "IMPORTANT GUIDELINES:\n" +
                "1. First, analyze the image type and content from the URL:\n" +
                "   - Is it a photo, artwork, product image, or something else?\n" +
                "   - What are the main subjects or elements in the image?\n" +
                "   - What is the current quality level (low, medium, high)?\n" +
                "   - What are the specific issues that need enhancement?\n\n" +
                "2. Based on your analysis, provide UNIQUE enhancement settings that:\n" +
                "   - Match the specific needs of THIS image\n" +
                "   - Use a WIDE RANGE of values (don't use the same values for every image)\n" +
                "   - Consider the image's content and purpose\n" +
                "   - Preserve the original style while improving quality\n\n" +
                "3. For each image type, consider these typical needs:\n" +
                "   - Photos: Focus on natural-looking enhancements, proper exposure, and color balance\n" +
                "   - Artwork: Preserve artistic style while improving clarity and detail\n" +
                "   - Products: Enhance details, correct lighting, and improve background\n" +
                "   - Portraits: Focus on skin tones, facial details, and background separation\n\n" +
                "4. IMPORTANT: Use DIFFERENT values for each image. Do not use the same values repeatedly.\n" +
                "   - Vary the intensity of adjustments based on the image's needs\n" +
                "   - Consider the image's current state when choosing values\n" +
                "   - Use the full range of allowed values when appropriate\n\n" +
                "Return ONLY a JSON object in this exact format, with no additional text or explanation:\n" +
                "{\n" +
                "  \"operations\": {\n" +
                "    \"restorations\": {\n" +
                "      \"upscale\": \"photo\" or \"faces\" or \"digital_art\" or \"smart_enhance\" or \"smart_resize\",\n" +
                "      \"decompress\": \"moderate\" or \"strong\" or \"auto\",\n" +
                "      \"polish\": true or false\n" +
                "    },\n" +
                "    \"adjustments\": {\n" +
                "      \"hdr\": {\n" +
                "        \"intensity\": number between 0-100 (use varied values based on image needs),\n" +
                "        \"stitching\": true or false\n" +
                "      },\n" +
                "      \"exposure\": number between -100 to 100 (adjust based on current image brightness),\n" +
                "      \"saturation\": number between -100 to 100 (vary based on image colors and type),\n" +
                "      \"contrast\": number between -100 to 100 (adjust based on image dynamic range),\n" +
                "      \"sharpness\": number between 0 to 100 (vary based on image detail level)\n" +
                "    },\n" +
                "    \"background\": {\n" +
                "      \"blur\": {\n" +
                "        \"category\": \"general\" or \"cars\" or \"products\",\n" +
                "        \"type\": \"regular\" or \"lens\",\n" +
                "        \"level\": \"low\" or \"medium\" or \"high\"\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}\n\n" +
                "Remember: Each image should get UNIQUE enhancement settings based on its specific needs and content.",
                imageUrl
            );

            logger.info("[Request {}] Sending prompt to Llama:\n{}", requestId, imageEnhancementPrompt);

            // Generate enhancement instructions using Llama with higher temperature for more variation
            TextGenerationRequest requestPromptClaid = new TextGenerationRequest();
            requestPromptClaid.setPrompt(imageEnhancementPrompt);
            requestPromptClaid.setTemperature(0.7); // Increased temperature for more variation
            TextGenerationResponse aiResponse = llamaService.generateText(requestPromptClaid);
            String responseText = aiResponse.getGeneratedText();
            
            logger.info("[Request {}] Received Llama response:\n{}", requestId, responseText);
            
            // Validate and clean the response text
            if (responseText == null || responseText.trim().isEmpty()) {
                logger.error("[Request {}] Llama response was empty", requestId);
                throw new RuntimeException("Llama response was null or empty for image: " + imageUrl);
            }

            // Remove markdown formatting if present
            responseText = responseText.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "").trim();
            logger.info("[Request {}] Cleaned Llama response:\n{}", requestId, responseText);

            // Parse enhancement configuration from Llama response
            JsonNode enhancementConfig;
            try {
                enhancementConfig = objectMapper.readTree(responseText);
                logger.info("[Request {}] Parsed enhancement config:\n{}", requestId, 
                    objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(enhancementConfig));
            } catch (Exception e) {
                logger.error("[Request {}] Failed to parse enhancement configuration JSON", requestId, e);
                throw new RuntimeException("Invalid enhancement configuration format: " + e.getMessage());
            }

            // Generate and log config hash - now including imageUrl
            String configHash = generateConfigHash(imageUrl, enhancementConfig);
            logger.info("[Request {}] Generated enhancement config hash: {} for image: {}", 
                requestId, configHash, imageUrl);

            // Validate the enhancement configuration structure
            if (!enhancementConfig.has("operations")) {
                logger.error("[Request {}] Missing operations in config hash: {}", requestId, configHash);
                throw new RuntimeException("Enhancement configuration missing 'operations' field");
            }

            // Get the operations node
            JsonNode operationsConfig = enhancementConfig.get("operations");
            logger.info("[Request {}] Operations config:\n{}", requestId, 
                objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(operationsConfig));

            // Prepare the request to the enhancement API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + claidApiKey);
            headers.set("X-Request-ID", requestId);
            headers.set("X-Config-Hash", configHash);

            // Create a new request body for each image
            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("input", imageUrl);
        

            // Create a fresh operations node for each request
            ObjectNode operationsNode = objectMapper.createObjectNode();
            
            // Copy each section individually to ensure no object reuse
            if (operationsConfig.has("restorations")) {
                operationsNode.set("restorations", operationsConfig.get("restorations").deepCopy());
            }
            if (operationsConfig.has("adjustments")) {
                operationsNode.set("adjustments", operationsConfig.get("adjustments").deepCopy());
            }
            if (operationsConfig.has("background")) {
                ObjectNode backgroundNode = objectMapper.createObjectNode();
                if (operationsConfig.get("background").has("blur")) {
                    backgroundNode.set("blur", operationsConfig.get("background").get("blur").deepCopy());
                }
                operationsNode.set("background", backgroundNode);
            }

            // Validate that we have at least one operation
            if (operationsNode.isEmpty()) {
                logger.error("[Request {}] No valid operations found in config hash: {}", requestId, configHash);
                throw new RuntimeException("No valid operations found in enhancement configuration");
            }

            requestBody.set("operations", operationsNode);
            
            // Log the final request body
            logger.info("[Request {}] Final request to enhancement API:\n{}", requestId, 
                objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(requestBody));

            HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);

            // Call the enhancement API
            logger.info("[Request {}] Sending request to enhancement API: {}", requestId, claidApiUrl);
            String enhancementResponse = restTemplate.postForObject(
                    claidApiUrl,
                    request,
                    String.class);

            // Parse and validate the response
            JsonNode responseJson = objectMapper.readTree(enhancementResponse);
            logger.info("[Request {}] Received enhancement API response:\n{}", requestId, 
                objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(responseJson));

            JsonNode dataNode = responseJson.get("data");
            if (dataNode != null) {
                JsonNode outputNode = dataNode.get("output");
                if (outputNode != null && outputNode.has("tmp_url")) {
                    String enhancedUrl = outputNode.get("tmp_url").asText();
                    logger.info("[Request {}] Successfully enhanced image. Enhanced URL: {}", requestId, enhancedUrl);
                    logger.info("=== ENHANCEMENT REQUEST COMPLETE ===\n");
                    return enhancedUrl;
                }
            }

            logger.error("[Request {}] Invalid response from enhancement API", requestId);
            throw new RuntimeException("Invalid response from enhancement API");

        } catch (Exception e) {
            logger.error("[Request {}] Error enhancing image: {}", requestId, e.getMessage(), e);
            logger.info("=== ENHANCEMENT REQUEST FAILED ===\n");
            throw new RuntimeException("Failed to enhance image: " + e.getMessage());
        }
    }
}