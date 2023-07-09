/**
 * Uses the Vercel AI SDK clientside `useChat` hook to receive messages from the
 * AI chat function on the server. Turns out this works with official OpenAI module's response objects,
 * not just the StreamingTextResponse objects from Vercel AI SDK.
 */

"use client";

import { useChat } from "ai/react";

export default function ChatV2() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat-functions",
  });

  console.log(messages);

  return (
    <div className="my-6 px-4">
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="my-4">
        <label>
          Say something...
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
