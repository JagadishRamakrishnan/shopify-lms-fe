import apiRequest from "./apiClient.js";

export const listCourses = async (shop, filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);

  const queryString = params.toString();
  const result = await apiRequest(`/api/courses${queryString ? `?${queryString}` : ""}`, { method: "GET" }, shop);
  return Array.isArray(result) ? result : result?.courses || [];
};

export const getCourse = async (id, shop) => {
  return apiRequest(`/api/courses/${id}`, { method: "GET" }, shop);
};

export const createCourse = async (course, shop) => {
  return apiRequest("/api/courses", { method: "POST", body: JSON.stringify(course) }, shop);
};

export const updateCourse = async (id, course, shop) => {
  return apiRequest(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(course) }, shop);
};

export const deleteCourse = async (id, shop) => {
  return apiRequest(`/api/courses/${id}`, { method: "DELETE" }, shop);
};
