import GoogleSignUp from '../components/pages/GoogleSignUp'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">PressPass - Sign Up</h1>
      <GoogleSignUp />
    </main>
  )
}

