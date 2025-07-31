export function clean(
  obj: Record<string, unknown> | Record<string, unknown>[]
): object {
  if (Array.isArray(obj)) {
    return obj.map((item) => clean(item));
  }
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) {
      delete obj[k];
    } else if (typeof v === "object") {
      clean(v as Record<string, unknown>);
    }
  }
  return obj;
}
