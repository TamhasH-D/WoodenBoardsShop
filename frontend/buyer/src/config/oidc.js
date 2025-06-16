/**
 * OIDC Configuration for Keycloak Integration
 * Настройки для подключения к Keycloak через OpenID Connect
 */

// Получаем конфигурацию из runtime environment или fallback к build-time переменным
const getOidcConfig = () => {
  // Проверяем, есть ли runtime конфигурация
  const runtimeConfig = window._env_ || {};
  const dynamicConfig = window.getOIDCConfig ? window.getOIDCConfig() : null;

  // Если есть динамическая конфигурация, используем её
  if (dynamicConfig) {
    console.log('[OIDC] Using dynamic configuration:', dynamicConfig);
    return dynamicConfig;
  }

  // Иначе используем runtime или build-time переменные
  const authority = runtimeConfig.REACT_APP_OIDC_AUTHORITY ||
                   process.env.REACT_APP_OIDC_AUTHORITY ||
                   'http://localhost:8030/realms/BuyerRealm';
  const clientId = runtimeConfig.REACT_APP_OIDC_CLIENT_ID ||
                  process.env.REACT_APP_OIDC_CLIENT_ID ||
                  'buyer-frontend';

  // Динамическое определение redirect URI на основе текущего хоста
  const currentHost = window.location.hostname;
  const currentPort = window.location.port || '8082';
  let redirectUri, postLogoutRedirectUri;

  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    redirectUri = `http://localhost:${currentPort}/auth/callback`;
    postLogoutRedirectUri = `http://localhost:${currentPort}`;
  } else {
    // Для любого другого хоста используем текущий origin
    redirectUri = `${window.location.origin}/auth/callback`;
    postLogoutRedirectUri = window.location.origin;
  }

  const responseType = runtimeConfig.REACT_APP_OIDC_RESPONSE_TYPE ||
                      process.env.REACT_APP_OIDC_RESPONSE_TYPE ||
                      'code';
  const scope = runtimeConfig.REACT_APP_OIDC_SCOPE ||
               process.env.REACT_APP_OIDC_SCOPE ||
               'openid profile email';
  const autoSilentRenew = (runtimeConfig.REACT_APP_AUTH_AUTO_SILENT_RENEW ||
                          process.env.REACT_APP_AUTH_AUTO_SILENT_RENEW) === 'true';
  const loadUserInfo = (runtimeConfig.REACT_APP_AUTH_LOAD_USER_INFO ||
                       process.env.REACT_APP_AUTH_LOAD_USER_INFO) !== 'false';

  console.log('[OIDC] Using computed configuration:', {
    authority,
    client_id: clientId,
    redirect_uri: redirectUri,
    post_logout_redirect_uri: postLogoutRedirectUri,
    currentHost,
    currentPort
  });

  return {
    // Основные настройки OIDC
    authority,
    client_id: clientId,
    redirect_uri: redirectUri,
    post_logout_redirect_uri: postLogoutRedirectUri,
    response_type: responseType,
    scope,

    // Настройки автоматического обновления токенов
    automaticSilentRenew: autoSilentRenew,
    silent_redirect_uri: `${window.location.origin}/auth/silent-callback`,
    
    // Настройки загрузки информации о пользователе
    loadUserInfo,
    
    // Настройки безопасности
    filterProtocolClaims: true,
    
    // Настройки для разработки
    monitorSession: process.env.NODE_ENV === 'development',
    
    // Дополнительные настройки
    extraQueryParams: {},
    
    // Настройки метаданных
    metadata: {
      issuer: authority,
      authorization_endpoint: `${authority}/protocol/openid-connect/auth`,
      token_endpoint: `${authority}/protocol/openid-connect/token`,
      userinfo_endpoint: `${authority}/protocol/openid-connect/userinfo`,
      end_session_endpoint: `${authority}/protocol/openid-connect/logout`,
      jwks_uri: `${authority}/protocol/openid-connect/certs`,
    },

    // Настройки клиента
    signingKeys: undefined, // Будут загружены автоматически
  };
};

// Экспортируем конфигурацию
export const oidcConfig = getOidcConfig();

// Дополнительные утилиты для работы с OIDC
export const oidcUtils = {
  /**
   * Получить URL для логина
   */
  getLoginUrl: () => {
    const config = getOidcConfig();
    const params = new URLSearchParams({
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      response_type: config.response_type,
      scope: config.scope,
      state: Math.random().toString(36).substring(2, 15),
      nonce: Math.random().toString(36).substring(2, 15),
    });
    
    return `${config.metadata.authorization_endpoint}?${params.toString()}`;
  },

  /**
   * Получить URL для логаута
   */
  getLogoutUrl: (idToken) => {
    const config = getOidcConfig();
    const params = new URLSearchParams({
      post_logout_redirect_uri: config.post_logout_redirect_uri,
    });
    
    if (idToken) {
      params.append('id_token_hint', idToken);
    }
    
    return `${config.metadata.end_session_endpoint}?${params.toString()}`;
  },

  /**
   * Проверить, настроен ли OIDC правильно
   */
  validateConfig: () => {
    const config = getOidcConfig();
    const requiredFields = ['authority', 'client_id', 'redirect_uri'];
    
    for (const field of requiredFields) {
      if (!config[field]) {
        console.error(`OIDC Config Error: Missing required field '${field}'`);
        return false;
      }
    }
    
    return true;
  },

  /**
   * Логирование конфигурации для отладки
   */
  logConfig: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('OIDC Configuration:', {
        authority: oidcConfig.authority,
        client_id: oidcConfig.client_id,
        redirect_uri: oidcConfig.redirect_uri,
        scope: oidcConfig.scope,
      });
    }
  }
};

// Проверяем конфигурацию при загрузке модуля
if (process.env.NODE_ENV === 'development') {
  if (!oidcUtils.validateConfig()) {
    console.warn('OIDC configuration validation failed. Please check your environment variables.');
  }
}

export default oidcConfig;
