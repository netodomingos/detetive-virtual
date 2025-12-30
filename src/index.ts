import "dotenv/config";
import { downloadVideo, transcribeVideo, deleteVideo, verifyContent, buildResponse } from "./steps/index.ts";

async function run(params: string) {
    console.log("=".repeat(60));
    console.log("      DETETIVE VIRTUAL - Análise de Conteúdo");
    console.log("=".repeat(60));
    
    const videoPath = await downloadVideo(params);

    const transcript = await transcribeVideo(videoPath);

    await deleteVideo(videoPath);

    const verification = await verifyContent(transcript);

    const response = buildResponse(verification);
    
    console.log("\n" + "=".repeat(60));
    console.log("      PROCESSO CONCLUÍDO COM SUCESSO!");
    console.log("=".repeat(60) + "\n");

    return response;
}

run("https://www.youtube.com/watch?v=lsL8eGOrsnQ").then(response => {
    console.log("Final Response:", response);
}).catch(error => {
    console.error("Error occurred:", error);
});