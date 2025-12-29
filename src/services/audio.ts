import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

const ffmpegPath =
  typeof ffmpegStatic === "string" ? ffmpegStatic : (ffmpegStatic as any).path ?? ffmpegStatic;

ffmpeg.setFfmpegPath(ffmpegPath as string);

export const extractAudio = (videoPath: string): Promise<string> => {
  const output = videoPath.replace(".mp4", ".wav");

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(output)
      .noVideo()
      .audioCodec("pcm_s16le")
      .on("end", () => resolve(output))
      .on("error", reject)
      .run();
  });
}
