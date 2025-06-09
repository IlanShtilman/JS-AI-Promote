import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import './HelpIcon.css';

const contentMap = {
  he: {
    language: { title: 'בחירת שפה', description: 'בחר את השפה המועדפת עליך לתוכן הפלייר' },
    logo: { title: 'העלאת לוגו', description: 'הוסף את הלוגו של העסק שלך' },
    title: { title: 'כותרת', description: 'הזן כותרת קצרה ומושכת שתהיה במוקד הפלייר' },
    promotional: { title: 'טקסט פרסומי', description: 'הזן טקסט פרסומי או השתמש ב-AI ליצירת רעיונות' },
    generate: { title: 'יצירת טקסטים', description: 'לחץ כדי ליצור מספר גרסאות של טקסט פרסומי באמצעות AI' }
  },
  en: {
    language: { title: 'Language', description: 'Select your preferred language for the flyer content' },
    logo: { title: 'Upload Logo', description: 'Add your business logo' },
    title: { title: 'Title', description: 'Enter a short catchy title for the flyer' },
    promotional: { title: 'Promotional Text', description: 'Enter a promotional text or use AI to generate ideas' },
    generate: { title: 'Generate Texts', description: 'Click to generate multiple versions of the promotional text using AI' }
  }
};

const HelpIcon = ({ topic, language = 'he' }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, right: 0 });
  const iconRef = useRef(null);

  const langKey = language === 'he' ? 'he' : 'en';
  const helpContent = contentMap[langKey][topic];

  const handleMouseEnter = (event) => {
    const rect = iconRef.current.getBoundingClientRect();
    setPopupPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      right: window.innerWidth - rect.right
    });
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  return (
    <span
      className="help-icon-container"
      ref={iconRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      aria-label={helpContent ? helpContent.title : ''}
    >
      <HelpOutlineIcon fontSize="small" />
      {showPopup && helpContent && createPortal(
        <div
          className="help-icon-popup"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <div className="help-icon-popup-title">{helpContent.title}</div>
          <div className="help-icon-popup-desc">{helpContent.description}</div>
        </div>,
        document.body
      )}
    </span>
  );
};

export default HelpIcon; 