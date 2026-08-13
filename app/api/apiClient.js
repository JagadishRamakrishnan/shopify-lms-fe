// const API_BASE_URL = import.meta.env.VITE_LMS_API_URL || "http://localhost:3000";
const API_BASE_URL = "http://localhost:3000";

export default async function apiRequest(path, options = {}, shop) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (shop) {
    url.searchParams.set("shop", shop);
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = { success: false, message: "Request failed." };
  }

  if (!response.ok) {
    throw new Error(payload?.message || "Something went wrong while contacting the LMS API.");
  }

  return payload?.data ?? payload;
}
