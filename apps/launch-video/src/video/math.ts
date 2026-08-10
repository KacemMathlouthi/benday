import { Easing, interpolate } from "remotion";

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function ease(
  frame: number,
  input: readonly [number, number],
  output: readonly [number, number] = [0, 1]
) {
  return interpolate(frame, input, output, {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function sceneOpacity(frame: number, duration: number, edge = 18) {
  const entering = ease(frame, [0, edge]);
  const leaving = ease(frame, [duration - edge, duration], [1, 0]);
  return Math.min(entering, leaving);
}
