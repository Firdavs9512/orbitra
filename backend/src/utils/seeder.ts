import type { DatabaseProvider } from '../providers/interface'
import { generateId } from './id'

export interface SeederConfig {
  adminEmail: string
  adminPassword: string
  adminName: string
}

export async function seedDefaultAdminUser(
  db: DatabaseProvider,
  config: SeederConfig
): Promise<void> {
  try {
    // Check if any users exist
    const userCount = await db.getUserCount()

    if (userCount > 0) {
      // Users already exist, skip seeding
      return
    }

    // No users exist, create default admin user
    const userId = generateId()
    const passwordHash = await Bun.password.hash(config.adminPassword, {
      algorithm: 'bcrypt',
      cost: 12,
    })

    await db.createUser({
      id: userId,
      email: config.adminEmail,
      fullName: config.adminName,
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    })

    // Log success message with credentials
    console.log(`
  ╔══════════════════════════════════════════╗
  ║      DEFAULT ADMIN USER CREATED          ║
  ╠══════════════════════════════════════════╣
  ║  Email:    ${config.adminEmail.padEnd(28)}║
  ║  Password: ${config.adminPassword.padEnd(28)}║
  ╠══════════════════════════════════════════╣
  ║  ⚠️  PLEASE CHANGE THIS PASSWORD!        ║
  ╚══════════════════════════════════════════╝
`)
  } catch (error) {
    console.error('Failed to seed default admin user:', error)
    throw error
  }
}
