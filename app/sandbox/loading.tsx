export default function SandboxLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-container">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <p className="mt-4 text-sm text-white/60">Loading sandbox...</p>
    </div>
  );
}
