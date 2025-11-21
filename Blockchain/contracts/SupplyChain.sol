// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * Sirsha – Pharma Supply Chain (MVP)
 * Roles: Manufacturer -> Distributor -> Pharmacy
 * States: Created -> Shipped -> Received -> Sold
 */
contract SupplyChain {
    enum State { Created, Shipped, Received, Sold }

    struct Batch {
        string drugName;
        string batchId;
        uint256 mfgDate;
        uint256 expDate;
        address manufacturer;
        address distributor;
        address pharmacy;
        State state;
    }

    mapping(string => Batch) public batches; // key: batchId
    event BatchCreated(string batchId, string drug, address manufacturer);
    event Shipped(string batchId, address distributor);
    event Received(string batchId, address pharmacy);
    event Sold(string batchId);

    function createBatch(
        string calldata batchId,
        string calldata drugName,
        uint256 mfgDate,
        uint256 expDate,
        address distributor
    ) external {
        require(batches[batchId].mfgDate == 0, "exists");
        require(expDate > mfgDate, "bad dates");
        batches[batchId] = Batch({
            drugName: drugName,
            batchId: batchId,
            mfgDate: mfgDate,
            expDate: expDate,
            manufacturer: msg.sender,
            distributor: distributor,
            pharmacy: address(0),
            state: State.Created
        });
        emit BatchCreated(batchId, drugName, msg.sender);
    }

    function ship(string calldata batchId) external {
        Batch storage b = batches[batchId];
        require(b.mfgDate != 0, "no batch");
        require(b.state == State.Created, "bad state");
        require(msg.sender == b.manufacturer, "only manufacturer");
        b.state = State.Shipped;
        emit Shipped(batchId, b.distributor);
    }

    function receiveAtPharmacy(string calldata batchId, address pharmacy) external {
        Batch storage b = batches[batchId];
        require(b.state == State.Shipped, "bad state");
        require(msg.sender == b.distributor, "only distributor");
        b.pharmacy = pharmacy;
        b.state = State.Received;
        emit Received(batchId, pharmacy);
    }

    function markSold(string calldata batchId) external {
        Batch storage b = batches[batchId];
        require(b.state == State.Received, "bad state");
        require(msg.sender == b.pharmacy, "only pharmacy");
        b.state = State.Sold;
        emit Sold(batchId);
    }

    function getBatch(string calldata batchId) external view returns (Batch memory) {
        return batches[batchId];
    }
}
