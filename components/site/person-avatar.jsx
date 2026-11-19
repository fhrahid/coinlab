import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function PersonAvatar({
  name,
  src,
  className,
  fallbackClassName,
}) {
  return (
    <Avatar className={cn("size-10", className)}>
      {src && <AvatarImage alt={name} src={src} />}
      {/* Shown when there is no photo, or the photo fails to load. */}
      <AvatarFallback
        className={cn("bg-secondary text-brand", fallbackClassName)}
      >
        <User aria-hidden="true" className="size-1/2" strokeWidth={1.5} />
      </AvatarFallback>
    </Avatar>
  );
}
