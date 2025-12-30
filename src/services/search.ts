import axios from "axios";

export async function searchSources(text: string) {
  const response = await axios.get("https://serpapi.com/search", {
    params: {
      q: text,
      api_key: process.env.SERP_API_KEY
    }
  });

  return response.data.organic_results.slice(0, 5);
}
