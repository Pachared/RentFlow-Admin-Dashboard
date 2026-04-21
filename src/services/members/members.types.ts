export type PartnerMember = {
  id: string;
  email: string;
  name?: string;
  role: "owner" | "finance" | "staff";
  status: string;
};
