const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? "https://indicadores-upa-back.vercel.app"
    : "http://localhost:8001");

export default API_BASE_URL;
