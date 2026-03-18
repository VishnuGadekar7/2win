import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("grid w-full auto-rows-[22rem] grid-cols-3 gap-4", className)}>
    {children}
  </div>
);

const BentoCard = ({ name, className, background, Icon, description, href, cta }: {
  name: string; className: string; background: ReactNode;
  Icon: any; description: string; href: string; cta: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      "dark:bg-neutral-950 dark:[border:1px_solid_rgba(255,255,255,.08)] dark:[box-shadow:0_-20px_80px_-20px_#a855f71f_inset]",
      "bg-neutral-950 [border:1px_solid_rgba(255,255,255,.08)] [box-shadow:0_-20px_80px_-20px_#a855f71f_inset]",
      className,
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-10 w-10 origin-left transform-gpu text-purple-400 transition-all duration-300 ease-in-out group-hover:scale-75" />
      <h3 className="text-lg font-semibold text-neutral-200 mt-2">{name}</h3>
      <p className="max-w-lg text-sm text-neutral-500">{description}</p>
    </div>
    <div className={cn(
      "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
    )}>
      <Button variant="ghost" asChild size="sm" className="pointer-events-auto text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
        <a href={href}>{cta}<ArrowRightIcon className="ml-2 h-4 w-4" /></a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-purple-500/[.03]" />
  </div>
);

export { BentoCard, BentoGrid };
