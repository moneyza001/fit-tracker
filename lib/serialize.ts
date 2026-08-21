export function toPlainJSON<T>(data: unknown): T {
  return JSON.parse(JSON.stringify(data)) as T;
}
