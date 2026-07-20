const BASE_URL = "http://127.0.0.1:8000/api/complaints";

export async function getComplaints() {
  const res = await fetch(`${BASE_URL}?limit=100`);

  if (!res.ok) {
    throw new Error("Failed to fetch complaints");
  }

  return await res.json();
}

export async function createComplaint(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    throw new Error("Failed to create complaint");
  }

  return await res.json();
}

export async function updateComplaint(id, data) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to update complaint");
  }

  return await res.json();
}

export async function deleteComplaint(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete complaint");
  }

  return await res.json();
}
