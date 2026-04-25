export type PartnerMember = {
  id: string;
  email: string;
  name?: string;
  role: "owner" | "finance" | "support" | "staff";
  permissions?: string[];
  permissionsJson?: string;
  status: string;
};

export type PartnerMemberInput = {
  email: string;
  name?: string;
  role: PartnerMember["role"];
  permissions?: string[];
  status?: string;
};
