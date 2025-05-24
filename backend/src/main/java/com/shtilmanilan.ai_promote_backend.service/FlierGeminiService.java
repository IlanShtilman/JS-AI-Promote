import com.fasterxml.jackson.databind.ObjectMapper;
import com.shtilmanilan.ai_promote_backend.service.ColorMindService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


@Service
public class FlierGeminiService {
    private static final Logger logger = LoggerFactory.getLogger(FlierGeminiService.class);

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ColorMindService colorMindService;

    public FlierGeminiService(RestTemplate restTemplate, ObjectMapper objectMapper, ColorMindService colorMindService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.colorMindService = colorMindService;
    }

    /**
     * Helper method to extract JSON from text that might contain markdown or other formatting
     */
    private String extractJsonFromText(String text) {
        if (text == null) return null;
        
        String trimmedText = text.trim();
        
        // Prioritize finding JSON within a markdown code block
        if (trimmedText.contains("```json")) {
            int startIndex = trimmedText.indexOf("```json") + 7;
            int endIndex = trimmedText.indexOf("```", startIndex);
            if (endIndex > startIndex) {
                return trimmedText.substring(startIndex, endIndex).trim();
            }
        }
        
        // Also check for a generic code block if json is not specified
         if (trimmedText.contains("```")) {
            int startIndex = trimmedText.indexOf("```") + 3;
            int endIndex = trimmedText.indexOf("```", startIndex);
            if (endIndex > startIndex) {
                return trimmedText.substring(startIndex, endIndex).trim();
            }
        }

        // If no code block, look for a standalone JSON array or object
        int firstBracket = trimmedText.indexOf('[');
        int firstBrace = trimmedText.indexOf('{');
        int lastBracket = trimmedText.lastIndexOf(']');
        int lastBrace = trimmedText.lastIndexOf('}');

        // Check for a valid array structure
        if (firstBracket != -1 && lastBracket > firstBracket) {
             return trimmedText.substring(firstBracket, lastBracket + 1);
        }

        // Check for a valid object structure
        if (firstBrace != -1 && lastBrace > firstBrace) {
            return trimmedText.substring(firstBrace, lastBrace + 1);
        }

        // If no clear JSON structure is found, return null or empty string
        return null; // Return null if likely not JSON
    }
}