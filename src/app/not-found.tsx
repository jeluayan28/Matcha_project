import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StatusPage, statusButton, statusButtonOutline } from "@/components/ui/status-page";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <StatusPage
        eyebrow="404"
        title="This page has wandered off"
        actions={
          <>
            <Link href="/shop" className={statusButton}>
              Browse the shop
            </Link>
            <Link href="/" className={statusButtonOutline}>
              Back home
            </Link>
          </>
        }
      >
        The link may be mistyped, or the page may have moved.
      </StatusPage>
      <SiteFooter />
    </>
  );
}
