import fs from "fs";
import path from "path";
import ytdl from "@distube/ytdl-core";

export async function downloadVideo(url: string): Promise<string> {
  console.log("\n[ETAPA 1/5] Iniciando download do vídeo...");
  console.log(`URL: ${url}`);
  
  const tmpDir = path.resolve("tmp");
  if (!fs.existsSync(tmpDir)) {
    console.log("Criando diretório temporário...");
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const filePath = path.resolve("tmp/video.mp4");
  console.log(`Salvando em: ${filePath}`);

  console.log("Iniciando stream de download...");
  const videoStream = ytdl(url, { 
    quality: "lowest",
    filter: "videoandaudio"
  });
  
  const writer = fs.createWriteStream(filePath);
  videoStream.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log("✓ Download concluído com sucesso!");
      resolve(filePath);
    });
    writer.on("error", (err) => {
      console.error("✗ Erro no download:", err.message);
      reject(err);
    });
    videoStream.on("error", (err) => {
      console.error("✗ Erro ao baixar vídeo:", err.message);
      reject(err);
    });
  });
}
