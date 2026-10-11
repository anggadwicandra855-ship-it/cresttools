import Image from "next/image";

interface LogoProps {
  /** full = lambang + tulisan, mark = lambang saja, wordmark = tulisan saja */
  variant?: "full" | "mark" | "wordmark";
  className?: string;
  /** Aktifkan untuk logo di atas layar (navbar) biar langsung ke-load. */
  priority?: boolean;
}

export default function Logo({ variant = "full", className = "", priority = false }: LogoProps) {
  const mark = (
    <Image
      src="/brand/crest-mark.png"
      alt={variant === "mark" ? "CrestTools" : ""}
      aria-hidden={variant === "mark" ? undefined : true}
      width={512}
      height={512}
      priority={priority}
      className="h-8 w-8 shrink-0 object-contain"
    />
  );

  const word = (
    <Image
      src="/brand/crest-wordmark.png"
      alt={variant === "wordmark" ? "CrestTools" : ""}
      aria-hidden={variant === "wordmark" ? undefined : true}
      width={1600}
      height={311}
      priority={priority}
      className="h-[22px] w-auto shrink-0 object-contain"
    />
  );

  if (variant === "mark") return <span className={className}>{mark}</span>;
  if (variant === "wordmark") return <span className={className}>{word}</span>;

  return (
    <span role="img" aria-label="CrestTools" className={`inline-flex items-center gap-2 ${className}`}>
      {mark}
      {word}
    </span>
  );
}
