import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!email || !password) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }
    
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      setFormError(error.message || 'Ошибка входа. Пожалуйста, попробуйте снова.');
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <h1 className="text-2xl font-bold text-wood-text mb-6 text-center">Вход в аккаунт</h1>
            
            {(formError || error) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError || error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-wood-text font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-wood-text font-medium mb-2">
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                  placeholder="••••••••"
                  required
                />
                <div className="mt-1 text-right">
                  <Link to="/forgot-password" className="text-sm text-wood-accent hover:text-wood-accent-dark">
                    Забыли пароль?
                  </Link>
                </div>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
                className={loading ? 'opacity-70 cursor-not-allowed' : ''}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Вход...
                  </div>
                ) : (
                  'Войти'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-wood-accent hover:text-wood-accent-dark font-medium">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 mb-4">Или войти через</p>
              <div className="flex space-x-4">
                <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-150">
                  Google
                </button>
                <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition duration-150">
                  Facebook
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
