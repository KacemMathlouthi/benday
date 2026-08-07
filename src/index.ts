export { ThinkingLogo } from './ThinkingLogo';
export type { ThinkingLogoProps } from './ThinkingLogo';

export { bake, bakeCached, bakeKey, clearBakeCache, resolveBakeOptions, DEFAULT_BAKE } from './bake';
export type { BakeSource } from './bake';

export { useDotMap, usePrefersReducedMotion, useThemeTick } from './hooks';
export type { UseDotMapResult } from './hooks';

export { PRESETS, PRESET_NAMES, dotRandom, makeFrame } from './presets';
export type { PresetDefinition } from './presets';

export type {
  BakeOptions,
  Dot,
  DotContext,
  DotFrame,
  DotMap,
  DotShape,
  MaskMode,
  Preset,
  PresetName,
  ThinkingState,
} from './types';
