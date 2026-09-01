import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function BreakingBadge({ className }: { className?: string }) {
  return (
    <Badge variant="live" className={cn("shadow-sm", className)}>
      Son Dakika
    </Badge>
  );
}
