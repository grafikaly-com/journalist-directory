export type UserSessionDto = {
  id: bigint;
  is_logged_in: boolean;
  expires_at: Date;
};
