import { Outlet } from "react-router-dom";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Dynamic light glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[20%] right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
