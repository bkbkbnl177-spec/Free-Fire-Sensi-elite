
export interface SensitivitySettings {
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeLook: number;
  dpi: string;
  fireButtonSize: string;
  tips: string[];
  deviceName: string;
}

export interface HistoryItem {
  id: string;
  deviceName: string;
  timestamp: number;
  settings: SensitivitySettings;
}
