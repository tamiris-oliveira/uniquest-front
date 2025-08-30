"use client";
import { AuthProvider } from '@/context/authContext';
import { usePathname } from "next/navigation";
import Menu from "@/components/main/menu";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Suspense } from "react";
import Spinner from "@/components/main/spinner";

function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <AuthProvider>
      <html lang="en">
        <body className={isAuthPage ? "auth-page" : ""}>
          {isAuthPage ? (
            children
          ) : (
            <>
              {/* O Menu agora está dentro de um header semântico */}
              <header className="main-header">
                <Menu />
              </header>
              
              {/* O conteúdo principal permanece em main */}
              <main>{children}</main>
            </>
          )}
          <ToastContainer position="top-right" autoClose={3000} />
        </body>
      </html>
    </AuthProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<Spinner />}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}