'use client'
import localFont from "next/font/local";
import "./globals.css";
import Header from './components/Header'
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { auth } from './firebase'

// context
import { AuthContext, AuthContextProvider } from './context/AuthContext'
import { useContext, useEffect, useState } from "react";

export default function RootLayout({ children }) {
  return (
    <AuthContextProvider>
      <InnerLayout>{children}</InnerLayout>
    </AuthContextProvider>
  );
}

const InnerLayout = ({ children }) => {
  const path = usePathname();
  const { push } = useRouter();
  const { currentUser } = useContext(AuthContext);

  const isAuthenticated = currentUser ? true : false;

  useEffect(() => {
    if (isAuthenticated && (path === '/login' || path === '/daftar')) {
      push('/');
    }
    if (!isAuthenticated && (path === '/upload')) {
      alert('kamu belum login, jadi ga bisa upload 👍')
      push('/login')
    }
  }, [isAuthenticated, path, push]);

  return (
    <>
      <html lang="en">
        <head>
          <title>Sisfor</title>
        </head>
        <body>
          <Header />
          <main className="container mx-auto">
            {children}
          </main>
        </body>
      </html>
    </>
  );
};