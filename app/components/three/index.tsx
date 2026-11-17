"use client";
import dynamic from "next/dynamic";

// three.js wird erst nach dem ersten Rendern geladen – die Seite steht sofort.
export const Stage = dynamic(() => import("./Stage"), { ssr: false });
export const HeroObject = dynamic(() => import("./HeroObject"), { ssr: false });
export const ServicesObject = dynamic(() => import("./ServicesObject"), { ssr: false });
export const FlightScene = dynamic(() => import("./FlightScene"), { ssr: false });
export const DetailObject = dynamic(() => import("./DetailObject"), { ssr: false });
