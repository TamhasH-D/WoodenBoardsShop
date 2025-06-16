import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);

  // Intersection Observer для анимаций при скролле
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const sections = [aboutRef, featuresRef, howItWorksRef, ctaRef];
    sections.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Параллакс эффект
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="hero-section"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="floating-elements">
            <div className="floating-element element-1"></div>
            <div className="floating-element element-2"></div>
            <div className="floating-element element-3"></div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-line">Революция в торговле</span>
              <span className="title-line highlight">древесиной</span>
            </h1>
            <p className="hero-subtitle">
              Современная платформа для покупки и продажи пиломатериалов
              с ИИ-анализом качества и прямым общением с поставщиками
            </p>
            <div className="hero-buttons">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/products')}
              >
                <span>Найти товары</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/analyzer')}
              >
                <span>ИИ Анализатор</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card card-1">
              <div className="card-icon">🌲</div>
              <div className="card-text">Качественная древесина</div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon">🤖</div>
              <div className="card-text">ИИ анализ</div>
            </div>
            <div className="visual-card card-3">
              <div className="card-icon">💬</div>
              <div className="card-text">Прямое общение</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Platform Section */}
      <section ref={aboutRef} className="about-section section-animate">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <div className="section-badge">О платформе</div>
              <h2 className="section-title">
                Цифровая экосистема для торговли пиломатериалами
              </h2>
              <p className="section-description">
                Мы объединяем покупателей и продавцов древесины на единой платформе,
                предоставляя современные инструменты для эффективной торговли и контроля качества.
              </p>

              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">1000+</div>
                  <div className="stat-label">Товаров в каталоге</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Проверенных продавцов</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">99%</div>
                  <div className="stat-label">Точность ИИ анализа</div>
                </div>
              </div>

              <button
                className="btn btn-outline"
                onClick={() => navigate('/sellers')}
              >
                Посмотреть продавцов
              </button>
            </div>

            <div className="about-visual">
              <div className="visual-container">
                <div className="tech-card">
                  <div className="tech-icon">🔬</div>
                  <h4>ИИ Анализ качества</h4>
                  <p>Автоматическое определение дефектов и классификация древесины</p>
                </div>
                <div className="tech-card">
                  <div className="tech-icon">📊</div>
                  <h4>Аналитика рынка</h4>
                  <p>Мониторинг цен и трендов в режиме реального времени</p>
                </div>
                <div className="tech-card">
                  <div className="tech-icon">🛡️</div>
                  <h4>Гарантия качества</h4>
                  <p>Система рейтингов и отзывов для надежных сделок</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="features-section section-animate">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">Преимущества</div>
            <h2 className="section-title">Почему выбирают нашу платформу</h2>
            <p className="section-description">
              Современные технологии и проверенные решения для эффективной торговли
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Широкий ассортимент</h3>
              <p>Более 1000 видов пиломатериалов от проверенных поставщиков со всей страны</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>ИИ контроль качества</h3>
              <p>Автоматический анализ досок с точностью 99% для определения дефектов и сортности</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Прямое общение</h3>
              <p>Встроенная система чатов для быстрого решения вопросов и согласования условий</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Проверенные продавцы</h3>
              <p>Система рейтингов и отзывов гарантирует надежность каждого поставщика</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1v6m0 6v6m8-8h-6m-6 0H2M9 9l3-3 3 3M9 15l3 3 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Умная аналитика</h3>
              <p>Мониторинг рыночных цен и трендов для принятия обоснованных решений</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Быстрые сделки</h3>
              <p>Оптимизированный процесс от поиска до заключения сделки за минимальное время</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="how-it-works-section section-animate">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">Как это работает</div>
            <h2 className="section-title">Простой путь к качественной древесине</h2>
            <p className="section-description">
              Четыре простых шага от поиска до получения товара
            </p>
          </div>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Поиск и выбор</h3>
                <p>Найдите нужные пиломатериалы в каталоге или воспользуйтесь умными фильтрами для точного поиска</p>
                <button
                  className="step-button"
                  onClick={() => navigate('/products')}
                >
                  Открыть каталог
                </button>
              </div>
              <div className="step-visual">
                <div className="visual-icon">🔍</div>
              </div>
            </div>

            <div className="step-item reverse">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>ИИ анализ качества</h3>
                <p>Загрузите фото досок в наш анализатор для автоматической оценки качества и выявления дефектов</p>
                <button
                  className="step-button"
                  onClick={() => navigate('/analyzer')}
                >
                  Попробовать анализатор
                </button>
              </div>
              <div className="step-visual">
                <div className="visual-icon">🤖</div>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Общение с продавцом</h3>
                <p>Свяжитесь с продавцом через встроенный чат для уточнения деталей и согласования условий сделки</p>
                <button
                  className="step-button"
                  onClick={() => navigate('/chats')}
                >
                  Мои чаты
                </button>
              </div>
              <div className="step-visual">
                <div className="visual-icon">💬</div>
              </div>
            </div>

            <div className="step-item reverse">
              <div className="step-number">04</div>
              <div className="step-content">
                <h3>Оформление заказа</h3>
                <p>Завершите сделку с гарантией качества и отслеживанием доставки до вашего объекта</p>
                <button
                  className="step-button"
                  onClick={() => navigate('/orders')}
                >
                  Мои заказы
                </button>
              </div>
              <div className="step-visual">
                <div className="visual-icon">📦</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section section-animate">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Готовы начать?</h2>
            <p className="cta-description">
              Присоединяйтесь к тысячам покупателей, которые уже используют нашу платформу
              для поиска качественной древесины
            </p>
            <div className="cta-buttons">
              <button
                className="btn btn-primary large"
                onClick={() => navigate('/products')}
              >
                Начать покупки
              </button>
              <button
                className="btn btn-outline large"
                onClick={() => navigate('/analyzer')}
              >
                Попробовать ИИ анализатор
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .home-container {
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%);
          color: white;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .floating-element {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .element-1 {
          width: 80px;
          height: 80px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .element-2 {
          width: 120px;
          height: 120px;
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .element-3 {
          width: 60px;
          height: 60px;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .hero-text {
          animation: slideInLeft 1s ease-out;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }

        .title-line {
          display: block;
        }

        .highlight {
          background: linear-gradient(45deg, #F4A460, #DEB887);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          line-height: 1.6;
          margin-bottom: 40px;
          opacity: 0.95;
          font-weight: 500;
          color: #f8fafc;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .hero-visual {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: slideInRight 1s ease-out;
        }

        .visual-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: none;
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          transition: all 0.4s ease;
          animation: fadeInUp 1s ease-out;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          color: #2d3748;
          position: relative;
          overflow: hidden;
        }

        .visual-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.1), transparent);
          transition: left 0.6s;
        }

        .visual-card:hover::before {
          left: 100%;
        }

        .visual-card:nth-child(2) {
          animation-delay: 0.2s;
          margin-left: 40px;
        }

        .visual-card:nth-child(3) {
          animation-delay: 0.4s;
          margin-left: 80px;
        }

        .visual-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 12px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }

        .card-text {
          font-weight: 700;
          font-size: 1.2rem;
          color: #2d3748;
          line-height: 1.4;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(45deg, #8B4513, #D2691E);
          color: white;
          box-shadow: 0 8px 32px rgba(139, 69, 19, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 40px rgba(139, 69, 19, 0.4);
        }

        .btn-primary:active {
          transform: translateY(0) scale(1.02);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .btn-outline {
          background: transparent;
          color: #8B4513;
          border: 2px solid #8B4513;
        }

        .btn-outline:hover {
          background: #8B4513;
          color: white;
          transform: translateY(-2px);
        }

        .btn.large {
          padding: 20px 40px;
          font-size: 1.1rem;
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Section Animations */
        .section-animate {
          opacity: 0;
          transform: translateY(60px);
          transition: all 0.8s ease;
        }

        .section-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* Section Headers */
        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-badge {
          display: inline-block;
          padding: 8px 20px;
          background: linear-gradient(45deg, #8B4513, #D2691E);
          color: white;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 800;
          color: #2d3748;
          margin-bottom: 20px;
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          letter-spacing: -0.025em;
          letter-spacing: -0.02em;
        }

        .section-description {
          font-size: 1.2rem;
          color: #2d3748;
          line-height: 1.7;
          max-width: 600px;
          margin: 0 auto;
          font-weight: 500;
          text-align: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* About Section */
        .about-section {
          padding: 120px 0;
          background: #f8fafc;
        }

        .about-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .about-text {
          animation: slideInLeft 0.8s ease-out;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin: 40px 0;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: #8B4513;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background: linear-gradient(45deg, #8B4513, #D2691E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #4a5568;
          font-weight: 500;
        }

        .about-visual {
          animation: slideInRight 0.8s ease-out;
        }

        .visual-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tech-card {
          background: white;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }

        .tech-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .tech-icon {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .tech-card h4 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 12px;
        }

        .tech-card p {
          color: #4a5568;
          line-height: 1.6;
          margin: 0;
        }

        /* Features Section */
        .features-section {
          padding: 120px 0;
          background: white;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 40px;
        }

        .feature-card {
          text-align: center;
          padding: 40px 30px;
          border-radius: 20px;
          transition: all 0.4s ease;
          border: 1px solid #e2e8f0;
          background: white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border-color: #8B4513;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.05), transparent);
          transition: left 0.6s;
        }

        .feature-card:hover::before {
          left: 100%;
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(45deg, #8B4513, #D2691E);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 16px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .feature-card p {
          color: #2d3748;
          line-height: 1.7;
          margin: 0;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* How It Works Section */
        .how-it-works-section {
          padding: 120px 0;
          background: #f8fafc;
        }

        .steps-container {
          display: flex;
          flex-direction: column;
          gap: 80px;
        }

        .step-item {
          display: grid;
          grid-template-columns: 80px 1fr 200px;
          gap: 40px;
          align-items: center;
          position: relative;
        }

        .step-item.reverse {
          grid-template-columns: 200px 1fr 80px;
        }

        .step-item.reverse .step-content {
          text-align: right;
        }

        .step-number {
          font-size: 3rem;
          font-weight: 800;
          color: #8B4513;
          opacity: 0.3;
        }

        .step-content h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 16px;
        }

        .step-content p {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 24px;
          font-size: 1.1rem;
        }

        .step-button {
          background: transparent;
          color: #8B4513;
          border: 2px solid #8B4513;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .step-button:hover {
          background: #8B4513;
          color: white;
          transform: translateY(-2px);
        }

        .step-visual {
          width: 120px;
          height: 120px;
          background: linear-gradient(45deg, #8B4513, #D2691E);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(139, 69, 19, 0.3);
        }

        .visual-icon {
          font-size: 3rem;
        }

        /* CTA Section */
        .cta-section {
          padding: 120px 0;
          background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%);
          color: white;
          text-align: center;
        }

        .cta-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 24px;
          line-height: 1.2;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .cta-description {
          font-size: 1.25rem;
          line-height: 1.6;
          margin-bottom: 40px;
          opacity: 0.95;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 60px;
            text-align: center;
          }

          .about-content {
            grid-template-columns: 1fr;
            gap: 60px;
          }

          .step-item,
          .step-item.reverse {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 30px;
          }

          .step-item.reverse .step-content {
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .cta-title {
            font-size: 2.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }

          .visual-card:nth-child(2),
          .visual-card:nth-child(3) {
            margin-left: 0;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 16px;
          }

          .hero-section,
          .about-section,
          .features-section,
          .how-it-works-section,
          .cta-section {
            padding: 80px 0;
          }

          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .cta-title {
            font-size: 2rem;
          }

          .step-content h3 {
            font-size: 1.5rem;
          }

          .feature-card {
            padding: 30px 20px;
          }

          .tech-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
