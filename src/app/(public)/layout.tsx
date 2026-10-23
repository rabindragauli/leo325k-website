import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteFooterMobile } from "@/components/layout/SiteFooterMobile";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteHeaderMobile } from "@/components/layout/SiteHeaderMobile";

// Shared public shell. Desktop and mobile variants switch with CSS at 860 px, so no JS is needed
// and the hidden copy is display:none (out of the accessibility tree, lazy images not loaded).
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader className="max-desk:hidden" />
      <SiteHeaderMobile className="desk:hidden" />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col focus:shadow-none focus:outline-none">
        {children}
      </main>
      <SiteFooter className="max-desk:hidden" />
      <SiteFooterMobile className="desk:hidden" />
    </>
  );
}
