// // Updated server.js with IPFS integration
// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// const CryptoJS = require('crypto-js');
// const Web3 = require('web3');
// const { create } = require('ipfs-http-client');
// const all = require('it-all');
// const { concat: uint8ArrayConcat } = require('uint8arrays/concat');
// const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string');
// const { toString: uint8ArrayToString } = require('uint8arrays/to-string');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Configure multer for file upload
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadDir = path.join(__dirname, 'uploads');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   fileFilter: function (req, file, cb) {
//     if (file.mimetype !== 'application/pdf') {
//       return cb(new Error('Only PDF files are allowed!'), false);
//     }
//     cb(null, true);
//   }
// });

// // Initialize IPFS client
// const ipfs = create({
//   host: process.env.IPFS_HOST || 'localhost',
//   port: process.env.IPFS_PORT || 5001,
//   protocol: process.env.IPFS_PROTOCOL || 'http'
// });

// // Initialize Web3 with your Ethereum provider
// const web3 = new Web3(process.env.ETHEREUM_PROVIDER || 'http://localhost:8545');

// // Updated contract ABI and address (make sure your contract has functions to store IPFS CIDs)
// const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'contracts', 'DocumentVerificationWithIPFS.json')));
// const contractAddress = process.env.CONTRACT_ADDRESS;

// // Create contract instance
// const docVerificationContract = new web3.eth.Contract(
//   contractABI.abi,
//   contractAddress
// );

// // Account that will interact with the blockchain
// const account = process.env.ETHEREUM_ACCOUNT;
// const privateKey = process.env.ETHEREUM_PRIVATE_KEY;

// // Function to add file to IPFS
// async function addFileToIPFS(filePath) {
//   try {
//     const fileContent = fs.readFileSync(filePath);
//     const file = await ipfs.add({
//       path: path.basename(filePath),
//       content: fileContent
//     }, {
//       pin: true
//     });
//     return file.cid.toString();
//   } catch (error) {
//     console.error('Error adding file to IPFS:', error);
//     throw error;
//   }
// }

// // Function to retrieve file from IPFS
// async function getFileFromIPFS(cid) {
//   try {
//     const data = await all(ipfs.cat(cid));
//     return uint8ArrayConcat(data);
//   } catch (error) {
//     console.error('Error getting file from IPFS:', error);
//     throw error;
//   }
// }

// // Calculate SHA-256 hash of a file
// function calculateFileHash(filePath) {
//   return new Promise((resolve, reject) => {
//     const fileData = fs.readFileSync(filePath);
//     const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileData)).toString();
//     resolve(hash);
//   });
// }

// // Upload PDF endpoint
// app.post('/api/upload', upload.single('pdf'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const filePath = req.file.path;
//     const fileName = req.file.originalname;
//     const fileHash = await calculateFileHash(filePath);
    
//     // Upload to IPFS
//     const ipfsCid = await addFileToIPFS(filePath);
    
//     // Store hash and IPFS CID in blockchain
//     const tx = {
//       from: account,
//       to: contractAddress,
//       gas: 500000,
//       data: docVerificationContract.methods.storeDocument(fileName, fileHash, ipfsCid).encodeABI()
//     };

//     const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
//     const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

//     // Get the public IPFS gateway URL
//     const ipfsGatewayUrl = `${process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'}${ipfsCid}`;

//     res.status(200).json({
//       success: true,
//       fileName,
//       fileHash,
//       ipfsCid,
//       ipfsUrl: ipfsGatewayUrl,
//       transactionHash: receipt.transactionHash
//     });

//     // Cleanup local file after uploading to IPFS
//     fs.unlinkSync(filePath);
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Verify PDF endpoint
// app.post('/api/verify', upload.single('pdf'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const filePath = req.file.path;
//     const fileName = req.file.originalname;
//     const currentFileHash = await calculateFileHash(filePath);
    
//     // Get stored data from blockchain
//     const documentData = await docVerificationContract.methods.getDocument(fileName).call();
//     const storedHash = documentData.hash;
//     const ipfsCid = documentData.ipfsCid;
    
//     if (!storedHash || storedHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
//       return res.status(404).json({ 
//         verified: false, 
//         message: 'Document not found in blockchain' 
//       });
//     }
    
//     const isVerified = currentFileHash === storedHash;
//     const ipfsGatewayUrl = `${process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'}${ipfsCid}`;

//     res.status(200).json({
//       verified: isVerified,
//       fileName,
//       currentHash: currentFileHash,
//       storedHash,
//       ipfsCid,
//       ipfsUrl: ipfsGatewayUrl,
//       message: isVerified ? 'Document verified successfully! No modifications detected.' : 'Document verification failed! The document has been modified.'
//     });

//     // Cleanup local file after verification
//     fs.unlinkSync(filePath);
//   } catch (error) {
//     console.error('Error verifying file:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Download document from IPFS
// app.get('/api/document/:cid/:filename', async (req, res) => {
//   try {
//     const { cid, filename } = req.params;
    
//     // Fetch file from IPFS
//     const fileData = await getFileFromIPFS(cid);
    
//     // Set appropriate headers
//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename="${filename}"`
//     });
    
//     // Send the file
//     res.send(Buffer.from(fileData));
//   } catch (error) {
//     console.error('Error downloading file:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const Web3 = require('web3');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Initialize Web3 with your Ethereum provider
const web3 = new Web3(process.env.ETHEREUM_PROVIDER || 'http://localhost:8545');

// Load contract ABI and address
const contractABI = JSON.parse(fs.readFileSync(path.join(__dirname, 'contracts', 'DocumentVerificationWithIPFS.json')));
const contractAddress = process.env.CONTRACT_ADDRESS;

// Create contract instance
const docVerificationContract = new web3.eth.Contract(
  contractABI.abi,
  contractAddress
);

// Account that will interact with the blockchain
const account = process.env.ETHEREUM_ACCOUNT;
const privateKey = process.env.ETHEREUM_PRIVATE_KEY;

// Function to add file to IPFS using axios
async function addFileToIPFS(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const formData = new FormData();
    
    formData.append('file', fileContent, {
      filename: path.basename(filePath),
      contentType: 'application/pdf'
    });
    
    console.log(`Uploading file to IPFS at ${process.env.IPFS_PROTOCOL || 'http'}://${process.env.IPFS_HOST || 'localhost'}:${process.env.IPFS_PORT || 5001}/api/v0/add`);
    
    const response = await axios.post(
      `${process.env.IPFS_PROTOCOL || 'http'}://${process.env.IPFS_HOST || 'localhost'}:${process.env.IPFS_PORT || 5001}/api/v0/add?pin=true`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        }
      }
    );
    
    console.log('IPFS upload response:', response.data);
    return response.data.Hash;
  } catch (error) {
    console.error('Error adding file to IPFS (detailed):', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}
// Add this before handling requests
async function checkContractOwner() {
  const contractOwner = await docVerificationContract.methods.owner().call();
  console.log(`Contract owner: ${contractOwner}`);
  console.log(`Current account: ${account}`);
  if (contractOwner.toLowerCase() !== account.toLowerCase()) {
    console.error('WARNING: Current account is not the contract owner!');
  }
}

// Call this function when the server starts
checkContractOwner().catch(console.error);

// Function to retrieve file from IPFS using axios
// Function to retrieve file from IPFS using axios - UPDATED
async function getFileFromIPFS(cid) {
  try {
    const url = `${process.env.IPFS_PROTOCOL || 'http'}://${process.env.IPFS_HOST || 'localhost'}:${process.env.IPFS_PORT || 5001}/api/v0/cat`;
    
    // Use POST instead of GET
    const response = await axios.post(
      url,
      {}, // Empty body
      {
        params: { arg: cid },
        responseType: 'arraybuffer'
      }
    );
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error getting file from IPFS:', error);
    throw error;
  }
}

// Calculate SHA-256 hash of a file
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(filePath);
    const hash = CryptoJS.SHA256(CryptoJS.lib.WordArray.create(fileData)).toString();
    resolve(hash);
  });
}

// Upload PDF endpoint
// Modify the upload endpoint to include more debugging
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileHash = await calculateFileHash(filePath);
    
    console.log(`File uploaded: ${fileName}, calculating hash: ${fileHash}`);
    console.log(`Uploading to IPFS: ${filePath}`);
    
    // Upload to IPFS
    const ipfsCid = await addFileToIPFS(filePath);
    console.log(`File uploaded to IPFS with CID: ${ipfsCid}`);
    
    // Debug contract and account information
    console.log(`Using contract at address: ${contractAddress}`);
    console.log(`Using account: ${account}`);
    
    try {
      // Try to call a view function first to check connection
      const owner = await docVerificationContract.methods.owner().call();
      console.log(`Contract owner verified: ${owner}`);
    } catch (error) {
      console.error('Error calling contract view function:', error.message);
    }
    
    // Create transaction data
    const data = docVerificationContract.methods.storeDocument(fileName, fileHash, ipfsCid).encodeABI();
    console.log('Transaction data prepared:', data.substring(0, 66) + '...');
    
    // Store hash and IPFS CID in blockchain
    const tx = {
      from: account,
      to: contractAddress,
      gas: 2000000, // Increased gas limit
      gasPrice: await web3.eth.getGasPrice(),
      data: data
    };

    console.log('Preparing blockchain transaction:', JSON.stringify(tx, null, 2));
    
    try {
      const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
      console.log('Transaction signed successfully');
      console.log('Sending transaction to blockchain...');
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(`Transaction confirmed: ${receipt.transactionHash}`);

      // Get the public IPFS gateway URL
      const ipfsGatewayUrl = `${process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'}${ipfsCid}`;

      res.status(200).json({
        success: true,
        fileName,
        fileHash,
        ipfsCid,
        ipfsUrl: ipfsGatewayUrl,
        transactionHash: receipt.transactionHash
      });
    } catch (txError) {
      console.error('Transaction error details:', txError);
      throw new Error(`Transaction failed: ${txError.message}`);
    }

    // Cleanup local file after uploading to IPFS
    fs.unlinkSync(filePath);
    console.log(`Local file deleted: ${filePath}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify PDF endpoint
app.post('/api/verify', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const currentFileHash = await calculateFileHash(filePath);
    
    // Get stored data from blockchain
    const documentData = await docVerificationContract.methods.getDocument(fileName).call();
    const storedHash = documentData.hash;
    const ipfsCid = documentData.ipfsCid;
    
    if (!storedHash || storedHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return res.status(404).json({ 
        verified: false, 
        message: 'Document not found in blockchain' 
      });
    }
    
    const isVerified = currentFileHash === storedHash;
    const ipfsGatewayUrl = `${process.env.IPFS_GATEWAY || 'https://localhost:8080/ipfs/'}${ipfsCid}`;

    res.status(200).json({
      verified: isVerified,
      fileName,
      currentHash: currentFileHash,
      storedHash,
      ipfsCid,
      ipfsUrl: ipfsGatewayUrl,
      message: isVerified ? 'Document verified successfully! No modifications detected.' : 'Document verification failed! The document has been modified.'
    });

    // Cleanup local file after verification
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error verifying file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download document from IPFS
app.get('/api/document/:cid/:filename', async (req, res) => {
  try {
    const { cid, filename } = req.params;
    
    // Fetch file from IPFS
    const fileData = await getFileFromIPFS(cid);
    
    // Set appropriate headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    });
    
    // Send the file
    res.send(Buffer.from(fileData));
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});