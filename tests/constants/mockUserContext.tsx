import { UserContext } from '@/components/providers/user'
import { defaultCutOffTime, defaultLeadTimeDays, defaultMinimumSpendPence } from "@/library/constants";
import type { BrowserSafeCompositeUser, UserContextType } from "@/types";
import type { ReactNode } from "react";
import { vi } from "vitest";

export function MockUserProvider({ children, mockValues }: { children: ReactNode; mockValues: UserContextType }) {
    return <UserContext.Provider value={mockValues}>{children}</UserContext.Provider>
}

export const baseUser: BrowserSafeCompositeUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@gmail.com',
    businessName: 'Test Business',
    slug: 'test-business',
    roles: 'merchant',
    emailConfirmed: false,
    cutOffTime: defaultCutOffTime,
    leadTimeDays: defaultLeadTimeDays,
    minimumSpendPence: defaultMinimumSpendPence,
}

export const baseContext: UserContextType = {
    user: baseUser,
    setUser: vi.fn(),
    inventory: null,
    setInventory: vi.fn(),
    confirmedMerchants: null,
    setConfirmedMerchants: vi.fn(),
    confirmedCustomers: null,
    setConfirmedCustomers: vi.fn(),
    invitationsReceived: null,
    setInvitationsReceived: vi.fn(),
    invitationsSent: null,
    setInvitationsSent: vi.fn(),
    ordersMade: null,
    setOrdersMade: vi.fn(),
    ordersReceived: null,
    setOrdersReceived: vi.fn(),
    vat: 20,
}

