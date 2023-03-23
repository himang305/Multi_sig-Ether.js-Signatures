// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract SignVerify {
   
   uint ss;
    constructor() {
        map[address(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4)] = true;
        map[address(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2)] = true;

    }

    mapping(address => bool) public map;

 
    function getMessageHash(
        uint _amount,
        uint _nonce
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_amount,_nonce));
    }

 function getEthSignedMessageHash(
        bytes32 _messageHash
    ) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
            );
    }

    function dd() public pure returns (bool){
        address a1 = address(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4);
        address a2 = address(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2);
        return a1 > a2;
    }

     function verify(
        uint _amount,
        uint _nonce,
        bytes memory signature
    ) public {
        uint requiredSignatures = 2;
        require(signature.length >= requiredSignatures * 65, "GS020");
        
        bytes32 messageHash = getMessageHash(_amount,_nonce);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        address lastOwner = address(0);
        address currentOwner;
        uint8 v;
        bytes32 r;
        bytes32 s;
        uint256 i;

        for (i = 0; i < requiredSignatures; i++) {
            (v, r, s) = signatureSplit(signature, i);
            currentOwner = ecrecover(ethSignedMessageHash, v, r, s);
            
            require(currentOwner > lastOwner 
            && map[currentOwner] == true 
            // && currentOwner != SENTINEL_OWNERS
            , "failed");
            lastOwner = currentOwner;
        }

        ss = 123;

        // return recoverSigner(ethSignedMessageHash, signature) == _signer;
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }

     function signatureSplit(bytes memory signatures, uint256 pos) internal pure returns (uint8 v, bytes32 r, bytes32 s) {
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let signaturePos := mul(0x41, pos)
            r := mload(add(signatures, add(signaturePos, 0x20)))
            s := mload(add(signatures, add(signaturePos, 0x40)))
            /**
             * Here we are loading the last 32 bytes, including 31 bytes
             * of 's'. There is no 'mload8' to do this.
             * 'byte' is not working due to the Solidity parser, so lets
             * use the second best option, 'and'
             */
            v := and(mload(add(signatures, add(signaturePos, 0x41))), 0xff)
        }
    }



}
