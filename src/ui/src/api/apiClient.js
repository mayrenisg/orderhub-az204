const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export async function apiRequest(path, options = {}) {
const token = localStorage.getItem('orderhub_token');
const headers = {
'Content-Type': 'application/json',
...(options.headers || {}),
};
if (token) {
headers.Authorization = `Bearer ${token}`;
}
const response = await fetch(`${API_BASE_URL}${path}`, {
...options,
headers,
});
if (!response.ok) {
throw new Error(`Request failed: ${response.status}`);
}
return response.json();
}