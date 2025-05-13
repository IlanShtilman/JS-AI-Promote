const BACKEND_ENHANCE_URL = 'http://localhost:8081/api/image/enhance';

// Helper function to generate a short request ID
const generateRequestId = () => Math.random().toString(36).substring(2, 10);

const EnhanceBackendCall = async (imageUrl) => {
    const requestId = generateRequestId();
    console.log(`[Request ${requestId}] Starting enhancement for image:`, imageUrl);

    if (!imageUrl) {
        console.error(`[Request ${requestId}] No image URL provided for enhancement`);
        return { error: 'No image URL provided' };
    }

    try {
        // Add cache-busting parameter to prevent caching
        const timestamp = new Date().getTime();
        const urlWithCacheBuster = `${BACKEND_ENHANCE_URL}?_=${timestamp}`;

        const response = await fetch(urlWithCacheBuster, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Request-ID': requestId
            },
            body: JSON.stringify({ 
                imageUrl,
                requestId,
                timestamp 
            }),
            // Ensure no caching
            cache: 'no-store',
            // Add credentials if needed
            credentials: 'same-origin'
        });

        // Log response headers for debugging
        const configHash = response.headers.get('X-Config-Hash');
        console.log(`[Request ${requestId}] Received response with config hash:`, configHash);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
            console.error(`[Request ${requestId}] Error enhancing image:`, errorData);
            return { 
                error: `Error enhancing image: ${errorData.error || response.statusText}`,
                status: response.status,
                requestId,
                configHash
            };
        }

        const data = await response.json();
        if (!data.enhancedImageUrl) {
            console.error(`[Request ${requestId}] Invalid response format:`, data);
            return { 
                error: 'Invalid response format from server',
                requestId,
                configHash
            };
        }

        console.log(`[Request ${requestId}] Successfully enhanced image with config hash:`, configHash);
        return { 
            data: { 
                enhancedUrl: data.enhancedImageUrl,
                timestamp: new Date().toISOString(),
                requestId,
                configHash
            } 
        };
    } catch (error) {
        console.error(`[Request ${requestId}] Network error during image enhancement:`, error);
        return { 
            error: 'Network error during image enhancement',
            details: error.message,
            requestId
        };
    }
}

export default EnhanceBackendCall;