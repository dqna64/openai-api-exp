"use client";

import { useChat } from "ai/react";

export default function ChatV2() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat-edge",
  });

  console.log(messages);
  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <label>
          Say something...
          <input value={input} onChange={handleInputChange} />
        </label>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
