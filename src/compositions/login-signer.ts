/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Signer, Keccak256Hasher } from '@lay2/pw-core';

export class LoginSigner extends Signer {
  constructor(public readonly from: string) {
    super(new Keccak256Hasher());
  }

  protected signMessages(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  signLogin(timestamp: number, typedData = true): Promise<string> {
    if (typedData) {
      return new Promise((resolve, reject) => {
        const typedData = JSON.stringify(loginTypedData(this.from, timestamp));
        const params = [this.from, typedData];
        const method = 'eth_signTypedData_v4';
        window.web3.currentProvider.sendAsync(
          { method, params, from: this.from },
          function(err: Error, result: Record<string, string>) {
            err && reject(err);
            resolve(result.result);
          }
        );
      });
    }

    return new Promise((resolve, reject) => {
      const personalData = loginPersonalData(this.from, timestamp);
      const params = [personalData, this.from];
      const method = 'personal_sign';
      window.web3.currentProvider.sendAsync(
        { method, params, from: this.from },
        function(err: Error, result: Record<string, string>) {
          err && reject(err);
          resolve(result.result);
        }
      );
    });
  }
}

const loginPersonalData = (address: string, timestamp: number) => {
  const hasher = new Keccak256Hasher();
  hasher.update(address);
  hasher.update(timestamp.toString());
  return hasher.digest().serializeJson();
};

const loginTypedData = (address: string, timestamp: number) => {
  return {
    domain: {
      chainId: 1,
      name: 'Portal Wallet - Login',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1'
    },
    message: {
      address,
      timestamp
    },
    primaryType: 'LoginRequest',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      LoginRequest: [
        { name: 'address', type: 'address' },
        { name: 'timestamp', type: 'uint256' }
      ]
    }
  };
};
