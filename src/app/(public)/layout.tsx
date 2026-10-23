import { PublicShell } from "@/components/layout/PublicShell";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return <PublicShell>{children}</PublicShell>;
}
