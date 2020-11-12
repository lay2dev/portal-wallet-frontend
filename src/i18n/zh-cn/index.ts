// This is just an example,
// so you can safely delete all default props below

const address = '地址';
const amount = '金额';
const assets = '资产';
const balance = '余额';
const boughtAt = '购买时间';
const cancel = '取消';
const caution = '注意';
const close = '关闭';
const confirm = '确认';
const contacts = '联系人';
const currency = '货币单位';
const dao = 'Nervos DAO';
const empty = '暂无记录';
const fee = '手续费';
const feeRate = '费率';
const from = '来自';
const hash = '哈希';
const language = '语言';
const loading = '加载中';
const login = '登录';
const note = '备注';
const ok = 'OK';
const rate = '汇率';
const send = '发送';
const sent = '已发送';
const settings = '设置';
const success = '成功';
const to = '去往';
const validBefore = '质保期至';

export default {
  common: {
    copied: '已复制'
  },
  index: {
    label: {
      assets,
      balance,
      caution,
      language,
      loading,
      settings,
      fiatSymbol: '货币单位',
      utilities: '应用'
    },
    btn: {
      send,
      contacts,
      language,
      currency,
      mykey: '退出并使用其他钱包',
      support: '帮助支持',
      aboutus: '关于我们',
      receive: '收款',
      swap: '兑换',
      scan: '扫码',
      settings,
      gotoOfficial: '前往正式版',
      understood: '我已知晓'
    },
    msg: {
      rc:
        '这是 Portal Wallet 的预览版，功能可能不稳定，也可能出现 Bug，请小心使用',
      mykey:
        'MyKey 的地址是一种特殊的以太坊地址，转入的 CKB 无法被再次转出，请立即停止在 MyKey 中使用 Portal Wallet！'
    }
  },
  contacts: {
    title: '联系人',
    label: {
      address,
      name: '姓名',
      description: '描述'
    },
    btn: {
      add: '新增',
      save: '保存',
      delete: '删除'
    },
    msg: {
      added: '联系人已更新',
      deleted: '联系人已删除',
      empty
    }
  },
  editContact: {
    title: '编辑联系人',
    label: {
      confirm
    },
    msg: {
      confirmDelete: '确定删除此联系人吗？'
    }
  },
  send: {
    title: send,
    label: {
      asset: '选择要发送的资产',
      address,
      amount,
      caution,
      balance,
      all: '全部',
      in: '收入',
      out: '转出',
      fee,
      note,
      addNote: '添加备注'
    },
    btn: {
      send,
      sendAll: '发送全部 CKB',
      batch: '批量转账',
      ok,
      cancel
    },
    msg: {
      address: '地址格式: CKB / ETH / ENS',
      clear:
        '剩余金额过低（小于 61 CKB），无法发送交易。是否要发送全部的 CKB？',
      // sendAll: '是否要发送全部的 CKB？',
      sent,
      requireAddress: '地址不能为空',
      requireAmount: '金额不能为空',
      minAmount: '最小金额为 61 CKB',
      maxAmount: '转账金额必须小于余额',
      wrongEns: 'ENS 无法解析',
      wrongAddress: '错误的地址格式',
      wrongAmount: '错误的金额格式'
    }
  },
  sendBatch: {
    title: '批量转账',
    label: {
      sum: '总额'
    },
    btn: {
      input: '输入',
      import: '导入',
      buildInput: '创建交易',
      buildImport: '导入链接 ',
      clear: '清除',
      send
    },
    msg: {
      inputFormat: '0xaaaa...aaaa,100\nckb1bbb...bbb 200\n ',
      inputHint:
        '请输入地址(CKB / ETH / ENS) 和金额，用英文逗号或空格分隔，每行一组',
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
      feeRate
    }
  },
  txlist: {
    label: {
      amount,
      cancel,
      fee,
      from,
      to,
      note,
      hash,
      height: '区块',
      set: '保存'
    },
    msg: {
      in: '收款成功',
      out: '发送成功',
      loading,
      empty,
      login: '登录查看'
    },
    btn: {
      close,
      check: '在 Nervos 浏览器中查看',
      loadMore: '加载更多'
    }
  },
  signBoard: {
    label: {
      txDetail: '交易详情',
      from,
      to,
      fee,
      feeRate,
      note
    },
    btn: {
      confirm
    }
  },
  swap: {
    title: '兑换 CKB',
    btn: {
      swap: '兑换'
    },
    label: {
      balance,
      sendAmount: '支付数量',
      receiveAmount: '获得数量',
      hash,
      rate,
      range: '金额范围'
    }
  },
  receiveCard: {
    label: {
      native: 'Portal Wallet',
      portal: '其他钱包/交易所',
      ckb: 'Neuron',
      address
    },
    msg: {
      where: '从哪里收款？',
      default:
        '当前登陆的以太坊地址。其他人可以通过 Portal Wallet 向这个地址发送 CKB 资产。',
      ckb: '与当前以太坊地址相对应的 CKB 长地址。',
      portal:
        '一个中转地址。当您需要从交易所或者其他不支持长地址格式的 CKB 钱包接收 CKB 资产时，请使用这个地址。'
    }
  },
  daoCard: {
    label: {
      dao,
      deposited: '已存入',
      yesterday: '昨日收益',
      cumulative: '累计收益'
    },
    btn: {
      dao
    }
  },
  login: {
    title: '授权确认',
    btn: {
      login
    },
    msg: {
      hint: '登录以继续',
      detail:
        '我们将请求一个针对钱包地址和当前时间的数字签名, 从而保护您的隐私数据不会泄露，如通讯录和交易备注等信息。'
    }
  },
  shop: {
    title: '雷兔商城',
    msg: {
      service:
        '如果你有任何问题或者建议，欢迎关注我们的公众号，并直接向我们发送消息。'
    }
  },

  order: {
    title: '提交订单',
    btn: {
      pay: '支付',
      home: '前往钱包',
      checkOrders: '查看订单',
      cancel
    },
    msg: {
      noSku: '无法找到商品信息',
      expired: '订单已过期，请刷新本页面重新下单',
      notEnough: '余额不足，请向账户中转入更多资产',
      paid: '付款已提交，需要等待确认发货，您可以去订单列表查看订单状态'
    },
    label: {
      success,
      rate
    }
  },

  orders: {
    title: '订单列表',
    label: {
      paid: '已付款',
      used: '已使用',
      service: '售后中',
      refunded: '已退款'
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
      pending: '交易确认中'
    }
  },

  cardInfo: {
    label: {
      validBefore,
      boughtAt
    }
  },

  assetSelect: {
    label: {
      select: '选择资产'
    }
  }
};
