import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StatusPage, statusButton } from "@/components/ui/status-page";

export default function ProductNotFound() {
  return (
    <>
      <SiteHeader />
      <StatusPage
        eyebrow="Not found"
        title="We couldn't find that matcha"
        actions={
          <Link href="/shop" className={statusButton}>
            Browse the shop
          </Link>
        }
      >
        It may have sold out for good, or the link may be mistyped.
      </StatusPage>
      <SiteFooter />
    </>
  );
}
