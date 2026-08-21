import Image from "next/image";

type AvatarProps = {
  src?: string | null;

  alt?: string;

  name?: string;

  size?: number;
};

export default function Avatar({
  src,
  alt = "",
  name = "",
  size = 40,
}: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="flex items-center justify-center rounded-full bg-[#D8B07A] font-semibold text-white"
    >
      {initials || "?"}
    </div>
  );
}