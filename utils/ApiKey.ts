export const BACKEND_API_KEY ="https://packarma.shellcode.cloud"
  import.meta.env["VITE_ENV"] === "DEV"
    ? "http://localhost:5000/api/admin"
    : import.meta.env["VITE_ADMIN_BACKEND_LINK"];

export const BACKEND_MEDIA_LINK ="https://packarma.shellcode.cloud"
  import.meta.env["VITE_ENV"] === "DEV"
    ? "http://localhost:5000"
    : import.meta.env["VITE_ADMIN_BACKEND_LINK"];
