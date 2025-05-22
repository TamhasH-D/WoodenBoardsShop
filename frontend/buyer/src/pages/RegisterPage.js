import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }
    
    if (!agreeTerms) {
      setFormError('Вы должны согласиться с условиями использования');
      return;
    }
    
    try {
      await register(name, email, password);
      navigate('/');
    } catch (error) {
      setFormError(error.message || 'Ошибка регистрации. Пожалуйста, попробуйте снова.');
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <h1 className="text-2xl font-bold text-wood-text mb-6 text-center">Регистрация</h1>
            
            {(formError || error) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError || error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-wood-text font-medium mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                  placeholder="Иван Иванов"
                  required
                />
              </div>
              
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
              
              <div className="mb-4">
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
                <p className="mt-1 text-sm text-gray-500">
                  Минимум 8 символов, включая буквы и цифры
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-wood-text font-medium mb-2">
                  Подтверждение пароля
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-gray-300 text-wood-accent focus:ring-wood-accent"
                    required
                  />
                  <span className="ml-2 text-gray-600 text-sm">
                    Я согласен с{' '}
                    <Link to="/terms" className="text-wood-accent hover:text-wood-accent-dark">
                      условиями использования
                    </Link>{' '}
                    и{' '}
                    <Link to="/privacy" className="text-wood-accent hover:text-wood-accent-dark">
                      политикой конфиденциальности
                    </Link>
                  </span>
                </label>
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
                    Регистрация...
                  </div>
                ) : (
                  'Зарегистрироваться'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-wood-accent hover:text-wood-accent-dark font-medium">
                  Войти
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
