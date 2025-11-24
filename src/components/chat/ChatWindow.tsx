"use client";

import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";

export type UIMsg = {
  id: string;
  role: Role;
  content: string;
};

const STORAGE_KEY = "chat_messages_v1";

// Acceso seguro a localStorage (evita errores en SSR, modos restringidos, etc.)
const safeStorage = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      console.error("Error leyendo localStorage:", err);
      return null;
    }
  },
  set(key: string, value: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      console.error("Error escribiendo en localStorage:", err);
    }
  },
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<UIMsg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ⬇️ Al montar el componente, cargar mensajes desde localStorage
  useEffect(() => {
    const raw = safeStorage.get(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as UIMsg[];
      if (Array.isArray(parsed)) {
        setMessages(parsed);
      }
    } catch (err) {
      console.error("Error parseando mensajes desde localStorage:", err);
    }
  }, []);

  // ⬇️ Cada vez que cambien los mensajes, guardarlos en localStorage
  useEffect(() => {
    try {
      const serialized = JSON.stringify(messages);
      safeStorage.set(STORAGE_KEY, serialized);
    } catch (err) {
      console.error("Error serializando mensajes para localStorage:", err);
    }
  }, [messages]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: UIMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);

    await sendMessageToAPI(userMessage);
  }

  async function sendMessageToAPI(userMessage: UIMsg) {
    try {
      setIsLoading(true);

      // Crear mensaje vacío de la IA para ir rellenando con el streaming
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
        },
      ]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Enviamos el historial actual + el nuevo mensaje
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: userMessage.role, content: userMessage.content },
          ],
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Error al conectar con /api/chat");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // Leer el streaming chunk a chunk
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "⚠️ Ocurrió un error al consultar la IA. Intenta de nuevo en unos segundos.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-100 shadow-lg">
      {/* Área de mensajes */}
      <div className="mb-3 flex-1 space-y-2 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-zinc-500">
            Escribe tu primera pregunta para empezar a chatear con la IA. ✨
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-70">
                {msg.role === "user" ? "Tú" : "IA"}
              </span>
              <span className="block whitespace-pre-wrap">{msg.content}</span>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Formulario de entrada */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
          placeholder="Escribe tu mensaje para la IA..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-blue-900 hover:bg-blue-500"
        >
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}
