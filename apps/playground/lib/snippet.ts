import { DEFAULT_BAKE_STATE, DEFAULT_RENDER_STATE } from "./state";
import type { BakeState, RenderState } from "./state";

export function round(v: number): string {
  return String(Math.round(v * 100) / 100);
}

/**
 * Render the current settings as JSX, listing only what differs from the
 * defaults — a wall of props nobody needs to type is worse than no snippet.
 */
export function buildSnippet(bake: BakeState, render: RenderState): string {
  const bakeProps: string[] = [];
  const d = DEFAULT_BAKE_STATE;
  if (bake.grid !== d.grid) {
    bakeProps.push(`grid: ${bake.grid}`);
  }
  if (bake.threshold !== d.threshold) {
    bakeProps.push(`threshold: ${round(bake.threshold)}`);
  }
  if (bake.gamma !== d.gamma) {
    bakeProps.push(`gamma: ${round(bake.gamma)}`);
  }
  if (bake.dilate !== d.dilate) {
    bakeProps.push(`dilate: ${bake.dilate}`);
  }
  if (bake.maskMode !== d.maskMode) {
    bakeProps.push(`maskMode: '${bake.maskMode}'`);
  }
  if (bake.invert) {
    bakeProps.push("invert: true");
  }
  if (!bake.trim) {
    bakeProps.push("trim: false");
  }

  const r = DEFAULT_RENDER_STATE;
  const props: string[] = ['src="/logo.svg"'];
  if (bakeProps.length > 0) {
    props.push(`bake={{ ${bakeProps.join(", ")} }}`);
  }
  props.push(`preset="${render.preset}"`);
  if (render.state !== r.state) {
    props.push(`state="${render.state}"`);
  }
  // 64 is the component default, not the playground's starting size.
  if (render.size !== 64) {
    props.push(`size={${render.size}}`);
  }
  if (render.fitNatural) {
    props.push('fit="natural"');
  }
  if (render.speed !== r.speed) {
    props.push(`speed={${round(render.speed)}}`);
  }
  if (render.dotScale !== r.dotScale) {
    props.push(`dotScale={${round(render.dotScale)}}`);
  }
  if (render.shape !== r.shape) {
    props.push(`shape="${render.shape}"`);
  }
  if (render.glow !== r.glow) {
    props.push(`glow={${round(render.glow)}}`);
  }
  if (render.weight !== r.weight) {
    props.push(`weight={${round(render.weight)}}`);
  }
  if (render.padding !== r.padding) {
    props.push(`padding={${round(render.padding)}}`);
  }
  if (render.color !== r.color) {
    props.push(`color="${render.color}"`);
  }

  return `<ThinkingLogo\n  ${props.join("\n  ")}\n/>`;
}
