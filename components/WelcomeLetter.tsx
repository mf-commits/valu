import { companyConfig } from "@/lib/companyConfig";
import { welcomeLetterBlocks, getWelcomeLetterSignoff } from "@/lib/welcomeLetter";
import { getVideoEmbed } from "@/lib/videoEmbed";
import Logo from "@/components/Logo";

export default function WelcomeLetter() {
  const video = getVideoEmbed(companyConfig.introVideoUrl);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-slate-700">
      <div className="text-center">
        <Logo className="mx-auto mb-4 h-7" />
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
          Bienvenue chez {companyConfig.entrepriseNom}
        </p>
        <h2 className="font-title mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Bonjour et bienvenue chez Valu
        </h2>
      </div>

      {video && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
          {video.kind === "iframe" && (
            <div className="relative aspect-video w-full">
              <iframe
                src={video.src}
                title="Message de bienvenue"
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
              ▶ Regarder notre message de bienvenue
            </a>
          )}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-5">
        {welcomeLetterBlocks.map((block, i) => {
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

        <p className="mt-5 whitespace-pre-line text-slate-500">
          {getWelcomeLetterSignoff()}
        </p>
      </div>
    </div>
  );
}
