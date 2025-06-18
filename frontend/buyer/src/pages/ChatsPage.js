import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { BUYER_TEXTS } from '../utils/localization';
import Chats from '../components/Chats';
import ChatWindow from '../components/chat/ChatWindow';

const ChatsPage = () => {
  const { setPageTitle } = useApp();
  // isAuthenticated is the comprehensive flag (Keycloak auth + profile loaded)
  // keycloakAuthenticated is true if Keycloak login is successful
  // profileLoading is true if profile is being fetched
  // profileError contains error object if profile fetch failed
  const { isAuthenticated, keycloakAuthenticated, profileLoading, profileError, login } = useAuth();

  useEffect(() => {
    setPageTitle(BUYER_TEXTS.CHATS);
  }, [setPageTitle]);

  // Styling for the centered message container
  const messageContainerStyle = {
    backgroundColor: '#f8fafc', // Consistent with main app background
    minHeight: 'calc(100vh - 64px - 50px)', // Adjust for header and potential global error banner
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px'
  };

  const titleStyle = { color: '#374151', marginBottom: '1rem', fontSize: '1.25rem' };
  const textStyle = { color: '#6b7280', marginBottom: '1.5rem', maxWidth: '400px' };
  const buttonStyle = {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    color: 'white',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };
  const errorTextStyle = { color: '#ef4444', marginBottom: '1.5rem', maxWidth: '400px', fontWeight: '500' };


  // Case 1: Keycloak authenticated, but profile is still loading
  if (keycloakAuthenticated && profileLoading) {
    return (
      <div style={messageContainerStyle}>
        {/* Optional: Spinner Icon */}
        <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <h2 style={titleStyle}>Загрузка вашего профиля...</h2>
        <p style={textStyle}>Пожалуйста, подождите, мы готовим ваши чаты.</p>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Case 2: Keycloak authenticated, but profile loading resulted in an error
  if (keycloakAuthenticated && profileError) {
    return (
      <div style={messageContainerStyle}>
        <h2 style={titleStyle}>Ошибка загрузки профиля</h2>
        <p style={errorTextStyle}>
          Не удалось загрузить данные вашего профиля: {profileError.message || "Неизвестная ошибка"}.
        </p>
        <p style={textStyle}>
          Чаты могут быть недоступны. Попробуйте обновить страницу или войти снова.
        </p>
        <button
          onClick={() => window.location.reload()} // Simple refresh
          style={{...buttonStyle, marginRight: '1rem', backgroundColor: '#6b7280'}}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
        >
          Обновить
        </button>
        <button
          onClick={login} // Attempt to re-trigger login/auth flow
          style={buttonStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          Повторить вход
        </button>
      </div>
    );
  }

  // Case 3: Not fully authenticated (either Keycloak not authed, or profile not loaded for other reasons)
  // This uses the comprehensive `isAuthenticated` flag.
  if (!isAuthenticated) {
    return (
      <div style={messageContainerStyle}>
        <h2 style={titleStyle}>Доступ к чатам ограничен</h2>
        <p style={textStyle}>
          Пожалуйста, войдите в систему, чтобы просмотреть свои чаты и общаться с продавцами.
        </p>
        <button
          onClick={login}
          style={buttonStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          Войти
        </button>
      </div>
    );
  }

  // Case 4: Fully authenticated and profile loaded, show chats
  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: 'calc(100vh - 64px)' // Adjust if global error banner is sticky
    }}>
      <Routes>
        <Route path="/" element={<Chats />} />
        <Route path="/:threadId" element={<ChatWindow />} />
      </Routes>
    </div>
  );
};

export default ChatsPage;
