const API_URL = process.env.REACT_APP_API_URL || "https://localhost:7162/api";

async function safeJson(res) {
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ------------------ KOLMKÕLAD ------------------

export async function getKolmkolar() {
  const res = await fetch(`${API_URL}/kolmkolad`);
  return await safeJson(res);
}

export async function addKolmkola(data) {
  const res = await fetch(`${API_URL}/kolmkolad`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await safeJson(res);
}

export async function deleteKolmkola(id) {
  const res = await fetch(`${API_URL}/kolmkolad/${id}`, {
    method: "DELETE",
  });
  await safeJson(res);
}

// ------------------ LOOD ------------------

export async function getLood() {
  const res = await fetch(`${API_URL}/lood`);
  return await safeJson(res);
}

export async function addLugu(data) {
  const res = await fetch(`${API_URL}/lood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  await safeJson(res);
}

export async function deleteLugu(id) {
  const res = await fetch(`${API_URL}/lood/${id}`, {
    method: "DELETE",
  });
  await safeJson(res);
}
