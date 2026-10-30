const TIME_ZONE = "Africa/Accra";
const LOCALE = "en-GH";

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeZone: TIME_ZONE });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});
const moneyFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const amountFormatter = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function toDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: Date | string | null | undefined) {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : null;
}

export function formatDateTime(value: Date | string | null | undefined) {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : null;
}

export function formatMoney(value: number) {
  return `GHS ${moneyFormatter.format(Math.round(value))}`;
}

export function formatAmount(value: number) {
  return amountFormatter.format(value);
}

export function formatWaitingAge(value: Date | string, now = Date.now()) {
  const date = toDate(value);
  if (!date) return "date unavailable";
  const days = Math.max(0, Math.floor((now - date.getTime()) / 86_400_000));
  if (days === 0) return "received today";
  return `${days} day${days === 1 ? "" : "s"} waiting`;
}
