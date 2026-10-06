import { bronnenVoor } from "@/lib/bronnen";

/** Kleine lijst "Meer informatie bij" met externe links. */
export function BronLinks({ ids, className = "" }: { ids?: string[]; className?: string }) {
  const b = bronnenVoor(ids);
  if (!b.length) return null;
  return (
    <p className={`text-sm text-ink-soft ${className}`}>
      <span className="font-semibold">Meer informatie bij: </span>
      {b.map((x, i) => (
        <span key={x.id}>
          <a href={x.url} target="_blank" rel="noopener noreferrer" title={x.over} className="font-semibold text-mist-600 underline underline-offset-2">{x.naam}<span className="sr-only"> (opent in nieuw tabblad)</span></a>
          {i < b.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
}
