export function AdminFooter() {
  return (
    <footer className="flex shrink-0 flex-wrap items-center gap-[18px] border-t border-admin-border bg-white px-6 py-2 font-nunito">
      <p className="flex-1 text-[13px] leading-[19.5px] text-admin-grey-900">
        {new Date().getFullYear()} © All Right Reserved
      </p>
      <p className="text-[14px] leading-[21px] whitespace-nowrap text-admin-muted">Designed &amp; Developed</p>
    </footer>
  );
}
