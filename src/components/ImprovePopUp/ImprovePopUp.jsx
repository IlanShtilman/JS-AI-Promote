import React, { useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import './ImprovePopUp.css';
import ImageEnhacer from '../ImageEnhacer/ImageEnhacer';
import '../ImageEnhacer/ImageEnhacer.css';
const ImprovePopUp = ({ isOpen, onClose, imageUrl }) => {
    // Prevent body scrolling when popup is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        // Cleanup function to restore scrolling when component unmounts or popup closes
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // If the modal is not open, don't render anything
    if (!isOpen) return null;

    const handleClose = () => {
        document.body.style.overflow = 'auto';
        onClose();
    };

    return (
        <>   
            {/* Overlay background, closes popup on click outside */}
            <div className="popup-overlay" onClick={handleClose}>
                {/* Modal content, click inside doesn't close popup */}
                <div className="popup-content" onClick={e => e.stopPropagation()}>
                    {/* Header section with title and close button */}
                    <div className="popup-header">
                        <h3>Improve Image</h3>
                        <button className="close-button" onClick={handleClose}>
                            <IoClose />
                        </button>
                    </div>

                    {/* Main content of the popup */}
                    <div className="popup-body">
                        <ImageEnhacer initialImageUrl={imageUrl} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImprovePopUp; 