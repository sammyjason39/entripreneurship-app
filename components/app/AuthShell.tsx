export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col justify-center px-4 py-8 text-on-bg-readable">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </main>
  );
}
