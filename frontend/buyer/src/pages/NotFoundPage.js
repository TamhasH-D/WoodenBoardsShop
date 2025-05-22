import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <svg className="w-24 h-24 mx-auto text-wood-accent mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          
          <h1 className="text-5xl font-bold text-wood-text mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-wood-text mb-6">Страница не найдена</h2>
          
          <p className="text-gray-600 mb-8">
            Извините, запрашиваемая страница не существует или была перемещена.
            Возможно, вы перешли по устаревшей ссылке или ввели неверный адрес.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/">
              <Button variant="primary">На главную</Button>
            </Link>
            <Link to="/products">
              <Button variant="outline">В каталог</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
