import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" aria-label="Offmark home" className="brand-home">
      <span className="brand-logo-frame">
        <Image
          src="/logo_w_words.jpg"
          alt=""
          width={8202}
          height={4687}
          className="brand-logo-image"
          unoptimized
          preload
        />
      </span>
    </Link>
  );
}
