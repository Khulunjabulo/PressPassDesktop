"use client";

import '../../globals.css';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';

import SignIn from '@/components/pages/SignIn';
import SignUp from '@/components/pages/SignUp';
import PrintMedia from '@/components/LandingPages/PrintMedia';
// import Header from '@/components/Header';

export default function LandingPageRouter() {
  const params = useParams();
  const slug = params?.slug || [];

  // Decide what to render
  let page;

  if (slug.length === 0) {
    // /LandingPage
    page = <PrintMedia />;
  } else if (slug[0].toLowerCase() === 'signin') {
    page = <SignIn />;
  } else if (slug[0].toLowerCase() === 'signup') {
    page = <SignUp />;
  } else if (slug[0].toLowerCase() === 'printmedia') {
    page = <PrintMedia />;
  } else {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-grow">
        {page}
      </main>
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </footer>
    </div>
  );
}
