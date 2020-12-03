import { div } from "../../libs/math"
import { format, formatAsset, lookupSymbol } from "../../libs/parse"
import { useContractsAddress } from "../../hooks"
import { Type } from "../../pages/Trade"
import { findValue } from "./receiptHelpers"

export default (type: Type) => (logs: TxLog[]) => {
  const { getSymbol } = useContractsAddress()
  const val = findValue(logs)

  const offer = val("offer_amount")
  const offerAsset = val("offer_asset")
  const rtn = val("return_amount")
  const rtnAsset = val("ask_asset")
  const spread = val("spread_amount")
  const commission = val("commission_amount")

  const rtnSymbol = getSymbol(rtnAsset)
  const offerSymbol = getSymbol(offerAsset)

  const price = {
    [Type.BUY]: div(offer, rtn),
    [Type.SELL]: div(rtn, offer),
  }[type]

  /* contents */
  const priceContents = {
    [Type.BUY]: {
      title: `Price per ${lookupSymbol(rtnSymbol)}`,
      content: `${format(price)} ${lookupSymbol(offerSymbol)}`,
    },
    [Type.SELL]: {
      title: `Price per ${lookupSymbol(offerSymbol)}`,
      content: `${format(price)} ${lookupSymbol(rtnSymbol)}`,
    },
  }[type]

  const rtnContents = {
    title: { [Type.BUY]: "Bought", [Type.SELL]: "Earned" }[type],
    content: formatAsset(rtn, rtnSymbol),
    children: [
      { title: "Spread", content: formatAsset(spread, rtnSymbol) },
      { title: "Commission", content: formatAsset(commission, rtnSymbol) },
    ],
  }

  const offerContents = {
    title: { [Type.BUY]: "Paid", [Type.SELL]: "Sold" }[type],
    content: formatAsset(offer, offerSymbol),
  }

  return {
    [Type.BUY]: [priceContents, rtnContents, offerContents],
    [Type.SELL]: [priceContents, offerContents, rtnContents],
  }[type]
}
