import { ConnectEmbed } from "@/app/thirdweb";
import { chain } from "./chain";
import { client } from "./client";
import Fundraiser from "../../components/Fundraiser";

export default function Home() {
  return (
    <>
      <div className="flex justify-center items-center mt-[5rem] flex-col">
        <h2 className="font-md text-2xl ">Fundraiser</h2>

        <ConnectEmbed client={client} chain={chain} />

        <Fundraiser />
      </div>
    </>
  );
}
