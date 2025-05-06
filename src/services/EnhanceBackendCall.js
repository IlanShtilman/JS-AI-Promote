
const BACKEND_ENHANCE_URL = 'http://localhost:8081/api/image/enhance';
const EnhanceBackendCall = async (imageUrl) => {
    try{
        const response = await fetch(BACKEND_ENHANCE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl }),
        });
        console.log(response);
        // Check if the response is okl
        if (response.ok) {
            const data = await response.json();
            return { data: { enhancedUrl: data.enhancedImageUrl } };
        } else {
            const errorData = await response.json();
            console.error('Error enhancing image:', errorData);
            return { error: `Error enhancing image: ${errorData.error || response.statusText}` }; // Adjust error message access
        }
    } catch (error) {
        console.error('Error enhancing image:', error);
        return { error: 'Network error during image enhancement.' };
    }
}

export default EnhanceBackendCall;