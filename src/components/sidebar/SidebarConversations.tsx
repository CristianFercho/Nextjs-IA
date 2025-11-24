"use client";

import { useState } from "react";

export type Conversation = {
  id: string;
  title: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type SidebarConversationsProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, newTitle: string) => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void; // puede ser "archivar" o "eliminar" según tu lógica
};

export default function SidebarConversations({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onToggleFavorite,
  onArchive,
}: SidebarConversationsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const activeConversations = conversations.filter((c) => !c.isArchived);
  const archivedConversations = conversations.filter((c) => c.isArchived);

  function startEditing(conv: Conversation) {
    setEditingId(conv.id);
    setDraftTitle(conv.title);
  }

  function handleRenameSubmit(convId: string) {
    const trimmed = draftTitle.trim();
    if (!trimmed) {
      // si se borra el título, no hacemos nada
      setEditingId(null);
      return;
    }
    onRename(convId, trimmed);
    setEditingId(null);
  }

  return (
    <aside className="flex h-full w-full flex-col gap-3 border-r border-zinc-800 bg-zinc-950/90 p-3 text-xs text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Conversaciones
          </span>
          <span className="text-[10px] text-zinc-500">
            {activeConversations.length} activas
          </span>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-[13px] font-medium text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800"
          title="Nueva conversación"
        >
          +
        </button>
      </div>

      {/* Lista de conversaciones activas */}
      <div className="flex-1 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
        {activeConversations.length === 0 && (
          <p className="px-2 py-3 text-[11px] text-zinc-500">
            Aún no tienes conversaciones. Crea una nueva con el botón{" "}
            <span className="font-semibold">+</span>.
          </p>
        )}

        {activeConversations.map((conv) => {
          const isActive = conv.id === activeId;
          const isEditing = conv.id === editingId;

          return (
            <div
              key={conv.id}
              className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] transition ${
                isActive
                  ? "bg-blue-600/15 border border-blue-500/60"
                  : "hover:bg-zinc-800/70"
              }`}
            >
              {/* Zona clicable para seleccionar conversación */}
              <button
                type="button"
                onClick={() => onSelect(conv.id)}
                className="flex-1 text-left"
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={() => handleRenameSubmit(conv.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleRenameSubmit(conv.id);
                      }
                      if (e.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                    className="w-full rounded-sm border border-zinc-700 bg-zinc-900 px-1 py-0.5 text-[11px] outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="flex flex-col">
                    <span
                      className={`line-clamp-1 font-medium ${
                        isActive ? "text-zinc-50" : "text-zinc-100"
                      }`}
                    >
                      {conv.title || "Sin título"}
                    </span>
                    {conv.updatedAt && (
                      <span className="text-[10px] text-zinc-500">
                        {conv.updatedAt}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Botones de acciones */}
              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                {/* Renombrar (doble click sobre el título o botón pequeño) */}
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => startEditing(conv)}
                    className="hidden h-5 w-5 items-center justify-center rounded-sm border border-zinc-700 bg-zinc-900 text-[9px] text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 group-hover:flex"
                    title="Renombrar"
                  >
                    ✎
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onToggleFavorite(conv.id)}
                  className={`flex h-5 w-5 items-center justify-center rounded-sm border text-[10px] ${
                    conv.isFavorite
                      ? "border-yellow-400 bg-yellow-500/20 text-yellow-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800"
                  }`}
                  title="Marcar como favorita"
                >
                  {conv.isFavorite ? "★" : "☆"}
                </button>

                <button
                  type="button"
                  onClick={() => onArchive(conv.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-sm border border-zinc-700 bg-zinc-900 text-[10px] text-zinc-300 hover:border-red-500 hover:bg-red-900/40 hover:text-red-200"
                  title="Archivar / eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección de archivadas (opcional, visible si existe alguna) */}
      {archivedConversations.length > 0 && (
        <div className="mt-1 border-t border-zinc-800 pt-2">
          <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Archivadas
          </p>
          <div className="space-y-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-1">
            {archivedConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between rounded-md px-2 py-1 text-[11px] text-zinc-500"
              >
                <span className="line-clamp-1">{conv.title}</span>
                <button
                  type="button"
                  onClick={() => onArchive(conv.id)}
                  className="text-[10px] text-blue-300 hover:text-blue-200"
                >
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
