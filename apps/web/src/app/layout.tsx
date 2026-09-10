import type { Metadata } from "next";
import { Krona_One, Manrope } from "next/font/google";

import { Providers } from "@/app/providers";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const kronaOne = Krona_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-krona",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VoiceForm",
    template: "%s · VoiceForm",
  },
  description:
    "Create forms people can listen to and answer by speaking, instead of typing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${kronaOne.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
