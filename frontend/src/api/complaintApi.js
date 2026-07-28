import { apiFetch } from './apiClient.js';
import { getEngineers } from './userApi.js';

const PATH = '/api/complaints';

export async function getComplaints() {
  const res = await apiFetch(`${PATH}?limit=100`);
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return await res.json();
}

export async function getComplaintById(id) {
  const [res, engineers] = await Promise.all([
    apiFetch(`${PATH}/${id}`),
    getEngineers().catch(() => [])
  ]);
  if (!res.ok) throw new Error('Failed to fetch complaint details');
  
  const item = await res.json();
  
  const engMap = {};
  engineers.forEach((e) => {
    engMap[e.id] = e.full_name;
  });

  const engineerName = engMap[item.assigned_to] || (item.assigned_to ? `ID: ${item.assigned_to}` : null);
  
  // Map snake_case from backend to camelCase for the frontend modal
  return {
    id: item.id,
    location: item.location,
    issueType: item.issue_type,
    description: item.description ?? "",
    severity: item.severity?.toLowerCase() ?? "low",
    status: item.status?.toLowerCase() === "false alarm" ? "false_alarm" : item.status?.toLowerCase(),
    assignedToId: item.assigned_to,
    assignedTo: engineerName,
    feedback: item.feedback ?? "",
    imageUrl: item.image_url,
    createdAt: new Date(item.created_at),
    cameraId: item.camera_id,
  };
}

export async function createComplaint(data) {
  // data is FormData — do NOT set Content-Type header (browser sets it with boundary automatically)
  const res = await apiFetch(PATH, { method: 'POST', body: data });
  if (!res.ok) throw new Error('Failed to create complaint');
  return await res.json();
}

export async function updateComplaint(id, data) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const res = await apiFetch(`${PATH}/${id}`, { method: 'PUT', body: formData });
  if (!res.ok) throw new Error('Failed to update complaint');
  return await res.json();
}

export async function deleteComplaint(id) {
  const res = await apiFetch(`${PATH}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete complaint');
  return await res.json();
}
