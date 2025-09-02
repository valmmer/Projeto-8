// src/lib/ai.ts
export type ImproveField = "resumo" | "experiencia" | "objetivo"; // 👈 inclui


export interface ImproveResponse {
  ok: boolean;
  result?: string;
  error?: string;
}

export async function improveText(
  prompt: string,
  field: ImproveField,
  opts?: { signal?: AbortSignal }
): Promise<ImproveResponse> {
  const res = await fetch("/api/ai/improve", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ prompt, field }),
    signal: opts?.signal,
  });
  const data = (await res.json()) as ImproveResponse;
  if (!res.ok || data.ok === false) {
    throw new Error(data?.error || `Falha na API (${res.status})`);
  }
  return data;
}
