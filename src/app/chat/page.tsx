"use client";

import { useState } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import SidebarConversations, {
  type Conversation,
} from "@/components/sidebar/SidebarConversations";

const initialConversations: Conversation[] = [
  {
    id: "default",
    title: "Conversación principal",
    isFavorite: true,
    isArchived: false,
  },
  {
    id: "ideas",
    title: "Ideas para el curso",
    isFavorite: false,
    isArchived: false,
  },
  {
    id: "pruebas",
    title: "Pruebas rápidas",
    isFavorite: false,
    isArchived: false,
  },
];

export default function ChatPage() {
  // Estado local para manejar las conversaciones del sidebar
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string>("default");

  function handleCreateConversation() {
    const id = crypto.randomUUID();
    const newConv: Conversation = {
      id,
      title: "Nueva conversación",
      isFavorite: false,
      isArchived: false,
    };
    setConversations((prev) => [...prev, newConv]);
    setActiveId(id);
  }

  function handleRenameConversation(id: string, newTitle: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  }

  function handleToggleFavorite(id: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  }

  function handleArchiveConversation(id: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isArchived: !c.isArchived } : c))
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex gap-4">
        {/* Sidebar */}
        <section className="w-72 shrink-0 h-[520px]">
          <SidebarConversations
            conversations={conversations}
            activeId={activeId}
            onSelect={setActiveId}
            onCreate={handleCreateConversation}
            onRename={handleRenameConversation}
            onToggleFavorite={handleToggleFavorite}
            onArchive={handleArchiveConversation}
          />
        </section>

        {/* ChatWindow */}
        <section className="flex flex-col gap-4">
          <header>
            <h1 className="text-2xl font-semibold">Chat básico con IA</h1>
            <p className="text-sm text-zinc-400">
              Aquí vamos a probar nuestro componente <code>ChatWindow</code>{" "}
              hablando directamente con la API de OpenAI.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              A la izquierda puedes gestionar varias conversaciones (crear,
              renombrar, marcar favoritas o archivarlas). En este primer paso el
              sidebar es visual; en la siguiente clase lo conectaremos con el
              historial real del chat.
            </p>
          </header>

          <div className="h-[420px]">
            <ChatWindow />
          </div>
        </section>
      </div>
    </main>
  );
}