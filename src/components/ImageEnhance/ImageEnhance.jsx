import React, { useState } from 'react';
import './ImageEnhance.css';
import useImageToCloudinary from '../../utils/useImageToCloudinary';
import EnhanceBackendCall from '../../services/EnhanceBackendCall';
import ReactCompareImage from 'react-compare-image'; // New

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
      console.log("Uploading to temporary Cloudinary URL: " + uploadedImageUrl);

      try {
        const result = await EnhanceBackendCall(uploadedImageUrl);
        console.log("Backend result:", result);
        if (result?.data?.enhancedUrl) {
          setEnhancedImageUrl(result.data.enhancedUrl);
        } else if (result?.error) {
          setEnhanceError(result.error);
        } else {
          setEnhanceError('Backend response did not contain enhanced image URL.');
        }
      } catch (error) {
        setEnhanceError('An unexpected error occurred during enhancement.');
        console.error("Enhance API call failed:", error);
      } finally {
        setEnhancing(false);
      }
    } else {
      setEnhanceError('No image has been uploaded yet.');
    }
  };

  // Function to remove the image
  const handleRemoveImage = () => {
    setImage(null);
    setEnhancedImageUrl('');
    setEnhanceError('');
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
              <h3>Before & After</h3>
              <div className="before-after-wrapper">
                {enhancedImageUrl ? (
                  <ReactCompareImage
                    leftImage={image}
                    rightImage={enhancedImageUrl}
                    leftImageLabel="Original"
                    rightImageLabel="Enhanced"
                    sliderLineColor="#333"
                    sliderLineWidth={2}
                    handleSize={30}
                  />
                ) : enhancing ? (
                  <div className="enhancing-overlay">Enhancing...</div>
                ) : (
                  <div className="only-original">
                    <img src={image} alt="Original" className="original-full-image" />
                    <div className="image-label original-label">Original</div>
                    {/* Add the "X" button to remove the image */}
                    <button className="remove-image-button" onClick={handleRemoveImage}>
                      X
                    </button>
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
          <button className="exit-button" onClick={onClose}>Exit</button>
          {enhancedImageUrl && (
            <button className="accept-button" onClick={onClose}>Accept</button>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageEnhance;
