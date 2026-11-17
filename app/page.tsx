import { Nav } from "./components/Nav";
import { Hero, HeroBackdrop } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Details } from "./components/Details";
import { Services } from "./components/Services";
import { Layers } from "./components/Layers";
import { Terminal } from "./components/Terminal";
import { Pricing } from "./components/Pricing";
import { Booking } from "./components/Booking";
import { Steps } from "./components/Steps";
import { Faq } from "./components/Faq";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Stage, HeroObject } from "./components/three";

export default function Home() {
  return (
    <>
      <HeroBackdrop />
      <Stage />
      <HeroObject />
      <Nav />
      <main id="main" className="relative z-10 overflow-x-clip">
        <Hero />
        <Marquee />
        <Details />
        <Services />
        <Layers />
        <Terminal />
        <Pricing />
        <Booking />
        <Steps />
        <Faq />
        <Contact />
      </main>
      <div className="relative z-10"><Footer /></div>
    </>
  );
}
