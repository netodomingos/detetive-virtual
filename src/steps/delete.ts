import fs from "fs/promises";

export async function deleteVideo(path: string) {
  console.log("\n[ETAPA 3/5] Limpando arquivos temporários...");
  console.log(`Deletando: ${path}`);
  await fs.unlink(path);
  console.log("✓ Arquivo deletado com sucesso!");
}
