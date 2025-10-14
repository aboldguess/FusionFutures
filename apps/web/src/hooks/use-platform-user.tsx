/**
 * @file use-platform-user.tsx
 * @description Mini README: Rich authentication and authorisation provider that powers login, invitation redemption, role
 * impersonation, and organisation approvals. The module exposes a React context with helper hooks used throughout the UI.
 * Structure: seed imports, helper utilities (hashing, code generation), React context, provider component, and consumer hook.
 */

'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { seedAccounts } from '@/data/accounts';
import { seedInvitations } from '@/data/invitations';
import { seedOrganisations } from '@/data/organisations';
import { logger } from '@/lib/logger';
import { hashSecret } from '@/lib/security';
import type {
  InvitationRecord,
  InvitationStatus,
  OrganisationRecord,
  OrganisationStatus,
  OrganisationType,
  PlatformAccount,
  SessionRecord,
  UserRole
} from '@/types/platform';

const SESSION_STORAGE_KEY = 'fusion-futures::session-v1';

interface AuthResult {
  success: boolean;
  message?: string;
  account?: PlatformAccount;
}

interface InvitationValidation {
  invitation: InvitationRecord | null;
  status: InvitationStatus | 'not_found';
}

interface IssueInvitationPayload {
  email: string;
  role: UserRole;
  organisationId?: string;
  message?: string;
  expiresInDays?: number;
}

interface CompleteInvitationPayload {
  fullName: string;
  title: string;
  location: string;
  bio: string;
  password: string;
  organisationStrategy: 'existing' | 'create';
  organisationId?: string;
  organisationName?: string;
  organisationType?: OrganisationType;
  organisationColour?: string;
}

interface PlatformUserContextValue {
  accounts: PlatformAccount[];
  invitations: InvitationRecord[];
  organisations: OrganisationRecord[];
  activeUser: PlatformAccount | null;
  availableUsers: PlatformAccount[];
  canImpersonate: boolean;
  bootstrapped: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  issueInvitation: (payload: IssueInvitationPayload) => Promise<InvitationRecord>;
  revokeInvitation: (code: string) => void;
  validateInvitation: (code: string) => InvitationValidation;
  completeInvitation: (code: string, payload: CompleteInvitationPayload) => Promise<AuthResult>;
  approveOrganisation: (organisationId: string) => void;
}

const PlatformUserContext = createContext<PlatformUserContextValue | undefined>(undefined);

const deriveInvitationStatus = (invitation: InvitationRecord): InvitationStatus => {
  if (invitation.status !== 'pending') {
    return invitation.status;
  }

  const now = Date.now();
  const expires = new Date(invitation.expiresAt).getTime();

  return now > expires ? 'expired' : invitation.status;
};

const organisationStatusPalette: Record<OrganisationStatus, OrganisationStatus> = {
  approved: 'approved',
  pending: 'pending',
  rejected: 'rejected'
};

function generateInvitationCode(role: UserRole) {
  const buffer = new Uint32Array(2);

  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(buffer);
  } else {
    for (let index = 0; index < buffer.length; index += 1) {
      buffer[index] = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    }
  }

  const segment = Array.from(buffer)
    .map((value) => value.toString(16).slice(-4))
    .join('')
    .toUpperCase();

  return `FF-${role.toUpperCase()}-${segment}`;
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function normaliseColour(input?: string) {
  if (!input) {
    return '#38bdf8';
  }

  return input.startsWith('#') ? input : `#${input}`;
}

export function PlatformUserProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<PlatformAccount[]>(seedAccounts);
  const [invitations, setInvitations] = useState<InvitationRecord[]>(seedInvitations);
  const [organisations, setOrganisations] = useState<OrganisationRecord[]>(seedOrganisations);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  // Restore existing session for a smoother DX between refreshes.
  useEffect(() => {
    if (typeof window === 'undefined') {
      setBootstrapped(true);
      return;
    }

    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SessionRecord;
        const existingAccount = seedAccounts.find((account) => account.id === parsed.userId);

        if (existingAccount) {
          setSession(parsed);
          logger.info('Restored persisted session', { accountId: parsed.userId });
        } else {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (error) {
        logger.error('Failed to parse stored session, clearing entry.', error);
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    setBootstrapped(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session]);

  const activeUser = useMemo(() => {
    if (!session) {
      return null;
    }

    return accounts.find((account) => account.id === session.userId) ?? null;
  }, [accounts, session]);

  const availableUsers = useMemo(
    () => accounts.filter((account) => account.status === 'active'),
    [accounts]
  );

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const hashed = await hashSecret(password);
    const lookupEmail = normaliseEmail(email);
    const account = accounts.find((candidate) => normaliseEmail(candidate.email) === lookupEmail);

    if (!account) {
      logger.warn('Login attempt for unknown email', { email: lookupEmail });
      return { success: false, message: 'No account found for that email.' };
    }

    if (account.status !== 'active') {
      logger.warn('Login blocked because account is not active', { email: lookupEmail, status: account.status });
      return { success: false, message: 'Your account is not active yet. Contact an administrator.' };
    }

    if (account.passwordHash !== hashed) {
      logger.warn('Incorrect password attempt', { email: lookupEmail });
      return { success: false, message: 'Invalid credentials. Check your password and try again.' };
    }

    const nextSession: SessionRecord = {
      userId: account.id,
      issuedAt: new Date().toISOString()
    };

    setSession(nextSession);
    setAccounts((previous) =>
      previous.map((candidate) =>
        candidate.id === account.id
          ? {
              ...candidate,
              lastLogin: nextSession.issuedAt
            }
          : candidate
      )
    );

    logger.info('Successful login', { accountId: account.id, role: account.role });

    return { success: true, account: { ...account, lastLogin: nextSession.issuedAt } };
  }, [accounts]);

  const logout = useCallback(() => {
    if (!activeUser) {
      return;
    }

    logger.info('Signing out current session', { accountId: activeUser.id });
    setSession(null);
  }, [activeUser]);

  const canImpersonate = activeUser?.role === 'superadmin';

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!canImpersonate) {
        logger.warn('Role switch denied – active user is not a superadmin.', { requestedRole: role });
        return;
      }

      const match = availableUsers.find((account) => account.role === role);

      if (!match) {
        logger.warn('Role switch requested for role with no available account', { requestedRole: role });
        return;
      }

      setSession({
        userId: match.id,
        issuedAt: new Date().toISOString()
      });

      logger.info('Superadmin impersonated another role', { targetAccountId: match.id, role });
    },
    [availableUsers, canImpersonate]
  );

  const validateInvitation = useCallback(
    (code: string): InvitationValidation => {
      const normalised = code.trim();
      const invitation = invitations.find((record) => record.code === normalised) ?? null;

      if (!invitation) {
        return { invitation: null, status: 'not_found' };
      }

      const status = deriveInvitationStatus(invitation);

      if (status !== invitation.status) {
        setInvitations((previous) =>
          previous.map((record) =>
            record.code === invitation.code
              ? {
                  ...record,
                  status
                }
              : record
          )
        );
      }

      return { invitation: { ...invitation, status }, status };
    },
    [invitations]
  );

  const issueInvitation = useCallback(
    async (payload: IssueInvitationPayload) => {
      if (!activeUser || (activeUser.role !== 'admin' && activeUser.role !== 'superadmin')) {
        throw new Error('Only administrators can issue invitations.');
      }

      const code = generateInvitationCode(payload.role);
      const issuedAt = new Date().toISOString();
      const expiresAt = new Date(
        Date.now() + (payload.expiresInDays ?? 14) * 24 * 60 * 60 * 1000
      ).toISOString();

      const invitation: InvitationRecord = {
        code,
        email: normaliseEmail(payload.email),
        role: payload.role,
        issuedBy: activeUser.id,
        issuedAt,
        expiresAt,
        status: 'pending',
        organisationId: payload.organisationId,
        message: payload.message
      };

      setInvitations((previous) => [...previous, invitation]);
      logger.info('Issued new invitation', { code, email: invitation.email, role: invitation.role });

      return invitation;
    },
    [activeUser]
  );

  const revokeInvitation = useCallback((code: string) => {
    setInvitations((previous) =>
      previous.map((record) =>
        record.code === code
          ? {
              ...record,
              status: record.status === 'accepted' ? record.status : 'revoked'
            }
          : record
      )
    );

    logger.info('Invitation revoked', { code });
  }, []);

  const approveOrganisation = useCallback(
    (organisationId: string) => {
      if (!activeUser || (activeUser.role !== 'admin' && activeUser.role !== 'superadmin')) {
        logger.warn('Organisation approval denied', { organisationId });
        return;
      }

      setOrganisations((previous) =>
        previous.map((organisation) =>
          organisation.id === organisationId
            ? {
                ...organisation,
                status: organisationStatusPalette.approved
              }
            : organisation
        )
      );

      logger.info('Organisation approved', { organisationId, approver: activeUser.id });
    },
    [activeUser]
  );

  const completeInvitation = useCallback(
    async (code: string, payload: CompleteInvitationPayload): Promise<AuthResult> => {
      const { invitation, status } = validateInvitation(code);

      if (!invitation || status !== 'pending') {
        logger.warn('Invitation redemption failed', { code, status });
        return {
          success: false,
          message:
            status === 'expired'
              ? 'This invitation has expired. Ask the administrator to send a new one.'
              : status === 'revoked'
              ? 'This invitation is no longer valid.'
              : 'We could not find a valid invitation for this code.'
        };
      }

      const passwordHash = await hashSecret(payload.password);
      const newId = `account-${invitation.role}-${Date.now()}`;
      const issuedAt = new Date().toISOString();

      let organisationId = invitation.organisationId;
      let organisationMeta = invitation.organisationId
        ? organisations.find((organisation) => organisation.id === invitation.organisationId) ?? null
        : null;

      if (!organisationMeta && payload.organisationStrategy === 'existing' && payload.organisationId) {
        organisationId = payload.organisationId;
        organisationMeta = organisations.find((organisation) => organisation.id === organisationId) ?? null;
      }

      if (!organisationMeta && payload.organisationStrategy === 'create' && payload.organisationName) {
        organisationId = `org-${Date.now()}`;
        organisationMeta = {
          id: organisationId,
          name: payload.organisationName,
          type: payload.organisationType ?? 'employer',
          status: 'pending',
          brandColour: normaliseColour(payload.organisationColour),
          createdAt: issuedAt,
          createdBy: newId,
          admins: [newId]
        };

        setOrganisations((previous) => [...previous, organisationMeta!]);
        logger.info('New organisation submitted for approval', {
          organisationId,
          creator: newId,
          name: organisationMeta.name
        });
      }

      const profileName = payload.fullName.trim();

      const account: PlatformAccount = {
        id: newId,
        email: invitation.email,
        role: invitation.role,
        status: 'active',
        passwordHash,
        createdAt: issuedAt,
        organisationAdmin: payload.organisationStrategy === 'create',
        invitedBy: invitation.issuedBy,
        profile: {
          name: profileName,
          title: payload.title.trim(),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileName)}`,
          location: payload.location.trim(),
          bio: payload.bio.trim()
        },
        organisation: organisationMeta
          ? {
              name: organisationMeta.name,
              type: organisationMeta.type,
              colour: organisationMeta.brandColour
            }
          : undefined
      };

      setAccounts((previous) => [...previous, account]);
      setInvitations((previous) =>
        previous.map((record) =>
          record.code === invitation.code
            ? {
                ...record,
                status: 'accepted'
              }
            : record
        )
      );
      setSession({ userId: newId, issuedAt });

      logger.info('Invitation redeemed successfully', { code, accountId: newId });

      return { success: true, account };
    },
    [organisations, validateInvitation]
  );

  const value = useMemo<PlatformUserContextValue>(
    () => ({
      accounts,
      invitations,
      organisations,
      activeUser,
      availableUsers,
      canImpersonate,
      bootstrapped,
      login,
      logout,
      switchRole,
      issueInvitation,
      revokeInvitation,
      validateInvitation,
      completeInvitation,
      approveOrganisation
    }),
    [
      accounts,
      invitations,
      organisations,
      activeUser,
      availableUsers,
      canImpersonate,
      bootstrapped,
      login,
      logout,
      switchRole,
      issueInvitation,
      revokeInvitation,
      validateInvitation,
      completeInvitation,
      approveOrganisation
    ]
  );

  return <PlatformUserContext.Provider value={value}>{children}</PlatformUserContext.Provider>;
}

export function usePlatformUser() {
  const context = useContext(PlatformUserContext);

  if (!context) {
    throw new Error('usePlatformUser must be used within a PlatformUserProvider');
  }

  return context;
}
