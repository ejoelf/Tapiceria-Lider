export function buildWorkOrderCode(nextId) {
  const padded = String(nextId).padStart(6, "0");
  return `TL-OT-${padded}`;
}