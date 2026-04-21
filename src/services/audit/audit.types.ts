export type PartnerAuditLog = {
  id: string;
  actorEmail?: string;
  action: string;
  entity?: string;
  entityId?: string;
  detail?: string;
  createdAt: string;
};
