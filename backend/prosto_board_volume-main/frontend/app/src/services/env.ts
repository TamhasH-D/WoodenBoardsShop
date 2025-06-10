interface Env {
  VITE_API_URL: string;
}

function getEnvVar(key: keyof Env): string {
  const value = import.meta.env[key];
  
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is not defined`);
  }

  return value;
}

export const env: Env = {
  VITE_API_URL: getEnvVar('VITE_API_URL'),
};