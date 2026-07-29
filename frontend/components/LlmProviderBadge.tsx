"use client";

export function formatLlmProviderLabel(provider: string | null | undefined): string | null {
  if (!provider) {
    return null;
  }

  const labels: Record<string, string> = {
    openai: "OpenAI",
    ollama: "Ollama",
    anthropic: "Anthropic",
    openrouter: "OpenRouter",
    gemini: "Google Gemini",
    bedrock: "AWS Bedrock",
  };

  return labels[provider.toLowerCase()] ?? provider;
}

function providerStyles(provider: string): string {
  // Use darker text colors so badges stay readable on the light content surface.
  switch (provider.toLowerCase()) {
    case "openai":
      return "border-emerald-300 bg-emerald-50 text-emerald-900";
    case "ollama":
      return "border-violet-300 bg-violet-50 text-violet-900";
    case "anthropic":
      return "border-orange-300 bg-orange-50 text-orange-900";
    case "openrouter":
      return "border-sky-300 bg-sky-50 text-sky-900";
    case "gemini":
      return "border-blue-300 bg-blue-50 text-blue-900";
    case "bedrock":
      return "border-amber-300 bg-amber-50 text-amber-900";
    default:
      return "border-slate-300 bg-slate-50 text-slate-900";
  }
}

export function LlmProviderBadge({ provider }: { provider?: string | null }) {
  const label = formatLlmProviderLabel(provider);

  if (!label || !provider) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${providerStyles(provider)}`}
      title={`AI diagnosis powered by ${label}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-current">AI</span>
      <span className="text-current opacity-50">·</span>
      <span className="text-current">{label}</span>
    </span>
  );
}
