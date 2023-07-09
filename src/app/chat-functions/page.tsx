/**
 * Uses the Vercel AI SDK clientside `useChat` hook to receive messages from the
 * AI chat function on the server. Turns out this works with official OpenAI module's response objects,
 * not just the StreamingTextResponse objects from Vercel AI SDK.
 */

"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";

export default function ChatV2() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat-functions",
  });

  const [chatResponse, setChatResponse] = useState<{
    weatherInfo: string;
    weatherReport: string;
  } | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        const parsedMessage = JSON.parse(lastMessage.content);
        setChatResponse(parsedMessage);
      }
    }
  }, [messages]);

  console.log(messages);

  return (
    <div className="my-6 px-4">
      {messages.map((m) => (
        <div key={m.id} className="my-2">
          <div className="font-bold">
            {m.role}
            {":"}
          </div>
          <div className="pl-2">
            {m.role === "assistant"
              ? JSON.parse(m.content).weatherReport ?? m.content
              : m.content}
          </div>
        </div>
      ))}

      <form onSubmit={handleSubmit} className="my-4">
        <label>
          {
            "Which city would you like to know the weather of? Format as 'City, Country' e.g. 'Berlin, Germany'"
          }
          <input
            value={input}
            onChange={handleInputChange}
            className="text-slate-900"
          />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
