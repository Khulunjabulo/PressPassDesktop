import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import '../globals.css';

export default function VerifyEmailPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
          <MailCheck className="h-8 w-8 text-[#329ae1]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Verify Your Email
        </h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email address. Please check your
          inbox (and spam folder) and click the link to complete your
          registration.
        </p>
        <p className="text-gray-600 mb-8">
          Once your email is verified, you can sign in to your account.
        </p>
        <Link
          href="/signin"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
        >
          Back to Sign In
        </Link>
        <p className="text-xs text-gray-500 mt-6">
          Didn't receive an email? Please wait a few minutes or try signing up again.
        </p>
      </div>
    </div>
  );
}