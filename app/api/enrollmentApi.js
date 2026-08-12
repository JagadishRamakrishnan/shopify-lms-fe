import apiRequest from "./apiClient.js";

export const listEnrollments = async (shop, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);

  const queryString = params.toString();
  const result = await apiRequest(`/api/enrollments${queryString ? `?${queryString}` : ""}`, { method: "GET" }, shop);
  return Array.isArray(result) ? result : result?.enrollments || [];
};

export const getEnrollment = async (id, shop) => {
  return apiRequest(`/api/enrollments/${id}`, { method: "GET" }, shop);
};

export const createEnrollment = async (payload, shop) => {
  return apiRequest("/api/enrollments", { method: "POST", body: JSON.stringify(payload) }, shop);
};

export const updateEnrollment = async (id, payload, shop) => {
  return apiRequest(`/api/enrollments/${id}`, { method: "PUT", body: JSON.stringify(payload) }, shop);
};

export const deleteEnrollment = async (id, shop) => {
  return apiRequest(`/api/enrollments/${id}`, { method: "DELETE" }, shop);
};
