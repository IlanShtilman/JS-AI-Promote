import { useState } from 'react';

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

const useImageToCloudinary = (uploadPreset) => {
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
  
    const uploadImage = async (file) => {
      if (!file || !process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || !uploadPreset) {
        console.error('Cloud Name, Upload Preset, or File not provided.');
        setUploadError('Missing configuration or file.');
        return;
      }
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      setUploading(true);
      setUploadError('');
      setUploadedImageUrl('');
  
      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          setUploadedImageUrl(data.secure_url);
        } else {
          const errorData = await response.json();
          console.error('Error uploading image:', errorData);
          setUploadError(`Error uploading image: ${errorData.error.message || response.statusText}`);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadError('Network error during image upload.');
      } finally {
        setUploading(false);
      }
    };
  
    return { uploadedImageUrl, uploading, uploadError, uploadImage };
  };

export default useImageToCloudinary;