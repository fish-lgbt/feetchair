import { fetchFromKv } from './kv';
import { hashSecret } from './hash-secret';

export const validateClient = async (clientId: string, clientSecret: string) => {
  const { hashedSecret } = await fetchFromKv(`${clientId}:auth`);
  return hashedSecret === (await hashSecret(clientSecret));
};
