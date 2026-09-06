export function FallingFeathers() {
  const feathers = [
    { left: "8%", duration: "22s", delay: "-2s", size: "w-8 h-16", textCol: "text-[#00F0FF]" },
    { left: "22%", duration: "28s", delay: "-8s", size: "w-10 h-20", textCol: "text-[#0077FF]" },
    { left: "38%", duration: "24s", delay: "-14s", size: "w-6 h-12", textCol: "text-[#00F0FF]" },
    { left: "54%", duration: "30s", delay: "-5s", size: "w-9 h-18", textCol: "text-[#0077FF]" },
    { left: "70%", duration: "26s", delay: "-18s", size: "w-7 h-14", textCol: "text-[#00F0FF]" },
    { left: "86%", duration: "32s", delay: "-11s", size: "w-10 h-20", textCol: "text-[#0077FF]" },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {feathers.map((f, i) => (
        <div
          key={i}
          className="absolute top-0 animate-feather-fall"
          style={{
            left: f.left,
            animationDuration: f.duration,
            animationDelay: f.delay,
          }}
        >
          <svg
            className={`${f.size} ${f.textCol} opacity-40 drop-shadow-[0_0_12px_rgba(0,240,255,0.5)]`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 13.5V21h7.5l9.74-9.76z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
        </div>
      ))}
    </div>
  )
}
