import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { BUYER_TEXTS } from '../utils/localization';
import ProfessionalChats from '../components/ProfessionalChats';
import ProfessionalChatWindow from '../components/chat/ProfessionalChatWindow';

const ChatsPage = () => {
  const { setPageTitle } = useApp();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.CHATS);
  }, [setPageTitle]);

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <Routes>
        <Route path="/" element={<ProfessionalChats />} />
        <Route path="/:threadId" element={<ProfessionalChatWindow />} />
      </Routes>
    </div>
  );
};

export default ChatsPage;
