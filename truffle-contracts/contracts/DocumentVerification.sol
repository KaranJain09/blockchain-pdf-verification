// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentVerificationWithIPFS {
    struct Document {
        string hash;
        string ipfsCid;
        uint256 timestamp;
        bool exists;
    }
    
    mapping(string => Document) private documents;
    address public owner;
    
    event DocumentStored(string fileName, string hash, string ipfsCid);
    event DocumentVerified(string fileName, bool verified);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function storeDocument(string memory fileName, string memory hash, string memory ipfsCid) public onlyOwner {
        // Check fileName is not empty
        require(bytes(fileName).length > 0, "File name cannot be empty");
        
        // Check hash is valid
        require(bytes(hash).length > 0, "Hash cannot be empty");
        
        // Check ipfsCid is valid
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");
        
        // Check if fileName already exists
        require(!documents[fileName].exists, "Document with this name already exists");
        
        documents[fileName] = Document({
            hash: hash,
            ipfsCid: ipfsCid,
            timestamp: block.timestamp,
            exists: true
        });
        emit DocumentStored(fileName, hash, ipfsCid);
    }
    
    function getDocument(string memory fileName) public view returns (string memory hash, string memory ipfsCid, uint256 timestamp, bool exists) {
        Document memory doc = documents[fileName];
        return (doc.hash, doc.ipfsCid, doc.timestamp, doc.exists);
    }
    
    function verifyDocument(string memory fileName, string memory hash) public returns (bool) {
        Document memory doc = documents[fileName];
        bool verified = keccak256(abi.encodePacked(doc.hash)) == keccak256(abi.encodePacked(hash));
        emit DocumentVerified(fileName, verified);
        return verified;
    }
}