/**
 * Uses OpenAI's API to generate a chat response to a user's message.
 */

import openai from '@/utils/openai'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler (req: NextApiRequest, res: NextApiResponse<{chatCompletionContent: string, error?: string}>) {

    try {
        const chatCompletion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant whose job is to help the user study their areas of interest and learn the most important knowledge in those areas."
                },
                {
                    role: "user",
                    content: "Hello! Recently I've been reading about the Manhattan Project and it is fascinating."
                }
            ],
            n: 2,
            max_tokens: 200,
            temperature: 1.2
        })
        
        res.status(200).json({chatCompletionContent: chatCompletion.data.choices[0].message?.content ?? "No content"})
    }
    catch(error: any) {
        console.log(error)
        res.status(500).json({chatCompletionContent: "Error", error: error.message})
    }
}

const reqBody = {
  "model": "gpt-3.5-turbo",
  "messages": [{"role": "system", "content": "You are a helpful assistant whose job is to help the user study their areas of interest and learn the most important knowledge in those areas."}, {"role": "user", "content": "Hello! Recently I've been reading about the Manhattan Project and it is fascinating."}],
  "n": 2,
  "max_tokens": 200,
  "temperature": 0
}

const curlReq = `curl https://api.openai.com/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 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" \
-d '${JSON.stringify(reqBody)}'`

// console.log(curlReq)

/*
curl https://api.openai.com/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer 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" \
-d '{"model":"gpt-3.5-turbo","messages":[{"role":"system","content":"You are a helpful assistant whose job is to help the user study their areas of interest and learn the most important knowledge in those areas."},{"role":"user","content":"Hello! Recently I've been reading about the Manhattan Project and it is fascinating."}],"n":2,"max_tokens":200,"temperature":0}'
*/

/*

Potentially useful request body parameters to POST https://api.openai.com/v1/chat/completions
- functions
- temperature
- top_p
- max_tokens
- stream
- user

*/