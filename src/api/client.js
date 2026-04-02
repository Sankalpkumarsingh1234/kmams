/**
 * GigShield API Client
 * Central place to manage all backend API calls
 */

const API_URL = 'http://localhost:3001';

export const api = {
  // User Management
  createUser: async (userData) => {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error(`Create user failed: ${response.status}`);
    return response.json();
  },

  getUser: async (userId) => {
    const response = await fetch(`${API_URL}/api/users/${userId}`);
    if (!response.ok) throw new Error(`Get user failed: ${response.status}`);
    return response.json();
  },

  // Policy Management
  createPolicy: async (policyData) => {
    const response = await fetch(`${API_URL}/api/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData),
    });
    if (!response.ok) throw new Error(`Create policy failed: ${response.status}`);
    return response.json();
  },

  // Claims Management
  createClaim: async (claimData) => {
    const response = await fetch(`${API_URL}/api/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData),
    });
    if (!response.ok) throw new Error(`Create claim failed: ${response.status}`);
    return response.json();
  },

  getClaims: async (userId) => {
    const response = await fetch(`${API_URL}/api/users/${userId}/claims`);
    if (!response.ok) throw new Error(`Get claims failed: ${response.status}`);
    return response.json();
  },

  // Chat / AI
  sendChat: async (userMessage, userContext) => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage, userContext }),
    });
    if (!response.ok) throw new Error(`Chat failed: ${response.status}`);
    return response.json();
  },

  // Weather Triggers
  checkWeather: async (pinCode) => {
    const response = await fetch(`${API_URL}/api/triggers/check/${pinCode}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`Weather check failed: ${response.status}`);
    return response.json();
  },

  // Payments
  createPaymentOrder: async (amount, userId, policyId) => {
    const response = await fetch(`${API_URL}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, userId, policyId }),
    });
    if (!response.ok) throw new Error(`Create order failed: ${response.status}`);
    return response.json();
  },

  verifyPayment: async (orderId, paymentId, signature) => {
    const response = await fetch(`${API_URL}/api/payment/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, paymentId, signature }),
    });
    if (!response.ok) throw new Error(`Verify payment failed: ${response.status}`);
    return response.json();
  },

  // Health check
  health: async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
