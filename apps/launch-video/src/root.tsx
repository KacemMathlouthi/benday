import { Composition } from "remotion";

import { BendayLaunch } from "./video/benday-launch";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./video/timing";

export function RemotionRoot() {
  return (
    <Composition
      component={BendayLaunch}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      height={HEIGHT}
      id="BendayLaunch"
      width={WIDTH}
    />
  );
}
