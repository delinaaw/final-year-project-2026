import Link from "next/link";

interface AuthFooterLinkProps {
  prompt: string;
  href: string;
  label: string;
}

export function AuthFooterLink({ prompt, href, label }: AuthFooterLinkProps) {
  return (
    <p className="flex justify-center gap-1.5 text-body-s">
      <span className="text-content-secondary">{prompt}</span>
      <Link href={href} className="focus-ring rounded font-semibold text-content-link">
        {label}
      </Link>
    </p>
  );
}
