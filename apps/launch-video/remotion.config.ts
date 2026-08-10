import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
Config.setPublicDir("../web/public");
Config.setOverwriteOutput(true);
Config.setVideoImageFormat("png");
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setConcurrency("50%");
Config.setDelayRenderTimeoutInMilliseconds(60_000);
Config.setMuted(true);
