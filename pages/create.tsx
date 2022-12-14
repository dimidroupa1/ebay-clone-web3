import React from "react";
import Header from "../components/Header";
import {
  useAddress,
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateAuctionListing,
  useCreateDirectListing,
} from "@thirdweb-dev/react";
import { NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import network from "../utils/network";
import Router, { useRouter } from "next/router";

const create = () => {
  const [selectedNft, setSelectedNft] = React.useState<NFT>();
  const router = useRouter()

  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );
  const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection"
  );

  const ownedNFTs = useOwnedNFTs(collectionContract, address);
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const {
    mutate: createDirectListing,
    isLoading,
    error,
  } = useCreateDirectListing(contract);
  const {
    mutate: createAuctionListing,
    isLoading: isLoadingDirect,
    error: errorDirect,
  } = useCreateAuctionListing(contract);

  const handleCreateListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }

    if (!selectedNft) return;

    const target = e.target as typeof e.target & {
      elements: { listingType: { value: string }; price: { value: string } };
    };

    const { listingType, price } = target.elements;

    if (listingType.value === "directListing") {
      createDirectListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
        tokenId: selectedNft.metadata.id,
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 * 24 * 7,
        quantity: 1,
        buyoutPricePerToken: price.value,
        startTimestamp: new Date()
      }, {
        onSuccess(data, variables, context) {
          console.log('SUCCESS->', data)
          console.log('variables->', variables)
          console.log('context->', context)
          router.push('/')
        },
        onError(error, variables, context) {
          console.log('ERROR->', error)
          console.log('variables->', variables)
          console.log('context->', context)
        }
      })
    }
    
    if(listingType.value === 'auctionListing') {
      createAuctionListing({
        assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
        buyoutPricePerToken: price.value,
        tokenId: selectedNft.metadata.id,
        startTimestamp: new Date(),
        currencyContractAddress: NATIVE_TOKEN_ADDRESS,
        listingDurationInSeconds: 60 * 60 * 24 * 7,
        quantity: 1,
        reservePricePerToken: 0,
      }, {
        onSuccess(data, variables, context) {
          console.log('SUCCESS->', data, '\n', 'variables->', variables, '\n', 'context->', context)
          router.push('/')
        },
        onError(error, variables, context) {
          console.log('ERROR->', error, '\n', 'variables->', variables, '\n', 'context->', context)
        }
      })
    }
  };

  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-4xl font-bold">List an Item</h1>
        <h2 className="text-xl font-semibold pt-5">
          Select an Item you wolud like to Sell
        </h2>
        <hr className="mb-5" />

        <p>Below you will find the NFT's you own in your wallet</p>

        <div className="flex overflow-x-scroll space-x-2 p-4">
          {ownedNFTs?.data?.map((nft) => (
            <div
              key={nft.metadata.id}
              onClick={() => setSelectedNft(nft)}
              className={`flex flex-col space-y-2 card min-w-fit border-2 bg-greay-100 ${
                nft.metadata.id === selectedNft?.metadata.id
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              <MediaRenderer
                src={nft.metadata.image}
                className="h-48 rounded-lg"
              />
              <p className="text-lg truncate font-bold">{nft.metadata.name}</p>
              <p className="text-xs truncate">{nft.metadata.description}</p>
            </div>
          ))}
        </div>

        {selectedNft && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10 ">
              <div className="grid grid-cols-2 gap-5">
                <label className="border-r border-gray-300 font-light">
                  Direct Listing / Fized Price
                </label>
                <input
                  type="radio"
                  name="listingType"
                  value="directListing"
                  className="ml-auto h-6 w-6"
                />

                <label className="border-r border-gray-300 font-light">
                  Auction
                </label>
                <input
                  type="radio"
                  name="listingType"
                  value="auctionListing"
                  className="ml-auto h-6 w-6"
                />

                <label className="border-r border-gray-300 font-light">
                  Price(GOR)
                </label>
                <input
                  type="text"
                  placeholder="0.05"
                  name="price"
                  className="bg-gray-100 p-5 outline-none focus:ring-2 focus:ring-black rounded"
                />
              </div>

              <button
                className="bg-blue-600 text-white rounded-lg p-4 mt-8"
                type="submit"
              >
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default create;
