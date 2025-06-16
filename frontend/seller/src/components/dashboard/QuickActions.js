import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  MessageSquare,
  TreePine,
  Search,
  Settings
} from 'lucide-react';
import { SELLER_TEXTS } from '../../utils/localization';

const ActionCard = ({ to, icon: Icon, title, description, color, external = false }) => {
  const content = (
    <div className={`
        group relative p-6 bg-white rounded-xl border border-gray-200 shadow-sm 
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${color}
      `}
    >
      <div className="flex items-start space-x-4">
        <div className={`
          p-3 rounded-lg transition-colors duration-200
          ${color === 'hover:border-blue-300' ? 'bg-blue-50 group-hover:bg-blue-100' : ''}
          ${color === 'hover:border-green-300' ? 'bg-green-50 group-hover:bg-green-100' : ''}
          ${color === 'hover:border-purple-300' ? 'bg-purple-50 group-hover:bg-purple-100' : ''}
          ${color === 'hover:border-amber-300' ? 'bg-amber-50 group-hover:bg-amber-100' : ''}
          ${color === 'hover:border-indigo-300' ? 'bg-indigo-50 group-hover:bg-indigo-100' : ''}
          ${color === 'hover:border-gray-300' ? 'bg-gray-50 group-hover:bg-gray-100' : ''}
        `}>
          <Icon className={`
            w-6 h-6 transition-colors duration-200
            ${color === 'hover:border-blue-300' ? 'text-blue-600' : ''}
            ${color === 'hover:border-green-300' ? 'text-green-600' : ''}
            ${color === 'hover:border-purple-300' ? 'text-purple-600' : ''}
            ${color === 'hover:border-amber-300' ? 'text-amber-600' : ''}
            ${color === 'hover:border-indigo-300' ? 'text-indigo-600' : ''}
            ${color === 'hover:border-gray-300' ? 'text-gray-600' : ''}
          `} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Hover indicator */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-current opacity-20 transition-all duration-200"></div>
    </div>
  );

  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link to={to}>
      {content}
    </Link>
  );
};

const QuickActions = () => {
  const actions = [
    {
      to: '/products',
      icon: Plus,
      title: SELLER_TEXTS.ADD_PRODUCT,
      description: 'Добавьте новый товар в ваш каталог с фотографиями и описанием',
      color: 'hover:border-blue-300'
    },
    {
      to: '/board-analyzer',
      icon: Search,
      title: 'Анализатор досок',
      description: 'Используйте AI для анализа изображений досок и расчета объема',
      color: 'hover:border-purple-300'
    },
    {
      to: '/chats',
      icon: MessageSquare,
      title: SELLER_TEXTS.VIEW_MESSAGES,
      description: 'Отвечайте на вопросы покупателей и ведите переговоры',
      color: 'hover:border-green-300'
    },
    {
      to: '/wood-types',
      icon: TreePine,
      title: SELLER_TEXTS.MANAGE_WOOD_TYPES,
      description: 'Управляйте типами древесины и устанавливайте цены',
      color: 'hover:border-amber-300'
    },
    {
      to: '/profile',
      icon: Settings,
      title: 'Настройки профиля',
      description: 'Обновите информацию о вашем бизнесе и контактные данные',
      color: 'hover:border-gray-300'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{SELLER_TEXTS.QUICK_ACTIONS}</h2>
          <p className="text-sm text-gray-600 mt-1">Быстрый доступ к основным функциям</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <ActionCard
            key={index}
            to={action.to}
            icon={action.icon}
            title={action.title}
            description={action.description}
            color={action.color}
            external={action.external}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
