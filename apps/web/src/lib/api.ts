import {
  AvatarOption,
  CityDetail,
  CreateSessionResponse,
  ErrorBody,
  MeResponse,
  WorldSnapshot,
} from "@3dworld/contracts";
import { z } from "zod";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.status = status;
    this.code = code;
  }
}

const request = async <T>(
  schema: z.ZodType<T>,
  path: string,
  init: { method?: string; token?: string | undefined; body?: unknown } = {},
): Promise<T> => {
  const headers: Record<string, string> = {};
  if (init.token) headers.authorization = `Bearer ${init.token}`;
  if (init.body !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
  });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = ErrorBody.safeParse(json);
    throw new ApiError(res.status, err.success ? err.data.error : "http_error", err.data?.message);
  }
  return schema.parse(json);
};

export const api = {
  world: () => request(WorldSnapshot, "/v1/world"),
  city: (cityId: string) => request(CityDetail, `/v1/cities/${encodeURIComponent(cityId)}`),
  avatars: () => request(z.object({ avatars: z.array(AvatarOption) }), "/v1/avatars"),
  createSession: (name: string, avatarId: string) =>
    request(CreateSessionResponse, "/v1/session", { method: "POST", body: { name, avatarId } }),
  me: (token: string) => request(MeResponse, "/v1/me", { token }),
  updateMe: (token: string, patch: { name?: string; avatarId?: string }) =>
    request(MeResponse, "/v1/me", { method: "PATCH", token, body: patch }),
};
