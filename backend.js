const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3010;

app.use(cors());
app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))

app.get('/check/:account/:mode', (req, res) => {
  const account = req.params.account;
  const mode = req.params.mode;
  let ress = checkAccountInWhitelist(account, mode);
  res.send(ress);
});

let whitelistAddressesOG = [
  "0x455a89CEaf1dfB149C9Fc166b84E694555b63766",
  "0x8D5E4b486E727Bde6C2ebd5013341aBF82EaF9E9",
  "0x79741f55A40160DA2930a45eeB498B4F23a46f40",
  "0xb74fb7ACB5FEaA8E65D67DD11D18d0387F26C7ce"
];

let whitelistAddressesWL = [
  "0x810D563f246Af6DF41EbDA8450c1101400D30701",
  "0xa49D85a26fcB5b8cA0c78692439591Bc718e2D21",
  "0x968B8F746391c8c17dD4656424FA65eC9CD09aaf"
];
let whitelistAddressesWHALE = [
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
