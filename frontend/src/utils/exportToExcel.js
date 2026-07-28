export function exportComplaintsToExcel(complaints, filenamePrefix = "Incident_History") {
  if (!complaints || complaints.length === 0) {
    alert("No incident data available to export.");
    return;
  }

  const headers = [
    "ID",
    "Camera ID",
    "Assigned To",
    "Location",
    "Issue Type",
    "Description",
    "Severity",
    "Status",
    "Reported At (IST)",
    "Created At (IST)",
    "Resolved At (IST)",
    "Feedback",
    "Is Active",
    "Image URL / Reference"
  ];

  const formatDate = (dateVal) => {
    if (!dateVal) return "N/A";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = complaints.map((c) => {
    const id = c.id ?? "N/A";
    const cameraId = c.cameraId ?? c.camera_id ?? "N/A";
    const assignedTo = c.assignedTo || (c.assignedToId ? `ID: ${c.assignedToId}` : "Unassigned");
    const location = c.location ?? "N/A";
    const issueType = c.issueType ?? c.issue_type ?? "N/A";
    const description = c.description ?? "";
    const severity = (c.severity ?? "low").toUpperCase();
    const status = (c.status ?? "Pending").toUpperCase();
    const reportedAt = formatDate(c.reportedAt || c.reported_at || c.createdAt);
    const createdAt = formatDate(c.createdAt || c.created_at);
    const resolvedAt = formatDate(c.resolvedAt || c.resolved_at);
    const feedback = c.feedback ?? "";
    const isActive = c.isActive !== undefined ? String(c.isActive) : "true";

    const rawImageUrl = c.image || c.imageUrl || c.image_url;
    let imageUrl = "No Image";
    if (rawImageUrl) {
      if (rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")) {
        imageUrl = rawImageUrl;
      } else {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        imageUrl = `${baseUrl}/${rawImageUrl.replace(/^\//, "")}`;
      }
    }

    return [
      id,
      cameraId,
      assignedTo,
      location,
      issueType,
      description,
      severity,
      status,
      reportedAt,
      createdAt,
      resolvedAt,
      feedback,
      isActive,
      imageUrl
    ].map(escapeCsv).join(",");
  });

  const headerRow = headers.map(escapeCsv).join(",");
  const csvContent = "\uFEFF" + [headerRow, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const timestamp = new Date().toISOString().split("T")[0];
  downloadLink.href = url;
  downloadLink.download = `${filenamePrefix}_${timestamp}.csv`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
