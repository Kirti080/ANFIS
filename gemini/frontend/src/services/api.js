import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({ baseURL: BASE, timeout: 60_000 });

export const predict = (inputs)            => api.post("/predict",         inputs).then(r => r.data);
export const fetchMFs = ()                 => api.get("/membership-functions").then(r => r.data);
export const explainability = (inputs)     => api.post("/explainability",   inputs).then(r => r.data);
export const fetchAuditLog = (params = {}) => api.get("/audit-log",  { params }).then(r => r.data);
export const fetchStats = ()               => api.get("/audit-stats").then(r => r.data);
export const retrain = ()                  => api.post("/retrain",          {}).then(r => r.data);
export const healthCheck = ()              => api.get("/health").then(r => r.data);
