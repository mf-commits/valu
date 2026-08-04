// Logo réel Services Valu — dépose le fichier PNG choisi dans /public/logo.png
// (renomme-le simplement "logo.png"). Le SVG de secours n'est utilisé que si
// logo.png est absent.
export default function Logo({ className = "h-7" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.png" alt="Services Valu" className={className} />;
}
