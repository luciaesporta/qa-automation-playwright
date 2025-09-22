import fs from 'fs/promises';

export async function getUserEmailFromFile(path: string): Promise<string> {
  const data = JSON.parse(await fs.readFile(path, 'utf-8'));
  return data.email;
}

export async function getJwtFromStorage(path: string): Promise<string> {
  const data = JSON.parse(await fs.readFile(path, 'utf-8'));
  return data.origins[0]?.localStorage.find((item: any) => item.name === 'jwt')?.value;
}
