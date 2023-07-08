/**
 * "openai-edge" is a drop-in replacement for the official "openai" module which
 * uses the fetch web api instead of axios. Necessary for the Vercel AI SDK.
 */

import { Configuration, OpenAIApi } from "openai-edge";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default openai;
