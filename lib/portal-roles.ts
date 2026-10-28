export const portalRoles = ["administrator", "staff", "customer"] as const;
export type PortalRole = (typeof portalRoles)[number];
