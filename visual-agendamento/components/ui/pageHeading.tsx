import { marker } from "@/lib/fonts";

type PageHeadingProps = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export default function PageHeading({
  title,
  description,
  eyebrow = "Chicago Barber",
}: PageHeadingProps) {
  return (
    <header>
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#FF5A00]">
        {eyebrow}
      </p>

      <h1
        className={`${marker.className} mt-3 text-4xl leading-none text-white sm:text-6xl`}
      >
        {title}
      </h1>

      <div className="mt-4 h-1 w-28 -rotate-1 rounded-full bg-[#00D1FF]" />

      {description && (
        <p className="mt-5 max-w-xl text-zinc-400">{description}</p>
      )}
    </header>
  );
}
