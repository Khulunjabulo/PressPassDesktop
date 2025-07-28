import "../app/globals.css"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Press Pass - Your Media Hub</title>
        <meta
          name="description"
          content="Welcome to Press Pass, your ultimate media hub for news and print publications."
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <main className="flex-grow w-full">{children}</main>
      </body>
    </html>
  )
}
