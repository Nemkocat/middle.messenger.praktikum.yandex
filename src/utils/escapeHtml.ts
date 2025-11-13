/**
 * Экранирует HTML символы для защиты от XSS
 * @param text Текст для экранирования
 * @returns Экранированный текст
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

