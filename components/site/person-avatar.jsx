import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/media";
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
      <AvatarFallback
        className={cn(
          "bg-brand font-mono text-[0.625rem] text-white",
          fallbackClassName,
        )}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
