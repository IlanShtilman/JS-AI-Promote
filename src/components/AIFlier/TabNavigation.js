import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'background', icon: 'wallpaper', label: 'BACKGROUND' },
    { id: 'content', icon: 'edit', label: 'CONTENT' },
    { id: 'style', icon: 'palette', label: 'STYLE' }
  ];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      {tabs.map((tab) => (
        <Button 
          key={tab.id}
          variant="contained" 
          sx={{ 
            width: '80px', 
            height: '80px', 
            mr: 1, 
            backgroundColor: activeTab === tab.id ? '#e3f2fd' : '#fff', 
            color: activeTab === tab.id ? '#1976d2' : '#666'
          }}
          onClick={() => setActiveTab(tab.id)}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span className="material-icons">{tab.icon}</span>
            <Typography variant="caption">{tab.label}</Typography>
          </Box>
        </Button>
      ))}
    </Box>
  );
};

export default TabNavigation; 