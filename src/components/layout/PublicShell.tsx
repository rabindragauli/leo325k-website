import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteFooterMobile } from "./SiteFooterMobile";
import { SiteHeader } from "./SiteHeader";
import { SiteHeaderMobile } from "./SiteHeaderMobile";

// Shared public shell, used by the (public) layout and the root 404 (which renders outside route
// groups). Desktop and mobile variants switch with CSS at 860 px, so no JS is needed and the
// hidden copy is display:none (out of the accessibility tree, lazy images not loaded).
export function PublicShell({ children }: { children: ReactNode }) {
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
