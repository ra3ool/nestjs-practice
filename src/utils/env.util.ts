export function getEnv(
  name: string,
  defaultValue: string | undefined = '',
): string | undefined {
  const value = process.env[name];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value;
}
