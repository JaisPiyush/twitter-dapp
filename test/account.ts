/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Account } from "../typechain";


describe("Account", () => {

    let AccountContract;
    let account: Account;
    let owner: SignerWithAddress;
    let addrs: SignerWithAddress[];
    

    beforeEach(async () =>  {
        AccountContract = await ethers.getContractFactory("Account");
        addrs = await ethers.getSigners();
        owner = addrs[0];
        account = await AccountContract.deploy();
        
    });


    describe("Deployement", () => {
       it("Accounts uid must be same as deployer", async () => {
           const details = await account.getDetails()
           const tweetsCount = details[details.length - 2];
           const uid = details[details.length - 1];
           expect(uid).to.equal(owner.address);
           expect(tweetsCount).to.equal(0);
        });
    });

    describe("Update", () => {
        const bnImage = "new_banner_image"
        it("Should fail bcz of non-owner is trying to update", async () => {
            const details = await account.getDetails();
            try{
                await account.connect(addrs[1]).update(bnImage, details[1], details[2]);
            }catch(e){
                expect(e).to.instanceOf(Error);
            }
            
        });

        it("Should update details of account", async () => {
            const details = await account.getDetails();
            account.on("AccountUpdated", (address: string) => {
                expect(address).to.eq(account.address)
            })
            await account.update(bnImage, details[1], details[2]);
            const newDetails = await account.getDetails();
            expect(newDetails[0]).to.eq(bnImage);
            await new Promise(res => setTimeout(() => res(null), 5000));
        })
    });

    describe("Adding Tweets", () => {
        
        it("Should add tweets and increase tweetCounts", async () => {
            const tCount = await account.getTweetsCount();
            const tIds = await account.getTweetIds();
            await account.addTweet(89);
            expect(await account.getTweetsCount()).to.eq(tCount.add(1));
            expect((await account.getTweetIds()).length).to.equal(tIds.length + 1);
            expect((await account.getTweetIds())[0].toNumber()).to.eq(89)
        })
    })



})