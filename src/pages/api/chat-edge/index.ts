/**
 * Uses Vercel AI SDK supporting OpenAI's API to generate a chat response to a user's message.
 */

import openai from '@/utils/openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextApiRequest, NextApiResponse } from 'next';

// Necesary for streaming, apparently. Try removing this and see if it works.
export const runtime = 'edge'

export default async function handler(req: NextApiRequest) {
const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
        stream: true,
        max_tokens: 200,
        temperature: 1.2,
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant whose job is to help the user study their areas of interest and learn the most important knowledge in those areas. Keep each response no longer than 75 words."
            },
            {
                role: "user",
                content: "I went out into the ocean on a boat yesterday and had a close encounter with a humpback whale. He came up to the boat and looked me right in the eye for a moment, then dove under the boat, swam a hundred metres away, breached in magnificient fashion as if waving us goodbye, then left. Whales are facinating creatures."
            },
            {
                role: "user",
                content: "Afterwards, I came back to shore and saw a hotdog stand. Now I am interested in the history of hotdog stands."
            },
        ],

    })

    const stream = OpenAIStream(response);

    // res.status(200).send(new StreamingTextResponse(stream))
    // res.status(200).json(new StreamingTextResponse(stream))
    return new StreamingTextResponse(stream)
}