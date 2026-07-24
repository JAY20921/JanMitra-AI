/**
 * Shared API configuration and helper functions for the frontend.
 * Points to the FastAPI backend running on port 8000.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/**
 * Generic fetcher with error handling.
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

/**
 * Stream a response from the chat endpoint.
 * Yields text chunks as they arrive via SSE.
 */
export async function* streamChat(
  query: string,
  userProfile?: Record<string, unknown>,
  sessionId?: string,
  language: string = "English"
): AsyncGenerator<string, void, undefined> {
  const url = `${API_BASE_URL}/chat/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      user_profile: userProfile || null,
      session_id: sessionId || null,
      stream: true,
      language,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "Unknown error");
    throw new Error(`Chat API Error ${res.status}: ${errorBody}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}

/**
 * Upload a file to the temp ingestion endpoint.
 */
export async function uploadTempDocument(
  sessionId: string,
  file: File
): Promise<{ message: string; num_chunks: number }> {
  const url = `${API_BASE_URL}/ingest/temp`;
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "Unknown error");
    throw new Error(`Upload Error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

/**
 * Scheme type matching the backend SchemeResponse model.
 */
export interface Scheme {
  id: string;
  title: string;
  ministry: string;
  match_percentage: number;
  eligibility_summary: string;
  benefits: string[];
  source_url?: string;
  source_type: string;
}

/**
 * Fetch recommended schemes from the backend.
 */
export async function fetchSchemes(params?: {
  state?: string;
  category?: string;
  age?: number;
  gender?: string;
  income?: number;
}): Promise<Scheme[]> {
  const searchParams = new URLSearchParams();
  if (params?.state) searchParams.set("state", params.state);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.age) searchParams.set("age", String(params.age));
  if (params?.gender) searchParams.set("gender", params.gender);
  if (params?.income) searchParams.set("income", String(params.income));

  const qs = searchParams.toString();
  const endpoint = `/schemes/${qs ? `?${qs}` : ""}`;
  return apiFetch<Scheme[]>(endpoint);
}

/**
 * Fetch chat history for a given session.
 */
export async function fetchChatHistory(sessionId: string): Promise<{ messages: { role: string; content: string }[] }> {
  return apiFetch<{ messages: { role: string; content: string }[] }>(`/chat/history/${sessionId}`);
}

/**
 * Clear user uploaded temporary documents for a session.
 */
export async function clearTempDocument(sessionId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/ingest/temp/${sessionId}`, {
    method: "DELETE",
  });
}
