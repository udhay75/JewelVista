
export enum JewelleryType {
  NECKLACE = 'Necklace',
  EARRINGS = 'Earrings',
  RING = 'Ring',
  BANGLE = 'Bangle',
}

export enum ModelStyle {
  BRIDAL = 'Bridal',
  MODERN = 'Modern',
  LIFESTYLE = 'Lifestyle',
  STUDIO = 'Studio',
}

export enum RegionalStyle {
  NORTH_INDIAN = 'North Indian',
  SOUTH_INDIAN = 'South Indian',
  INTERNATIONAL = 'International',
}

export enum ShotType {
  CLOSE_UP = 'Close-up',
  MID_SHOT = 'Mid-shot',
  STANDING = 'Standing',
  SIDE_PROFILE = 'Side Profile',
}

export enum SkinTone {
  FAIR = 'Fair',
  MEDIUM = 'Medium',
  DEEP = 'Deep',
}

export enum ModelSource {
  AI_GENERATED = 'AI Generated',
  CUSTOM_UPLOAD = 'Custom Upload',
}

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface OverlaySettings {
  image: string | null;
  position: LogoPosition;
  padding: number;
  size: number;
  opacity: number;
  enabled: boolean;
  border?: boolean;
}

export interface ProductDetails {
  goldWeight: string;
  goldPurity: string;
  stonePrice: string;
  diamondCarat: string;
}

export interface BrandingConfig {
  logo: OverlaySettings;
  jewellery: OverlaySettings;
  details: OverlaySettings & { content: ProductDetails };
}

export interface GenerationConfig {
  jewelleryTypes: JewelleryType[];
  modelSource: ModelSource;
  customModelImage?: string;
  modelStyle: ModelStyle;
  regionalStyle: RegionalStyle;
  shotType: ShotType;
  skinTone: SkinTone;
  ageRange: string;
}

export interface Project {
  id: string;
  name: string;
  originalImage: string;
  results: string[];
  createdAt: number;
}
