import { searchSources } from "../services/search.ts";
import { llmVerify } from "../services/llms.ts";

export async function verifyContent(transcript: string) {
  console.log("\n[ETAPA 4/5] Verificando conteúdo...");
  
  console.log("Buscando fontes relacionadas...");
  const sources = await searchSources(transcript);
  console.log(`✓ Encontradas ${sources.length} fontes`);

  console.log("Analisando com LLM...");
  const analysis = await llmVerify({
    transcript,
    sources
  });
  console.log("✓ Análise concluída!");

  return analysis;
}
