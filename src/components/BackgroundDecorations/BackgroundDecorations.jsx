import React from 'react';
import { HiOutlineRocketLaunch } from 'react-icons/hi2';
import { BsGlobe2 } from 'react-icons/bs';
import './BackgroundDecorations.css';

const BackgroundDecorations = () => {
    return (
        <div className="background-decorations">
            {/* Background gradient */}
            <div className="background-gradient"></div>

            {/* Decorative elements */}
            <div className="decorative-pattern"></div>
            <div className="decorative-circle decorative-circle-1"></div>
            <div className="decorative-circle decorative-circle-2"></div>
            <div className="decorative-blob decorative-blob-1"></div>
            <div className="decorative-blob decorative-blob-2"></div>

            {/* Icons */}
            <div className="decorative-icons">
                <HiOutlineRocketLaunch className="decorative-rocket" />
                <BsGlobe2 className="decorative-globe" />
            </div>
        </div>
    );
};

export default BackgroundDecorations; 