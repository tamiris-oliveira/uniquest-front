"use client";
import { AuthProvider } from '@/context/authContext';
import { usePathname } from "next/navigation";
import Menu from "@/components/main/menu";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export default function RootLayout({
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
              <Menu />
              <main>{children}</main>
            </>
          )}
          <ToastContainer position="top-right" autoClose={3000} />
        </body>
      </html>
    </AuthProvider>
  );
}
