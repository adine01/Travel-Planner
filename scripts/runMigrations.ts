import { runMigrations } from '@/db/migration'

async function main() {
  try {
    await runMigrations()
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Error running migrations:', error)
  } finally {
    process.exit()
  }
}

main()

