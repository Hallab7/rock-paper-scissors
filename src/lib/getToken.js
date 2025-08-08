// src/lib/getToken.js
import { cookies } from "next/headers";

export async function getToken() {
  const cookieStore = await cookies(); // <-- now awaited
  const token = cookieStore.get("token")?.value || null;
  return token;
}
