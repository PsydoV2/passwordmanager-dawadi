/** Alle Seiten der App an einer Stelle (mit abschließendem Schrägstrich wegen `trailingSlash`). */
export const ROUTES = {
  landing: "/",
  vault: "/app/",
  setup: "/app/setup/",
  unlock: "/app/unlock/",
  generator: "/app/generator/",
  report: "/app/report/",
  settings: "/app/settings/",
} as const;
