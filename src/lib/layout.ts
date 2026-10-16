/** Deterministic cell shapes so the broadsheet feels modular, not uniform. */
export type CellShape = "lead" | "wide" | "tall" | "compact" | "standard";

export function getCellShape(index: number): CellShape {
  if (index === 1) return "lead";
  if (index % 11 === 0 || index === 6) return "wide";
  if (index % 7 === 0 || index === 3) return "tall";
  if (index % 5 === 0 || index === 8) return "compact";
  return "standard";
}

export function getExcerptLength(shape: CellShape): number {
  switch (shape) {
    case "lead":
      return 340;
    case "wide":
      return 260;
    case "tall":
      return 300;
    case "compact":
      return 110;
    default:
      return 200;
  }
}
