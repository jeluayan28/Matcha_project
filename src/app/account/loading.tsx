export default function AccountLoading() {
  return (
    <div className="grid animate-pulse gap-8 md:grid-cols-2" aria-busy="true">
      <p className="sr-only" role="status">
        Loading
      </p>
      <div className="h-64 rounded-3xl bg-sage/30" />
      <div className="h-64 rounded-3xl bg-sage/30" />
    </div>
  );
}
