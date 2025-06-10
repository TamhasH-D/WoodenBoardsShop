export interface Point {
  x: number;
  y: number;
}

export interface Detection {
  confidence: number;
  class_name: string;
  points: Point[];
}

export interface WoodenBoard {
  volume: number;
  height: number;
  width: number;
  length: number;
  detection: Detection;
}

export interface AnalysisResponse {
  total_volume: number;
  total_count: number;
  wooden_boards: WoodenBoard[];
}