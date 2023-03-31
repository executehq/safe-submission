/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useCallback } from 'react'
import React, { useEffect, useState } from 'react'
// import styled from 'styled-components'
import { Button, Title, Divider, } from '@gnosis.pm/safe-react-components'
import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk'
import { ethers } from 'ethers'
// const Container = styled.div`
//   padding: 1rem;
//   width: 100%;
//   height: 100%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-direction: column;
// `

// const Link = styled.a`
//   margin-top: 8px;
// `

const SafeApp = (): React.ReactElement => {
  const { sdk, safe } = useSafeAppsSDK();
  // const [to, setTo] = useState<string>('');
  // const [value, setValue] = useState<string>('');
  // const [data, setData] = useState<string>('');
  // const [transactionId, settransactionId] = useState<string>('');
  console.log('safe', safe);
  console.log('sdk', sdk);

  const moduleAbi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "_verifier",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "safe",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "txHash",
          type: "uint256",
        },
      ],
      name: "TransactionExecuted",
      type: "event",
    },
    {
      inputs: [],
      name: "NAME",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "VERSION",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "allowTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "allowedTransactions",
      outputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "allowedTransactionsCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "safe",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "verificationId",
          type: "uint256",
        },
      ],
      name: "executeTransaction",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "fallback",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "safe",
          type: "address",
        },
      ],
      name: "nextTransactionId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "nonce",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "verifier",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  // console.log(to, value, transactionId);
  const contractAddy = "0x0Fc51aaE5dD89843d40F6057bcC111ae2787a46e"

  const module = new ethers.Contract(contractAddy, moduleAbi, ethers.providers.getDefaultProvider('goerli'));
  const sendTx = async () => {
    const x = await module.nextTransactionId(safe.safeAddress);
    console.log(formResponse.action.to, formResponse.action.value, '0x')
    // callData foe executing the approveTransation function in the contract properly
    const callData = module.interface.encodeFunctionData('allowTransaction', [formResponse.action.to, ethers.utils.parseEther(formResponse.action.value), '0x'])

    console.log(callData)
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: contractAddy,
            value: ethers.utils.parseEther("0").toString(),
            data: callData
          },
        ],
      })
      console.log({ safeTxHash })
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash)
      console.log({ safeTx })

      await fetch("https://dead-payment-production.up.railway.app/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          trigger: formResponse.context,
          safeAddress: safe.safeAddress,
          transactionId: x.toString(),
          type: formResponse.triggerType,
        })
      })
    } catch (e) {
      console.error(e)
    }
    return
  }

  const [formResponse, setFormResponse] = useState<any>({})
  useEffect(() => {
    console.log(formResponse)
  }, [formResponse])

  return (
    <div className=" w-screen bg-gray-100">
      <div className="w-full ml-5">

        <Title size="md">Define Trigger</Title>

        <select className="w-3/4 h-12 rounded-lg p-3 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => {
          if (e.target.value !== "NULL") {
            setFormResponse({ ...formResponse, triggerType: e.target.value })
          } else {
            setFormResponse({})
          }
        }}>
          <option value="NULL" className="text-gray-500">Select Trigger Type</option>
          <option value="TIMESTAMP" className="text-gray-900">Timestamp</option>
          <option value="PRICE" className="text-gray-900">Token Price</option>
          <option value="EVM_EVENT" className="text-gray-900">On-chain Event</option>
        </select>
        <Divider />
        {
          formResponse && formResponse.triggerType === "TIMESTAMP" ?
            (<>
              <input onChange={(e) => setFormResponse({
                ...formResponse,
                context: {
                  ...formResponse.context,
                  time: e.target.value
                }
              })} className="w-3/4 h-12 rounded-lg p-3 border-2" name="from" placeholder="Timestamp" />
              <Divider />
            </>)
            :
            null
        }

        {
          formResponse && formResponse.triggerType === "EVM_EVENT" ?
            (<>
              <input onChange={(e) => setFormResponse({
                ...formResponse,
                context: {
                  ...formResponse.context,
                  from: e.target.value
                }
              })} className="w-3/4 h-12 rounded-lg p-3 border-2" name="from" placeholder="From (Optional)" />
              <Divider />
              <input onChange={(e) => setFormResponse({
                ...formResponse,
                context: {
                  ...formResponse.context,
                  to: e.target.value
                }
              })} className="w-3/4 h-12 rounded-lg p-3 border-2" name="to" placeholder="To (Optional)" />
              <Divider />
              <input onChange={(e) => setFormResponse({
                ...formResponse,
                context: {
                  ...formResponse.context,
                  topic: e.target.value
                }
              })} className="w-3/4 h-12 rounded-lg p-3 border-2" name="topic" placeholder="Event Topic (Optional)" />
              <Divider />
              <input onChange={(e) => setFormResponse({
                ...formResponse,
                context: {
                  ...formResponse.context,
                  status: e.target.value
                }
              })} className="w-3/4 h-12 rounded-lg p-3 border-2" name="status" placeholder="Status (Option)" />
              <Divider />
            </>)
            :
            null
        }


        {
          formResponse && formResponse.triggerType === "PRICE" ?
            (<>
              <input onChange={(e) => setFormResponse({
                ...formResponse,
                context: {
                  ...formResponse.context,
                  token: e.target.value
                }
              })} className="w-3/4 h-12 rounded-lg p-3 border-2" name="from" placeholder="Token ID" />
              <Divider />
              <input onChange={(e) => setFormResponse({
                ...formResponse,
                context: {
                  ...formResponse.context,
                  price: e.target.value
                }
              })} className="w-3/4 h-12 rounded-lg p-3 border-2" name="to" placeholder="Price" />
              <Divider />

            </>)
            :
            null
        }

        <Title size="md">Define Action </Title>
        <br />
        <input onChange={(e) => {
          setFormResponse({
            ...formResponse,
            action: {
              ...formResponse.action,
              to: e.target.value
            }
          })
        }} className="w-3/4 h-12 rounded-lg p-3 border-2" name="timestamp" placeholder="To" />
        <Divider />

        <input onChange={(e) => {
          setFormResponse({
            ...formResponse,
            action: {
              ...formResponse.action,
              value: e.target.value
            }
          })
        }
        } className="w-3/4 h-12 rounded-lg p-3 border-2" name="timestamp" placeholder="Value" />
        <Divider />

        <input className="w-3/4 h-12 rounded-lg p-3 border-2" name="timestamp" placeholder="Data" />
        <Divider />

        <Button size="lg" color="primary" onClick={sendTx} >
          Create Automation
        </Button>
      </div>

    </div>
  )
}

export default SafeApp
