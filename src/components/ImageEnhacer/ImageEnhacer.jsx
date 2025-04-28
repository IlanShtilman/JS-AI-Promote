import React, { useState } from 'react';
import axios from 'axios';
import './ImageEnhacer.css';
import BackgroundDecorations from '../BackgroundDecorations/BackgroundDecorations';

// Add this function at the top of the file, before the ImageEnhancer component
const smoothScrollTo = (element, duration = 3000) => {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    // Easing function for smooth acceleration and deceleration
    const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    requestAnimationFrame(animation);
};

const ImageEnhancer = ({ initialImageUrl }) => {
    const [originalUrl, setOriginalUrl] = useState(initialImageUrl || '');
    const [enhancedUrl, setEnhancedUrl] = useState('');
    const [claidResponse, setClaidResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State for managing enhancement options
    const [enhancementOptions, setEnhancementOptions] = useState({
        upscale: 'smart_enhance',
        decompress: 'auto',
        polish: 'off',
        resizing: {
            width: 'auto',
            height: 'auto',
            unit: 'pixels'
        },
        fit: 'cover',
        adjustments: {
            hdr: 0,
            exposure: 0,
            saturation: 0,
            contrast: 0,
            sharpness: 0
        },
        outputFormat: {
            type: 'jpeg',
            quality: 100,
            progressive: true
        }
    });

    const upscaleOptions = [
        { value: 'smart_enhance', label: 'Smart Enhance' },
        { value: 'smart_resize', label: 'Smart Resize' },
        { value: 'photo', label: 'Photo' },
        { value: 'faces', label: 'Faces' },
        { value: 'digital_art', label: 'Digital Art' },
        { value: 'none', label: 'None' }
    ];

    const decompressOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'strong', label: 'Strong' },
        { value: 'none', label: 'None' }
    ];

    const polishOptions = [
        { value: 'off', label: 'Off' },
        { value: 'on', label: 'On' }
    ];

    const fitOptions = [
        { value: 'bounds', label: 'Bounds' },
        { value: 'crop', label: 'Smart Crop' },
        { value: 'cover', label: 'Cover' },
        { value: 'crop_center', label: 'Crop Center' },
        { value: 'canvas', label: 'Canvas' },
        { value: 'outpaint', label: 'Outpaint' }
    ];

    const outputFormatOptions = [
        { value: 'jpeg', label: 'JPEG' },
        { value: 'png', label: 'PNG' },
        { value: 'webp', label: 'WebP' },
        { value: 'avif', label: 'AVIF' }
    ];

    const handleOptionChange = (section, option, value) => {
        if (section === 'resizing') {
            setEnhancementOptions(prev => ({
                ...prev,
                resizing: {
                    ...prev.resizing,
                    [option]: value
                }
            }));
        } else if (section === 'adjustments') {
            const numericValue = parseInt(value);
            setEnhancementOptions(prev => ({
                ...prev,
                adjustments: {
                    ...prev.adjustments,
                    [option]: numericValue
                }
            }));
            // Update the slider's CSS variable
            const slider = document.querySelector(`input[type="range"][data-adjustment="${option}"]`);
            if (slider) {
                const percentage = ((numericValue + 100) / 200) * 100;
                slider.style.setProperty('--value', `${percentage}%`);
            }
        } else if (section === 'outputFormat') {
            setEnhancementOptions(prev => ({
                ...prev,
                outputFormat: {
                    ...prev.outputFormat,
                    [option]: option === 'quality' ? parseInt(value) : value
                }
            }));
        } else {
            setEnhancementOptions(prev => ({
                ...prev,
                [section]: value
            }));
        }
    };

    // Add a test function to check if the backend is running
    const testBackendConnection = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/test');
            console.log('Backend test response:', response.data);
            return true;
        } catch (err) {
            console.error('Backend connection test failed:', err);
            return false;
        }
    };

    const handleEnhance = async () => {
        try {
            setLoading(true);
            setEnhancedUrl('');
            setClaidResponse(null);
            setError('');

            const payload = {
                input: originalUrl,
                operations: {
                    "restorations": {
                        ...(enhancementOptions.upscale !== 'none' && {
                            "upscale": enhancementOptions.upscale
                        }),
                        ...(enhancementOptions.decompress !== 'none' && {
                            "decompress": enhancementOptions.decompress
                        }),
                        ...(enhancementOptions.polish === 'on' && {
                            "polish": true
                        })
                    },
                    "resizing": {
                        "width": enhancementOptions.resizing.width,
                        "height": enhancementOptions.resizing.height,
                        "fit": enhancementOptions.fit
                    },
                    "adjustments": {
                        "hdr": enhancementOptions.adjustments.hdr,
                        "exposure": enhancementOptions.adjustments.exposure,
                        "saturation": enhancementOptions.adjustments.saturation,
                        "contrast": enhancementOptions.adjustments.contrast,
                        "sharpness": enhancementOptions.adjustments.sharpness
                    }
                },
                output: {
                    "format": enhancementOptions.outputFormat
                },
            };

            const res = await axios.post('http://localhost:4000/api/enhance', payload);
            
            if (res.data && res.data.success && res.data.enhancedImageUrl) {
                setEnhancedUrl(res.data.enhancedImageUrl);
                setClaidResponse(res.data.rawResponse);
                // Scroll to results after a short delay to ensure the DOM is updated
                setTimeout(() => {
                    const resultsSection = document.getElementById('results-section');
                    if (resultsSection) {
                        const headerHeight = document.querySelector('.header-content')?.offsetHeight || 0;
                        const windowHeight = window.innerHeight;
                        const resultsHeight = resultsSection.offsetHeight;
                        
                        // Calculate position to show the full results section with extra space
                        const extraSpace = 100; // Add extra space below
                        const resultsPosition = resultsSection.offsetTop - headerHeight - (windowHeight - resultsHeight) / 2 + extraSpace;
                        
                        smoothScrollTo(resultsSection, 3000);
                    }
                }, 100);
            } else if (res.data?.output?.tmp_url) {
                setEnhancedUrl(res.data.output.tmp_url);
                setClaidResponse(res.data);
                setTimeout(() => {
                    const resultsSection = document.getElementById('results-section');
                    if (resultsSection) {
                        const headerHeight = document.querySelector('.header-content')?.offsetHeight || 0;
                        const windowHeight = window.innerHeight;
                        const resultsHeight = resultsSection.offsetHeight;
                        const extraSpace = 100;
                        const resultsPosition = resultsSection.offsetTop - headerHeight - (windowHeight - resultsHeight) / 2 + extraSpace;
                        smoothScrollTo(resultsSection, 3000);
                    }
                }, 100);
            } else if (res.data?.data?.output?.tmp_url) {
                setEnhancedUrl(res.data.data.output.tmp_url);
                setClaidResponse(res.data);
                setTimeout(() => {
                    const resultsSection = document.getElementById('results-section');
                    if (resultsSection) {
                        const headerHeight = document.querySelector('.header-content')?.offsetHeight || 0;
                        const windowHeight = window.innerHeight;
                        const resultsHeight = resultsSection.offsetHeight;
                        const extraSpace = 100;
                        const resultsPosition = resultsSection.offsetTop - headerHeight - (windowHeight - resultsHeight) / 2 + extraSpace;
                        smoothScrollTo(resultsSection, 3000);
                    }
                }, 100);
            } else {
                console.error("Could not extract enhanced image URL from response:", res.data);
                const errorMessage = res.data?.error || "Could not extract enhanced image URL from response";
                setError(errorMessage);
            }

        } catch (err) {
            console.error("Error in enhancement:", err);
            setError(`Failed to enhance image: ${err.response?.data?.error || err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BackgroundDecorations/>
            <div className="header-content">
                <h1>Claid AI Image Enhancer</h1>
                <p>Transform your images with AI-powered enhancement</p>
            </div>
            <div className="image-enhancer">
                {/* URL Input Section */}
                <div className="input-section">
                    <div className="url-input-container">
                        <input
                            type="text"
                            placeholder="Enter image URL"
                            value={originalUrl}
                            onChange={(e) => setOriginalUrl(e.target.value)}
                            className="url-input"
                        />
                        <button
                            onClick={handleEnhance}
                            className="enhance-button"
                            disabled={!originalUrl || loading}
                        >
                            {loading ? 'Enhancing...' : 'Enhance Image'}
                        </button>
                    </div>

                    {/* Enhancement Options Section */}
                    <div className="enhancement-options">
                        {/* First Row */}
                        <div className="options-row">
                            {/* Upscale Options */}
                            <div className="option-group">
                                <h3>Upscale Options</h3>
                                <select
                                    value={enhancementOptions.upscale}
                                    onChange={(e) => handleOptionChange('upscale', null, e.target.value)}
                                    className="option-select"
                                >
                                    <option value="smart_enhance">Smart Enhance</option>
                                    <option value="smart_resize">Smart Resize</option>
                                    <option value="photo">Photo</option>
                                    <option value="faces">Faces</option>
                                    <option value="digital_art">Digital Art</option>
                                    <option value="none">None</option>
                                </select>
                            </div>

                            {/* Decompress Options */}
                            <div className="option-group">
                                <h3>Decompress Options</h3>
                                <select
                                    value={enhancementOptions.decompress}
                                    onChange={(e) => handleOptionChange('decompress', null, e.target.value)}
                                    className="option-select"
                                >
                                    <option value="auto">Auto</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="strong">Strong</option>
                                    <option value="none">None</option>
                                </select>
                            </div>

                            {/* Polish Option */}
                            <div className="option-group">
                                <h3>Polish</h3>
                                <select
                                    value={enhancementOptions.polish}
                                    onChange={(e) => handleOptionChange('polish', null, e.target.value)}
                                    className="option-select"
                                >
                                    <option value="off">Off</option>
                                    <option value="on">On</option>
                                </select>
                            </div>
                        </div>

                        {/* Second Row */}
                        <div className="options-row">
                            {/* Resizing Options */}
                            <div className="option-group">
                                <h3>Resizing</h3>
                                <div className="resizing-options">
                                    <div className="resizing-input">
                                        <div className="size-input-container">
                                            <label className="size-label">Width</label>
                                            <input
                                                type="text"
                                                placeholder="Width"
                                                value={enhancementOptions.resizing.width}
                                                onChange={(e) => handleOptionChange('resizing', 'width', e.target.value)}
                                                className="size-input"
                                            />
                                        </div>
                                        <div className="size-input-container">
                                            <label className="size-label">Height</label>
                                            <input
                                                type="text"
                                                placeholder="Height"
                                                value={enhancementOptions.resizing.height}
                                                onChange={(e) => handleOptionChange('resizing', 'height', e.target.value)}
                                                className="size-input"
                                            />
                                        </div>
                                    </div>
                                    <select
                                        value={enhancementOptions.resizing.unit}
                                        onChange={(e) => handleOptionChange('resizing', 'unit', e.target.value)}
                                        className="unit-select"
                                    >
                                        <option value="pixels">Pixels</option>
                                        <option value="percentage">Percentage</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fit Options */}
                            <div className="option-group">
                                <h3>Fit Options</h3>
                                <select
                                    value={enhancementOptions.fit}
                                    onChange={(e) => handleOptionChange('fit', null, e.target.value)}
                                    className="option-select"
                                >
                                    <option value="bounds">Bounds</option>
                                    <option value="crop">Smart Crop</option>
                                    <option value="cover">Cover</option>
                                    <option value="crop_center">Crop Center</option>
                                    <option value="canvas">Canvas</option>
                                    <option value="outpaint">Outpaint</option>
                                </select>
                            </div>

                            {/* Output Format Options */}
                            <div className="option-group">
                                <h3>Output Format</h3>
                                <select
                                    value={enhancementOptions.outputFormat.type}
                                    onChange={(e) => handleOptionChange('outputFormat', 'type', e.target.value)}
                                    className="option-select"
                                >
                                    <option value="jpeg">JPEG</option>
                                    <option value="png">PNG</option>
                                    <option value="webp">WebP</option>
                                    <option value="avif">AVIF</option>
                                </select>
                            </div>
                        </div>

                        {/* Third Row - Color Adjustments */}
                        <div className="options-column">
                            <div className="option-group color-adjustments">
                                <h3>Color Adjustments</h3>
                                <div className="adjustment-sliders">
                                    <div className="adjustment-slider">
                                        <label>HDR</label>
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="-100"
                                                max="100"
                                                value={enhancementOptions.adjustments.hdr}
                                                onChange={(e) => handleOptionChange('adjustments', 'hdr', e.target.value)}
                                                className="slider"
                                                data-adjustment="hdr"
                                                style={{ '--value': `${((enhancementOptions.adjustments.hdr + 100) / 200) * 100}%` }}
                                            />
                                            <span className="slider-value">{enhancementOptions.adjustments.hdr}</span>
                                        </div>
                                    </div>
                                    <div className="adjustment-slider">
                                        <label>Exposure</label>
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="-100"
                                                max="100"
                                                value={enhancementOptions.adjustments.exposure}
                                                onChange={(e) => handleOptionChange('adjustments', 'exposure', e.target.value)}
                                                className="slider"
                                                data-adjustment="exposure"
                                                style={{ '--value': `${((enhancementOptions.adjustments.exposure + 100) / 200) * 100}%` }}
                                            />
                                            <span className="slider-value">{enhancementOptions.adjustments.exposure}</span>
                                        </div>
                                    </div>
                                    <div className="adjustment-slider">
                                        <label>Saturation</label>
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="-100"
                                                max="100"
                                                value={enhancementOptions.adjustments.saturation}
                                                onChange={(e) => handleOptionChange('adjustments', 'saturation', e.target.value)}
                                                className="slider"
                                                data-adjustment="saturation"
                                                style={{ '--value': `${((enhancementOptions.adjustments.saturation + 100) / 200) * 100}%` }}
                                            />
                                            <span className="slider-value">{enhancementOptions.adjustments.saturation}</span>
                                        </div>
                                    </div>
                                    <div className="adjustment-slider">
                                        <label>Contrast</label>
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="-100"
                                                max="100"
                                                value={enhancementOptions.adjustments.contrast}
                                                onChange={(e) => handleOptionChange('adjustments', 'contrast', e.target.value)}
                                                className="slider"
                                                data-adjustment="contrast"
                                                style={{ '--value': `${((enhancementOptions.adjustments.contrast + 100) / 200) * 100}%` }}
                                            />
                                            <span className="slider-value">{enhancementOptions.adjustments.contrast}</span>
                                        </div>
                                    </div>
                                    <div className="adjustment-slider">
                                        <label>Sharpness</label>
                                        <div className="slider-container">
                                            <input
                                                type="range"
                                                min="-100"
                                                max="100"
                                                value={enhancementOptions.adjustments.sharpness}
                                                onChange={(e) => handleOptionChange('adjustments', 'sharpness', e.target.value)}
                                                className="slider"
                                                data-adjustment="sharpness"
                                                style={{ '--value': `${((enhancementOptions.adjustments.sharpness + 100) / 200) * 100}%` }}
                                            />
                                            <span className="slider-value">{enhancementOptions.adjustments.sharpness}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message Display */}
                {error && <div className="error-message">{error}</div>}

                {/* Results Section */}
                <div id="results-section" className="results-section">
                    {/* Original Image Display */}
                    {originalUrl && (
                        <div className="image-container">
                            <h3>Original Image</h3>
                            <img src={originalUrl} alt="Original" className="preview-image" />
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Enhancing your image...</p>
                        </div>
                    )}

                    {/* Enhanced Image Display */}
                    {enhancedUrl && (
                        <div className="image-container">
                            <h3>Enhanced Image</h3>
                            <img src={enhancedUrl} alt="Enhanced" className="preview-image" />
                            <a
                                href={enhancedUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="download-button"
                            >
                                Download Enhanced Image
                            </a>
                        </div>
                    )}
                </div>
                
                {/* Debug Panel - Only shown when there's an error */}
                {error && (
                    <div className="debug-panel">
                        <h3>Debug Information</h3>
                        <p><strong>Error:</strong> {error}</p>
                        <p><strong>Backend URL:</strong> http://localhost:4000/api/enhance</p>
                        <button 
                            onClick={testBackendConnection} 
                            className="debug-button"
                        >
                            Test Backend Connection
                        </button>
                        <p>
                            <strong>Note:</strong> Make sure the Java Spring Boot backend is running on port 4000. 
                            Set the CLAID_API_KEY environment variable with your API key.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ImageEnhancer;
