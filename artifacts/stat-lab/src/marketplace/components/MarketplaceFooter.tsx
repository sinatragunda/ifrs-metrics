import { Link } from "wouter";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "IFRS Lab", href: "/ifrs" },
      { label: "Workspace", href: "/workspace/app" },
      { label: "Loans overview", href: "/loans-deposits" },
      { label: "Service catalog", href: "/loans-deposits/marketplace" },
      { label: "Pricing", href: "/ifrs#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/ifrs" },
      { label: "Register interest", href: "/ifrs#interest" },
      { label: "Account", href: "/account" },
      { label: "Checkout", href: "/checkout" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/ifrs#approach" },
      { label: "Contact", href: "mailto:sales@ifrsmetrics.com" },
      { label: "Standards roadmap", href: "/ifrs#roadmap" },
    ],
  },
];

export function MarketplaceFooter() {
  return (
    <footer className="mt-auto border-t border-[#d2dfe3] bg-[#142a3d] text-[#cbd8df]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[7px_7px_7px_2px] bg-[#147b69] text-[11px] font-bold text-white">
              IM
            </span>
            <span className="text-sm font-bold text-white">IFRS Metrics</span>
          </div>
          <p className="text-xs leading-relaxed text-[#94a3b8]">
            Loans and deposits marketplace for IFRS 9 classification, ECL, amortised cost, and disclosure packs.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-white">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("mailto:") ? (
                    <a href={link.href} className="text-xs text-[#94a3b8] hover:text-white">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-xs text-[#94a3b8] hover:text-white">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[11px] text-[#64748b]">
        © {new Date().getFullYear()} IFRS Metrics · Loans & Deposits marketplace
      </div>
    </footer>
  );
}
