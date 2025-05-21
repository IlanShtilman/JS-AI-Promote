import React, { useState, useEffect, useCallback } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import './ImageEnhance.css';
import useImageToCloudinary from '../../utils/useImageToCloudinary';
import EnhanceBackendCall from '../../services/EnhanceBackendCall';

const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const ImageEnhance = ({ onClose, onImageEnhanced }) => {
  const [image, setImage] = useState(null);
  const { uploadedImageUrl, uploading, uploadError, uploadImage, resetUpload } = useImageToCloudinary(UPLOAD_PRESET);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState('');
  const [enhanceError, setEnhanceError] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [enhancementKey, setEnhancementKey] = useState(0); // Key to force re-enhancement

  // Reset all states when image changes
  const resetStates = useCallback(() => {
    setEnhancedImageUrl('');
    setEnhanceError('');
    setImagesLoaded(false);
    setImageLoadError(false);
    setEnhancing(false);
    resetUpload();
  }, [resetUpload]);

  // Function to preload an image
  const preloadImage = useCallback((url) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject(new Error('Invalid image URL'));
        return;
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (img.width === 0 || img.height === 0) {
          reject(new Error('Invalid image dimensions'));
          return;
        }
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }, []);

  // Validate and preload images
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const validateAndPreloadImages = async () => {
      if (!image || !enhancedImageUrl) {
        setImagesLoaded(false);
        return;
      }

      try {
        setImageLoadError(false);

        timeoutId = setTimeout(() => {
          if (isMounted) {
            setImageLoadError(true);
            setEnhanceError('Image loading timed out');
          }
        }, 30000);

        const [originalBlob, enhancedBlob] = await Promise.all([
          fetch(image).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch original image: ${res.status}`);
            return res.blob();
          }),
          fetch(enhancedImageUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch enhanced image: ${res.status}`);
            return res.blob();
          })
        ]);

        if (originalBlob.size === 0 || enhancedBlob.size === 0) {
          throw new Error('Invalid image data received');
        }

        await Promise.all([
          preloadImage(image),
          preloadImage(enhancedImageUrl)
        ]);

        if (isMounted) {
          clearTimeout(timeoutId);
          setImagesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading images:', error);
        if (isMounted) {
          clearTimeout(timeoutId);
          setImagesLoaded(false);
          setImageLoadError(true);
          setEnhanceError(`Error loading images: ${error.message}`);
        }
      }
    };

    validateAndPreloadImages();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [image, enhancedImageUrl, preloadImage, enhancementKey]); // Added enhancementKey dependency

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (image) {
        URL.revokeObjectURL(image);
      }
      const imageUrl = URL.createObjectURL(file);
      resetStates();
      setImage(imageUrl);
      uploadImage(file);
      setEnhancementKey(prev => prev + 1); // Force re-enhancement
    }
  };

  const handleEnhanceImage = async () => {
    if (uploadedImageUrl) {
      setEnhancing(true);
      setEnhanceError('');
      setImagesLoaded(false);
      setImageLoadError(false);
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

  const handleRemoveImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }
    resetStates();
    setImage(null);
    setEnhancementKey(prev => prev + 1); // Force re-enhancement on next upload
  };

  useEffect(() => {
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const renderImageComparison = () => {
    if (!image || !enhancedImageUrl || !imagesLoaded || imageLoadError) {
      return null;
    }

    return (
      <div className="image-comparison-container">
        <div className="comparison-labels">
          <span className="label original-label">Original</span>
          <span className="label enhanced-label">Enhanced</span>
        </div>
        <ReactCompareSlider
          key={enhancementKey}
          className="image-comparison-slider"
          itemOne={
            <ReactCompareSliderImage 
              src={image}
              alt="Original image"
              style={{ 
                objectFit: 'contain',
                backgroundColor: '#f5f5f5',
                transform: 'none',
                maxHeight: '600px'
              }}
            />
          }
          itemTwo={
            <ReactCompareSliderImage 
              src={enhancedImageUrl}
              alt="Enhanced image"
              style={{ 
                objectFit: 'contain',
                backgroundColor: '#f5f5f5',
                transform: 'none',
                maxHeight: '600px'
              }}
            />
          }
          portrait={false}
          position={50}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>
    );
  };

  const renderLoadingOrError = () => {
    if (enhancing) {
      return <div className="enhancing-overlay">Enhancing...</div>;
    }
    if (imageLoadError) {
      return <div className="error-message">Error loading images. Please try again.</div>;
    }
    if (!imagesLoaded && enhancedImageUrl) {
      return <div className="enhancing-overlay">Loading comparison...</div>;
    }
    return null;
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
                  <>
                    {renderImageComparison()}
                    {renderLoadingOrError()}
                  </>
                ) : (
                  <div className="only-original">
                    <img 
                      src={image} 
                      alt="Original" 
                      className="original-full-image"
                      onError={(e) => {
                        console.error('Error loading original image:', e);
                        setEnhanceError('Error loading original image');
                        setImageLoadError(true);
                      }}
                    />
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
              disabled={uploading || !uploadedImageUrl || enhancing || imageLoadError}
            >
              {enhancing ? 'Enhancing...' : 'Enhance Image'}
            </button>
          </>
        )}

        {enhanceError && <p className="error-message">{enhanceError}</p>}

        <div className="action-buttons">
          <button className="exit-button" onClick={onClose}>Exit</button>
          {enhancedImageUrl && imagesLoaded && !imageLoadError && (
            <button 
              className="accept-button" 
              onClick={() => {
                onImageEnhanced && onImageEnhanced(enhancedImageUrl);
                onClose();
              }}
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
