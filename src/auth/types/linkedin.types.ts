export interface LinkedInProfile {
  id: string;
  linkedinId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
  userId: string;
  user: LinkedInProfile;
  createdAt: Date;
  updatedAt: Date;
}
