'use client';

export default function BackgroundGlows() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -left-48 bottom-[20%] w-[500px] h-[500px] rounded-full bg-yellow-500/8 blur-[120px]" />
      <div className="absolute -right-48 top-[15%] w-[600px] h-[600px] rounded-full bg-sky-500/8 blur-[130px]" />
    </div>
  );
}
