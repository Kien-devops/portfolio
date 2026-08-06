const poolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || "";
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || "";
const region = import.meta.env.VITE_COGNITO_REGION || "us-east-1";

export interface AuthResult {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function login(email: string, password: string): Promise<string> {
  const url = `https://cognito-idp.${region}.amazonaws.com/`;
  
  if (!clientId) {
    console.error("Vite environment variables for Cognito are missing.", { region, poolId, clientId });
    // Safe fall-back for local development/mock authentication
    if (email === "admin@example.com" && password === "Admin123!") {
      const mockToken = "mock-jwt-token";
      localStorage.setItem("id_token", mockToken);
      localStorage.setItem("access_token", "mock-access-token");
      localStorage.setItem("refresh_token", "mock-refresh-token");
      localStorage.setItem("token_expires_at", (Date.now() + 3600 * 1000).toString());
      return mockToken;
    }
    throw new Error("Cognito Client ID is not configured. For local mock development, use admin@example.com / Admin123!");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
    },
    body: JSON.stringify({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorMsg = result.message || result.__type || "Authentication failed";
    throw new Error(errorMsg);
  }

  const authResult = result.AuthenticationResult;
  if (!authResult) {
    throw new Error("No authentication result returned from Cognito");
  }

  localStorage.setItem("id_token", authResult.IdToken);
  localStorage.setItem("access_token", authResult.AccessToken);
  localStorage.setItem("refresh_token", authResult.RefreshToken);
  localStorage.setItem("token_expires_at", (Date.now() + authResult.ExpiresIn * 1000).toString());

  return authResult.IdToken;
}

export function logout(): void {
  localStorage.removeItem("id_token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");
}

export function isAuthenticated(): boolean {
  const token = localStorage.getItem("id_token");
  const expiresAt = localStorage.getItem("token_expires_at");
  if (!token || !expiresAt) {
    return false;
  }
  // Check if token is expired
  const expired = Date.now() >= parseInt(expiresAt, 10);
  if (expired) {
    logout();
  }
  return !expired;
}

export function getToken(): string | null {
  if (!isAuthenticated()) {
    return null;
  }
  return localStorage.getItem("id_token");
}

export function getAdminEmail(): string {
  if (!isAuthenticated()) return "";
  const token = localStorage.getItem("id_token");
  if (!token || token === "mock-jwt-token") return "admin@example.com";
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.email || "Admin";
  } catch (err) {
    return "Admin";
  }
}
