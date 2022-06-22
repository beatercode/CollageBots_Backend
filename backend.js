const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))

app.get('/check/:account/:mode', (req, res) => {
  const account = req.params.account;
  const mode = req.params.mode;
  let ress = checkAccountInWhitelist(account, mode);
  res.send(ress);
});

const whitelistAddressesOG = [
  "0x455a89CEaf1dfB149C9Fc166b84E694555b63766",
  ""
];

const whitelistAddressesWL = [
  "",
  ""
];
const whitelistAddressesWHALE = [
  "0xD5737dD3f79D8E52f44d0F2d2DA60c04430A51C6",
  ""
];

// mode: 0 OG - 1 WL - 2 WHALE
function checkAccountInWhitelist(account, mode) {
  if (mode != 0 && mode != 1 && mode != 2) return null;
  const whitelistAddresses = mode == 0
    ? whitelistAddressesOG
    : mode == 1
      ? whitelistAddressesWL
      : whitelistAddressesWHALE;
  const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
  const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
  const rootHash = merkleTree.getRoot();
  const claimingAddress = keccak256(account);
  const hexProof = merkleTree.getHexProof(claimingAddress);
  const isPresent = merkleTree.verify(hexProof, claimingAddress, rootHash);
  //hexProof = hexProof.replace(/'/g, '"');
  return isPresent ? hexProof : null;
}
