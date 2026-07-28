import { apiFetch } from './apiClient.js';

const PATH = '/api/users';

export async function getEngineers() {
  const res = await apiFetch(`${PATH}/engineers`);
  if (!res.ok) throw new Error('Failed to fetch engineers');
  return await res.json();
}