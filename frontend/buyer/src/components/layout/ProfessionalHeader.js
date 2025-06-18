import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const ProfessionalHeader = () => {
  // isAuthenticated is the comprehensive flag: Keycloak auth + profile loaded
  // keycloakAuthenticated is just Keycloak's own auth status
  // profileLoading indicates if the buyer profile is being fetched
  const { isAuthenticated, login, logout, userInfo, keycloakAuthenticated, profileLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = [
    { path: '/', label: 'Главная' },
    { path: '/products', label: 'Каталог' },
    { path: '/analyzer', label: 'Анализатор' },
    { path: '/chats', label: 'Сообщения' }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Link 
              to="/" 
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                textDecoration: 'none',
                letterSpacing: '-0.025em'
              }}
            >
              WoodMarket
            </Link>
            <span style={{
              marginLeft: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '500',
              padding: '0.25rem 0.5rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem'
            }}>
              Покупатель
            </span>
          </div>

          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <nav
              className="desktop-nav"
              style={{
                display: isMobile ? 'none' : 'flex',
                alignItems: 'center',
                gap: '1.5rem' // Adjusted gap for new elements
              }}
            >
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    color: isActive(item.path) ? '#2563eb' : '#374151',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.5rem 0',
                    borderBottom: isActive(item.path) ? '2px solid #2563eb' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.color = '#2563eb';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.color = '#374151';
                    }
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons - Desktop */}
            <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '1rem' }}>
              {keycloakAuthenticated ? ( // Show user info area if Keycloak login is done
                <>
                  <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                    {profileLoading ? "Загрузка..." : (userInfo?.username || 'User')}
                  </span>
                  <button
                    onClick={logout}
                    disabled={profileLoading} // Optionally disable logout while profile is loading
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#ffffff',
                      backgroundColor: '#ef4444', // Red for logout
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                  >
                    Logout
                  </button>
                </>
              ) : ( // Only show Login if not even Keycloak authenticated
                <button
                  onClick={login}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#2563eb', // Blue for login
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            style={{
              display: isMobile ? 'flex' : 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              gap: '4px'
            }}
            aria-label="Toggle menu"
          >
            <span style={{
              width: '20px',
              height: '2px',
              backgroundColor: '#374151',
              transition: 'all 0.3s ease',
              transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }}></span>
            <span style={{
              width: '20px',
              height: '2px',
              backgroundColor: '#374151',
              transition: 'all 0.3s ease',
              opacity: mobileMenuOpen ? 0 : 1
            }}></span>
            <span style={{
              width: '20px',
              height: '2px',
              backgroundColor: '#374151',
              transition: 'all 0.3s ease',
              transform: mobileMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
            }}></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && isMobile && (
          <div style={{
            paddingBottom: '1rem',
            borderTop: '1px solid #e5e7eb',
            marginTop: '1px'
          }}>
            <nav style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              paddingTop: '1rem'
            }}>
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: isActive(item.path) ? '#2563eb' : '#374151',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    backgroundColor: isActive(item.path) ? '#dbeafe' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {/* Auth Buttons - Mobile */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                {keycloakAuthenticated ? ( // Show user info area if Keycloak login is done
                  <>
                    <span style={{
                      display: 'block',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      textAlign: 'center'
                    }}>
                      {profileLoading ? "Загрузка..." : (userInfo?.username || 'User')}
                    </span>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      disabled={profileLoading} // Optionally disable logout
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#ffffff',
                        backgroundColor: '#ef4444',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      Logout
                    </button>
                  </>
                ) : ( // Only show Login if not even Keycloak authenticated
                  <button
                    onClick={() => { login(); setMobileMenuOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#ffffff',
                      backgroundColor: '#2563eb',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    Login
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {/* {mobileMenuOpen && isMobile && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '65px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40
          }}
        />
      )} */}

      <style jsx>{`
        @media (min-width: 768px) {
          .mobile-menu-button {
            display: none !important;
          }
          .desktop-nav {
            display: flex !important;
          }
        }
        
        @media (max-width: 767px) {
          .mobile-menu-button {
            display: flex !important;
          }
          .desktop-nav {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default ProfessionalHeader;
