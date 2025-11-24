import React from 'react'
import ChatWindow from '../../components/chat/ChatWindow';

export default function page() {
  return (
    <main className='min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4'>
        <div className='w-full max-w-3xl space-y-4'>
            <header>
                <h1 className='text-2xl font-semibold'>
                    Chat básico con IA
                </h1>
                <p className='text-sm text-zinc-400'>
                    Aquí vamos a probar nuestro componente <code>ChatWindow</code> hablando directamente con la API de OpenAI
                </p>
            </header>
            <ChatWindow/>
        </div>
      
    </main>
  )
}
