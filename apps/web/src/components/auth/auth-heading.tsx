interface AuthHeadingProps {
  title: string;
  description: string;
}

export function AuthHeading({ title, description }: AuthHeadingProps) {
  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-[28px] font-bold leading-9 text-content-primary sm:text-[32px] sm:leading-10">
        {title}
      </h1>
      <p className="text-body-m leading-6 text-content-secondary sm:text-body-l">{description}</p>
    </header>
  );
}
