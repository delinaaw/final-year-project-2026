export const SERIES_LIGHT = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#8a5a2b",
] as const;

export function seriesColor(index: number) {
  return SERIES_LIGHT[index % SERIES_LIGHT.length];
}
