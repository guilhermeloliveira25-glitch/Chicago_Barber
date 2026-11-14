import Hero from "@/components/hero";
import Highlights from "@/components/home/highlights";
import Location from "@/components/home/location";
import GraffitiBackground from "@/components/ui/graffitiBackground";

export default function Home() {
  return (
    <>
      <Hero />

      <div className="relative overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
        <GraffitiBackground />

        <div className="relative z-10">
          <Highlights />
          <Location />
        </div>
      </div>
    </>
  );
}
