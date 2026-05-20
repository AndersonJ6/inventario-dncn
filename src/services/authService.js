const MCP_ENDPOINT = import.meta.env.VITE_MCP_ENDPOINT || "https://stitch.googleapis.com/mcp";
const MCP_API_KEY = import.meta.env.VITE_MCP_API_KEY || null;

const sendMCPRequest = async (method, params = {}) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (MCP_API_KEY) {
    headers["X-Goog-Api-Key"] = MCP_API_KEY;
  }

  const response = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Error de conexión con el servicio remoto.");
  }
  if (payload?.error) {
    const errorMessage = payload.error.message || "Error en la respuesta MCP.";
    throw new Error(errorMessage);
  }
  return payload.result;
};

export const pingMCP = async () => sendMCPRequest("ping");

export const loginWithMCP = async (user, password) => {
  return sendMCPRequest("login", { user, email: user, password });
};
