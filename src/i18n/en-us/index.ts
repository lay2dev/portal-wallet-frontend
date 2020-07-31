// This is just an example,
// so you can safely delete all default props below

const address = 'Address';
const amount = 'Amount';
const balance = 'Balance';
const boughtAt = 'Bought At';
const cancel = 'Cancel';
const close = 'Close';
const ckb = 'CKB';
const dao = 'Nervos DAO';
const empty = 'No Records';
const fee = 'Fee';
const from = 'From';
const hash = 'Hash';
const loading = 'Loading';
const login = 'Login';
const note = 'Note';
const ok = 'OK';
const portal = 'Portal';
const rate = 'Fee Rate';
const send = 'Send';
const sent = 'Transaction Sent';
const success = 'Success';
const to = 'To';
const validBefore = 'Expires';

export default {
  common: {
    copied: 'Copid to Clipboard'
  },
  index: {
    label: {
      balance
    },
    btn: {
      send,
      receive: 'Receive',
      swap: 'Swap',
      scan: 'Scan QR',
      settings: 'Settings'
    }
  },
  contacts: {
    title: 'Contacts',
    label: {
      address,
      name: 'Name',
      description: 'Description'
    },
    btn: {
      save: 'Save'
    },
    msg: {
      added: 'Contact Added',
      empty
    }
  },
  send: {
    title: send,
    label: {
      address,
      amount,
      all: 'All',
      in: 'In',
      out: 'Out',
      fee,
      note,
      addNote: 'Add Note'
    },
    btn: {
      send,
      batch: 'Batch Transaction',
      rate,
      ok,
      cancel,
      contacts: 'From Contacts'
    },
    msg: {
      address: 'Address: CKB / ETH / ENS',
      sent,
      requireAddress: 'Address is required',
      requireAmount: 'Amount is required',
      minAmount: 'minimal amount is 61 CKB',
      wrongEns: 'ENS cannot be resolved',
      wrongAddress: 'Invalid address foramt',
      wrongAmount: 'Invalid amount foramt'
    }
  },
  sendBatch: {
    title: 'Batch Transaction',
    label: {
      sum: 'Sum'
    },
    btn: {
      input: 'Input',
      import: 'Import',
      buildInput: 'Build from input',
      buildImport: 'Import from link',
      clear: 'Clear',
      send: 'Send'
    },
    msg: {
      inputFormat: '0xaaaa...aaaa,100\nckb1bbb...bbb 200\n ',
      inputHint:
        'Separate address (CKB / ETH / ENS) and amount with comma or space, one entry per line.',
      linkFormat:
        'https://docs.google.com/spreadsheets/d/{sheet-id}/edit?usp=sharing\n ',
      linkHint:
        'Google sheets public shared link. Each line of the sheet must have the address (CKB / ETH/ ENS) and amount as the first two columns.',
      sent
    }
  },
  feebar: {
    label: {
      fee,
      rate
    }
  },
  txlist: {
    label: {
      amount,
      fee,
      from,
      to,
      note,
      hash,
      height: 'Height'
    },
    msg: {
      in: 'Received',
      out: 'Sent',
      loading,
      empty,
      login: 'Need Login'
    },
    btn: {
      close,
      check: 'Check in Nervos Explorer',
      loadMore: 'Load More'
    }
  },
  signBoard: {
    label: {
      txDetail: 'Transaction Detail',
      from,
      to,
      fee,
      rate,
      note
    },
    btn: {
      confirm: 'Confirm'
    }
  },
  swap: {
    title: 'Swap for CKB',
    btn: {
      swap: 'Swap'
    },
    label: {
      balance,
      sendAmount: 'Pay Amount',
      receiveAmount: 'Receive Amount',
      hash,
      rate: 'Rate',
      maximum: 'Maximum / TX'
    },
    msg: {
      maxckb: '100,000 CKB'
    }
  },
  receiveCard: {
    label: {
      native: 'Native',
      portal,
      ckb,
      address
    }
  },
  daoCard: {
    label: {
      dao,
      balance,
      deposited: 'Deposited',
      yesterday: 'Yesterday',
      cumulative: 'Cumulative'
    },
    btn: {
      dao
    }
  },
  login: {
    title: 'Authorization',
    btn: {
      login
    },
    msg: {
      hint: 'Login to Continue',
      detail:
        'A signature of your address and timestamp will be requested to prevent unauthorized access for your private information, such as contacts and transaction notes.'
    }
  },
  shop: {
    title: 'Lay2 Shop'
  },

  order: {
    title: 'Place Order',
    btn: {
      pay: 'Pay',
      checkOrders: 'Check Orders',
      cancel
    },
    msg: {
      noSku: 'Can not find product',
      expired: 'Order expired, please reload this page',
      paid: 'Payment submitted, you can go to check the order status'
    },
    label: {
      success,
      rate: 'Current Rate'
    }
  },

  orders: {
    title: 'Orders',
    label: {
      avaliable: 'Avaliable',
      used: 'Used',
      expired: 'Expired',
      service: 'Service'
    },
    msg: {
      empty
    }
  },

  cardItem: {
    label: {
      validBefore,
      boughtAt
    },
    msg: {
      pending: 'Payment Confirming'
    }
  },

  cardInfo: {
    label: {
      validBefore,
      boughtAt
    }
  }
};
