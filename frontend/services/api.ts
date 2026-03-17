const API = process.env.NEXT_PUBLIC_API_URL;

export const request = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`${API}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
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