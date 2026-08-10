import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

import { PRESET_NAMES, PRESETS } from "../../../../registry/ui/benday";
import { Logo } from "../../../web/src/components/logo";

import "./theme.css";
import { BendayAssets, FrameBenday } from "./frame-benday";
import { ease, sceneOpacity } from "./math";

const SCENES = {
  close: { duration: 318, from: 1482 },
  install: { duration: 396, from: 1122 },
  intro: { duration: 150, from: 0 },
  presets: { duration: 606, from: 342 },
  product: { duration: 228, from: 150 },
  settings: { duration: 246, from: 912 },
} as const;

const base: React.CSSProperties = {
  backgroundColor: "var(--background)",
  color: "var(--foreground)",
  fontFamily: "var(--font-sans)",
  overflow: "hidden",
};

export function BendayLaunch() {
  return (
    <AbsoluteFill style={base}>
      <BendayAssets>
        <Sequence
          durationInFrames={SCENES.intro.duration}
          from={SCENES.intro.from}
          name="Introducing benday"
        >
          <IntroScene />
        </Sequence>
        <Sequence
          durationInFrames={SCENES.product.duration}
          from={SCENES.product.from}
          name="What is benday"
        >
          <ProductScene />
        </Sequence>
        <Sequence
          durationInFrames={SCENES.presets.duration}
          from={SCENES.presets.from}
          name="21 presets"
        >
          <PresetWall />
        </Sequence>
        <Sequence
          durationInFrames={SCENES.settings.duration}
          from={SCENES.settings.from}
          name="Customization"
        >
          <SettingsScene />
        </Sequence>
        <Sequence
          durationInFrames={SCENES.install.duration}
          from={SCENES.install.from}
          name="Install"
        >
          <InstallScene />
        </Sequence>
        <Sequence
          durationInFrames={SCENES.close.duration}
          from={SCENES.close.from}
          name="CTA"
        >
          <CloseScene />
        </Sequence>
      </BendayAssets>
    </AbsoluteFill>
  );
}

function IntroScene() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, SCENES.intro.duration, 20);
  const copyIn = ease(frame, [10, 38]);
  const lockupIn = ease(frame, [46, 78]);
  const travel = ease(frame, [112, SCENES.intro.duration], [0, -70]);

  return (
    <AbsoluteFill style={{ opacity, transform: `translateX(${travel}px)` }}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          inset: "0 180px",
          justifyContent: "center",
          position: "absolute",
        }}
      >
        <div
          style={{
            opacity: copyIn,
            transform: `translateX(${(1 - copyIn) * -28}px)`,
          }}
        >
          <div
            style={{
              color: "var(--muted)",
              fontSize: 46,
              letterSpacing: "-0.035em",
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            Introducing
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              fontFamily: "var(--font-pixel)",
              fontSize: 168,
              gap: 34,
              lineHeight: 0.9,
              opacity: lockupIn,
              transform: `translateX(${(1 - lockupIn) * -24}px)`,
            }}
          >
            <Img
              src={staticFile("icon.svg")}
              style={{ height: 156, width: 156 }}
            />
            benday
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ProductScene() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, SCENES.product.duration, 18);
  const enter = ease(frame, [8, 34]);
  const exit = ease(frame, [
    SCENES.product.duration - 36,
    SCENES.product.duration,
  ]);

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateX(${56 - enter * 56 - exit * 120}px)`,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gridTemplateColumns: "1fr 650px",
          inset: "0 140px",
          position: "absolute",
        }}
      >
        <div style={{ maxWidth: 920 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 430,
              letterSpacing: "-0.055em",
              lineHeight: 0.98,
            }}
          >
            Your logo,
            <br />
            <span style={{ color: "var(--muted)" }}>
              turned into a<br /> thinking indicator.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <FrameBenday
            dotScale={0.66}
            preset="breathe"
            size={500}
            speed={1.1}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}

const TILE_WIDTH = 540;
const TILE_HEIGHT = 300;

function PresetWall() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, SCENES.presets.duration, 18);
  const track = ease(frame, [18, 588], [0, -TILE_WIDTH * 4]);

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          height: TILE_HEIGHT * 3,
          left: 150 + track,
          position: "absolute",
          top: 90,
          width: TILE_WIDTH * 7,
        }}
      >
        {PRESET_NAMES.map((preset, index) => {
          const column = index % 7;
          const row = Math.floor(index / 7);
          const definition = PRESETS[preset];
          return (
            <div
              key={preset}
              style={{
                alignItems: "center",
                borderLeft: "1px solid var(--border)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                height: TILE_HEIGHT,
                justifyContent: "center",
                left: column * TILE_WIDTH,
                position: "absolute",
                top: row * TILE_HEIGHT,
                width: TILE_WIDTH,
              }}
            >
              <FrameBenday
                dotScale={0.66}
                frameOffset={index * 11}
                preset={preset}
                size={176}
                speed={1.1}
              />
              <div
                style={{
                  color: "var(--muted)",
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                  marginTop: 18,
                }}
              >
                {definition.label}
              </div>
            </div>
          );
        })}
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            borderRight: "1px solid var(--border)",
            inset: 0,
            pointerEvents: "none",
            position: "absolute",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

const SETTING_WORDS = [
  "Color",
  "Presets",
  "Speed",
  "Dot shape",
  "Glow",
  "And much more.",
] as const;

function SettingsScene() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, SCENES.settings.duration, 18);

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gridTemplateColumns: "680px 1fr",
          inset: "0 150px",
          position: "absolute",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <FrameBenday preset="contour" size={420} speed={0.95} />
        </div>

        <div style={{ height: 140, position: "relative" }}>
          {SETTING_WORDS.map((word, index) => {
            const from = 28 + index * 30;
            const isLast = index === SETTING_WORDS.length - 1;
            const to = isLast ? 228 : from + 40;
            const wordOpacity = Math.min(
              ease(frame, [from, from + 8]),
              ease(frame, [to - 8, to], [1, 0])
            );
            const x = (1 - ease(frame, [from, from + 10])) * 28;
            return (
              <div
                key={word}
                style={{
                  color: isLast ? "var(--muted)" : "var(--foreground)",
                  fontSize: isLast ? 76 : 108,
                  fontWeight: 430,
                  letterSpacing: "-0.055em",
                  lineHeight: 1,
                  opacity: wordOpacity,
                  position: "absolute",
                  transform: `translateX(${x}px)`,
                  whiteSpace: "nowrap",
                }}
              >
                {word}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

const INSTALL_COMMAND = "bunx shadcn@latest add KacemMathlouthi/benday/benday";

function InstallScene() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, SCENES.install.duration, 18);
  const terminalIn = ease(frame, [10, 32]);
  const typedCharacters = Math.floor(
    ease(frame, [38, 133], [0, INSTALL_COMMAND.length])
  );
  const cursorVisible = Math.floor(frame / 18) % 2 === 0;
  const outputs = [
    { at: 138, copy: "✔ Checking registry." },
    { at: 168, copy: "✔ Installing files." },
    { at: 188, copy: "✔ Done." },
  ];

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          height: 650,
          left: 190,
          opacity: terminalIn,
          position: "absolute",
          top: 184,
          transform: `translateY(${(1 - terminalIn) * 22}px)`,
          width: 1540,
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "var(--surface-raised)",
            borderBottom: "1px solid var(--border)",
            color: "var(--muted)",
            display: "flex",
            fontFamily: "var(--font-mono)",
            fontSize: 20,
            height: 58,
            padding: "0 24px",
          }}
        >
          install benday
        </div>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 31,
            lineHeight: 1.75,
            padding: "54px 46px",
          }}
        >
          <div style={{ whiteSpace: "pre" }}>
            <span style={{ color: "var(--muted)" }}>$ </span>
            {INSTALL_COMMAND.slice(0, typedCharacters)}
            {typedCharacters < INSTALL_COMMAND.length && (
              <span style={{ opacity: cursorVisible ? 1 : 0 }}>▋</span>
            )}
          </div>
          <div style={{ marginTop: 30 }}>
            {outputs.map((output) => (
              <div
                key={output.copy}
                style={{
                  color: "var(--muted)",
                  opacity: ease(frame, [output.at, output.at + 7]),
                  transform: `translateY(${(1 - ease(frame, [output.at, output.at + 7])) * 8}px)`,
                }}
              >
                {output.copy}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function CloseScene() {
  const frame = useCurrentFrame();
  const enter = ease(frame, [12, 42]);
  const artIn = ease(frame, [0, 72]);
  const settle = ease(frame, [34, 112]);

  return (
    <AbsoluteFill style={{ opacity: ease(frame, [0, 18]) }}>
      <Img
        src={staticFile("hero-field.webp")}
        style={{
          height: "100%",
          objectFit: "cover",
          opacity: artIn * 0.25,
          transform: `scale(${1.08 - artIn * 0.04}) translateX(70px)`,
          width: "100%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, #000 0%, rgba(0,0,0,.96) 34%, rgba(0,0,0,.35) 72%, rgba(0,0,0,.72) 100%)",
        }}
      />

      <div
        style={{
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          left: 132,
          opacity: enter,
          position: "absolute",
          top: 0,
          transform: `translateX(${(1 - enter) * -30}px)`,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 430,
            letterSpacing: "-0.055em",
            lineHeight: 1,
            maxWidth: 950,
          }}
        >
          Give thinking
          <br />
          <span style={{ color: "var(--muted)" }}>an identity.</span>
        </div>

        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 42,
            marginTop: 74,
          }}
        >
          <FrameBenday preset="resolve" settle={settle} size={108} />
          <Logo className="launch-lockup" />
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            color: "var(--muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 27,
            letterSpacing: "-0.025em",
            marginTop: 58,
            paddingTop: 24,
            width: 760,
          }}
        >
          benday.kacemmathlouthi.dev
        </div>
      </div>
    </AbsoluteFill>
  );
}
