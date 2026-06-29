export default function BackgroundGlows() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden>
      {/* Primary glow — top-right */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, rgba(34,211,238,0.02) 40%, transparent 70%)',
        }}
      />
      {/* Secondary glow — bottom-left */}
      <div
        className="absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0.02) 40%, transparent 70%)',
        }}
      />
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-100" />
    </div>
  );
}
