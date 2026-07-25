// Fallback to mock auth if explicitly set or if Google Client ID is missing
const useMockAuth =
  import.meta.env.VITE_USE_MOCK_AUTH === "True" ||
  !import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() === "";

export { useMockAuth };
