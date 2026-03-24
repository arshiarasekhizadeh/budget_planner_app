const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const request = async (endpoint: string, options?: RequestInit) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options?.headers || {})
  };

  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    let message = `API error: ${res.status}`;
    
    if (errorData.message) {
      message = errorData.message;
    } else if (typeof errorData.detail === 'string') {
      message = errorData.detail;
    } else if (Array.isArray(errorData.detail) && errorData.detail[0]?.msg) {
      // For validation errors
      message = errorData.detail[0].msg;
    }
    
    throw new Error(message);
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

export const forgotPassword = (email: string) => {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email })
  });
};

export const resetPassword = (data: any) => {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data)
  });
};

export const verifyEmail = (token: string) => {
  return request(`/auth/verify-email?token=${token}`);
};

export const getMonthlyGoal = (month: string, token: string) => {
  return request(`/monthly-goals/?month=${month}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
};

export const updateMonthlyGoal = (data: { month: string, goal_amount: number }, token: string) => {
  return request("/monthly-goals/", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
};

export const getMe = (token: string) => {
  return request("/auth/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
};

export const updateUser = (data: any, token: string) => {
  return request("/auth/update", {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
};

export const changePassword = (data: any, token: string) => {
  return request("/auth/change-password", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
};

export const uploadAvatar = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API}/auth/upload-avatar`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  return res.json();
};

export const getAiAdvice = (month: string, token: string) => {
  return request(`/analytics/ai-advice?month=${month}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
};

export const exportBudget = async (month: string, format: 'pdf' | 'csv', token: string) => {
  const res = await fetch(`${API}/analytics/export/${format}?month=${month}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  if (!res.ok) throw new Error("Export failed");
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budget_report_${month}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};


export const getBudgets = (month: string, token: string) => {
  return request(`/budgets/?month=${month}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
};

export const createBudget = (data: any, token: string) => {
  return request("/budgets/", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
};

export const updateBudget = (id: number, data: any, token: string) => {
  return request(`/budgets/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
};

export const deleteBudget = (id: number, token: string) => {
  return request(`/budgets/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
};

export const getTransactions = () => {
  return request("/transactions");
};