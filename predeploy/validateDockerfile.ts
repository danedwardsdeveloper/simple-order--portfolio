import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import { parse as dotenvParse } from 'dotenv'

const defaultEnvPath = path.join(process.cwd(), '.env')
const defaultDockerPath = path.join(process.cwd(), 'Dockerfile')

interface EnvComparison {
  envFileVars: Set<string>
  dockerfileVars: Set<string>
  missingInEnv: string[]
  missingInDocker: string[]
  nodeEnvWarning?: string
}

interface Config {
  ignoredVars: Set<string>
}

class EnvValidatorError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvValidatorError'
  }
}

class FileReadError extends EnvValidatorError {
  constructor(
    public readonly filePath: string,
    public readonly originalError: Error,
  ) {
    super(`Error reading file ${filePath}: ${originalError.message}`)
    this.name = 'FileReadError'
  }
}

class FileParseError extends EnvValidatorError {
  constructor(
    public readonly filePath: string,
    public readonly originalError: Error,
  ) {
    super(`Error parsing file ${filePath}: ${originalError.message}`)
    this.name = 'FileParseError'
  }
}

class FileNotFoundError extends EnvValidatorError {
  constructor(public readonly filePath: string) {
    super(`File not found: ${filePath}`)
    this.name = 'FileNotFoundError'
  }
}

const defaultConfig: Config = {
  ignoredVars: new Set(['NODE_ENV', 'NODE_VERSION', 'PNPM_VERSION', 'NODE_ENV', 'PORT']),
}

function checkFileExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new FileNotFoundError(filePath)
  }
}

function parseEnvFile(filePath: string, configArg: Config): Set<string> {
  try {
    checkFileExists(filePath)
    const envContent = fs.readFileSync(filePath, 'utf8')

    try {
      const parsed = dotenvParse(envContent)
      return new Set(Object.keys(parsed).filter(key => !configArg.ignoredVars.has(key)))
    } catch (error) {
      throw new FileParseError(filePath, error as Error)
    }
  } catch (error) {
    if (error instanceof EnvValidatorError) {
      throw error
    }
    throw new FileReadError(filePath, error as Error)
  }
}

function parseDockerfile(filePath: string, configArg: Config): { vars: Set<string>; content: string } {
  try {
    checkFileExists(filePath)
    const dockerContent = fs.readFileSync(filePath, 'utf8')

    try {
      const envVars = new Set<string>()

      const patterns = [
        // ENV VAR=value or ENV VAR="value" or ENV VAR='value'
        /^ENV\s+(?:--\w+\s+)?([A-Za-z_][A-Za-z0-9_]*)(?:=["']?(?:[^"']*)?["']?|\s+["']?(?:[^"']*)?["']?|\s|$)/gm,
        // ARG VAR=value or ARG VAR="value" or ARG VAR='value'
        /^ARG\s+(?:--\w+\s+)?([A-Za-z_][A-Za-z0-9_]*)(?:=["']?(?:[^"']*)?["']?|\s+["']?(?:[^"']*)?["']?|\s|$)/gm,
      ]

      for (const pattern of patterns) {
        const matches = dockerContent.matchAll(pattern)
        for (const match of matches) {
          const varName = match[1]
          if (!configArg.ignoredVars.has(varName)) {
            envVars.add(varName)
          }
        }
      }

      return { vars: envVars, content: dockerContent }
    } catch (error) {
      throw new FileParseError(filePath, error as Error)
    }
  } catch (error) {
    if (error instanceof EnvValidatorError) {
      throw error
    }
    throw new FileReadError(filePath, error as Error)
  }
}

function checkNodeEnvProduction(dockerContent: string): string | undefined {
  const nodeEnvPattern = /^ENV\s+(?:--\w+\s+)?NODE_ENV=["']?(\w+)["']?/m
  const match = dockerContent.match(nodeEnvPattern)

  if (!match) {
    return 'NODE_ENV is not set in Dockerfile'
  }

  if (match[1] !== 'production') {
    return `NODE_ENV is set to "${match[1]}" instead of "production"`
  }

  return undefined
}

function compareEnvironments(envPath: string, dockerPath: string, configArg: Config): EnvComparison {
  const envFileVars = parseEnvFile(envPath, configArg)
  const { vars: dockerfileVars, content: dockerContent } = parseDockerfile(dockerPath, configArg)

  const missingInEnv = [...dockerfileVars].filter(v => !envFileVars.has(v))
  const missingInDocker = [...envFileVars].filter(v => !dockerfileVars.has(v))
  const nodeEnvWarning = checkNodeEnvProduction(dockerContent)

  return {
    envFileVars,
    dockerfileVars,
    missingInEnv,
    missingInDocker,
    nodeEnvWarning,
  }
}
function printResults(comparison: EnvComparison, configArg: Config): void {
  console.log('\n=== Environment Variables Comparison ===\n')

  if (comparison.nodeEnvWarning) {
    console.log(chalk.yellow('⚠️  Warning:'), chalk.yellow(comparison.nodeEnvWarning))
    console.log()
  }

  console.log('Ignored variables:', chalk.dim([...configArg.ignoredVars].join(', ')))
  console.log('\nVariables in .env:', chalk.blue(comparison.envFileVars.size))
  console.log('Variables in Dockerfile:', chalk.blue(comparison.dockerfileVars.size))

  if (comparison.missingInDocker.length > 0) {
    console.log('\n❌ Variables in .env but missing in Dockerfile:')
    comparison.missingInDocker.forEach(v => console.log(chalk.red(`  - ${v}`)))
  }

  if (comparison.missingInEnv.length > 0) {
    console.log('\n❌ Variables in Dockerfile but missing in .env:')
    comparison.missingInEnv.forEach(v => console.log(chalk.red(`  - ${v}`)))
  }

  if (comparison.missingInDocker.length === 0 && comparison.missingInEnv.length === 0) {
    console.log('\n' + chalk.green('✅ All environment variables match between files!'))
  }

  console.log('\n=== End of Comparison ===')
}

try {
  const comparison = compareEnvironments(defaultEnvPath, defaultDockerPath, defaultConfig)
  printResults(comparison, defaultConfig)

  if (comparison.missingInDocker.length > 0 || comparison.missingInEnv.length > 0) {
    process.exit(1)
  }
} catch (error) {
  if (error instanceof FileNotFoundError) {
    console.error(chalk.red(`❌ ${error.message}`))
    console.error(chalk.red(`Please ensure ${error.filePath} exists in your project root.`))
  } else if (error instanceof FileParseError) {
    console.error(chalk.red(`❌ ${error.message}`))
    console.error(chalk.red('Please check the file format is correct.'))
  } else if (error instanceof FileReadError) {
    console.error(chalk.red(`❌ ${error.message}`))
    console.error(chalk.red('Please check file permissions and try again.'))
  } else {
    console.error(chalk.red('❌ An unexpected error occurred:'), error)
  }
  process.exit(1)
}
