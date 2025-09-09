import "../app/globals.css"
import ServiceWorkerRegister from "../components/ServiceWorkerRegister"

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
      </head>
      <body className="flex flex-col min-h-screen">
        <ServiceWorkerRegister />
        <main className="flex-grow w-full">{children}</main>
      </body>
    </html>
  )
}
