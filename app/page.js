"use client";

import '../app/globals.css';
import Home from '@/components/pages/Home';
import SignIn from '@/components/pages/SignIn';
import SignUp from '@/components/pages/SignUp';
import PrintMedia from '@/components/LandingPages/PrintMedia';
// import Header from '@/components/Header';

import { usePathname } from 'next/navigation';

export default function App() {
  const pathname = usePathname();

  let page;
  switch (pathname) {
    case '/signin':
      page = <SignIn />;
      break;
    case '/signup':
      page = <SignUp />;
      break;
       case '/printmedia':
      page = <PrintMedia />;
      break;
    case '/':
    default:
      page = <Home />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-grow">{page}</main>
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </footer>
    </div>
  );
}
