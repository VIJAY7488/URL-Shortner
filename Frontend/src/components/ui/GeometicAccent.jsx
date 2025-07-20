
export default function GeometricAccent() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top left geometric shape */}
      <div className="absolute -top-40 -left-40 w-80 h-80 border border-purple-500/20 rounded-full" />
      <div className="absolute -top-32 -left-32 w-64 h-64 border border-pink-500/20 rounded-full" />

      {/* Top right geometric lines */}
      <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-purple-500/40 to-transparent" />
      <div className="absolute top-20 right-32 w-px h-32 bg-gradient-to-b from-pink-500/40 to-transparent" />
      <div className="absolute top-20 right-44 w-px h-24 bg-gradient-to-b from-blue-500/40 to-transparent" />

      {/* Bottom geometric elements */}
      <div className="absolute bottom-20 left-20 w-32 h-32 border border-teal-500/20 rotate-45" />
      <div className="absolute bottom-32 left-32 w-24 h-24 border border-purple-500/20 rotate-45" />

      {/* Center accent lines */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/10 to-transparent translate-y-2" />

      {/* Floating geometric shapes */}
      <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-purple-500/40 rotate-45 animate-pulse" />
      <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-pink-500/40 rotate-45 animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-blue-500/40 rotate-45 animate-pulse delay-2000" />
    </div>
  )
}
