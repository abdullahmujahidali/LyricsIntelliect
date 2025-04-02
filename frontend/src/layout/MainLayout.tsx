import { Outlet } from "react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-10 md:py-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;