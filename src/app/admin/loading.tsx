export default function AdminLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <p className="sr-only" role="status">
        Loading
      </p>
      <div className="skeleton h-12 w-64 rounded-full bg-sage" />
      <div className="skeleton h-72 rounded-3xl bg-sage/70" />
    </div>
  );
}
