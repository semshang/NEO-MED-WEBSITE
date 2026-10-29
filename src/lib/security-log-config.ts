export function validateSecurityLogConfiguration(): void {
  const configuredSecret = process.env.NEXTAUTH_SECRET?.trim();
  if (!configuredSecret && process.env.NODE_ENV === "production") {
    throw new Error("NEXTAUTH_SECRET is required in production for security-log pseudonymization.");
  }
}

export function getSecurityLogKey(): string {
  validateSecurityLogConfiguration();
  const configuredSecret = process.env.NEXTAUTH_SECRET?.trim();
  return configuredSecret ?? "development-only-security-log-key";
}

validateSecurityLogConfiguration();
