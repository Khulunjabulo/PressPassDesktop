"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Paperclip, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function FloatingMessenger({ user = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [attachedFile, setAttachedFile] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showEmailPrompt, setShowEmailPrompt] = useState(!user)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user) {
      setShowEmailPrompt(false)
      loadMessages()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/support/messages?userId=${user.uid}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      setAttachedFile(file)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() && !attachedFile) return
    
    if (!user && !email.trim()) {
      alert("Please enter your email address")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("message", message)
      formData.append("email", user ? user.email : email)
      formData.append("userId", user ? user.uid : "guest")
      formData.append("userName", user ? user.displayName || user.email : email)
      
      if (attachedFile) {
        formData.append("file", attachedFile)
      }

      const response = await fetch("/api/support/send-message", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setMessage("")
        setAttachedFile(null)
        if (user) {
          loadMessages()
        } else {
          const newMsg = {
            id: Date.now().toString(),
            message,
            timestamp: new Date().toISOString(),
            fromUser: true,
            fileName: attachedFile?.name
          }
          setMessages([...messages, newMsg])
        }
      } else {
        alert("Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = () => {
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setShowEmailPrompt(false)
    } else {
      alert("Please enter a valid email address")
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-50"
          aria-label="Open support messenger"
        >
          <MessageCircle className="w-6 h-6" />
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white border-0 h-5 w-5 flex items-center justify-center p-0 text-xs">
            !
          </Badge>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-[#4A90E2] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Support Chat</h3>
                <p className="text-xs opacity-90">We typically reply within 2 hours</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Email Prompt for Non-Authenticated Users */}
          {showEmailPrompt && (
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
              <div className="text-center space-y-4 max-w-sm">
                <User className="w-12 h-12 mx-auto text-gray-400" />
                <h4 className="font-semibold text-gray-900">Welcome!</h4>
                <p className="text-sm text-gray-600">
                  Please enter your email so we can respond to your message
                </p>
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleEmailSubmit()}
                    className="w-full"
                  />
                  <Button
                    onClick={handleEmailSubmit}
                    className="w-full bg-[#4A90E2] hover:bg-[#3A7BC8]"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          {!showEmailPrompt && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm mt-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.fromUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.fromUser
                          ? "bg-[#4A90E2] text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      {msg.fileName && (
                        <div className="flex items-center gap-1 mt-2 text-xs opacity-90">
                          <Paperclip className="w-3 h-3" />
                          <span>{msg.fileName}</span>
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${msg.fromUser ? "opacity-80" : "text-gray-500"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                {attachedFile && (
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                    <Paperclip className="w-4 h-4" />
                    <span className="flex-1 truncate">{attachedFile.name}</span>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    disabled={loading}
                    className="flex-1"
                  />
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || (!message.trim() && !attachedFile)}
                    className="bg-[#4A90E2] hover:bg-[#3A7BC8] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Messages are automatically deleted after 7 days
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}