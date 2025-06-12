import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';
import Chats from '../components/Chats';
import ChatWindow from '../components/chat/ChatWindow';

const ChatsPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.CHATS);
  }, [setPageTitle]);

  return (
    <div style={{
      backgroundColor: '#FAF7F0',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Routes>
        <Route path="/" element={<Chats />} />
        <Route path="/:threadId" element={<ChatWindow />} />
      </Routes>
    </div>
  );
};

export default ChatsPage;
