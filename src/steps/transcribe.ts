import OpenAI from "openai";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

ffmpeg.setFfmpegPath(ffmpegStatic as unknown as string);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const CHUNK_DURATION = 600;

async function getFileSizeAndDuration(filePath: string): Promise<{ size: number; duration: number }> {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(filePath);
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve({ size: stats.size, duration: metadata.format.duration || 0 });
    });
  });
}

async function compressAudio(inputPath: string): Promise<string> {
  const outputPath = inputPath.replace(/\.[^.]+$/, '_compressed.mp3');
  
  console.log('Comprimindo áudio...');
  
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('libmp3lame')
      .audioBitrate('64k')
      .audioChannels(1)
      .audioFrequency(16000)
      .noVideo()
      .output(outputPath)
      .on('end', () => {
        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;
        const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        console.log(`✓ Áudio comprimido: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${reduction}% menor)`);
        resolve();
      })
      .on('error', reject)
      .run();
  });

  return outputPath;
}

async function splitAudio(inputPath: string, outputDir: string, chunkDuration: number): Promise<string[]> {
  const chunks: string[] = [];
  const { duration } = await getFileSizeAndDuration(inputPath);
  const numChunks = Math.ceil(duration / chunkDuration);

  console.log(`Dividindo áudio em ${numChunks} partes de ${chunkDuration}s...`);

  for (let i = 0; i < numChunks; i++) {
    const startTime = i * chunkDuration;
    const chunkPath = path.join(outputDir, `chunk_${i}.mp3`);
    
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(chunkDuration)
        .output(chunkPath)
        .audioCodec('libmp3lame')
        .on('end', () => resolve())
        .on('error', reject)
        .run();
    });

    chunks.push(chunkPath);
    console.log(`✓ Parte ${i + 1}/${numChunks} criada`);
  }

  return chunks;
}

export async function transcribeVideo(videoPath: string): Promise<string> {
  console.log("\n[ETAPA 2/5] Iniciando transcrição do vídeo...");
  console.log(`Arquivo: ${videoPath}`);
  
  let { size, duration } = await getFileSizeAndDuration(videoPath);
  console.log(`Tamanho original: ${(size / 1024 / 1024).toFixed(2)} MB | Duração: ${duration.toFixed(0)}s`);

  let processPath = videoPath;
  let compressedPath: string | null = null;

  if (size > MAX_FILE_SIZE * 0.8) {
    compressedPath = await compressAudio(videoPath);
    processPath = compressedPath;
    const compressedInfo = await getFileSizeAndDuration(compressedPath);
    size = compressedInfo.size;
    duration = compressedInfo.duration;
  }

  let fullTranscript = '';

  if (size > MAX_FILE_SIZE) {
    console.log("Arquivo grande detectado. Dividindo em partes...");
    
    const tempDir = path.join(path.dirname(videoPath), 'chunks');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const chunks = await splitAudio(videoPath, tempDir, CHUNK_DURATION);
    console.log("Processando transcrição das partes...");

    for (let i = 0; i < chunks.length; i++) {
      console.log(`Transcrevendo parte ${i + 1}/${chunks.length}...`);
      
      const chunkPath = chunks[i]!;
      const transcript = await openai.audio.transcriptions.create({
        file: fs.createReadStream(chunkPath),
        model: "whisper-1",
        language: "pt"
      });

      fullTranscript += transcript.text + ' ';
      fs.unlinkSync(chunkPath);
    }

    fs.rmdirSync(tempDir);
  } else {
    console.log("Processando com Whisper API...");
    
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(videoPath),
      model: "whisper-1",
      language: "pt"
    });

    fullTranscript = transcript.text;
  }

  const text = fullTranscript.trim();

  if (compressedPath && fs.existsSync(compressedPath)) {
    fs.unlinkSync(compressedPath);
  }

  console.log("✓ Transcrição concluída!");
  console.log(`Tamanho do texto: ${text.length} caracteres`);
  
  return text;
}
