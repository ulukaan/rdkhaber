/** CI ve yerel kurulumda DATABASE_URL yoksa tablo script'lerini atlar. */
export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function skipMessage(scriptName) {
  console.log(`${scriptName}: DATABASE_URL yok, atlanıyor.`);
}
