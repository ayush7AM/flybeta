export default function Marquee() {
  const text = 'NO BORING VIDEOS • JUST PURE CODE • BEAT THE BOSS • AI GRADED • ';
  // Repeat enough times for seamless loop
  const repeated = text.repeat(8);

  return (
    <div className="relative bg-black border-y-4 border-black py-4 overflow-hidden select-none">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-yellow-400 font-black text-2xl uppercase tracking-wider">
          {repeated}
        </span>
      </div>
    </div>
  );
}
