// app/layout.js
import "../app/globals.css"
import ServiceWorkerRegister from "../components/ServiceWorkerRegister"
import { FloatingMessenger } from "../components/FloatingMessenger"
import { AuthProvider } from "../components/AuthProvider"
import AdminImpersonationBannerWrapper from "../components/AdminImpersonationBannerWrapper"

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

        {/* PDF.js */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          async
        ></script>
      </head>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        {/*
          AdminImpersonationBannerWrapper sits OUTSIDE AuthProvider intentionally.
          It needs to call signInWithCustomToken before AuthProvider's
          onAuthStateChanged fires, so the auth state is already set when
          AuthProvider reads it.
        */}
        <AdminImpersonationBannerWrapper>
          <AuthProvider>
            <ServiceWorkerRegister />
            <main className="flex-grow w-full">{children}</main>
            <FloatingMessenger />
          </AuthProvider>
        </AdminImpersonationBannerWrapper>
      </body>
    </html>
  )
}