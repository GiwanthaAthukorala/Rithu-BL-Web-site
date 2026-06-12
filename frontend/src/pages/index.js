import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header/Header";
import LandingPage from "@/components/Home/Landing";
import Categories from "@/components/SocialCategories/Categories";
import HelpMode from "@/components/HelpTask/HelpMode";
import FAQ from "@/components/FAQ";
import Footer from "@/Context/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <div className="">
        <Header />
      </div>
      <div className="">
        <LandingPage />
      </div>
      <div>
        <Categories />
      </div>
      <div>
        <HelpMode />
      </div>
      <div>
        <FAQ />
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
}
