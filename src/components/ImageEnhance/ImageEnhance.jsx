import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ImageEnhance.css';
import useImageToCloudinary from '../../utils/useImageToCloudinary';
import EnhanceBackendCall from '../../services/EnhanceBackendCall';

const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

const ImageComparison = ({ leftImage, rightImage, leftLabel = "Original", rightLabel = "Enhanced" }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Update container size on mount and window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateSliderPosition(e);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateSliderPosition(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className="custom-image-comparison"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => {
        setIsDragging(true);
        updateSliderPosition(e.touches[0]);
      }}
      onTouchMove={(e) => {
        if (isDragging) {
          updateSliderPosition(e.touches[0]);
        }
      }}
      onTouchEnd={() => setIsDragging(false)}
    >
      <div className="comparison-container" style={{ height: containerSize.width * 0.75 }}>
        <div className="image-wrapper">
          <img 
            src={leftImage} 
            alt={leftLabel} 
            className="comparison-image left-image"
            onLoad={(e) => {
              const img = e.target;
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                const aspectRatio = img.naturalHeight / img.naturalWidth;
                const height = containerSize.width * aspectRatio;
                setContainerSize(prev => ({ ...prev, height }));
              }
            }}
          />
        </div>
        <div 
          className="comparison-overlay"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="image-wrapper">
            <img 
              src={rightImage} 
              alt={rightLabel} 
              className="comparison-image right-image"
            />
          </div>
        </div>
        <div 
          className="comparison-slider"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="slider-handle" />
        </div>
        <div className="comparison-labels">
          <span className="label left-label">{leftLabel}</span>
          <span className="label right-label">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};

const ImageEnhance = ({ onClose }) => {
  const [image, setImage] = useState(null);
  const { uploadedImageUrl, uploading, uploadError, uploadImage } = useImageToCloudinary(UPLOAD_PRESET);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState('');
  const [enhanceError, setEnhanceError] = useState('');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

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

  // Validate and preload both images
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
  }, [image, enhancedImageUrl, preloadImage]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      uploadImage(file);
      setEnhancedImageUrl('');
      setEnhanceError('');
      setImagesLoaded(false);
      setImageLoadError(false);
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
    setImage(null);
    setEnhancedImageUrl('');
    setEnhanceError('');
    setImagesLoaded(false);
    setImageLoadError(false);
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
        <ImageComparison
          leftImage={image}
          rightImage={enhancedImageUrl}
          leftLabel="Original"
          rightLabel="Enhanced"
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
    if (!imagesLoaded) {
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
                    <div className="image-label original-label">Original</div>
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
            <button className="accept-button" onClick={onClose}>Accept</button>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageEnhance;
