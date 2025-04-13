const DocumentVerificationWithIPFS = artifacts.require("DocumentVerificationWithIPFS");

module.exports = function (deployer) {
  deployer.deploy(DocumentVerificationWithIPFS).then(() => {
    console.log("DocumentVerificationWithIPFS deployed at", DocumentVerificationWithIPFS.address);
  });
};
