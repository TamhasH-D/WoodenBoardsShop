import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    clearErrors();

    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, accept specific credentials or any non-empty ones
      if ((data.username === 'admin' && data.password === 'admin') ||
          (data.username && data.password)) {

        // Store auth token and user info (in real app, this would come from API)
        const authData = {
          token: 'demo-token-' + Date.now(),
          user: {
            id: '1',
            username: data.username,
            email: `${data.username}@example.com`,
            role: 'admin',
            permissions: ['read', 'write', 'delete']
          },
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        localStorage.setItem('authToken', authData.token);
        localStorage.setItem('authUser', JSON.stringify(authData.user));
        localStorage.setItem('authExpires', authData.expiresAt.toString());

        toast.success('Добро пожаловать в админ панель!');

        // Redirect to intended page or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Неверные учетные данные'
        });
      }
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: 'Ошибка входа. Попробуйте еще раз.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        {/* Logo and Title */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white text-3xl font-bold">A</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Админ Панель</h1>
          <p className="text-gray-600">Войдите в свою учетную запись</p>
        </motion.div>

        {/* Login Form */}
        <motion.div variants={itemVariants}>
          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg"
                >
                  <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{errors.root.message}</span>
                </motion.div>
              )}

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="form-label">
                  Имя пользователя
                </label>
                <Input
                  id="username"
                  type="text"
                  icon={<UserIcon className="w-5 h-5" />}
                  placeholder="Введите имя пользователя"
                  error={errors.username?.message}
                  {...register('username', {
                    required: 'Имя пользователя обязательно',
                    minLength: {
                      value: 2,
                      message: 'Минимум 2 символа'
                    }
                  })}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="form-label">
                  Пароль
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    icon={<LockClosedIcon className="w-5 h-5" />}
                    placeholder="Введите пароль"
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Пароль обязателен',
                      minLength: {
                        value: 3,
                        message: 'Минимум 3 символа'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <motion.div
              variants={itemVariants}
              className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200"
            >
              <div className="flex items-start space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-800 mb-1">
                    Демо доступ
                  </p>
                  <p className="text-sm text-primary-700">
                    Используйте <strong>admin/admin</strong> или любые другие учетные данные для входа
                  </p>
                </div>
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Админ Панель. Все права защищены.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
