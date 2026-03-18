const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const request = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`${API}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${res.status}`);
  }

  return res.json();
};

export const signup = (data: any) => {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const login = (data: any) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const getTransactions = () => {
  return request("/transactions");
};

export const createTransaction = (data: any) => {
  return request("/transactions", {
    method: "POST",
    body: JSON.stringify(data)
  });
};