import React, { useState } from 'react';
import './ImageEnhance.css';
import useImageToCloudinary from '../../utils/useImageToCloudinary';
import EnhanceBackendCall from '../../services/EnhanceBackendCall';
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const ImageEnhance = ({ onClose }) => {
  const [image, setImage] = useState(null);
  const { uploadedImageUrl, uploading, uploadError, uploadImage } = useImageToCloudinary(UPLOAD_PRESET);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState('');
  const [enhanceError, setEnhanceError] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      uploadImage(file);
      setEnhancedImageUrl('');
      setEnhanceError('');
    }
  };

  const handleEnhanceImage = async () => {
    if (uploadedImageUrl) {
      setEnhancing(true);
      setEnhanceError('');
      console.log("uploading Image to a temporary cloudinary url :" + uploadedImageUrl);

      const result = await EnhanceBackendCall(uploadedImageUrl);
      console.log("result from the backend :" + result);
      if (result.data && result.data.enhancedUrl) {
        setEnhancedImageUrl(result.data.enhancedUrl);
        console.log('Enhanced image URL:', result.data.enhancedUrl);
      } else if (result.error) {
        setEnhanceError(result.error);
      } else {
        setEnhanceError('Backend response did not contain enhanced image URL.');
      }

      setEnhancing(false);
    } else {
      setEnhanceError('No image has been uploaded yet.');
    }
  };

  return (
    <>
      <div className="image-enhance-overlay" onClick={onClose} />
      <div className="image-enhance-container">
        {!image ? (
          <div className="upload-section">
            <h2>Upload an Image to Enhance</h2>
            <label className="file-upload-label">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
            </label>
          </div>
        ) : (
          <>
            <div className="image-preview-container">
              <div className="image-preview">
                <h3>Original Image</h3>
                <img
                  src={image}
                  alt="Selected Image"
                  className="selected-image"
                />
              </div>

              <div className="image-preview">
                <h3>Enhanced Image</h3>
                {enhancedImageUrl ? (
                  <img
                    src={enhancedImageUrl}
                    alt="Enhanced Image"
                    className="enhanced-image"
                  />
                ) : (
                  <div className="enhanced-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                    {enhancing ? 'Enhancing...' : 'Enhanced image will appear here'}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleEnhanceImage}
              className="enhance-button"
              disabled={uploading || !uploadedImageUrl || enhancing}
            >
              {enhancing ? 'Enhancing...' : 'Enhance Image'}
            </button>
          </>
        )}

        {enhanceError && <p className="error-message">{enhanceError}</p>}

        <div className="action-buttons">
          <button className="exit-button" onClick={onClose}>
            Exit
          </button>
          {enhancedImageUrl && (
            <button 
              className="accept-button"
              onClick={onClose}
            >
              Accept
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageEnhance;