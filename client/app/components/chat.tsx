'use client'

import * as React from 'react'
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Send, User, Bot, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Doc {
  pageContent?: string
  metadata?: {
    loc?: {
      pageNumber?: number
    }
    source?: string
  }
}

interface IMessage {
  role: 'assistant' | 'user'
  content?: string
  documents?: Doc[]
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>('')
  const [messages, setMessages] = React.useState<IMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSendChatMessage = async () => {
    if (!message.trim()) return
    
    const userMessage = message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setMessage('')
    setIsLoading(true)
    
    try {
      const res = await fetch(`http://localhost:8000/chat?message=${encodeURIComponent(userMessage)}`)
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant', 
        content: data?.message, 
        documents: data?.docs
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant', 
        content: "Sorry, I encountered an error. Please try again."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendChatMessage()
    }
  }

  return (
    <div className='bg-black min-h-screen w-full p-4 pb-24 flex flex-col'>
      <div className='max-w-4xl w-full mx-auto flex-1 overflow-y-auto'>
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col items-center justify-center h-full text-gray-400'
            >
              <Bot className='h-12 w-12 mb-4' />
              <h2 className='text-xl font-semibold'>Welcome</h2>
              <p className='mt-2'>Ask anything from the uploaded PDF</p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                <div className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[80%] rounded-xl p-4 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}>
                    <p className='whitespace-pre-wrap'>{message.content}</p>
                    
                    {message.documents && message.documents.length > 0 && (
                      <div className='mt-3 pt-3 border-t border-gray-600'>
                        <h4 className='text-sm font-medium mb-2 flex items-center gap-1'>
                          <FileText size={14} /> Sources
                        </h4>
                        <div className='space-y-2'>
                          {message.documents.map((doc, docIndex) => (
                            <div key={docIndex} className='text-xs p-2 bg-gray-700 rounded-lg'>
                              <p className='line-clamp-2'>{doc.pageContent}</p>
                              {doc.metadata?.source && (
                                <p className='text-gray-400 mt-1 truncate'>
                                  Source: {doc.metadata.source}
                                  {doc.metadata.loc?.pageNumber && ` (Page ${doc.metadata.loc.pageNumber})`}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex items-start gap-3 mb-6'
          >
            <div className='flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center'>
              <Bot size={16} />
            </div>
            <div className='bg-gray-800 rounded-xl p-4 w-16'>
              <div className='flex space-x-1'>
                <div className='h-2 w-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></div>
                <div className='h-2 w-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></div>
                <div className='h-2 w-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className='fixed bottom-0 left-170 right-0 bg-gradient-to-t from-black to-transparent pt-10 pb-6'>
        <div className='max-w-4xl mx-auto px-4 flex gap-3'>
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type your query...'
            className='flex-1 bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <Button 
            onClick={handleSendChatMessage} 
            disabled={!message.trim() || isLoading}
            className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500'
          >
            <Send size={18} className='mr-2' /> Send
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatComponent