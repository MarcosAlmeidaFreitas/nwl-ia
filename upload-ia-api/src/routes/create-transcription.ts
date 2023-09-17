import { FastifyInstance } from "fastify";
import { z } from 'zod';
import fs from 'fs'
import { open } from 'node:fs/promises'
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";


export async function createTranscriptionRoute(app : FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (req) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    })

    const { videoId } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      prompt: z.string(),
    });

    const { prompt } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where:{
        id: videoId,
      }
    });

    const videoPath = video.path;
    console.log("\n\n\n\n\n" + videoPath + "\n\n\n");

    //  const caminho = (process.cwd() + "/temp/videoid")
    // const arquivos = fs.readdirSync(process.cwd()+ "./temp/videoid");
    
    // console.log(caminho);
    try {
        const audioReadStream = fs.createReadStream(videoPath);  
        // audioReadStream.on('ready', (stream)=>{
        //   console.log(String(stream));
        // });

        
        const response = await openai.audio.transcriptions.create({
          file: audioReadStream,
          model: 'whisper-1',
          language: 'pt',
          response_format: 'json',
          temperature: 0,
          prompt,
        });
        return response.text
    } catch (error) {
      console.log(JSON.stringify(error, null, 2));
    }
    

  })
}