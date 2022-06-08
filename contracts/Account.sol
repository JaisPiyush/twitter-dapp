// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract Account {

    event AccountUpdated(address addr);

    string private bannerImageUrl;
    string private avatarImageUrl;
    string private favAudioUrl;
    uint private tweetsCount;
    address private uid;
    uint[] private tweetIds;

    constructor() {
        uid = tx.origin;
        tweetsCount = 0;
        avatarImageUrl = "https://cdn.dribbble.com/users/146798/screenshots/5811891/dribbble_4x.png";
    }

    modifier onlyOwner(){
        require(tx.origin == uid);
        _;
    }


    function update(string memory _bannerImageUrl, string memory _avatarImageUrl, string memory _favAudioUrl) public onlyOwner {
        bannerImageUrl = _bannerImageUrl;
        avatarImageUrl = _avatarImageUrl;
        favAudioUrl = _favAudioUrl;
        emit AccountUpdated(address(this));
    }


    function getDetails() public view returns (string memory, string memory, string memory, uint, address ){
        return (bannerImageUrl, avatarImageUrl, favAudioUrl, tweetsCount, uid);
    }

    function getTweetIds() public view returns (uint[] memory){
        return tweetIds;
    }

    function getTweetsCount() public view returns (uint){
        return tweetsCount;
    }

    function addTweet(uint tweetId) public onlyOwner {
        tweetIds.push(tweetId);
        tweetsCount = tweetIds.length;
    }


}