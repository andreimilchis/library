/**
 * Revolut Business API Client
 *
 * Handles authentication, token management, and API calls to Revolut Business API.
 * Uses JWT Bearer client assertion (RS256) with X.509 certificate for OAuth.
 */

import { SignJWT, importPKCS8 } from "jose";

const REVOLUT_API_URL =
  process.env.REVOLUT_USE_SANDBOX === "true"
    ? process.env.REVOLUT_SANDBOX_URL || "https://sandbox-b2b.revolut.com/api/1.0"
    : process.env.REVOLUT_API_URL || "https://b2b.revolut.com/api/1.0";

const REVOLUT_AUTH_URL =
  process.env.REVOLUT_USE_SANDBOX === "true"
    ? "https://sandbox-business.revolut.com/app-confirm"
    : "https://business.revolut.com/app-confirm";

export interface RevolutTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RevolutAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface RevolutTransaction {
  id: string;
  type: string;
  state: string;
  created_at: string;
  completed_at?: string;
  reference?: string;
  legs: {
    leg_id: string;
    account_id: string;
    amount: number;
    currency: string;
    description?: string;
    balance?: number;
  }[];
  merchant?: {
    name: string;
    category_code: string;
    city?: string;
    country?: string;
  };
}

/**
 * Generates a JWT client assertion signed with the private key.
 * Revolut requires this for OAuth token requests.
 */
async function generateClientAssertion(): Promise<string> {
  const privateKeyPem = process.env.REVOLUT_PRIVATE_KEY;
  const clientId = process.env.REVOLUT_CLIENT_ID;
  const redirectUri = process.env.REVOLUT_REDIRECT_URI;

  if (!privateKeyPem || !clientId) {
    throw new Error("REVOLUT_PRIVATE_KEY and REVOLUT_CLIENT_ID must be set");
  }

  // Extract domain from redirect URI to use as JWT issuer
  // Revolut expects the issuer to be the redirect URI domain, not the client_id
  let issuer = clientId;
  if (redirectUri) {
    try {
      issuer = new URL(redirectUri).hostname;
    } catch {
      // Fall back to clientId if redirect URI is invalid
    }
  }

  // Handle escaped newlines in env var (common when setting via Vercel dashboard)
  const normalizedPem = privateKeyPem.replace(/\\n/g, "\n");

  const privateKey = await importPKCS8(normalizedPem, "RS256");

  const tokenEndpoint = `${REVOLUT_API_URL}/auth/token`;

  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(issuer)
    .setSubject(clientId)
    .setAudience(tokenEndpoint)
    .setIssuedAt()
    .setExpirationTime("60s")
    .sign(privateKey);
}

export class RevolutClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${REVOLUT_API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Revolut API error (${response.status}): ${error}`);
    }

    return response.json() as Promise<T>;
  }

  async getAccounts(): Promise<RevolutAccount[]> {
    return this.request<RevolutAccount[]>("/accounts");
  }

  async getAccount(accountId: string): Promise<RevolutAccount> {
    return this.request<RevolutAccount>(`/accounts/${accountId}`);
  }

  async getTransactions(
    params: {
      from?: string;
      to?: string;
      count?: number;
      type?: string;
    } = {}
  ): Promise<RevolutTransaction[]> {
    const searchParams = new URLSearchParams();
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    if (params.count) searchParams.set("count", params.count.toString());
    if (params.type) searchParams.set("type", params.type);

    const query = searchParams.toString();
    return this.request<RevolutTransaction[]>(`/transactions${query ? `?${query}` : ""}`);
  }

  async getTransaction(transactionId: string): Promise<RevolutTransaction> {
    return this.request<RevolutTransaction>(`/transaction/${transactionId}`);
  }

  static async exchangeAuthorizationCode(code: string): Promise<RevolutTokenResponse> {
    const clientAssertion = await generateClientAssertion();

    const response = await fetch(`${REVOLUT_API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.REVOLUT_CLIENT_ID || "",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: clientAssertion,
        redirect_uri: process.env.REVOLUT_REDIRECT_URI || "",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json() as Promise<RevolutTokenResponse>;
  }

  static async refreshAccessToken(refreshToken: string): Promise<RevolutTokenResponse> {
    const clientAssertion = await generateClientAssertion();

    const response = await fetch(`${REVOLUT_API_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.REVOLUT_CLIENT_ID || "",
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: clientAssertion,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    return response.json() as Promise<RevolutTokenResponse>;
  }

  static getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.REVOLUT_CLIENT_ID || "",
      response_type: "code",
      redirect_uri: process.env.REVOLUT_REDIRECT_URI || "",
      scope: "READ",
    });
    return `${REVOLUT_AUTH_URL}?${params.toString()}`;
  }
}
