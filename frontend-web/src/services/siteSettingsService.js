const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function getPublicWebsiteSettingsRequest() {
  const response = await fetch(`${API_BASE_URL}/public/settings/website`);

  if (!response.ok) {
    throw new Error("No se pudieron cargar los ajustes públicos.");
  }

  return response.json();
}