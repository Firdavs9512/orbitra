export type UserRole = 'admin' | 'viewer'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: User
}

export interface UserManagement {
  id: string
  email: string
  fullName: string
  role: UserRole
  createdAt: string
}
