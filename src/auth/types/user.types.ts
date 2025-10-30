export interface LinkedInProfile {
  id: string;
  linkedinId: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  localizedFirstName: string | null;
  localizedLastName: string | null;
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
