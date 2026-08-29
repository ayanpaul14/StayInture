import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ConditionalFooter from "../components/ConditionalFooter";
import PageBackground from "../components/PageBackground";

export const metadata = {
  title: "StayInture — find a place, or list yours",
  description: "Property rental & listing platform: Flat, Bungalow, PG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen bg-slate-950 text-ink">
        <PageBackground />
        <AuthProvider>
          <Navbar />
          <main className="relative z-10">{children}</main>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}