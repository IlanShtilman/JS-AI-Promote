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
import java.util.Arrays;

@Service
public class ImageEnhancementService {
    private static final Logger logger = LoggerFactory.getLogger(ImageEnhancementService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;
    private final GPT4Service gpt4Service;

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
    public ImageEnhancementService(RestTemplate restTemplate, GPT4Service gpt4Service) {
        this.restTemplate = restTemplate;
        this.gpt4Service = gpt4Service;
    }

    public String enhanceImage(String imageUrl) {
        String requestId = java.util.UUID.randomUUID().toString().substring(0, 8);
        logger.info("\n\n=== ENHANCEMENT REQUEST START ===");
        logger.info("[Request {}] Starting enhancement for image: {}", requestId, imageUrl);
        
        try {
            logger.info("\n\nDEBUG: Starting image enhancement process for image: {}\n\n", imageUrl);

            // Create a more specific prompt for GPT-4 Vision that encourages varied responses
            String imageEnhancementPrompt = String.format(
                "You are a highly skilled image enhancement AI. Your task is to analyze the provided image URL and generate precise, image-specific enhancement settings.%n%n" +
                "Image URL: %s%n%n" +
                "IMPORTANT GUIDELINES:%n" +
                "clean your memory before starting the task%n" +
                "1. First, analyze the image type and content from the URL:%n" +
                "   - Is it a photo, artwork, product image, or something else?%n" +
                "   - What are the main subjects or elements in the image?%n" +
                "   - What is the current quality level (low, medium, high)?%n" +
                "   - What are the specific issues that need enhancement?%n%n" +
                "2. Based on your analysis, provide UNIQUE enhancement settings that:%n" +
                "   - Match the specific needs of THIS image%n" +
                "   - Use varied values based on image content%n" +
                "   - **Favor subtle and natural-looking improvements** over aggressive changes%n" +
                "   - Avoid applying enhancements too strongly — use **moderate or light adjustments**%n" +
                "   - Preserve the original style while improving quality%n" +
                "   - For HDR, exposure, contrast, sharpness, and saturation:%n" +
                "    - Use values closer to neutral unless the image clearly needs more%n" +
                "3. CRITICAL: For upscale, you MUST ONLY use one of these exact values:%n" +
                "   - 'null' - for no upscale - to see the full image%n" +
                "   - 'photo' - Used on photos of people, nature, architecture, etc. taken with phones or digital cameras.%n" +
                "   - 'faces' - Used on images containing people %n" +
                "   - 'digital_art' -Used on drawings, illustrations, paintings, cartoons, anime, etc.%n" +
                "   - 'smart_enhance' - Used on small low quality product, real estate and food images.%n" +
                "   - 'smart_resize' - Used on high-quality images and photos with barely readable text. %n%n" +
                "4. For upscale, you MUST ONLY use one of these exact values:%n" +
                "   - 'null' - for no upscale - to see the full image%n" +
                "   - 'photo' - Used on photos of people, nature, architecture, etc. taken with phones or digital cameras.%n" +
                "   - 'faces' - Used on images containing people %n" +
                "   - 'digital_art' -Used on drawings, illustrations, paintings, cartoons, anime, etc.%n" +
                "   - 'smart_enhance' - Used on small low quality product, real estate and food images.%n" +
                "   - 'smart_resize' - Used on high-quality images and photos with barely readable text. %n%n" +
                "5.  For Decompress use: %n" +
                "   - 'moderate' - Removes JPEG artifacts from the image.%n" +
                "   - 'strong' - Removes JPEG artifacts more aggressively than moderate.%n" +
                "   - 'auto' - Automatically detects and removes JPEG artifacts if needed.%n" +
                " For Resizing Fit: %n" +
                "   - 'crop' -DEFAULT. Scales an image until it fully covers the specified width and height, the rest gets cropped. Content-aware cropping. %n" +
                "   - 'bounds' - Scales an image until the larger side reaches the edge of canvas established by width and height. %n"+
                "   - 'cover' - Scales an image until the smaller side reaches the edge of canvas established by width and height. %n" +
                "   - 'canvas' - Puts input image on the canvas established by width and height. Aspect ratio and size of the input image won't change. Extra space will be filled with the specified background color. %n" +
                "   - 'outpaint' - Scales an image until the larger side reaches the edge of canvas established by width and height, then fills the extra space with a generated coherent background. %n"+
                " If you choose crop, you must use the following values: %n" +
                "   - 'center' - is a basic cropping mode that crops images from their center without considering their content. %n" +
                "   - 'smart' -  is a content-aware cropping mode that detects a main object in a photo and uses it as the center point for cropping. %n" +
                "Manual Color Adjustments: %n" +
                "    - 'hdr' - Balance out colors and lighting. Supports changing the intensity of operation. 100 is most recommended%n" +
                "    - 'exposure' - Decrease (negative integer) or increase (positive) exposure. Range: -100 - 100, DO NOT use rounded values unless needed%n" +
                "    - 'saturation' - Decrease (negative integer) or increase (positive) exposure. Range: -100 - 100, DO NOT use rounded values unless needed%n" +
                "    - 'contrast' - Decrease (negative integer) or increase (positive) exposure.Range: -100 - 100, DO NOT use rounded values unless needed%n" +
                "    - 'sharpness' - Increase sharpness by using positive integer .Range: 0 - 100, DO NOT use rounded values unless needed%n" +
                "   - IMPORTANT: Use DIFFERENT values for each image.%n" +
                "   - Avoid using the same numeric values more than once.%n" +
                "   - Use subtle, unique variations for each image.%n" +
                "   - Do not default to the same group of values across all images.%n" +
                "   - Every image should feel individually considered.%n" +
                "   - Be careful with sharpness, it can be overused.%n%n" +
                "   - dont use rounded values unless needed%n" +
                "   - if the image is blurry, DO NOT use the blur option and icrease HDR intensity to make the image pop more%n" +
                "   - if the image is blurry, use \"decompress\": \"strong\" %n" +
                "5. Return ONLY a JSON object in this exact format:%n" +
                "{%n" +
                "  \"operations\": {%n" +
                "    \"restorations\": {%n" +
                "      \"upscale\": \"photo\",        (choose:photo, faces, digital_art, smart_enhance, smart_resize)%n" +
                "      \"decompress\": \"strong\",   (use: moderate or strong)%n" +
                "      \"polish\": true              (use: true or false)%n" +
                "    },%n" +
                "    \"resizing\": {%n" +
                "      \"width\": \"auto\",           (use: number, \"auto\", or \"150%%\")%n" +
                "      \"height\": 500,              (use: number, \"auto\", or \"150%%\")%n" +
                "      \"fit\": \"bounds\"            (use: bounds, cover, canvas, outpaint, crop,%n" +
                "                                    or {\"type\": \"crop\", \"crop\": \"center\"},%n" +
                "                                    or {\"type\": \"outpaint\", \"feathering\": \"15%%\"})%n" +
                "    },%n" +
                "    \"adjustments\": {%n" +
                "      \"hdr\": {%n" +
                "        \"intensity\": 50,%n (use: integer between 0 to 100 , DO NOT use rounded values unless needed)%n"  +
                "        \"stitching\": true%n (use: true or false)%n" +
                "      },%n" +
                "      (you can use values from -100 to 100 for each setting  )%n" +       
                "      \"exposure\": 0%n (Decrease (negative integer) or increase (positive) exposure. Range: -100 - 100, DO NOT use rounded values unless needed)%n"  +
                "      \"saturation\": 0%n (Decrease (negative integer) or increase (positive) exposure. Range: -100 - 100, DO NOT use rounded values unless needed)%n" +
                "      \"contrast\": 0%n (Decrease (negative integer) or increase (positive) exposure.Range: -100 - 100, DO NOT use rounded values unless needed)%n" +
                "      \"sharpness\": 0%n (Increase sharpness by using positive integer .Range: 0 - 100, DO NOT use rounded values unless needed)%n" +
                "    },%n" +
                "      \"generative\": {%n" +
                "        \"style_transfer\": {%n" +
                "          \"style_reference_image\": \"%s\",%n" +
                "          \"prompt\": \"enhance image quality with natural texture, vivid but realistic colors, and improved clarity\",%n" +
                "          \"style_strength\": 0.75,%n" +
                "          \"denoising_strength\": 0.75,%n" +
                "          \"depth_strength\": 1.0%n" +
                "        }%n" +
                "      },%n" +
                "    \"background\": null | {%n (if the image is blurry, DO NOT use the blur option)" +
                "      \"remove\": false | true | {%n" +
                "        \"category\": \"general\" | \"cars\" | \"products\",%n" +
                "        \"selective\": {%n" +
                "          \"object_to_keep\": \"<object>\"%n" +
                "        },%n" +
                "        \"clipping\": false | true%n" +
                "      },%n" +
                "      \"blur\": false | true  {%n" +
                "        \"category\": \"general\" | \"cars\" | \"products\",%n" +
                "        \"selective\": {%n" +
                "          \"object_to_keep\": \"<object>\"%n" +
                "        },%n" +
                "        \"type\": \"regular\" | \"lens\",%n" +
                "        \"level\": \"low\" %n" +
                "      },%n" +
                "      \"color\": \"#ffffff\" | \"<color-hex>\" | \"transparent\"%n" +
                "    },%n" +
                "    \"padding\": null | \"10%%\" | \"5%% 25%%\",%n" +
                "    \"privacy\": {%n" +
                "      \"blur_car_plate\": false | true%n" +
                "    }%n" +
                "      }%n" +
                "    }%n" +
                "  }%n" +
                "}%n%n" +
                "Note: All sections can be null or omitted if not needed.%n" +
                "Ensure proper JSON formatting with quotes and commas.%n",
                imageUrl,imageUrl
            );

            logger.info("[Request {}] Sending prompt to GPT-4 Vision:\n{}", requestId, imageEnhancementPrompt);

            // Generate enhancement instructions using GPT-4 Vision with higher temperature for more variation
            TextGenerationRequest requestPromptClaid = new TextGenerationRequest();
            requestPromptClaid.setPrompt(imageEnhancementPrompt);
            requestPromptClaid.setTemperature(0.7); // Increased temperature for more variation
            TextGenerationResponse aiResponse = gpt4Service.generateText(requestPromptClaid);
            String responseText = aiResponse.getGeneratedText();
            
            logger.info("[Request {}] Received GPT-4 Vision response:\n{}", requestId, responseText);
            
            // Validate and clean the response text
            if (responseText == null || responseText.trim().isEmpty()) {
                logger.error("[Request {}] GPT-4 Vision response was empty", requestId);
                throw new RuntimeException("GPT-4 Vision response was null or empty for image: " + imageUrl);
            }

            // Remove markdown formatting if present
            responseText = responseText.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "").trim();
            logger.info("[Request {}] Cleaned GPT-4 Vision response:\n{}", requestId, responseText);

            // Parse enhancement configuration from GPT-4 Vision response
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

            // Validate upscale value
            if (operationsConfig.has("restorations") && 
                operationsConfig.get("restorations").has("upscale")) {
                String upscaleValue = operationsConfig.get("restorations").get("upscale").asText();
                if (!Arrays.asList("photo", "faces", "digital_art", "smart_enhance", "smart_resize")
                        .contains(upscaleValue)) {
                    logger.error("[Request {}] Invalid upscale value: {}", requestId, upscaleValue);
                    throw new RuntimeException("Invalid upscale value. Must be one of: photo, faces, digital_art, smart_enhance, smart_resize");
                }
            }

            // Validate background configuration
            if (operationsConfig.has("background")) {
                JsonNode backgroundNode = operationsConfig.get("background");
                if (!backgroundNode.isNull()) {
                    // Validate remove configuration
                    if (backgroundNode.has("remove")) {
                        JsonNode removeNode = backgroundNode.get("remove");
                        if (removeNode.isBoolean()) {
                            // Simple boolean case is valid
                        } else if (removeNode.isObject()) {
                            // Validate remove object structure
                            if (removeNode.has("category")) {
                                String category = removeNode.get("category").asText();
                                if (!Arrays.asList("general", "cars", "products").contains(category)) {
                                    throw new RuntimeException("Invalid remove category. Must be one of: general, cars, products");
                                }
                            }
                            if (removeNode.has("selective")) {
                                JsonNode selectiveNode = removeNode.get("selective");
                                if (!selectiveNode.has("object_to_keep") || !selectiveNode.get("object_to_keep").isTextual()) {
                                    throw new RuntimeException("Remove selective must have object_to_keep as text");
                                }
                            }
                            if (removeNode.has("clipping")) {
                                if (!removeNode.get("clipping").isBoolean()) {
                                    throw new RuntimeException("Remove clipping must be boolean");
                                }
                            }
                        } else {
                            throw new RuntimeException("Remove must be boolean or object");
                        }
                    }

                    // Validate blur configuration
                    if (backgroundNode.has("blur")) {
                        JsonNode blurNode = backgroundNode.get("blur");
                        if (blurNode.isBoolean()) {
                            // Simple boolean case is valid
                        } else if (blurNode.isObject()) {
                            // Validate blur object structure
                            if (blurNode.has("category")) {
                                String category = blurNode.get("category").asText();
                                if (!Arrays.asList("general", "cars", "products").contains(category)) {
                                    throw new RuntimeException("Invalid blur category. Must be one of: general, cars, products");
                                }
                            }
                            if (blurNode.has("selective")) {
                                JsonNode selectiveNode = blurNode.get("selective");
                                if (!selectiveNode.has("object_to_keep") || !selectiveNode.get("object_to_keep").isTextual()) {
                                    throw new RuntimeException("Blur selective must have object_to_keep as text");
                                }
                            }
                            if (blurNode.has("type")) {
                                String type = blurNode.get("type").asText();
                                if (!Arrays.asList("regular", "lens").contains(type)) {
                                    throw new RuntimeException("Invalid blur type. Must be one of: regular, lens");
                                }
                            }
                            if (blurNode.has("level")) {
                                String level = blurNode.get("level").asText().trim();
                                if (!Arrays.asList("low", "medium", "high").contains(level)) {
                                    throw new RuntimeException("Invalid blur level. Must be one of: low, medium, high");
                                }
                            }
                        } else {
                            throw new RuntimeException("Blur must be boolean or object");
                        }
                    }

                    // Validate color configuration
                    if (backgroundNode.has("color")) {
                        String color = backgroundNode.get("color").asText();
                        if (!color.equals("transparent") && !color.matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")) {
                            throw new RuntimeException("Invalid color value. Must be 'transparent' or a valid hex color code");
                        }
                    }

                    // Validate that at least one property exists
                    if (!backgroundNode.has("remove") && !backgroundNode.has("blur") && !backgroundNode.has("color")) {
                        throw new RuntimeException("Background object must contain at least one of: remove, blur, or color");
                    }
                }
            }

            // Validate padding configuration
            if (operationsConfig.has("padding") && !operationsConfig.get("padding").isNull()) {
                String padding = operationsConfig.get("padding").asText();
                // Validate padding format: either single percentage or two percentages
                if (!padding.matches("^\\d+%") && !padding.matches("^\\d+%\\s+\\d+%$")) {
                    throw new RuntimeException("Invalid padding format. Must be either 'X%' or 'X% Y%'");
                }
            }

            // Validate privacy configuration
            if (operationsConfig.has("privacy")) {
                JsonNode privacyNode = operationsConfig.get("privacy");
                if (!privacyNode.isNull()) {
                    // Validate blur_car_plate
                    if (privacyNode.has("blur_car_plate")) {
                        if (!privacyNode.get("blur_car_plate").isBoolean()) {
                            throw new RuntimeException("blur_car_plate must be a boolean value");
                        }
                    }
                    
                    // Ensure privacy object is not empty
                    if (!privacyNode.has("blur_car_plate")) {
                        throw new RuntimeException("Privacy object must contain blur_car_plate property");
                    }
                }
            }

            // Validate generative configuration
            if (operationsConfig.has("generative") && !operationsConfig.get("generative").isNull()) {
                JsonNode generativeNode = operationsConfig.get("generative");
                
                // Validate style_transfer configuration
                if (generativeNode.has("style_transfer") && !generativeNode.get("style_transfer").isNull()) {
                    JsonNode styleTransferNode = generativeNode.get("style_transfer");
                    
                    // Validate style_reference_image
                    if (styleTransferNode.has("style_reference_image")) {
                        if (!styleTransferNode.get("style_reference_image").isTextual()) {
                            throw new RuntimeException("style_reference_image must be a string URL");
                        }
                    }
                    
                    // Validate prompt
                    if (styleTransferNode.has("prompt") && !styleTransferNode.get("prompt").isNull()) {
                        if (!styleTransferNode.get("prompt").isTextual()) {
                            throw new RuntimeException("prompt must be a string");
                        }
                    }
                    
                    // Validate style_strength
                    if (styleTransferNode.has("style_strength") && !styleTransferNode.get("style_strength").isNull()) {
                        double styleStrength = styleTransferNode.get("style_strength").asDouble();
                        if (styleStrength < 0.0 || styleStrength > 1.0) {
                            throw new RuntimeException("style_strength must be between 0.0 and 1.0");
                        }
                    }
                    
                    // Validate denoising_strength
                    if (styleTransferNode.has("denoising_strength") && !styleTransferNode.get("denoising_strength").isNull()) {
                        double denoisingStrength = styleTransferNode.get("denoising_strength").asDouble();
                        if (denoisingStrength < 0.0 || denoisingStrength > 1.0) {
                            throw new RuntimeException("denoising_strength must be between 0.0 and 1.0");
                        }
                    }
                    
                    // Validate depth_strength
                    if (styleTransferNode.has("depth_strength") && !styleTransferNode.get("depth_strength").isNull()) {
                        double depthStrength = styleTransferNode.get("depth_strength").asDouble();
                        if (depthStrength < 0.0 || depthStrength > 1.0) {
                            throw new RuntimeException("depth_strength must be between 0.0 and 1.0");
                        }
                    }
                }
            }

            // Validate resizing configuration
            if (operationsConfig.has("resizing") && !operationsConfig.get("resizing").isNull()) {
                JsonNode resizingNode = operationsConfig.get("resizing");
                
                // Validate width
                if (resizingNode.has("width")) {
                    JsonNode widthNode = resizingNode.get("width");
                    if (!widthNode.isNull() && !widthNode.isNumber() && 
                        !widthNode.asText().equals("auto") && !widthNode.asText().matches("\\d+%")) {
                        throw new RuntimeException("Invalid width value. Must be null, 'auto', a number, or a percentage (e.g., '150%')");
                    }
                }
                
                // Validate height
                if (resizingNode.has("height")) {
                    JsonNode heightNode = resizingNode.get("height");
                    if (!heightNode.isNull() && !heightNode.isNumber() && 
                        !heightNode.asText().equals("auto") && !heightNode.asText().matches("\\d+%")) {
                        throw new RuntimeException("Invalid height value. Must be null, 'auto', a number, or a percentage (e.g., '150%')");
                    }
                }
                
                // Validate fit
                if (resizingNode.has("fit")) {
                    JsonNode fitNode = resizingNode.get("fit");
                    if (fitNode.isTextual()) {
                        String fitValue = fitNode.asText();
                        if (!Arrays.asList("bounds", "cover", "canvas", "outpaint", "crop")
                                .contains(fitValue)) {
                            throw new RuntimeException("Invalid fit value. Must be one of: bounds, cover, canvas, outpaint, crop");
                        }
                    } else if (fitNode.isObject()) {
                        if (!fitNode.has("type")) {
                            throw new RuntimeException("Fit object must have a 'type' field");
                        }
                        String type = fitNode.get("type").asText();
                        if (type.equals("crop")) {
                            if (!fitNode.has("crop") || 
                                !Arrays.asList("center", "smart").contains(fitNode.get("crop").asText())) {
                                throw new RuntimeException("Invalid crop value. Must be 'center' or 'smart'");
                            }
                        } else if (type.equals("outpaint")) {
                            if (!fitNode.has("feathering") || 
                                !fitNode.get("feathering").asText().matches("\\d+%")) {
                                throw new RuntimeException("Invalid feathering value. Must be a percentage (e.g., '15%')");
                            }
                        } else {
                            throw new RuntimeException("Invalid fit type. Must be 'crop' or 'outpaint'");
                        }
                    } else {
                        throw new RuntimeException("Invalid fit value format");
                    }
                }
            }

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
            if (operationsConfig.has("resizing")) {
                operationsNode.set("resizing", operationsConfig.get("resizing").deepCopy());
            }
            if (operationsConfig.has("adjustments")) {
                operationsNode.set("adjustments", operationsConfig.get("adjustments").deepCopy());
            }
            if (operationsConfig.has("background") && !operationsConfig.get("background").isEmpty()) {
                JsonNode backgroundConfig = operationsConfig.get("background");
                if (backgroundConfig.has("blur") || backgroundConfig.has("remove") || backgroundConfig.has("color")) {
                    operationsNode.set("background", backgroundConfig.deepCopy());
                }
            }

            // Add generative configuration if present
            if (operationsConfig.has("generative") && !operationsConfig.get("generative").isNull()) {
                operationsNode.set("generative", operationsConfig.get("generative").deepCopy());
            }

            // Add output format configuration
            ObjectNode outputNode = objectMapper.createObjectNode();
            ObjectNode formatNode = objectMapper.createObjectNode();
            formatNode.put("type", "jpeg");
            formatNode.put("quality", 100);
            formatNode.put("progressive", true);
            outputNode.set("format", formatNode);
            requestBody.set("output", outputNode);

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
                JsonNode responseOutputNode = dataNode.get("output");
                if (responseOutputNode != null && responseOutputNode.has("tmp_url")) {
                    String enhancedUrl = responseOutputNode.get("tmp_url").asText();
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