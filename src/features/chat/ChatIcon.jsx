import React from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import { IconButton } from '@mui/material';

const ChatIconComponent = ({ onClick }) => {
  return (
    <IconButton onClick={onClick} sx={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#3f51b5', color: 'white', '&:hover': { backgroundColor: '#303f9f' } }}>
      <ChatIcon fontSize="large" />
    </IconButton>
  );
};

export default ChatIconComponent;