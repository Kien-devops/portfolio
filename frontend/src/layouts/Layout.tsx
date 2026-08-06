import { Outlet } from "react-router-dom";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";

export default function Layout() {
  return (
    <div className="relative flex flex-col min-h-screen bg-transparent text-slate-100 font-sans antialiased overflow-hidden">
      <div className="liquid-background"></div>
      
      <Header />
      
      <main className="relative z-10 flex-grow pt-24 pb-12">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
