import apiRequest from "./apiClient.js";

export const listStudents = async (shop, search = "") => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);

  const queryString = params.toString();
  const result = await apiRequest(`/api/students${queryString ? `?${queryString}` : ""}`, { method: "GET" }, shop);
  return Array.isArray(result) ? result : result?.students || [];
};

export const getStudent = async (id, shop) => {
  return apiRequest(`/api/students/${id}`, { method: "GET" }, shop);
};

export const createStudent = async (student, shop) => {
  return apiRequest("/api/students", { method: "POST", body: JSON.stringify(student) }, shop);
};

export const updateStudent = async (id, student, shop) => {
  return apiRequest(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(student) }, shop);
};
