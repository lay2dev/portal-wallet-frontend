// This is just an example,
// so you can safely delete all default props below

const address = 'Address';
const amount = 'Amount';
const balance = 'Balance';
const boughtAt = 'Bought At';
const cancel = 'Cancel';
const close = 'Close';
const confirm = 'Confirm';
const contacts = 'Contacts';
const currency = 'Currency';
const dao = 'Nervos DAO';
const empty = 'No Records';
const fee = 'Fee';
const from = 'From';
const hash = 'Hash';
const language = 'Language';
const loading = 'Loading';
const login = 'Login';
const note = 'Note';
const ok = 'OK';
const rate = 'Fee Rate';
const send = 'Send';
const sent = 'Transaction Sent';
const settings = 'Settings';
const success = 'Success';
const to = 'To';
const validBefore = 'Expires';

export default {
  common: {
    copied: 'Copied to Clipboard'
  },
  index: {
    label: {
      balance,
      language,
      settings
    },
    btn: {
      send,
      contacts,
      language,
      currency,
      support: 'Support',
      aboutus: 'About Us',
      receive: 'Receive',
      swap: 'Swap',
      scan: 'Scan QR',
      settings
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
      save: 'Save',
      delete: 'Delete'
    },
    msg: {
      added: 'Contact Updated',
      deleted: 'Contact Deleted',
      empty
    }
  },
  editContact: {
    title: 'Edit Contact',
    label: {
      confirm
    },
    msg: {
      confirmDelete: 'Do you want to delete this contact ?'
    }
  },
  send: {
    title: send,
    label: {
      address,
      amount,
      balance,
      caution: 'Caution',
      all: 'All',
      in: 'In',
      out: 'Out',
      fee,
      note,
      addNote: 'Add Note'
    },
    btn: {
      send,
      sendAll: 'Send All CKB',
      batch: 'Batch Transaction',
      rate,
      ok,
      cancel
    },
    msg: {
      address: 'Address: CKB / ETH / ENS',
      clear:
        "The remaining balance is too small (less than 61 CKB). Transaction won't succeed. Do you want to send ALL you CKB out?",
      // sendAll: 'Do you want to send ALL you CKB out?',
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
      send
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
      height: 'Block'
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
      confirm
    }
  },
  swap: {
    title: 'Swap for CKB',
    btn: {
      swap: 'Swap'
    },
    label: {
      balance,
      loading,
      sendAmount: 'Pay Amount',
      receiveAmount: 'Receive Amount',
      hash,
      rate,
      range: 'Amount Range'
    }
  },
  receiveCard: {
    label: {
      native: 'Portal Wallet',
      portal: 'Wallets / Exchanges',
      ckb: 'Neuron',
      address
    },
    msg: {
      where: 'From where?',
      default:
        'Current ETH address. Others can send CKB to this address with Portal Wallet.',
      ckb: 'The CKB full address corresponding to your ETH address.',
      portal:
        'A Transit address. When you need to transfer CKB from exchanges or CKB wallets with no full address support, please use this address.'
    }
  },
  daoCard: {
    label: {
      dao,
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
      paid: 'Paid',
      used: 'Used',
      service: 'Service',
      refunded: 'Refunded'
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
