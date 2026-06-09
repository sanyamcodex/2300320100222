export function Log(stack: string, level: string, packageName: string, message: string) {
  if (typeof window === "undefined") {
    return;
  }

  const entry = {
    time: new Date().toISOString(),
    stack,
    level,
    package: packageName,
    message
  };

  const key = "stage7_client_logs";
  const existing = window.sessionStorage.getItem(key);
  const logs = existing ? JSON.parse(existing) : [];
  logs.push(entry);
  window.sessionStorage.setItem(key, JSON.stringify(logs.slice(-80)));
}

