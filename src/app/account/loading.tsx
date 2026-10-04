export default function AccountLoading() {
  return (
    <div className="grid gap-8 md:grid-cols-2" aria-busy="true">
      <p className="sr-only" role="status">
        Loading
      </p>
      <div className="skeleton h-64 rounded-3xl bg-sage" />
      <div className="skeleton h-64 rounded-3xl bg-sage" />
    </div>
  );
}
