import Image from "next/image";
import Link from "next/link";

import { Wordmark } from "@/components/marketing/wordmark";

const QUICK_LINKS = [
  { label: "My Forms", href: "/forms" },
  { label: "About Us", href: "/help" },
  { label: "Contact us", href: "/help" },
  { label: "Help Center", href: "/help" },
];

const SOCIALS = [
  { icon: "/landing/s-twitter.svg", label: "Twitter", href: "https://twitter.com" },
  { icon: "/landing/s-linkedin.svg", label: "LinkedIn", href: "https://linkedin.com" },
  { icon: "/landing/s-chat.svg", label: "Chat", href: "/help" },
];

export function MarketingFooter() {
  return (
    <footer className="bg-white px-5 py-12 sm:px-8 lg:px-16 lg:py-16">
      <div className="mx-auto flex w-full max-w-[1312px] flex-col gap-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[342px_201px_201px] lg:justify-between lg:gap-0">
          <div className="flex max-w-[342px] flex-col gap-6 lg:gap-8">
            <Wordmark />
            <p className="text-body-l leading-6 text-content-primary">
              Revolutionzing the way we create forms by using forms making it very simple to
              create forms
            </p>
            <div className="flex items-center gap-6">
              {SOCIALS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="focus-ring flex size-10 items-center justify-center rounded-full bg-surface-page transition-colors hover:bg-brand-muted"
                >
                  <Image src={social.icon} alt="" width={24} height={24} className="size-6" />
                </Link>
              ))}
            </div>
          </div>

          <nav className="flex flex-col gap-6 text-content-primary">
            <h3 className="text-[20px] font-medium leading-7">Quick LInks</h3>
            <ul className="flex flex-col gap-4">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="focus-ring rounded text-body-l leading-6">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-6 text-content-primary">
            <h3 className="text-[20px] font-medium leading-7">Contact</h3>
            <ul className="flex flex-col gap-4 text-body-l leading-6 opacity-80">
              <li>
                <a href="mailto:voiceforms@gmail.com" className="focus-ring rounded break-all">
                  voiceforms@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+233244567890" className="focus-ring rounded">
                  +(233) 244 567 890
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 text-body-m text-content-primary/80 sm:flex-row sm:items-center sm:justify-between sm:text-body-l">
          <p className="underline">2025@All rights reserved VoiceForm © 2026</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="focus-ring rounded underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="focus-ring rounded underline">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
