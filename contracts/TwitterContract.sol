// SPDX-License-Identifier: GPL-3.0
import "./Account.sol";

pragma solidity ^0.8.0;


contract TwitterContract {

    event TweetAdded(uint tweetId);
    event TweetDeleted(uint tweetId);

    struct Tweet {
        uint id;
        address username;
        bytes tweetText;
        bool isDeleted;
    }

    struct SerializedTweet {
        uint id;
        address username;
        string tweetText;
        bool isDeleted;
    }

    modifier accountExists(address uid) {
        require(accounts[uid] != Account(address(0)), 
                "Account does not exists"
        );
        _;
    }

    mapping(address => Account) private accounts;
    Tweet[] private tweets;


    function addTweet(string memory _tweetText) external accountExists(msg.sender) {
        bytes memory tweetText = bytes(_tweetText);
        require(tweetText.length <= 280, "Tweet cannot contain more than 280 characters.");
        Account account = accounts[msg.sender];
        uint tweetId = tweets.length;
        tweets.push(Tweet(tweetId, msg.sender, tweetText, false));
        account.addTweet(tweetId);
        emit TweetAdded( tweetId);
    }

    function filterDeletedTweets(Tweet[] memory _tweets) private pure returns (SerializedTweet[] memory){
        Tweet[] memory temp = new Tweet[](_tweets.length);
        uint counter = 0;
        for(uint i = 0; i < _tweets.length; i++){
            if(_tweets[i].isDeleted == false){
                temp[counter] = _tweets[i];
                counter++;
            }
        }
        SerializedTweet[] memory result = new SerializedTweet[](counter);
        for(uint i=0; i<counter; i++) {
            Tweet memory tweet = temp[i];
            result[i] = SerializedTweet(tweet.id, tweet.username, string(tweet.tweetText), tweet.isDeleted);
        }
        return result;

    }

    function deleteTweet(uint tweetId) external accountExists(msg.sender){
        require(tweets.length > tweetId, "Tweet does not exists");
        require(tweets[tweetId].username == msg.sender, "Account not allowed to delete tweet");
        tweets[tweetId].isDeleted = true;
        emit TweetDeleted(tweetId);
    }

    function getAccountTweetCounts(address uid) public view accountExists(uid) returns (uint){
        Account account = accounts[uid];
        return account.getTweetsCount();
    }

    function getMyTweetCounts() public view accountExists(msg.sender) returns (uint){
        return getAccountTweetCounts(msg.sender);
    }

    function getAccountTweets(address uid) public view accountExists(uid) returns (SerializedTweet[] memory){
        Account account = accounts[uid];
        uint[] memory tweetIds = account.getTweetIds();
        Tweet[] memory myTweets = new Tweet[](tweetIds.length);
        for(uint i = 0; i < tweetIds.length; i++){
            myTweets[i] = tweets[tweetIds[i]];
        }
        return filterDeletedTweets(myTweets);
    }

    function getMyAccountTweets() public view accountExists(msg.sender) returns (SerializedTweet[] memory){
        return getAccountTweets(msg.sender);
    }


    function getTweets() public view returns (SerializedTweet[] memory){
        return filterDeletedTweets(tweets);
    }


 


    function createAccount() external {
        require(accounts[msg.sender] == Account(address(0)));
        Account account = new Account();
        accounts[msg.sender] = account;
    }

    function getAccountAddress(address uid) public view accountExists(uid) returns (address) {
        return address(accounts[uid]);
    }

    function getAccountDetails(address uid) public view accountExists(uid) returns (string memory, string memory, string memory, uint, address ){
        Account account = accounts[uid];
        return account.getDetails();
    }

    function getMyAccountAddress() public view accountExists(msg.sender) returns (address){
        return address(accounts[msg.sender]);

    }

    function getMyAccountDetails() public view accountExists(msg.sender) returns (string memory, string memory, string memory, uint, address ) {
        return getAccountDetails(msg.sender);

    }
}