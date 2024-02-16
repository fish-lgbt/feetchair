export type Auth = {
  hashedSecret: string;
};

export type Flag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

export type Flags = Flag[];

export type RateLimit = {
  /**
   * Number of requests allowed
   */
  limit: number;
  /**
   * Number of requests remaining
   */
  remaining: number;
  /**
   * Unix timestamp
   */
  reset: string;
};

export type AccountType = 'free' | 'premium';

export type ClientData = {
  rateLimit: RateLimit;
  accountType: AccountType;
};

export type Keys = {
  auth: Auth;
  flags: Flags;
  'client-data': ClientData;
};

export const fetchFromKv = async <K extends keyof Keys>(key: `${string}:${K}`, defaultValue?: Keys[K]): Promise<Keys[K]> => {
  const value = await process.env.feetchair.get(key);
  if (value) return JSON.parse(value);
  if (!defaultValue) throw new Error(`Key ${key} not found`);
  await process.env.feetchair.put(key, JSON.stringify(defaultValue));
  return defaultValue;
};

export const putInKv = async <K extends keyof Keys>(key: `${string}:${K}`, value: Keys[K]) => {
  await process.env.feetchair.put(key, JSON.stringify(value));
};
