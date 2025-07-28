import axios from 'axios';

// Environment-based configuration
const getEnvironmentConfig = () => {
  // Use custom environment variable for staging, fallback to NODE_ENV
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return {
        AUTH_SERVICE: process.env.REACT_APP_AUTH_SERVICE_URL || 'https://api.hospital.com/auth',
        HOSPITAL_SERVICE: process.env.REACT_APP_HOSPITAL_SERVICE_URL || 'https://api.hospital.com/hospital',
        APPOINTMENT_SERVICE: process.env.REACT_APP_APPOINTMENT_SERVICE_URL || 'https://api.hospital.com/appointment',
        PATIENT_SERVICE: process.env.REACT_APP_PATIENT_SERVICE_URL || 'https://api.hospital.com/patient',
        DOCTOR_SERVICE: process.env.REACT_APP_DOCTOR_SERVICE_URL || 'https://api.hospital.com/doctor',
        EMAIL_SERVICE: process.env.REACT_APP_EMAIL_SERVICE_URL || 'https://api.hospital.com/email'
      };
    case 'staging':
      return {
        AUTH_SERVICE: process.env.REACT_APP_AUTH_SERVICE_URL || 'https://staging-api.hospital.com/auth',
        HOSPITAL_SERVICE: process.env.REACT_APP_HOSPITAL_SERVICE_URL || 'https://staging-api.hospital.com/hospital',
        APPOINTMENT_SERVICE: process.env.REACT_APP_APPOINTMENT_SERVICE_URL || 'https://staging-api.hospital.com/appointment',
        PATIENT_SERVICE: process.env.REACT_APP_PATIENT_SERVICE_URL || 'https://staging-api.hospital.com/patient',
        DOCTOR_SERVICE: process.env.REACT_APP_DOCTOR_SERVICE_URL || 'https://staging-api.hospital.com/doctor',
        EMAIL_SERVICE: process.env.REACT_APP_EMAIL_SERVICE_URL || 'https://staging-api.hospital.com/email'
      };
    case 'test':
      return {
        AUTH_SERVICE: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8081',
        HOSPITAL_SERVICE: process.env.REACT_APP_HOSPITAL_SERVICE_URL || 'http://localhost:8082',
        APPOINTMENT_SERVICE: process.env.REACT_APP_APPOINTMENT_SERVICE_URL || 'http://localhost:8083',
        PATIENT_SERVICE: process.env.REACT_APP_PATIENT_SERVICE_URL || 'http://localhost:8084',
        DOCTOR_SERVICE: process.env.REACT_APP_DOCTOR_SERVICE_URL || 'http://localhost:8085',
        EMAIL_SERVICE: process.env.REACT_APP_EMAIL_SERVICE_URL || 'http://localhost:8086'
      };
    default: // development and any other environment
      return {
        AUTH_SERVICE: process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8081',
        HOSPITAL_SERVICE: process.env.REACT_APP_HOSPITAL_SERVICE_URL || 'http://localhost:8080',
        APPOINTMENT_SERVICE: process.env.REACT_APP_APPOINTMENT_SERVICE_URL || 'http://localhost:8080',
        PATIENT_SERVICE: process.env.REACT_APP_PATIENT_SERVICE_URL || 'http://localhost:8080',
        DOCTOR_SERVICE: process.env.REACT_APP_DOCTOR_SERVICE_URL || 'http://localhost:8080',
        EMAIL_SERVICE: process.env.REACT_APP_EMAIL_SERVICE_URL || 'http://localhost:8080'
      };
  }
};

const API_CONFIG = getEnvironmentConfig();

// Create different axios instances for different services
const createApiInstance = (baseURL: string, serviceName: string) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    withCredentials: false,
    timeout: 30000 // 30 seconds timeout
  });

  // Add request interceptor for logging AND authorization
  instance.interceptors.request.use(
    (config) => {
      // Add authorization header to ALL service instances
      const token = localStorage.getItem('accessToken');

      // Enhanced debugging - also check what happened to the token
      const allKeys = Object.keys(localStorage);
      const tokenFromStorage = localStorage.getItem('accessToken');

      console.log(`[${serviceName}] Token lifecycle debug:`, {
        requestUrl: config.url,
        timestamp: new Date().toISOString(),
        tokenExists: !!token,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 20) + '...' : 'none',
        allLocalStorageKeys: allKeys,
        accessTokenValue: tokenFromStorage,
        localStorageSize: allKeys.length
      });

      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[${serviceName}] ✅ Authorization header added`);
      } else {
        console.log(`[${serviceName}] ❌ No valid token found - API call will fail`);
      }

      console.log(`[${serviceName}] API Request:`, config.method?.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error(`[${serviceName}] Request Error:`, error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      console.log(`[${serviceName}] API Response:`, response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error(`[${serviceName}] Response Error:`, error.response?.status, error.config?.url);

      // Handle unauthorized responses
      if (error.response?.status === 401) {
        console.warn(`[${serviceName}] Unauthorized - clearing stored auth data`);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Optionally redirect to login page
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Export service-specific API instances
export const authApi = createApiInstance(API_CONFIG.AUTH_SERVICE, 'AUTH');
export const hospitalApi = createApiInstance(API_CONFIG.HOSPITAL_SERVICE, 'HOSPITAL');
export const appointmentApi = createApiInstance(API_CONFIG.APPOINTMENT_SERVICE, 'APPOINTMENT');
export const patientApi = createApiInstance(API_CONFIG.PATIENT_SERVICE, 'PATIENT');
export const doctorApi = createApiInstance(API_CONFIG.DOCTOR_SERVICE, 'DOCTOR');
export const emailApi = createApiInstance(API_CONFIG.EMAIL_SERVICE, 'EMAIL');

// Default API instance (backward compatibility)
export const api = authApi;

// Export configuration for reference
export const apiConfig = API_CONFIG;

// Helper function to get service URL
export const getServiceUrl = (service: keyof typeof API_CONFIG): string => {
  return API_CONFIG[service];
};

// Health check function for all services
export const checkServiceHealth = async () => {
  const services = Object.keys(API_CONFIG) as (keyof typeof API_CONFIG)[];
  const healthStatus: Record<string, boolean> = {};

  for (const serviceName of services) {
    try {
      const serviceApi = getApiInstance(serviceName);
      await serviceApi.get('/health', { timeout: 5000 });
      healthStatus[serviceName] = true;
    } catch (error) {
      console.warn(`Service ${serviceName} is not available:`, error);
      healthStatus[serviceName] = false;
    }
  }

  return healthStatus;
};

// Helper function to get API instance by service name
export const getApiInstance = (serviceName: keyof typeof API_CONFIG) => {
  switch (serviceName) {
    case 'AUTH_SERVICE':
      return authApi;
    case 'HOSPITAL_SERVICE':
      return hospitalApi;
    case 'APPOINTMENT_SERVICE':
      return appointmentApi;
    case 'PATIENT_SERVICE':
      return patientApi;
    case 'DOCTOR_SERVICE':
      return doctorApi;
    case 'EMAIL_SERVICE':
      return emailApi;
    default:
      return authApi;
  }
};
