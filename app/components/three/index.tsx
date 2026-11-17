"use client";
import dynamic from "next/dynamic";

// three.js wird erst nach dem ersten Rendern geladen – die Seite steht sofort.
export const Stage = dynamic(() => import("./Stage"), { ssr: false });
export const HeroObject = dynamic(() => import("./HeroObject"), { ssr: false });
export const CardObject = dynamic(() => import("./CardObject"), { ssr: false });
