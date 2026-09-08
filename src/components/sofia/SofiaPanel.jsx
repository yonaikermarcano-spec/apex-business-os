// src/components/sofia/SofiaPanel.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { chatWithSofia, isGeminiConfigured } from '../../services/geminiService'

export default function SofiaPanel() {
  const { project, toggleSofia, sofiaHistory, addSofiaMessage, clearSofiaHistory, toggleSettings } = useAppStore()
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const hasKey = isGeminiConfigured()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [sofiaHistory, isLoading])

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText
    if (!text.trim() || isLoading) return

    setInputText('')
    addSofiaMessage({ role: 'user', text })
    setIsLoading(true)

    try {
      const res = await chatWithSofia(text, sofiaHistory, project)
      if (res.error) {
        addSofiaMessage({ role: 'model', text: `⚠️ ${res.text}` })
      } else {
        addSofiaMessage({ role: 'model', text: res.text })
      }
    } catch (err) {
      addSofiaMessage({ role: 'model', text: 'Error al conectar con SOFIA.' })
    } finally {
      setIsLoading(false)
    }
  }

  const promptSuggestions = [
    '¿Cuánto Runway nos queda con los costos actuales?',
    '¿Cuántas carreras diarias se necesitan para cubrir la nómina?',
    'Redacta un resumen ejecutivo para presentar a inversores.',
    '¿Qué pasa si la comisión por carrera sube a $4?',
  ]

  return (
    <div className="fixed top-12 bottom-0 right-0 z-50 w-full sm:w-[400px] bg-[#1c1c1c]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-base shadow-md">
            ✨
          </div>
          <div>
            <h3 className="font-bold text-sm text-w11-text flex items-center gap-1.5">
              SOFIA <span className="text-[10px] chip-progress px-1.5 py-0.2 rounded">Virtual CFO</span>
            </h3>
            <p className="text-[10px] text-white/40">Asistente de Inteligencia Financiera IA</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearSofiaHistory}
            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors text-xs"
            title="Limpiar chat"
          >
            🗑️
          </button>
          <button
            onClick={toggleSofia}
            className="p-1.5 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      </div>

      {/* No Key Warning Banner */}
      {!hasKey && (
        <div className="bg-amber-950/40 border-b border-amber-500/20 p-3 text-xs flex items-center justify-between gap-2">
          <span className="text-amber-300 text-[11px]">
            ⚠️ Requiere Gemini API Key (Gratis)
          </span>
          <button
            onClick={toggleSettings}
            className="btn-accent text-[10px] py-1 px-2 shrink-0"
          >
            Configurar
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {sofiaHistory.length === 0 && (
          <div className="space-y-4 pt-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <p className="font-bold text-white text-sm">¡Hola, equipo de {project.profile.name}!</p>
              <p className="text-white/50 text-[11px] max-w-xs mx-auto mt-1">
                Soy SOFIA. Conozco todos tus números: nómina, servidores, breakeven y flujo de caja. Pregúntame lo que necesites.
              </p>
            </div>

            {/* Suggestions */}
            <div className="space-y-1.5 text-left pt-2">
              <span className="text-[10px] text-white/30 uppercase tracking-wide font-semibold block">Preguntas sugeridas:</span>
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="w-full text-left p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/10 border border-white/5 text-[11px] text-white/80 transition-colors"
                >
                  💬 {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {sofiaHistory.map((msg, idx) => {
          const isUser = msg.role === 'user'
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-w11-accent text-white rounded-br-sm'
                    : 'bg-white/5 text-w11-text border border-white/10 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="flex items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 w-24">
            <div className="w-2 h-2 rounded-full bg-w11-accent animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-w11-accent animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-w11-accent animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-white/10 bg-[#181818]">
        <form
          onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            className="w11-input flex-1 text-xs py-2"
            placeholder="Escribe tu consulta financiera a SOFIA..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="btn-accent px-3 py-2 text-xs disabled:opacity-40"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
