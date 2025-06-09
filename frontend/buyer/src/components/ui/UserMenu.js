import React, { useState } from 'react';

/**
 * Меню пользователя
 */
const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="user-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="user-button"
        aria-label="Меню пользователя"
      >
        👤
      </button>
      
      {isOpen && (
        <div className="user-dropdown">
          <a href="/profile">Профиль</a>
          <a href="/orders">Заказы</a>
          <a href="/settings">Настройки</a>
          <hr />
          <button>Выйти</button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
