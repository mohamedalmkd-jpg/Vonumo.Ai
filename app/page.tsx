import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { Layers } from "./components/Layers";
import { Terminal } from "./components/Terminal";
import { Features } from "./components/Features";
import { Pricing } from "./components/Pricing";
import { Booking } from "./components/Booking";
import { Steps } from "./components/Steps";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <Services />
        <Layers />
        <Terminal />
        <Features />
        <Pricing />
        <Booking />
        <Steps />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
