import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { Providers } from "@/app/providers";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
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
    <html lang="en" className={manrope.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
