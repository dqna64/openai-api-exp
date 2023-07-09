/**
 * Uses the official OpenAI API
 */

import openai from "@/utils/openai";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ChatCompletionFunctions,
  ChatCompletionRequestMessage,
  ChatCompletionResponseMessage,
} from "openai";

const ALL_UNITS = ["fahrenheit", "celsius", "kelvin"] as const;
type UnitTuple = typeof ALL_UNITS;
type UnitType = UnitTuple[number];

type WeatherInfoType = {
  location: string;
  temperature: number;
  averageSummerTemperature: number;
  unit: UnitType;
  forecast: string;
};

/**
 * Type guard to narrow an object to a `GetCurrentWeatherParams` type.
 * Made to check OpenAI's returned function call parameters to the `getCurrentWeather` function.
 */
function isGetCurrentWeatherParams(obj: any): obj is GetCurrentWeatherParams {
  if (typeof obj !== "object") return false;
  if (typeof obj.location !== "string") return false;
  if (typeof obj.averageSummerTemperature !== "number") return false;
  if (obj.unit && !ALL_UNITS.includes(obj.unit)) return false;
  return true;
}

type GetCurrentWeatherParams = {
  location: string;
  averageSummerTemperature: number;
  unit?: UnitType;
};

function getCurrentWeather({
  location,
  averageSummerTemperature,
  unit,
}: GetCurrentWeatherParams): WeatherInfoType {
  const weatherInfo: WeatherInfoType = {
    location,
    temperature: 12,
    averageSummerTemperature,
    unit: unit ?? "celsius",
    forecast: ["sunny", "cloudy", "rainy", "snowy"][
      Math.floor(Math.random() * 4)
    ],
  };
  return weatherInfo;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    weatherInfo?: WeatherInfoType;
    weatherReport?: string;
    error?: string;
  }>
) {
  const reqBody = JSON.parse(req.body);
  console.log("Client request:");
  console.dir(reqBody, { depth: null });

  const { messages: reqMessages } = reqBody;
  const location =
    reqMessages[reqMessages.length - 1].content ?? "Jakarta, Indonesia";

  const messages: (
    | ChatCompletionResponseMessage
    | ChatCompletionRequestMessage
  )[] = [
    {
      role: "user",
      content: `What's the weather like in ${location}?`,
    },
  ];

  const functions: ChatCompletionFunctions[] = [
    {
      name: "getCurrentWeather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and country, e.g. Arizona, USA",
          },
          averageSummerTemperature: {
            type: "number",
            description:
              "The annual average summer temperature in the given location",
          },
          unit: {
            type: "string",
            description:
              "The unit of temperature to use. Infer this from the user's location.",
            enum: ALL_UNITS,
          },
        },
        required: ["location", "averageSummerTemperature", "unit"],
      },
    },
  ];

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    // stream: true,
    // max_tokens: 200,
    temperature: 1.2,
    messages,
    functions,
    function_call: {
      name: "getCurrentWeather", // Force the AI to call this function on first chat response
    },
  });

  const response_message = chatCompletion.data.choices[0].message;

  console.log("\nChat completion response 1 (AI makes function call):");
  console.dir(chatCompletion.data, { depth: null });

  // Check if the AI wants to call a function
  if (response_message?.function_call) {
    const functionCall = response_message.function_call;

    if (functionCall.name === "getCurrentWeather") {
      // Parse and validate function arguments provided by the AI before passing them to the function
      const functionArguments = functionCall.arguments
        ? JSON.parse(functionCall.arguments)
        : {};
      if (isGetCurrentWeatherParams(functionArguments)) {
        // Call the function
        const functionCallResult = getCurrentWeather(functionArguments);
        // TODO: Store weatherInfo in database
        // Put function call response into message history for the AI to read
        messages.push(response_message); // This is a ChatCompletionResponseMessage authored by the AI assistant
        messages.push({
          // This is a ChatCompletionRequestMessage authored by the function `getCurrentWeather`
          role: "function",
          name: functionCall.name, // "getCurrentWeather"
          content: JSON.stringify(functionCallResult),
        });
        messages.push({
          role: "user",
          content:
            "With the weather information provided by the function, please give me a weather report.",
        });

        // Send the function call result to the AI and ask it to respond in natural language
        const chatCompletion2 = await openai.createChatCompletion({
          model: "gpt-3.5-turbo-0613",
          temperature: 1.2,
          messages,
          functions,
          function_call: "none", // Force the AI to respond in natural language
        });

        console.log("\nChat completion response 2 (AI gives weather report):");

        // Return response to client
        res.status(200).json({
          weatherInfo: functionCallResult,
          weatherReport: chatCompletion2.data.choices[0].message?.content,
        });
      } else {
        console.log(
          `Bad AI function call: invalid arguments to getCurrentWeather: ${functionArguments}`
        );
        res.status(500).json({ error: "Bad AI function call" });
      }
    } else {
      console.log(
        `Bad AI function call: invalid function name: ${functionCall.name}`
      );
      res.status(500).json({ error: "Bad AI function call" });
    }
  } else {
    console.log("AI did not call function");
    res.status(500).json({ error: "AI did not call function" });
  }
}
