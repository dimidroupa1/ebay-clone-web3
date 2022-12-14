import React from "react";
import Header from "../components/Header";
import { useAddress, useContract } from "@thirdweb-dev/react";
import { useRouter } from "next/router";

type Props = {};

const addItem = ({}: Props) => {
  const address = useAddress();
  const [preview, setPreview] = React.useState<string>();
  const [image, setImage] = React.useState<File>();
  const router = useRouter();

  const { contract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection"
  );

  const mintNft = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(e.target !== e.currentTarget) return;

    if (!contract || !address) return;

    if (!image) {
      alert("Please select an image!");
      return;
    }

    const target = e.target as typeof e.target & {
      name: {
        value: string;
      };
      description: {
        value: string;
      };
    };

    const metadata = {
      name: target.name.value,
      description: target.description.value,
      image: image,
    };

    try {
      const tx = await contract.mintTo(address, metadata);

      const receipt = tx.receipt;
      const tokenId = tx.id;
      const nft = await tx.data();

      console.log(receipt, tokenId, nft);
      router.push("/");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Header />

      <main className="max-w-6xl mx-auto p-10 border">
        <h1 className="text-4xl font-bold">Add an Item to the Marketplace</h1>
        <h2 className="text-xl font-semibold pt-5">Item details</h2>
        <p className="pb-5">
          By adding an utem to the marketplace, you're essentially Minting of
          the item into your wallet which we can then list for sale!
        </p>

        <div className="flex flex-col justify-center items-center md:flex-row md:space-x-5 pt-10">
          <img
            src={preview || "https://links.papareact.com/ucj"}
            alt=""
            className="border h-80 w-80 object-contain"
          />

          <form
            className="flex flex-col flex-1 p-2 space-y-2 justify-center"
            onSubmit={mintNft}
          >
            <label className="font-light">Na of Item</label>
            <input
              type="text"
              placeholder="Name of Item..."
              className="formField"
              name="name"
              id="name"
            />

            <label className="font-light">Description</label>
            <input
              type="text"
              placeholder="Enter Description..."
              className="formField"
              name="description"
              id="description"
            />

            <label className="font-light">Image of the Item</label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setPreview(URL.createObjectURL(e.target.files[0]));
                  setImage(e.target.files[0]);
                }
              }}
            />

            <button
              className="bg-blue-600 font-bold text-white rounded-full py-4 px-10 w-56 md:mt-auto mx-auto  md:ml-auto"
              type="submit"
            >
              Add/Mint Item
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default addItem;
