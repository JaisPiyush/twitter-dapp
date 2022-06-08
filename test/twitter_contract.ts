/* eslint-disable camelcase */
/* eslint-disable prettier/prettier */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { fail } from "assert";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {Account__factory, TwitterContract} from "../typechain"


describe("Twitter Contract", () => {


    let Twitter;
    let Account: Account__factory;
    let twitter:TwitterContract;
    let owner: SignerWithAddress;
    let addrs: SignerWithAddress[];

    beforeEach(async () => {
        Twitter = await ethers.getContractFactory("TwitterContract");
        Account = await ethers.getContractFactory("Account");
        addrs = await ethers.getSigners();
        owner = addrs[0];
        twitter = await Twitter.deploy();
    });

    describe("Create Account", () => {
        it("Should create account", async () => {
            await twitter.createAccount();
            const address = await twitter.getMyAccountAddress();
            expect(address.length).to.not.equal(0);
            const account = await Account.attach(address);
            const details = await account.getDetails();
            expect(details[details.length -1]).to.equal(owner.address)
            
        });
        it("Should throw error because account is already created", async () => {
            try{
                await twitter.createAccount();
                fail("Account already exists but still it's not throwing error");
            }catch(e){
                expect(true).to.equal(true);
            }
        })
    });

    describe("Add Tweet", () => {
        
        it("Should not add tweet because account doesn't exists", async () => {
            try{
                await twitter.connect(addrs[1]).addTweet("Hello World");
                fail("Account doesn't exists but still it's not throwing error");
            }catch(e){
                
                expect((e as Error).message).to.include("Account does not exists")
            }
            
        });

        it("Should throw error because lenght of tweet will be greater than 280", async () => {
            await twitter.createAccount();
            let str = "";
            for(let i =0; i < 281; i++){
                str = `${str}2`;
            }
            expect(str.length).to.equal(281);
            // await twitter.addTweet(str);
            try{
                await twitter.addTweet(str);
                fail("Message lenght is greater than 280 still not error thrown");
            }catch(e){
                expect((e as Error).message).to.include("Tweet cannot contain more than 280 characters.")
            }

        });

        it("Should add tweet and emit event", async () => {
            await twitter.createAccount();
            const account = await Account.attach(await twitter.getMyAccountAddress());
            twitter.on("TweetAdded", async (tId: BigNumber) => {
                const tIds = (await account.getTweetIds()).map((t) => t.toNumber());
                expect(tIds).to.include(tId.toNumber());
            });
            await twitter.addTweet("Hello world");
            expect((await twitter.getMyTweetCounts()).toNumber()).to.equal(1);
            await new Promise(res => setTimeout(() => res(null), 5000));
        });
    });

    describe("Get Tweets", () => {
        it("Should return serialzed all tweets", async () => {
            await twitter.createAccount();
            await twitter.connect(addrs[1]).createAccount();
            const numOfTweets = 5;
            for(let i =0; i < numOfTweets; i++){
                await twitter.addTweet(`${i**2}`);
            }
            
            for(let i =0; i < numOfTweets; i++){
                await twitter.connect(addrs[1]).addTweet(`${i**3}`);
            }

            const tweets = await twitter.getTweets();
            expect(tweets.length).to.equal(numOfTweets * 2);

            const tweet = tweets[2];
            expect(tweet.length).to.equal(4);
            expect(tweet[3]).to.equal(false);
            expect(tweet[0].toNumber()).to.equal(2);
            expect(tweet.username).to.equal(owner.address);
            expect(tweets[7].username).to.equal(addrs[1].address)

            
        });

        it("Should return only user's tweets", async () => {
            await twitter.createAccount();
            const numOfTweets = 5;
            for(let i =0; i < numOfTweets; i++){
                await twitter.addTweet(`${i**2}`);
            }
            await twitter.connect(addrs[1]).createAccount();
            for(let i =0; i < numOfTweets; i++){
                await twitter.connect(addrs[1]).addTweet(`${i**3}`);
            }
            
            
            
            expect(await twitter.signer.getAddress()).to.equal(owner.address)
            const tweets = await twitter.connect(addrs[1]).getMyAccountTweets();
            
            expect(tweets.length).equal(5);
            expect(tweets[0][0].toNumber()).to.equal(5);
        })
    });


    describe("Delete Tweet", () => {
        it("Should delete tweet and emit TweetDeleted event", async () => {
            await twitter.createAccount();
            const numOfTweets = 5;
            for(let i =0; i < numOfTweets; i++){
                await twitter.addTweet(`${i**2}`);
            }
            expect((await twitter.getTweets()).length).to.equal(numOfTweets);
            
            
            
            const prevTweets = await twitter.getTweets();
            twitter.on("TweetDeleted", async (tweetId) => {
                expect((await twitter.getTweets()).length).to.equal(prevTweets.length - 1)
            })

            await twitter.deleteTweet(3);

            
            const tweets = await twitter.getTweets();
            expect(tweets.map((t) => t.id)).to.not.include(3);
            const myTweets = await twitter.getMyAccountTweets();
            expect(myTweets.map((t) => t.id)).to.not.include(3);
            
            // Ethersjs uses polling to get event which has interval of 4secs to scan;
            await new Promise(res => setTimeout(() => res(null), 5000));
            
        });


        it("Should not allow tweet to be deleted", async () => {
            await twitter.createAccount();
            await twitter.connect(addrs[1]).createAccount();
            const numOfTweets = 5;
            for(let i =0; i < numOfTweets; i++){
                await twitter.addTweet(`${i**2}`);
            }
            try {
                await twitter.deleteTweet(8);
                fail("Tweet doesn't exists yet no error thrown")
            }catch(e){
                expect((e as Error).message).to.include("Tweet does not exists")
            }

            try {
                await twitter.connect(addrs[1]).deleteTweet(0);
                fail("Tweet trying to be deleted by another account yet no error thrown")
            }catch(e){
                expect((e as Error).message).to.include("Account not allowed to delete tweet")
            }

            
        })
    })

    
})