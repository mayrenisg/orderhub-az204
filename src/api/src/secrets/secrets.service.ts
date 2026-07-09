import { Injectable } from '@nestjs/common';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
@Injectable()
export class SecretsService {
  private client?: SecretClient;
  private cache = new Map<string, string>();
  constructor() {
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL;
    if (vaultUrl) {
      const credential = new DefaultAzureCredential();
      this.client = new SecretClient(vaultUrl, credential);
    }
  }
  async getSecret(secretName: string, envFallbackName?: string): Promise<string> {
    if (this.cache.has(secretName)) {
      return this.cache.get(secretName)!;
    }
    if (this.client) {
      const secret = await this.client.getSecret(secretName);
      const value = secret.value;
      if (!value) {
        throw new Error(`Secret ${secretName} has no value`);
      }
      this.cache.set(secretName, value);
      return value;
    }
    const fallback = envFallbackName ? process.env[envFallbackName] : undefined;
    if (!fallback) {
      throw new Error(`Missing secret ${secretName} and fallback ${envFallbackName}`);
    }
    this.cache.set(secretName, fallback);
    return fallback;
  }
}