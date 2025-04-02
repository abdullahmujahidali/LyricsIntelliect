import Footer from "@/components/Footer";
import { Music } from "lucide-react";
import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              LyricsIntelliect
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-10 md:py-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
