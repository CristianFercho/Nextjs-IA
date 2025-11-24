import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="text-center space-y-4">
        <h1>Curso de Next.js + IA</h1>
        <p className="text-zinc-400 text-sm">
          Epecemos probando el chat básico de IA
        </p>
        <Link
          href={"/chat"}
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500"
        >
          Ir al chat
        </Link>
      </div>
    </main>
  );
}
