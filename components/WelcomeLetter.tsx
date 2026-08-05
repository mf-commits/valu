import type { LetterBlock } from "@/lib/welcomeLetter";
import type { ContractLang } from "@/lib/contractContent";
import { getVideoEmbed } from "@/lib/videoEmbed";
import { t } from "@/lib/uiStrings";
import Logo from "@/components/Logo";

type Props = {
  lang?: ContractLang;
  entrepriseNom: string;
  introVideoUrl: string;
  blocks: LetterBlock[];
  signoff: string;
};

export default function WelcomeLetter({
  lang,
  entrepriseNom,
  introVideoUrl,
  blocks,
  signoff,
}: Props) {
  const video = getVideoEmbed(introVideoUrl);
  const s = t(lang).welcome;

  return (
    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
      <div className="text-center">
        <Logo className="mx-auto mb-4 h-7" />
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
          {s.bienvenueChez} {entrepriseNom}
        </p>
        <h2 className="font-title mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {s.bonjour}
        </h2>
      </div>

      {video && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
          {video.kind === "iframe" && (
            <div className="relative aspect-video w-full">
              <iframe
                src={video.src}
                title={s.videoTitle}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {video.kind === "file" && (
            <video controls className="w-full" preload="metadata">
              <source src={video.src} />
            </video>
          )}
          {video.kind === "unknown" && (
            <a
              href={video.src}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-100"
            >
              {s.videoLinkFallback}
            </a>
          )}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-5">
        {blocks.map((block, i) => {
          if (block.type === "heading") {
            return (
              <h3
                key={i}
                className="mt-5 text-sm font-semibold text-slate-900 first:mt-0"
              >
                {block.text}
              </h3>
            );
          }
          if (block.type === "list") {
            return (
              <ol key={i} className="mt-2 list-decimal space-y-2 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            );
          }
          return (
            <p key={i} className="mt-3 first:mt-0">
              {block.text}
            </p>
          );
        })}

        <p className="mt-5 whitespace-pre-line text-slate-500">{signoff}</p>
      </div>
    </div>
  );
}
