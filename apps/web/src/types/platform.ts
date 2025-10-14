/**
 * @file platform.ts
 * @description Mini README: Centralises TypeScript types for authentication, invitations, organisations, and
 * collaborative content across the Fusion Futures platform. The file groups related type aliases and interfaces so
 * developers can reason about account flows and UI data at a glance. Structure: role enumerations, auth-centric
 * models, organisation models, and social content records.
 */

export type UserRole = 'superadmin' | 'admin' | 'user';

export type AccountStatus = 'active' | 'invited' | 'suspended';

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export type OrganisationType = 'institution' | 'employer' | 'hub';

export type OrganisationStatus = 'pending' | 'approved' | 'rejected';

export interface PlatformProfile {
  name: string;
  title: string;
  avatar: string;
  location: string;
  bio: string;
  linkedin?: string;
}

export interface PlatformUser {
  id: string;
  role: UserRole;
  profile: PlatformProfile;
  organisation?: {
    name: string;
    type: OrganisationType;
    colour: string;
  };
}

export interface PlatformAccount extends PlatformUser {
  email: string;
  status: AccountStatus;
  passwordHash: string;
  organisationAdmin?: boolean;
  invitedBy?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface OrganisationRecord {
  id: string;
  name: string;
  type: OrganisationType;
  status: OrganisationStatus;
  brandColour: string;
  createdAt: string;
  createdBy: string;
  admins: string[];
}

export interface InvitationRecord {
  code: string;
  email: string;
  role: UserRole;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  status: InvitationStatus;
  organisationId?: string;
  organisationNameSuggestion?: string;
  message?: string;
}

export interface SessionRecord {
  userId: string;
  issuedAt: string;
}

export interface ImpactPost {
  id: string;
  authorId: string;
  content: string;
  link?: string;
  createdAt: string;
  stats: {
    likes: number;
    replies: number;
    impact: string;
  };
  tags: string[];
}

export interface EventRecord {
  id: string;
  ownerId: string;
  title: string;
  summary: string;
  location: string;
  startDate: string;
  endDate: string;
  mode: 'in-person' | 'online' | 'hybrid';
  visibility: 'public' | 'private';
  banner: string;
  attendees: string[];
  contributors: string[];
}

export interface ConnectionInsight {
  id: string;
  metric: string;
  value: number;
  change: number;
  description: string;
}
