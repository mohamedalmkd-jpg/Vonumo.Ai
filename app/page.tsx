import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { Details } from "./components/Details";
import { Services } from "./components/Services";
import { Showroom } from "./components/Showroom";
import { MaterialLab } from "./components/MaterialLab";
import { Film } from "./components/Film";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Film-Abschnitt nur, wenn der gerenderte Film wirklich vorliegt (npm run render:reel)
const HAS_FILM = existsSync(join(process.cwd(), "public", "film", "reel-1080.mp4"));
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
      <Stage />
      <HeroObject />
      <Nav />
      <main id="main" className="relative z-10 overflow-x-clip">
        <Hero />
        <Showroom />
        {HAS_FILM && <Film />}
        <Services />
        <MaterialLab />
        <Marquee />
        <Details />
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
