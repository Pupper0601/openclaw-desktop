// ═══════════════════════════════════════════════════════════
// TextCleaner — Single source of truth for text processing
// Consolidates extractText, stripDirectives, isNoise, stripUserMeta
// that were duplicated across gateway.ts, ChatView.tsx, MessageBubble.tsx
// ═══════════════════════════════════════════════════════════

/**
 * Extract plain text from any content format the Gateway sends.
 * Handles: string, content blocks array [{type:'text',text:'...'}], nested objects.
 */
export function extractText(val: unknown): string {
  if (typeof val === 'string') return val;
  if (val == null) return '';
  if (Array.isArray(val)) {
    return val.map((block: any) => {
      if (typeof block === 'string') return block;
      if (block?.type === 'text' && typeof block.text === 'string') return block.text;
      if (typeof block?.text === 'string') return block.text;
      return '';
    }).join('');
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (typeof obj.text === 'string') return obj.text;
    if (typeof obj.content === 'string') return obj.content;
    if (Array.isArray(obj.content)) return extractText(obj.content);
    return JSON.stringify(val);
  }
  return String(val);
}

/**
 * Strip server directive tags that should never render in the UI.
 * [[reply_to:...]], [[audio_as_voice]], untrusted content wrappers, etc.
 */
export function stripDirectives(text: string): string {
  let clean = text;
  clean = clean.replace(/\[\[reply_to_current\]\]/gi, '');
  clean = clean.replace(/\[\[reply_to:[^\]]*\]\]/gi, '');
  clean = clean.replace(/\[\[audio_as_voice\]\]/gi, '');
  // Untrusted content wrappers
  clean = clean.replace(/<<<EXTERNAL_UNTRUSTED_CONTENT[\s\S]*?<<<END_EXTERNAL_UNTRUSTED_CONTENT>>>/g, '');
  clean = clean.replace(/<<<EXTERNAL_UNTRUSTED_CONTENT[^>]*>>>/g, '');
  clean = clean.replace(/<<<END_EXTERNAL_UNTRUSTED_CONTENT>>>/g, '');
  return clean.trim();
}

/** Patterns that indicate noise messages (hidden from chat) */
const NOISE_PATTERNS: RegExp[] = [
  /^Read HEARTBEAT\.md/i,
  /^HEARTBEAT_OK/,               // Matches "HEARTBEAT_OK" at start (with or without trailing text)
  /^NO_REPLY$/,
  /heartbeat prompt:/i,           // Heartbeat system prompts
  /^When reading HEARTBEAT\.md/i, // Heartbeat instruction variations
  /^احفظ جميع المعلومات المهمة/,
  /^⚠️ Session nearing compaction/,
  /^\[System\]\s*\[?\d{4}/i,  // Only match [System] followed by timestamp, not arbitrary content
  /^System:\s*\[/,
  /^PS [A-Z]:\\.*>/,
  /^node scripts\/build/,
  /^npx electron/,
  /^Ctrl\+[A-Z]/,
  /^Conversation info \(untrusted metadata\)/i,
  /^\[AEGIS_DESKTOP_CONTEXT\]/i,
  /^\[AEGIS:RASHID\]/i,
];

/**
 * Check if a message is "noise" that should be hidden from chat.
 * Heartbeats, system messages, build output, desktop context injection, etc.
 */
export function isNoise(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return NOISE_PATTERNS.some(p => p.test(trimmed));
}

/**
 * Strip injected metadata from user messages for clean display.
 * Removes: AEGIS_DESKTOP_CONTEXT blocks, Conversation info JSON,
 * System notification blocks, inline UTC timestamps.
 */
export function stripUserMeta(text: string): string {
  let clean = text;
  // [AEGIS_DESKTOP_CONTEXT]...[/AEGIS_DESKTOP_CONTEXT]
  clean = clean.replace(/\[AEGIS_DESKTOP_CONTEXT\][\s\S]*?\[\/AEGIS_DESKTOP_CONTEXT\]\s*/i, '');
  // Conversation info JSON block
  clean = clean.replace(/Conversation info \(untrusted metadata\):\s*```json\s*\{[\s\S]*?\}\s*```\s*/i, '');
  // System notification blocks with UTC timestamp — only match structured system metadata
  clean = clean.replace(/System:\s*\[(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{4}-[\s\S]*?\](?:\s*(?=\n\n)|\s*$)/g, '');
  // Inline [Mon 2026-...] timestamp prefixes
  clean = clean.replace(/^\[(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+UTC\]\s*/i, '');
  return clean.trim();
}
