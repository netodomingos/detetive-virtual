export function buildResponse(result: any) {
  console.log("\n[ETAPA 5/5] Construindo resposta final...");
  
  const response = {
    score: result.score,
    verdict: result.verdict,
    explanation: result.summary,
    reasons: result.reasons,
    disclaimer:
      "Resultado baseado em análise automatizada e fontes públicas."
  };
  
  console.log("✓ Resposta construída!");
  console.log(`Veredicto: ${response.verdict}`);
  console.log(`Score: ${response.score}`);
  
  return response;
}
