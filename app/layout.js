// app/layout.js - Updated News Reader Layout
import "../app/globals.css"
import ServiceWorkerRegister from "../components/ServiceWorkerRegister"
import { FloatingMessenger } from "../components/FloatingMessenger"
import { AuthProvider } from "../components/AuthProvider"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Press Pass - Your Media Hub</title>
        <meta
          name="description"
          content="Welcome to Press Pass, your ultimate media hub for news and print publications."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#329ae1" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/press-pass.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/press-pass.png" />
        <link rel="apple-touch-icon" href="/press-pass.png" />
        <link rel="shortcut icon" href="/press-pass.png" />
        {/* Add PDF.js library */}
        <script 
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          async
        ></script>
      </head>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <ServiceWorkerRegister />
          <main className="flex-grow w-full">{children}</main>
          
          {/* Floating Support Messenger - Available on all pages */}
          <FloatingMessenger />
        </AuthProvider>
      </body>
    </html>
  )
}

