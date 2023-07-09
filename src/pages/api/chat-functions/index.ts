/**
 * Uses the official OpenAI API
 */

import openai from "@/utils/openai";
import { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionResponseMessage } from "openai";

const ALL_UNITS = ["fahrenheit", "celsius", "kelvin"] as const;
type UnitTuple = typeof ALL_UNITS;
type UnitType = UnitTuple[number];

type WeatherInfoType = {
  location: string;
  temperature: number;
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
  if (obj.unit && !ALL_UNITS.includes(obj.unit)) return false;
  return true;
}

type GetCurrentWeatherParams = {
  location: string;
  unit?: UnitType;
};

function getCurrentWeather({
  location,
  unit,
}: GetCurrentWeatherParams): WeatherInfoType {
  const weatherInfo: WeatherInfoType = {
    location: location,
    temperature: 12,
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
  }>
) {
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    // stream: true,
    // max_tokens: 200,
    temperature: 1.2,
    messages: [
      {
        role: "user",
        content: "What's the weather like in Sydney, Australia?",
      },
    ],
    functions: [
      {
        name: "getCurrentWeather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and country, e.g. Sydney, Australia",
            },
            unit: {
              type: "string",
              enum: ALL_UNITS,
            },
          },
          //   required: ["location"],
        },
      },
    ],
    function_call: "auto",
  });

  const response_message = chatCompletion.data.choices[0].message;

  console.log(chatCompletion.data);
  console.log(response_message);

  if (response_message?.function_call) {
    const function_call = response_message.function_call;
    if (function_call.name === "getCurrentWeather") {
      const args = function_call.arguments
        ? JSON.parse(function_call.arguments)
        : {};
      if (isGetCurrentWeatherParams(args)) {
        const weatherInfo = getCurrentWeather(args);
        res.status(200).json({ weatherInfo: weatherInfo });
      } else {
        res.status(200).json({});
      }
    } else {
      res.status(200).json({});
    }
  } else {
    res.status(200).json({});
  }
}
