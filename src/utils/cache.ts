export function cache<T>(fn: (...args: any[]) => Promise<T>, ttl: number) {
  const cache = new Map<string, { result: Promise<T>; expiresAt: number }>();
  return async (...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      const cached = cache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.result;
      }
    }
    const result = fn(...args);
    cache.set(key, { result, expiresAt: Date.now() + ttl });
    return result;
  };
}
