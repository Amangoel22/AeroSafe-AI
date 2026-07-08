const BASE_URL = "http://127.0.0.1:8000/api/users";

export async function getEngineers() {
  const res = await fetch(`${BASE_URL}/engineers`);

  if (!res.ok) {
    throw new Error("Failed to fetch engineers");
  }

  return await res.json();
}