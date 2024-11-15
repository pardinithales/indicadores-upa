const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? "https://indicadores-upa-back-2addxqkdd-thales-pardinis-projects.vercel.app"
  : "http://localhost:8001";

export default API_BASE_URL;
