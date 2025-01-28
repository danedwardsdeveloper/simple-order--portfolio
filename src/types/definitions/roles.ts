export type Roles = 'merchant' | 'customer' | 'both'
export type RoleModes = Extract<Roles, 'merchant' | 'customer'>
