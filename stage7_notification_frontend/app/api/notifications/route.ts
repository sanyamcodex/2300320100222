import { NextRequest, NextResponse } from "next/server";
import { readFile, mkdir, appendFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const AUTH_URLS = [
  "http://4.224.186.213/evaluation-service/auth",
  "http://20.244.56.144/evaluation-service/auth"
];

type EnvValues = Record<string, string>;

async function Log(stack: string, level: string, packageName: string, message: string) {
  const logDir = path.join(process.cwd(), "..", "logs");
  await mkdir(logDir, { recursive: true });
  const line = `${new Date().toISOString()} | stack=${stack} | level=${level} | package=${packageName} | ${message}\n`;
  await appendFile(path.join(logDir, "stage7.log"), line, "utf-8");
}

async function readEnvValues(): Promise<EnvValues> {
  const envPath = path.join(process.cwd(), "..", ".env");
  const envText = await readFile(envPath, "utf-8");
  const values: EnvValues = {};

  for (const line of envText.split(/\r?\n/)) {
    if (!line.includes(":")) {
      continue;
    }
    const [key, ...rest] = line.split(":");
    values[key.trim().replaceAll('"', "")] = rest.join(":").trim().replaceAll('"', "");
  }

  return values;
}

function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1];
  const decoded = Buffer.from(payload, "base64url").toString("utf-8");
  return JSON.parse(decoded);
}

function buildAuthPayload(values: EnvValues) {
  const tokenPayload = decodeJwtPayload(values.access_token);
  return {
    email: tokenPayload.email,
    name: tokenPayload.name,
    rollNo: tokenPayload.rollNo,
    accessCode: tokenPayload.accessCode,
    clientID: values.clientID,
    clientSecret: values.clientSecret
  };
}

async function refreshToken(values: EnvValues) {
  const payload = JSON.stringify(buildAuthPayload(values));

  for (const authUrl of AUTH_URLS) {
    try {
      await Log("backend", "info", "stage7-api", `Refreshing token using ${authUrl}`);
      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: payload,
        cache: "no-store"
      });

      if (!response.ok) {
        await Log("backend", "warn", "stage7-api", `Token refresh failed with ${response.status}`);
        continue;
      }

      const parsed = await response.json();
      const token = parsed.access_token ?? parsed.accessToken;
      if (token) {
        await Log("backend", "info", "stage7-api", "Token refresh successful");
        return token;
      }
    } catch (error) {
      await Log("backend", "error", "stage7-api", `Token refresh error: ${(error as Error).message}`);
    }
  }

  throw new Error("Unable to refresh token");
}

function buildRemoteUrl(request: NextRequest) {
  const remoteUrl = new URL(API_URL);
  const limit = request.nextUrl.searchParams.get("limit");
  const page = request.nextUrl.searchParams.get("page");
  const type = request.nextUrl.searchParams.get("notification_type");

  if (limit) {
    remoteUrl.searchParams.set("limit", limit);
  }
  if (page) {
    remoteUrl.searchParams.set("page", page);
  }
  if (type && type !== "All") {
    remoteUrl.searchParams.set("notification_type", type);
  }

  return remoteUrl;
}

async function fetchNotifications(remoteUrl: URL, token: string) {
  return fetch(remoteUrl, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });
}

export async function GET(request: NextRequest) {
  try {
    const values = await readEnvValues();
    const remoteUrl = buildRemoteUrl(request);

    await Log("backend", "info", "stage7-api", `Fetching notifications page=${request.nextUrl.searchParams.get("page") ?? "1"}`);
    let response = await fetchNotifications(remoteUrl, values.access_token);

    if (response.status === 401) {
      await Log("backend", "warn", "stage7-api", "Saved token rejected, refreshing");
      const freshToken = await refreshToken(values);
      response = await fetchNotifications(remoteUrl, freshToken);
    }

    if (!response.ok) {
      await Log("backend", "error", "stage7-api", `Notification API failed with ${response.status}`);
      return NextResponse.json(
        { notifications: [], message: "Unable to fetch notifications right now" },
        { status: response.status }
      );
    }

    const parsed = await response.json();
    await Log("backend", "info", "stage7-api", `Returned ${(parsed.notifications ?? []).length} notifications`);
    return NextResponse.json(parsed);
  } catch (error) {
    await Log("backend", "error", "stage7-api", `Request failed: ${(error as Error).message}`);
    return NextResponse.json(
      { notifications: [], message: "Something went wrong while loading notifications" },
      { status: 500 }
    );
  }
}

