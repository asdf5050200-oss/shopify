export interface Product {
  id: string;
  url: string;
  name: string;
  base64: string;
  mimeType: string;
}

export interface MockupResult {
  id: string;
  medium: string;
  imageUrl: string;
  prompt: string;
}

export type MediumType = 'boutique window' | 'jewelry box' | 'fashion magazine' | 'luxury display' | 'billboard';
export type StyleType = 'none' | 'vintage' | 'futuristic' | 'minimalist' | 'painterly' | 'cyberpunk' | 'retro-ads';
export type BackgroundType = 'studio' | 'outdoor' | 'abstract' | 'office' | 'custom';
export type TextureType = 'none' | 'fabric' | 'metallic' | 'paper' | 'leather' | 'glass' | 'velvet';

export interface GenerationConfig {
  mediums: MediumType[];
  style: StyleType;
  texture: TextureType;
  background: {
    type: BackgroundType;
    customUrl?: string;
    customBase64?: string;
    customMimeType?: string;
  };
}
