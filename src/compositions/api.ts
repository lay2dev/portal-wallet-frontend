import { Notify, Cookies, LocalStorage } from 'quasar';
import axios from 'axios';
import { useConfig } from './config';
import PWCore, { Amount, AmountUnit } from '@lay2/pw-core';
import { SwapTX, SwapTxStatus, SwapConfig } from './swap';
import * as jwt from 'jsonwebtoken';
import { Contact } from './account';

const apiGet = async (
  url: string,
  params?: Record<string, string | undefined>,
  authorization?: boolean
) => get(useConfig().api_base + url, params, authorization);

const apiPost = async (
  url: string,
  params: Record<string, unknown>,
  authorization?: boolean
) => post(useConfig().api_base + url, params, authorization);

export function useApi() {
  return {
    login: async (address: string, timestamp: number, signature: string) => {
      const res = await apiPost('/auth/login', {
        address,
        timestamp,
        signature
      });
      if (res?.status === 201) {
        const { accessToken, refreshToken } = res.data as Record<
          string,
          string
        >;
        return { accessToken, refreshToken };
      } else {
        throw new Error('Authorization failed!');
      }
    },

    addNote: async (txHash: string, remark: string) => {
      const res = await apiPost('/user/txremarks', { txHash, remark }, true);
      if (res?.status !== 201) {
        throw new Error(`Add note failed: ${txHash}, ${remark}`);
      }
    },

    addContact: async (contact: Contact) => {
      const res = await apiPost('/user/contacts', { ...contact }, true);
      if (res?.status !== 201) {
        throw new Error(`Add contact failed: ${JSON.stringify(contact)}`);
      }
    },

    loadContacts: async (): Promise<Contact[]> => {
      const res = await apiGet('/user/contacts', undefined, true);
      const contacts: Contact[] = [];

      if (res?.status === 200) {
        for (const c of res.data as Contact[]) {
          contacts.push(c);
        }
      }

      return contacts;
    },

    loadTxRecords: async (
      lockHash: string,
      lastHash: string | undefined,
      size = 10,
      direction = 'all'
    ) =>
      ((
        await apiGet(
          '/cell/txList',
          {
            lockHash,
            lastHash,
            size: `${size}`,
            direction
          },
          true
        )
      )?.data as Record<string, string | number>[]) || [],

    loadDao: async (lockHash: string) => {
      const dao = (await apiGet('/dao/stats', { lockHash }))?.data as {
        global: unknown;
        user: { locked: string; yesterday: string; yieldCumulative: string };
      };

      const locked = new Amount(dao.user.locked, AmountUnit.shannon);
      const yesterday = new Amount(dao.user.yesterday, AmountUnit.shannon);
      const cumulative = new Amount(
        dao.user.yieldCumulative,
        AmountUnit.shannon
      );

      return { locked, yesterday, cumulative };
    },

    loadSwapConfig: async () => {
      return (await apiGet('/swap/config'))?.data as SwapConfig;
    },

    loadSwapRates: async () => {
      const rates = (await apiGet('/swap/tokenRate'))?.data as {
        symbol: string;
        price: string;
      }[];
      return rates;
    },

    loadSwapTxs: async (address: string, size: number, lastId?: number) => {
      let params: Record<string, string> = { address, size: size.toString() };
      !!lastId && (params = { ...params, lastId: lastId.toString() });
      const res = (await apiGet('/swap/transactions', params))?.data as Record<
        string,
        { [key: string]: string | number }
      >[];
      const txs: SwapTX[] = [];

      if (res) {
        for (const tx of res) {
          txs.push(
            new SwapTX(
              (tx.id as unknown) as number,
              tx.from.amount as string,
              tx.from.decimal as number,
              tx.from.hash as string,
              tx.from.symbol as string,
              tx.to.amount as string,
              tx.to.decimal as number,
              tx.to.hash as string,
              tx.to.symbol as string,
              (tx.time as unknown) as number,
              (tx.status as unknown) as SwapTxStatus
            )
          );
        }
      }

      return txs;
    },

    submitPendingSwap: async (
      txhash: string,
      ckbAmount: string,
      tokenSymbol: string,
      tokenAmount: string,
      from: string
    ) => {
      await apiPost('/swap/submitPendingSwap', {
        txhash,
        ckbAmount,
        tokenSymbol,
        tokenAmount,
        from
      });
    }
  };
}

export const checkAuthorization = async (
  address: string,
  bypass = false
): Promise<string | undefined> => {
  const AT = Cookies.get('AT+' + address);
  if (!!AT) {
    console.log('[api] AT: ', AT);
    const { exp } = jwt.decode(AT) as Record<string, number>;
    if (new Date().getTime() < exp * 1000 || bypass) {
      return AT;
    } else {
      const RT = LocalStorage.getItem('RT+' + address);
      console.log('[api] RT: ', RT);
      if (!!RT) {
        try {
          const { accessToken, refreshToken } = (
            await apiGet(
              '/auth/refreshToken',
              { refreshToken: RT.toString() },
              true
            )
          )?.data as Record<string, string>;
          Cookies.set('AT+' + address, accessToken);
          LocalStorage.set('RT+' + address, refreshToken);
          return accessToken;
        } catch (e) {}
      }
    }
  }
};

export const get = async (
  url: string,
  params?: Record<string, string | undefined>,
  authorization?: boolean
) => {
  let config = undefined;
  if (authorization) {
    const AT = await checkAuthorization(
      PWCore.provider.address.addressString,
      url.endsWith('refreshToken')
    );
    config = {
      headers: { Authorization: `Bearer ${AT || ''}` }
    };
  }

  url += '?';
  for (const p in params) {
    if (params[p] !== undefined) {
      url += `${p}=${params[p] as string}&`;
    }
  }
  let ret = null;
  console.log('[apiGet] url: ', url);
  try {
    ret = await axios.get(url, config);
  } catch (e) {
    // GTM.logEvent({
    //   category: 'exceptions',
    //   action: `Error: ${e.toString()} | Params: ${JSON.stringify(params)}`,
    //   label: '[API] - ' + url.split('/').pop()
    // })
    Notify.create({
      message: `[API] - ${(e as Error).toString()}`,
      position: 'top',
      timeout: 2000,
      color: 'negative'
    });
  }

  return ret;
};

const post = async (
  url: string,
  params: Record<string, unknown>,
  authorization?: boolean
) => {
  let config = undefined;
  if (authorization) {
    const AT = await checkAuthorization(
      PWCore.provider.address.addressString,
      url.endsWith('refreshToken')
    );
    config = {
      headers: { Authorization: `Bearer ${AT || ''}` }
    };
  }

  console.log('[apiPost]', url, JSON.stringify(params));

  let ret = null;
  try {
    ret = await axios.post(url, params, config);
  } catch (e) {
    // GTM.logEvent({
    //   category: 'exceptions',
    //   action: `Error: ${e.toString()} | Params: ${JSON.stringify(params)}`,
    //   label: '[API] - ' + url.split('/').pop()
    // })
    Notify.create({
      message: `[API] - ${(e as Error).message} Params: ${JSON.stringify(
        params
      )}`,
      position: 'top',
      timeout: 2000,
      color: 'negative'
    });
  }

  return ret;
};
