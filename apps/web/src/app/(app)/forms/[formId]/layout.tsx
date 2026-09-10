import { BuilderShell } from "@/components/builder/builder-shell";

export default async function FormLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  return <BuilderShell formId={formId}>{children}</BuilderShell>;
}
