
const BACKEND_ENHANCE_URL = 'http://localhost:8081/enhanceImage';
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
            return { data };
        } else {
            const errorData = await response.json();
            console.error('Error enhancing image:', errorData);
            return { error: `Error enhancing image: ${errorData.error.message || response.statusText}` };
        }
    } catch (error) {
        console.error('Error enhancing image:', error);
        return { error: 'Network error during image enhancement.' };
    }
}

export default EnhanceBackendCall;