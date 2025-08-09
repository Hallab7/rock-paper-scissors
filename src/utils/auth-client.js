// utils/auth-client.js

export async function signup({ username, email, password }) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "signup", username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  return data.user;
}

export async function login({ email, password }) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data.user;
}

export async function logout() {
  await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "logout" }),
  });
}

export async function getCurrentUser() {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include" // ensures cookies are sent
  });
  const data = await res.json();
  
  if (!res.ok) throw new Error(data.error || "Not authenticated");
  return data.user;
}

async function checkAuth() {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (res.ok) {
    const data = await res.json();
    if (data.user) {
      console.log("User is logged in:", data.user);
    } else {
      console.log("No valid user");
    }
  } else {
    console.log("Auth check failed");
  }
}
checkAuth();
