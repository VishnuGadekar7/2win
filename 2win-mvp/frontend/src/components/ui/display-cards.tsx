"use client";
import { cn } from "@/lib/utils";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  cta?: string;
  href?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon,
  title = "Featured",
  description = "Discover amazing content",
  cta = "System Details",
  href = "#",
  titleClassName = "text-purple-400",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-44 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-5 py-4 transition-all duration-700",
        "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-black after:to-transparent after:content-['']",
        "hover:border-purple-500/40 hover:bg-white/[0.05]",
        "[&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="relative inline-block rounded-xl bg-white/5 border border-white/10 p-2">
          {icon}
        </span>
        <p className={cn("text-lg font-black tracking-tight", titleClassName)}>
          {title}
        </p>
      </div>
      <p className="whitespace-nowrap text-sm text-neutral-300 font-medium">
        {description}
      </p>
      <a
        href={href}
        className="text-purple-400 text-[10px] font-black uppercase tracking-[0.3em] hover:text-purple-300 transition-colors pointer-events-auto z-10 relative"
      >
        {cta} →
      </a>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    { className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-black/40 hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0 grayscale-[60%] hover:grayscale-0" },
    { className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-black/40 hover:before:opacity-0 before:transition-opacity before:duration-700 before:left-0 before:top-0 grayscale-[60%] hover:grayscale-0" },
    { className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10" },
  ];
  const displayCards = cards || defaultCards;
  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}

export { DisplayCard };
