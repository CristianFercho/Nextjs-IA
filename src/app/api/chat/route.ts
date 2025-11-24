import { env } from "@/lib/env";
import OpenAI from "openai";

export async function POST(req: Request) {
  const body = await req.json();

  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY, // ← Seguro y tipado
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream:true,
    messages: body.messages
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller){
      try{
        for await(const chunk of completion){
          const delta = chunk.choices[0]?.delta?.content || "";
          if(!delta) continue;

          controller.enqueue(encoder.encode(delta));
        }
      }catch(error){
        console.error("Error en streaming de /api/chat:", error);
        controller.error(error);
      }finally{
        controller.close();
      }
    }
  })

  return new Response(stream, {
    headers:{
      "Content-Type": "text/plain; charset=utf-8"
    }
  })
}
