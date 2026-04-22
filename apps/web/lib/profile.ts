const allowedAssetClasses = ["stock", "etf", "crypto"] as const;

type AllowedAssetClass = (typeof allowedAssetClasses)[number];


export function parsePreferredAssetClasses(value: string): AllowedAssetClass[] {
  const parsed = value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is AllowedAssetClass => allowedAssetClasses.includes(item as AllowedAssetClass));

  if (parsed.length > 0) {
    return Array.from(new Set(parsed));
  }

  return ["stock", "crypto"];
}
