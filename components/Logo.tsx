// eslint-disable-next-line @next/next/no-img-element
export default function Logo({ className = "h-7" }: { className?: string }) {
  // Remplace /public/logo.svg par le vrai logo Services Valu (SVG ou PNG).
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.svg" alt="Services Valu" className={className} />;
}
