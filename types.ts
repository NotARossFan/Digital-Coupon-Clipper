export enum InputMode {
  SCREENSHOT = 'SCREENSHOT',
  HTML = 'HTML',
}

export interface ScriptResponse {
  script: string;
  explanation: string;
  confidence: string;
  targetSelectors: string[];
}

export interface Coupon {
  id: number;
  product: string;
  discount: string;
  isClipped: boolean;
  image: string;
}