import { fetchFromKv } from '@/common/kv';

export const getFlags = async (clientId: string, identity: string | null) => {
  const globalFlags = await fetchFromKv(`${clientId}:flags`, []);
  if (!identity) return globalFlags;

  const identityFlags = await fetchFromKv(`${clientId}:flags:${identity}`, []);
  return globalFlags.map((flag) => {
    const identityFlag = identityFlags.find((f) => f.id === flag.id);
    return identityFlag || flag;
  });
};
