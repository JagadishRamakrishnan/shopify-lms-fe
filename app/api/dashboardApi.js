import apiRequest from "./apiClient.js";

export const getDashboardStats = async (shop) => {
  return apiRequest("/api/dashboard/stats", { method: "GET" }, shop);
};

export const getRecentEnrollments = async (shop) => {
  return apiRequest("/api/dashboard/recent-enrollments", { method: "GET" }, shop);
};
