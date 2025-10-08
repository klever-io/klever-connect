/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const proto = $root.proto = (() => {

    /**
     * Namespace proto.
     * @exports proto
     * @namespace
     */
    const proto = {};

    proto.TXContract = (function() {

        /**
         * Properties of a TXContract.
         * @memberof proto
         * @interface ITXContract
         * @property {proto.TXContract.ContractType|null} [Type] TXContract Type
         * @property {google.protobuf.IAny|null} [Parameter] TXContract Parameter
         */

        /**
         * Constructs a new TXContract.
         * @memberof proto
         * @classdesc Represents a TXContract.
         * @implements ITXContract
         * @constructor
         * @param {proto.ITXContract=} [properties] Properties to set
         */
        function TXContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TXContract Type.
         * @member {proto.TXContract.ContractType} Type
         * @memberof proto.TXContract
         * @instance
         */
        TXContract.prototype.Type = 0;

        /**
         * TXContract Parameter.
         * @member {google.protobuf.IAny|null|undefined} Parameter
         * @memberof proto.TXContract
         * @instance
         */
        TXContract.prototype.Parameter = null;

        /**
         * Creates a new TXContract instance using the specified properties.
         * @function create
         * @memberof proto.TXContract
         * @static
         * @param {proto.ITXContract=} [properties] Properties to set
         * @returns {proto.TXContract} TXContract instance
         */
        TXContract.create = function create(properties) {
            return new TXContract(properties);
        };

        /**
         * Encodes the specified TXContract message. Does not implicitly {@link proto.TXContract.verify|verify} messages.
         * @function encode
         * @memberof proto.TXContract
         * @static
         * @param {proto.ITXContract} message TXContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TXContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Type != null && Object.hasOwnProperty.call(message, "Type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.Type);
            if (message.Parameter != null && Object.hasOwnProperty.call(message, "Parameter"))
                $root.google.protobuf.Any.encode(message.Parameter, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TXContract message, length delimited. Does not implicitly {@link proto.TXContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.TXContract
         * @static
         * @param {proto.ITXContract} message TXContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TXContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TXContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.TXContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.TXContract} TXContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TXContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.TXContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.Type = reader.int32();
                        break;
                    }
                case 2: {
                        message.Parameter = $root.google.protobuf.Any.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TXContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.TXContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.TXContract} TXContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TXContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TXContract message.
         * @function verify
         * @memberof proto.TXContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TXContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Type != null && message.hasOwnProperty("Type"))
                switch (message.Type) {
                default:
                    return "Type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                case 24:
                case 63:
                    break;
                }
            if (message.Parameter != null && message.hasOwnProperty("Parameter")) {
                let error = $root.google.protobuf.Any.verify(message.Parameter);
                if (error)
                    return "Parameter." + error;
            }
            return null;
        };

        /**
         * Creates a TXContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.TXContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.TXContract} TXContract
         */
        TXContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.TXContract)
                return object;
            let message = new $root.proto.TXContract();
            switch (object.Type) {
            default:
                if (typeof object.Type === "number") {
                    message.Type = object.Type;
                    break;
                }
                break;
            case "TransferContractType":
            case 0:
                message.Type = 0;
                break;
            case "CreateAssetContractType":
            case 1:
                message.Type = 1;
                break;
            case "CreateValidatorContractType":
            case 2:
                message.Type = 2;
                break;
            case "ValidatorConfigContractType":
            case 3:
                message.Type = 3;
                break;
            case "FreezeContractType":
            case 4:
                message.Type = 4;
                break;
            case "UnfreezeContractType":
            case 5:
                message.Type = 5;
                break;
            case "DelegateContractType":
            case 6:
                message.Type = 6;
                break;
            case "UndelegateContractType":
            case 7:
                message.Type = 7;
                break;
            case "WithdrawContractType":
            case 8:
                message.Type = 8;
                break;
            case "ClaimContractType":
            case 9:
                message.Type = 9;
                break;
            case "UnjailContractType":
            case 10:
                message.Type = 10;
                break;
            case "AssetTriggerContractType":
            case 11:
                message.Type = 11;
                break;
            case "SetAccountNameContractType":
            case 12:
                message.Type = 12;
                break;
            case "ProposalContractType":
            case 13:
                message.Type = 13;
                break;
            case "VoteContractType":
            case 14:
                message.Type = 14;
                break;
            case "ConfigITOContractType":
            case 15:
                message.Type = 15;
                break;
            case "SetITOPricesContractType":
            case 16:
                message.Type = 16;
                break;
            case "BuyContractType":
            case 17:
                message.Type = 17;
                break;
            case "SellContractType":
            case 18:
                message.Type = 18;
                break;
            case "CancelMarketOrderContractType":
            case 19:
                message.Type = 19;
                break;
            case "CreateMarketplaceContractType":
            case 20:
                message.Type = 20;
                break;
            case "ConfigMarketplaceContractType":
            case 21:
                message.Type = 21;
                break;
            case "UpdateAccountPermissionContractType":
            case 22:
                message.Type = 22;
                break;
            case "DepositContractType":
            case 23:
                message.Type = 23;
                break;
            case "ITOTriggerContractType":
            case 24:
                message.Type = 24;
                break;
            case "SmartContractType":
            case 63:
                message.Type = 63;
                break;
            }
            if (object.Parameter != null) {
                if (typeof object.Parameter !== "object")
                    throw TypeError(".proto.TXContract.Parameter: object expected");
                message.Parameter = $root.google.protobuf.Any.fromObject(object.Parameter);
            }
            return message;
        };

        /**
         * Creates a plain object from a TXContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.TXContract
         * @static
         * @param {proto.TXContract} message TXContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TXContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.Type = options.enums === String ? "TransferContractType" : 0;
                object.Parameter = null;
            }
            if (message.Type != null && message.hasOwnProperty("Type"))
                object.Type = options.enums === String ? $root.proto.TXContract.ContractType[message.Type] === undefined ? message.Type : $root.proto.TXContract.ContractType[message.Type] : message.Type;
            if (message.Parameter != null && message.hasOwnProperty("Parameter"))
                object.Parameter = $root.google.protobuf.Any.toObject(message.Parameter, options);
            return object;
        };

        /**
         * Converts this TXContract to JSON.
         * @function toJSON
         * @memberof proto.TXContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TXContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TXContract
         * @function getTypeUrl
         * @memberof proto.TXContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TXContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.TXContract";
        };

        /**
         * ContractType enum.
         * @name proto.TXContract.ContractType
         * @enum {number}
         * @property {number} TransferContractType=0 TransferContractType value
         * @property {number} CreateAssetContractType=1 CreateAssetContractType value
         * @property {number} CreateValidatorContractType=2 CreateValidatorContractType value
         * @property {number} ValidatorConfigContractType=3 ValidatorConfigContractType value
         * @property {number} FreezeContractType=4 FreezeContractType value
         * @property {number} UnfreezeContractType=5 UnfreezeContractType value
         * @property {number} DelegateContractType=6 DelegateContractType value
         * @property {number} UndelegateContractType=7 UndelegateContractType value
         * @property {number} WithdrawContractType=8 WithdrawContractType value
         * @property {number} ClaimContractType=9 ClaimContractType value
         * @property {number} UnjailContractType=10 UnjailContractType value
         * @property {number} AssetTriggerContractType=11 AssetTriggerContractType value
         * @property {number} SetAccountNameContractType=12 SetAccountNameContractType value
         * @property {number} ProposalContractType=13 ProposalContractType value
         * @property {number} VoteContractType=14 VoteContractType value
         * @property {number} ConfigITOContractType=15 ConfigITOContractType value
         * @property {number} SetITOPricesContractType=16 SetITOPricesContractType value
         * @property {number} BuyContractType=17 BuyContractType value
         * @property {number} SellContractType=18 SellContractType value
         * @property {number} CancelMarketOrderContractType=19 CancelMarketOrderContractType value
         * @property {number} CreateMarketplaceContractType=20 CreateMarketplaceContractType value
         * @property {number} ConfigMarketplaceContractType=21 ConfigMarketplaceContractType value
         * @property {number} UpdateAccountPermissionContractType=22 UpdateAccountPermissionContractType value
         * @property {number} DepositContractType=23 DepositContractType value
         * @property {number} ITOTriggerContractType=24 ITOTriggerContractType value
         * @property {number} SmartContractType=63 SmartContractType value
         */
        TXContract.ContractType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "TransferContractType"] = 0;
            values[valuesById[1] = "CreateAssetContractType"] = 1;
            values[valuesById[2] = "CreateValidatorContractType"] = 2;
            values[valuesById[3] = "ValidatorConfigContractType"] = 3;
            values[valuesById[4] = "FreezeContractType"] = 4;
            values[valuesById[5] = "UnfreezeContractType"] = 5;
            values[valuesById[6] = "DelegateContractType"] = 6;
            values[valuesById[7] = "UndelegateContractType"] = 7;
            values[valuesById[8] = "WithdrawContractType"] = 8;
            values[valuesById[9] = "ClaimContractType"] = 9;
            values[valuesById[10] = "UnjailContractType"] = 10;
            values[valuesById[11] = "AssetTriggerContractType"] = 11;
            values[valuesById[12] = "SetAccountNameContractType"] = 12;
            values[valuesById[13] = "ProposalContractType"] = 13;
            values[valuesById[14] = "VoteContractType"] = 14;
            values[valuesById[15] = "ConfigITOContractType"] = 15;
            values[valuesById[16] = "SetITOPricesContractType"] = 16;
            values[valuesById[17] = "BuyContractType"] = 17;
            values[valuesById[18] = "SellContractType"] = 18;
            values[valuesById[19] = "CancelMarketOrderContractType"] = 19;
            values[valuesById[20] = "CreateMarketplaceContractType"] = 20;
            values[valuesById[21] = "ConfigMarketplaceContractType"] = 21;
            values[valuesById[22] = "UpdateAccountPermissionContractType"] = 22;
            values[valuesById[23] = "DepositContractType"] = 23;
            values[valuesById[24] = "ITOTriggerContractType"] = 24;
            values[valuesById[63] = "SmartContractType"] = 63;
            return values;
        })();

        return TXContract;
    })();

    proto.Transaction = (function() {

        /**
         * Properties of a Transaction.
         * @memberof proto
         * @interface ITransaction
         * @property {proto.Transaction.IRaw|null} [RawData] Transaction RawData
         * @property {Array.<Uint8Array>|null} [Signature] Transaction Signature
         * @property {proto.Transaction.TXResult|null} [Result] Transaction Result
         * @property {proto.Transaction.TXResultCode|null} [ResultCode] Transaction ResultCode
         * @property {Array.<proto.Transaction.IReceipt>|null} [Receipts] Transaction Receipts
         * @property {number|null} [Block] Transaction Block
         * @property {number|null} [GasLimit] Transaction GasLimit
         * @property {number|null} [GasMultiplier] Transaction GasMultiplier
         */

        /**
         * Constructs a new Transaction.
         * @memberof proto
         * @classdesc Represents a Transaction.
         * @implements ITransaction
         * @constructor
         * @param {proto.ITransaction=} [properties] Properties to set
         */
        function Transaction(properties) {
            this.Signature = [];
            this.Receipts = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transaction RawData.
         * @member {proto.Transaction.IRaw|null|undefined} RawData
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.RawData = null;

        /**
         * Transaction Signature.
         * @member {Array.<Uint8Array>} Signature
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Signature = $util.emptyArray;

        /**
         * Transaction Result.
         * @member {proto.Transaction.TXResult} Result
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Result = 0;

        /**
         * Transaction ResultCode.
         * @member {proto.Transaction.TXResultCode} ResultCode
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.ResultCode = 0;

        /**
         * Transaction Receipts.
         * @member {Array.<proto.Transaction.IReceipt>} Receipts
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Receipts = $util.emptyArray;

        /**
         * Transaction Block.
         * @member {number} Block
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Block = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction GasLimit.
         * @member {number} GasLimit
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.GasLimit = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction GasMultiplier.
         * @member {number} GasMultiplier
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.GasMultiplier = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @function create
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction=} [properties] Properties to set
         * @returns {proto.Transaction} Transaction instance
         */
        Transaction.create = function create(properties) {
            return new Transaction(properties);
        };

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @function encode
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.RawData != null && Object.hasOwnProperty.call(message, "RawData"))
                $root.proto.Transaction.Raw.encode(message.RawData, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.Signature != null && message.Signature.length)
                for (let i = 0; i < message.Signature.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.Signature[i]);
            if (message.Result != null && Object.hasOwnProperty.call(message, "Result"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.Result);
            if (message.ResultCode != null && Object.hasOwnProperty.call(message, "ResultCode"))
                writer.uint32(/* id 4, wireType 0 =*/32).int32(message.ResultCode);
            if (message.Receipts != null && message.Receipts.length)
                for (let i = 0; i < message.Receipts.length; ++i)
                    $root.proto.Transaction.Receipt.encode(message.Receipts[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.Block != null && Object.hasOwnProperty.call(message, "Block"))
                writer.uint32(/* id 6, wireType 0 =*/48).uint64(message.Block);
            if (message.GasLimit != null && Object.hasOwnProperty.call(message, "GasLimit"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.GasLimit);
            if (message.GasMultiplier != null && Object.hasOwnProperty.call(message, "GasMultiplier"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.GasMultiplier);
            return writer;
        };

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @function decode
         * @memberof proto.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Transaction();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.RawData = $root.proto.Transaction.Raw.decode(reader, reader.uint32());
                        break;
                    }
                case 2: {
                        if (!(message.Signature && message.Signature.length))
                            message.Signature = [];
                        message.Signature.push(reader.bytes());
                        break;
                    }
                case 3: {
                        message.Result = reader.int32();
                        break;
                    }
                case 4: {
                        message.ResultCode = reader.int32();
                        break;
                    }
                case 5: {
                        if (!(message.Receipts && message.Receipts.length))
                            message.Receipts = [];
                        message.Receipts.push($root.proto.Transaction.Receipt.decode(reader, reader.uint32()));
                        break;
                    }
                case 6: {
                        message.Block = reader.uint64();
                        break;
                    }
                case 7: {
                        message.GasLimit = reader.uint64();
                        break;
                    }
                case 8: {
                        message.GasMultiplier = reader.uint64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transaction message.
         * @function verify
         * @memberof proto.Transaction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transaction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.RawData != null && message.hasOwnProperty("RawData")) {
                let error = $root.proto.Transaction.Raw.verify(message.RawData);
                if (error)
                    return "RawData." + error;
            }
            if (message.Signature != null && message.hasOwnProperty("Signature")) {
                if (!Array.isArray(message.Signature))
                    return "Signature: array expected";
                for (let i = 0; i < message.Signature.length; ++i)
                    if (!(message.Signature[i] && typeof message.Signature[i].length === "number" || $util.isString(message.Signature[i])))
                        return "Signature: buffer[] expected";
            }
            if (message.Result != null && message.hasOwnProperty("Result"))
                switch (message.Result) {
                default:
                    return "Result: enum value expected";
                case 0:
                case 1:
                    break;
                }
            if (message.ResultCode != null && message.hasOwnProperty("ResultCode"))
                switch (message.ResultCode) {
                default:
                    return "ResultCode: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 21:
                case 22:
                case 23:
                case 24:
                case 25:
                case 26:
                case 27:
                case 28:
                case 29:
                case 30:
                case 31:
                case 32:
                case 33:
                case 34:
                case 35:
                case 36:
                case 37:
                case 38:
                case 39:
                case 40:
                case 41:
                case 42:
                case 43:
                case 44:
                case 45:
                case 46:
                case 47:
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54:
                case 55:
                case 56:
                case 57:
                case 58:
                case 59:
                case 60:
                case 61:
                case 62:
                case 63:
                case 64:
                case 65:
                case 99:
                    break;
                }
            if (message.Receipts != null && message.hasOwnProperty("Receipts")) {
                if (!Array.isArray(message.Receipts))
                    return "Receipts: array expected";
                for (let i = 0; i < message.Receipts.length; ++i) {
                    let error = $root.proto.Transaction.Receipt.verify(message.Receipts[i]);
                    if (error)
                        return "Receipts." + error;
                }
            }
            if (message.Block != null && message.hasOwnProperty("Block"))
                if (!$util.isInteger(message.Block) && !(message.Block && $util.isInteger(message.Block.low) && $util.isInteger(message.Block.high)))
                    return "Block: integer|Long expected";
            if (message.GasLimit != null && message.hasOwnProperty("GasLimit"))
                if (!$util.isInteger(message.GasLimit) && !(message.GasLimit && $util.isInteger(message.GasLimit.low) && $util.isInteger(message.GasLimit.high)))
                    return "GasLimit: integer|Long expected";
            if (message.GasMultiplier != null && message.hasOwnProperty("GasMultiplier"))
                if (!$util.isInteger(message.GasMultiplier) && !(message.GasMultiplier && $util.isInteger(message.GasMultiplier.low) && $util.isInteger(message.GasMultiplier.high)))
                    return "GasMultiplier: integer|Long expected";
            return null;
        };

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.Transaction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.Transaction} Transaction
         */
        Transaction.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.Transaction)
                return object;
            let message = new $root.proto.Transaction();
            if (object.RawData != null) {
                if (typeof object.RawData !== "object")
                    throw TypeError(".proto.Transaction.RawData: object expected");
                message.RawData = $root.proto.Transaction.Raw.fromObject(object.RawData);
            }
            if (object.Signature) {
                if (!Array.isArray(object.Signature))
                    throw TypeError(".proto.Transaction.Signature: array expected");
                message.Signature = [];
                for (let i = 0; i < object.Signature.length; ++i)
                    if (typeof object.Signature[i] === "string")
                        $util.base64.decode(object.Signature[i], message.Signature[i] = $util.newBuffer($util.base64.length(object.Signature[i])), 0);
                    else if (object.Signature[i].length >= 0)
                        message.Signature[i] = object.Signature[i];
            }
            switch (object.Result) {
            default:
                if (typeof object.Result === "number") {
                    message.Result = object.Result;
                    break;
                }
                break;
            case "SUCCESS":
            case 0:
                message.Result = 0;
                break;
            case "FAILED":
            case 1:
                message.Result = 1;
                break;
            }
            switch (object.ResultCode) {
            default:
                if (typeof object.ResultCode === "number") {
                    message.ResultCode = object.ResultCode;
                    break;
                }
                break;
            case "Ok":
            case 0:
                message.ResultCode = 0;
                break;
            case "OutOfFunds":
            case 1:
                message.ResultCode = 1;
                break;
            case "AccountError":
            case 2:
                message.ResultCode = 2;
                break;
            case "AssetError":
            case 3:
                message.ResultCode = 3;
                break;
            case "ContractInvalid":
            case 4:
                message.ResultCode = 4;
                break;
            case "ContractNotFound":
            case 5:
                message.ResultCode = 5;
                break;
            case "FeeInvalid":
            case 6:
                message.ResultCode = 6;
                break;
            case "ParameterInvalid":
            case 7:
                message.ResultCode = 7;
                break;
            case "APRInvalid":
            case 8:
                message.ResultCode = 8;
                break;
            case "AssetIDInvalid":
            case 9:
                message.ResultCode = 9;
                break;
            case "AssetTypeInvalid":
            case 10:
                message.ResultCode = 10;
                break;
            case "AssetCantBeMinted":
            case 11:
                message.ResultCode = 11;
                break;
            case "AssetCantBeBurned":
            case 12:
                message.ResultCode = 12;
                break;
            case "AssetCantBePaused":
            case 13:
                message.ResultCode = 13;
                break;
            case "AssetCantBeDelegated":
            case 14:
                message.ResultCode = 14;
                break;
            case "AssetOwnerCantBeChanged":
            case 15:
                message.ResultCode = 15;
                break;
            case "AccountNotOwner":
            case 16:
                message.ResultCode = 16;
                break;
            case "CommissionTooHigh":
            case 17:
                message.ResultCode = 17;
                break;
            case "DelegationAmountInvalid":
            case 18:
                message.ResultCode = 18;
                break;
            case "ProposalNotActive":
            case 19:
                message.ResultCode = 19;
                break;
            case "ValueInvalid":
            case 20:
                message.ResultCode = 20;
                break;
            case "AmountInvalid":
            case 21:
                message.ResultCode = 21;
                break;
            case "BucketIDInvalid":
            case 22:
                message.ResultCode = 22;
                break;
            case "KeyConflict":
            case 23:
                message.ResultCode = 23;
                break;
            case "MaxDelegationAmount":
            case 24:
                message.ResultCode = 24;
                break;
            case "InvalidPeerKey":
            case 25:
                message.ResultCode = 25;
                break;
            case "MinKFIStakedUnreached":
            case 26:
                message.ResultCode = 26;
                break;
            case "MaxSupplyExceeded":
            case 27:
                message.ResultCode = 27;
                break;
            case "SaveAccountError":
            case 28:
                message.ResultCode = 28;
                break;
            case "LoadAccountError":
            case 29:
                message.ResultCode = 29;
                break;
            case "SameAccountError":
            case 30:
                message.ResultCode = 30;
                break;
            case "AssetPaused":
            case 31:
                message.ResultCode = 31;
                break;
            case "DeletegateError":
            case 32:
                message.ResultCode = 32;
                break;
            case "WithdrawNotAvailable":
            case 33:
                message.ResultCode = 33;
                break;
            case "ErrOverflow":
            case 34:
                message.ResultCode = 34;
                break;
            case "SetStakingErr":
            case 35:
                message.ResultCode = 35;
                break;
            case "SetMarketOrderErr":
            case 36:
                message.ResultCode = 36;
                break;
            case "BalanceError":
            case 37:
                message.ResultCode = 37;
                break;
            case "KAPPError":
            case 38:
                message.ResultCode = 38;
                break;
            case "UnfreezeError":
            case 39:
                message.ResultCode = 39;
                break;
            case "UndelegateError":
            case 40:
                message.ResultCode = 40;
                break;
            case "WithdrawError":
            case 41:
                message.ResultCode = 41;
                break;
            case "ClaimError":
            case 42:
                message.ResultCode = 42;
                break;
            case "BucketsExceeded":
            case 43:
                message.ResultCode = 43;
                break;
            case "AssetCantBeWiped":
            case 44:
                message.ResultCode = 44;
                break;
            case "AssetCantAddRoles":
            case 45:
                message.ResultCode = 45;
                break;
            case "FreezeError":
            case 46:
                message.ResultCode = 46;
                break;
            case "ITONotActive":
            case 47:
                message.ResultCode = 47;
                break;
            case "NFTMintStopped":
            case 48:
                message.ResultCode = 48;
                break;
            case "RoyaltiesChangeStopped":
            case 49:
                message.ResultCode = 49;
                break;
            case "ITOKAPPError":
            case 50:
                message.ResultCode = 50;
                break;
            case "ITOWhiteListError":
            case 51:
                message.ResultCode = 51;
                break;
            case "NFTMetadataChangeStopped":
            case 52:
                message.ResultCode = 52;
                break;
            case "AlreadyExists":
            case 53:
                message.ResultCode = 53;
                break;
            case "IteratorLimitReached":
            case 54:
                message.ResultCode = 54;
                break;
            case "VMFunctionNotFound":
            case 55:
                message.ResultCode = 55;
                break;
            case "VMFunctionWrongSignature":
            case 56:
                message.ResultCode = 56;
                break;
            case "VMUserError":
            case 57:
                message.ResultCode = 57;
                break;
            case "VMOutOfGas":
            case 58:
                message.ResultCode = 58;
                break;
            case "VMAccountCollision":
            case 59:
                message.ResultCode = 59;
                break;
            case "VMCallStackOverFlow":
            case 60:
                message.ResultCode = 60;
                break;
            case "VMExecutionPanicked":
            case 61:
                message.ResultCode = 61;
                break;
            case "VMExecutionFailed":
            case 62:
                message.ResultCode = 62;
                break;
            case "VMUpgradeFailed":
            case 63:
                message.ResultCode = 63;
                break;
            case "VMSimulateFailed":
            case 64:
                message.ResultCode = 64;
                break;
            case "KDATransferNotAllowed":
            case 65:
                message.ResultCode = 65;
                break;
            case "Fail":
            case 99:
                message.ResultCode = 99;
                break;
            }
            if (object.Receipts) {
                if (!Array.isArray(object.Receipts))
                    throw TypeError(".proto.Transaction.Receipts: array expected");
                message.Receipts = [];
                for (let i = 0; i < object.Receipts.length; ++i) {
                    if (typeof object.Receipts[i] !== "object")
                        throw TypeError(".proto.Transaction.Receipts: object expected");
                    message.Receipts[i] = $root.proto.Transaction.Receipt.fromObject(object.Receipts[i]);
                }
            }
            if (object.Block != null)
                if ($util.Long)
                    (message.Block = $util.Long.fromValue(object.Block)).unsigned = true;
                else if (typeof object.Block === "string")
                    message.Block = parseInt(object.Block, 10);
                else if (typeof object.Block === "number")
                    message.Block = object.Block;
                else if (typeof object.Block === "object")
                    message.Block = new $util.LongBits(object.Block.low >>> 0, object.Block.high >>> 0).toNumber(true);
            if (object.GasLimit != null)
                if ($util.Long)
                    (message.GasLimit = $util.Long.fromValue(object.GasLimit)).unsigned = true;
                else if (typeof object.GasLimit === "string")
                    message.GasLimit = parseInt(object.GasLimit, 10);
                else if (typeof object.GasLimit === "number")
                    message.GasLimit = object.GasLimit;
                else if (typeof object.GasLimit === "object")
                    message.GasLimit = new $util.LongBits(object.GasLimit.low >>> 0, object.GasLimit.high >>> 0).toNumber(true);
            if (object.GasMultiplier != null)
                if ($util.Long)
                    (message.GasMultiplier = $util.Long.fromValue(object.GasMultiplier)).unsigned = true;
                else if (typeof object.GasMultiplier === "string")
                    message.GasMultiplier = parseInt(object.GasMultiplier, 10);
                else if (typeof object.GasMultiplier === "number")
                    message.GasMultiplier = object.GasMultiplier;
                else if (typeof object.GasMultiplier === "object")
                    message.GasMultiplier = new $util.LongBits(object.GasMultiplier.low >>> 0, object.GasMultiplier.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.Transaction
         * @static
         * @param {proto.Transaction} message Transaction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transaction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.Signature = [];
                object.Receipts = [];
            }
            if (options.defaults) {
                object.RawData = null;
                object.Result = options.enums === String ? "SUCCESS" : 0;
                object.ResultCode = options.enums === String ? "Ok" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.Block = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.Block = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.GasLimit = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.GasLimit = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.GasMultiplier = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.GasMultiplier = options.longs === String ? "0" : 0;
            }
            if (message.RawData != null && message.hasOwnProperty("RawData"))
                object.RawData = $root.proto.Transaction.Raw.toObject(message.RawData, options);
            if (message.Signature && message.Signature.length) {
                object.Signature = [];
                for (let j = 0; j < message.Signature.length; ++j)
                    object.Signature[j] = options.bytes === String ? $util.base64.encode(message.Signature[j], 0, message.Signature[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.Signature[j]) : message.Signature[j];
            }
            if (message.Result != null && message.hasOwnProperty("Result"))
                object.Result = options.enums === String ? $root.proto.Transaction.TXResult[message.Result] === undefined ? message.Result : $root.proto.Transaction.TXResult[message.Result] : message.Result;
            if (message.ResultCode != null && message.hasOwnProperty("ResultCode"))
                object.ResultCode = options.enums === String ? $root.proto.Transaction.TXResultCode[message.ResultCode] === undefined ? message.ResultCode : $root.proto.Transaction.TXResultCode[message.ResultCode] : message.ResultCode;
            if (message.Receipts && message.Receipts.length) {
                object.Receipts = [];
                for (let j = 0; j < message.Receipts.length; ++j)
                    object.Receipts[j] = $root.proto.Transaction.Receipt.toObject(message.Receipts[j], options);
            }
            if (message.Block != null && message.hasOwnProperty("Block"))
                if (typeof message.Block === "number")
                    object.Block = options.longs === String ? String(message.Block) : message.Block;
                else
                    object.Block = options.longs === String ? $util.Long.prototype.toString.call(message.Block) : options.longs === Number ? new $util.LongBits(message.Block.low >>> 0, message.Block.high >>> 0).toNumber(true) : message.Block;
            if (message.GasLimit != null && message.hasOwnProperty("GasLimit"))
                if (typeof message.GasLimit === "number")
                    object.GasLimit = options.longs === String ? String(message.GasLimit) : message.GasLimit;
                else
                    object.GasLimit = options.longs === String ? $util.Long.prototype.toString.call(message.GasLimit) : options.longs === Number ? new $util.LongBits(message.GasLimit.low >>> 0, message.GasLimit.high >>> 0).toNumber(true) : message.GasLimit;
            if (message.GasMultiplier != null && message.hasOwnProperty("GasMultiplier"))
                if (typeof message.GasMultiplier === "number")
                    object.GasMultiplier = options.longs === String ? String(message.GasMultiplier) : message.GasMultiplier;
                else
                    object.GasMultiplier = options.longs === String ? $util.Long.prototype.toString.call(message.GasMultiplier) : options.longs === Number ? new $util.LongBits(message.GasMultiplier.low >>> 0, message.GasMultiplier.high >>> 0).toNumber(true) : message.GasMultiplier;
            return object;
        };

        /**
         * Converts this Transaction to JSON.
         * @function toJSON
         * @memberof proto.Transaction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transaction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Transaction
         * @function getTypeUrl
         * @memberof proto.Transaction
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Transaction.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.Transaction";
        };

        /**
         * TXResult enum.
         * @name proto.Transaction.TXResult
         * @enum {number}
         * @property {number} SUCCESS=0 SUCCESS value
         * @property {number} FAILED=1 FAILED value
         */
        Transaction.TXResult = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "SUCCESS"] = 0;
            values[valuesById[1] = "FAILED"] = 1;
            return values;
        })();

        /**
         * TXResultCode enum.
         * @name proto.Transaction.TXResultCode
         * @enum {number}
         * @property {number} Ok=0 Ok value
         * @property {number} OutOfFunds=1 OutOfFunds value
         * @property {number} AccountError=2 AccountError value
         * @property {number} AssetError=3 AssetError value
         * @property {number} ContractInvalid=4 ContractInvalid value
         * @property {number} ContractNotFound=5 ContractNotFound value
         * @property {number} FeeInvalid=6 FeeInvalid value
         * @property {number} ParameterInvalid=7 ParameterInvalid value
         * @property {number} APRInvalid=8 APRInvalid value
         * @property {number} AssetIDInvalid=9 AssetIDInvalid value
         * @property {number} AssetTypeInvalid=10 AssetTypeInvalid value
         * @property {number} AssetCantBeMinted=11 AssetCantBeMinted value
         * @property {number} AssetCantBeBurned=12 AssetCantBeBurned value
         * @property {number} AssetCantBePaused=13 AssetCantBePaused value
         * @property {number} AssetCantBeDelegated=14 AssetCantBeDelegated value
         * @property {number} AssetOwnerCantBeChanged=15 AssetOwnerCantBeChanged value
         * @property {number} AccountNotOwner=16 AccountNotOwner value
         * @property {number} CommissionTooHigh=17 CommissionTooHigh value
         * @property {number} DelegationAmountInvalid=18 DelegationAmountInvalid value
         * @property {number} ProposalNotActive=19 ProposalNotActive value
         * @property {number} ValueInvalid=20 ValueInvalid value
         * @property {number} AmountInvalid=21 AmountInvalid value
         * @property {number} BucketIDInvalid=22 BucketIDInvalid value
         * @property {number} KeyConflict=23 KeyConflict value
         * @property {number} MaxDelegationAmount=24 MaxDelegationAmount value
         * @property {number} InvalidPeerKey=25 InvalidPeerKey value
         * @property {number} MinKFIStakedUnreached=26 MinKFIStakedUnreached value
         * @property {number} MaxSupplyExceeded=27 MaxSupplyExceeded value
         * @property {number} SaveAccountError=28 SaveAccountError value
         * @property {number} LoadAccountError=29 LoadAccountError value
         * @property {number} SameAccountError=30 SameAccountError value
         * @property {number} AssetPaused=31 AssetPaused value
         * @property {number} DeletegateError=32 DeletegateError value
         * @property {number} WithdrawNotAvailable=33 WithdrawNotAvailable value
         * @property {number} ErrOverflow=34 ErrOverflow value
         * @property {number} SetStakingErr=35 SetStakingErr value
         * @property {number} SetMarketOrderErr=36 SetMarketOrderErr value
         * @property {number} BalanceError=37 BalanceError value
         * @property {number} KAPPError=38 KAPPError value
         * @property {number} UnfreezeError=39 UnfreezeError value
         * @property {number} UndelegateError=40 UndelegateError value
         * @property {number} WithdrawError=41 WithdrawError value
         * @property {number} ClaimError=42 ClaimError value
         * @property {number} BucketsExceeded=43 BucketsExceeded value
         * @property {number} AssetCantBeWiped=44 AssetCantBeWiped value
         * @property {number} AssetCantAddRoles=45 AssetCantAddRoles value
         * @property {number} FreezeError=46 FreezeError value
         * @property {number} ITONotActive=47 ITONotActive value
         * @property {number} NFTMintStopped=48 NFTMintStopped value
         * @property {number} RoyaltiesChangeStopped=49 RoyaltiesChangeStopped value
         * @property {number} ITOKAPPError=50 ITOKAPPError value
         * @property {number} ITOWhiteListError=51 ITOWhiteListError value
         * @property {number} NFTMetadataChangeStopped=52 NFTMetadataChangeStopped value
         * @property {number} AlreadyExists=53 AlreadyExists value
         * @property {number} IteratorLimitReached=54 IteratorLimitReached value
         * @property {number} VMFunctionNotFound=55 VMFunctionNotFound value
         * @property {number} VMFunctionWrongSignature=56 VMFunctionWrongSignature value
         * @property {number} VMUserError=57 VMUserError value
         * @property {number} VMOutOfGas=58 VMOutOfGas value
         * @property {number} VMAccountCollision=59 VMAccountCollision value
         * @property {number} VMCallStackOverFlow=60 VMCallStackOverFlow value
         * @property {number} VMExecutionPanicked=61 VMExecutionPanicked value
         * @property {number} VMExecutionFailed=62 VMExecutionFailed value
         * @property {number} VMUpgradeFailed=63 VMUpgradeFailed value
         * @property {number} VMSimulateFailed=64 VMSimulateFailed value
         * @property {number} KDATransferNotAllowed=65 KDATransferNotAllowed value
         * @property {number} Fail=99 Fail value
         */
        Transaction.TXResultCode = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "Ok"] = 0;
            values[valuesById[1] = "OutOfFunds"] = 1;
            values[valuesById[2] = "AccountError"] = 2;
            values[valuesById[3] = "AssetError"] = 3;
            values[valuesById[4] = "ContractInvalid"] = 4;
            values[valuesById[5] = "ContractNotFound"] = 5;
            values[valuesById[6] = "FeeInvalid"] = 6;
            values[valuesById[7] = "ParameterInvalid"] = 7;
            values[valuesById[8] = "APRInvalid"] = 8;
            values[valuesById[9] = "AssetIDInvalid"] = 9;
            values[valuesById[10] = "AssetTypeInvalid"] = 10;
            values[valuesById[11] = "AssetCantBeMinted"] = 11;
            values[valuesById[12] = "AssetCantBeBurned"] = 12;
            values[valuesById[13] = "AssetCantBePaused"] = 13;
            values[valuesById[14] = "AssetCantBeDelegated"] = 14;
            values[valuesById[15] = "AssetOwnerCantBeChanged"] = 15;
            values[valuesById[16] = "AccountNotOwner"] = 16;
            values[valuesById[17] = "CommissionTooHigh"] = 17;
            values[valuesById[18] = "DelegationAmountInvalid"] = 18;
            values[valuesById[19] = "ProposalNotActive"] = 19;
            values[valuesById[20] = "ValueInvalid"] = 20;
            values[valuesById[21] = "AmountInvalid"] = 21;
            values[valuesById[22] = "BucketIDInvalid"] = 22;
            values[valuesById[23] = "KeyConflict"] = 23;
            values[valuesById[24] = "MaxDelegationAmount"] = 24;
            values[valuesById[25] = "InvalidPeerKey"] = 25;
            values[valuesById[26] = "MinKFIStakedUnreached"] = 26;
            values[valuesById[27] = "MaxSupplyExceeded"] = 27;
            values[valuesById[28] = "SaveAccountError"] = 28;
            values[valuesById[29] = "LoadAccountError"] = 29;
            values[valuesById[30] = "SameAccountError"] = 30;
            values[valuesById[31] = "AssetPaused"] = 31;
            values[valuesById[32] = "DeletegateError"] = 32;
            values[valuesById[33] = "WithdrawNotAvailable"] = 33;
            values[valuesById[34] = "ErrOverflow"] = 34;
            values[valuesById[35] = "SetStakingErr"] = 35;
            values[valuesById[36] = "SetMarketOrderErr"] = 36;
            values[valuesById[37] = "BalanceError"] = 37;
            values[valuesById[38] = "KAPPError"] = 38;
            values[valuesById[39] = "UnfreezeError"] = 39;
            values[valuesById[40] = "UndelegateError"] = 40;
            values[valuesById[41] = "WithdrawError"] = 41;
            values[valuesById[42] = "ClaimError"] = 42;
            values[valuesById[43] = "BucketsExceeded"] = 43;
            values[valuesById[44] = "AssetCantBeWiped"] = 44;
            values[valuesById[45] = "AssetCantAddRoles"] = 45;
            values[valuesById[46] = "FreezeError"] = 46;
            values[valuesById[47] = "ITONotActive"] = 47;
            values[valuesById[48] = "NFTMintStopped"] = 48;
            values[valuesById[49] = "RoyaltiesChangeStopped"] = 49;
            values[valuesById[50] = "ITOKAPPError"] = 50;
            values[valuesById[51] = "ITOWhiteListError"] = 51;
            values[valuesById[52] = "NFTMetadataChangeStopped"] = 52;
            values[valuesById[53] = "AlreadyExists"] = 53;
            values[valuesById[54] = "IteratorLimitReached"] = 54;
            values[valuesById[55] = "VMFunctionNotFound"] = 55;
            values[valuesById[56] = "VMFunctionWrongSignature"] = 56;
            values[valuesById[57] = "VMUserError"] = 57;
            values[valuesById[58] = "VMOutOfGas"] = 58;
            values[valuesById[59] = "VMAccountCollision"] = 59;
            values[valuesById[60] = "VMCallStackOverFlow"] = 60;
            values[valuesById[61] = "VMExecutionPanicked"] = 61;
            values[valuesById[62] = "VMExecutionFailed"] = 62;
            values[valuesById[63] = "VMUpgradeFailed"] = 63;
            values[valuesById[64] = "VMSimulateFailed"] = 64;
            values[valuesById[65] = "KDATransferNotAllowed"] = 65;
            values[valuesById[99] = "Fail"] = 99;
            return values;
        })();

        Transaction.KDAFee = (function() {

            /**
             * Properties of a KDAFee.
             * @memberof proto.Transaction
             * @interface IKDAFee
             * @property {Uint8Array|null} [KDA] KDAFee KDA
             * @property {number|null} [Amount] KDAFee Amount
             */

            /**
             * Constructs a new KDAFee.
             * @memberof proto.Transaction
             * @classdesc Represents a KDAFee.
             * @implements IKDAFee
             * @constructor
             * @param {proto.Transaction.IKDAFee=} [properties] Properties to set
             */
            function KDAFee(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * KDAFee KDA.
             * @member {Uint8Array} KDA
             * @memberof proto.Transaction.KDAFee
             * @instance
             */
            KDAFee.prototype.KDA = $util.newBuffer([]);

            /**
             * KDAFee Amount.
             * @member {number} Amount
             * @memberof proto.Transaction.KDAFee
             * @instance
             */
            KDAFee.prototype.Amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new KDAFee instance using the specified properties.
             * @function create
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {proto.Transaction.IKDAFee=} [properties] Properties to set
             * @returns {proto.Transaction.KDAFee} KDAFee instance
             */
            KDAFee.create = function create(properties) {
                return new KDAFee(properties);
            };

            /**
             * Encodes the specified KDAFee message. Does not implicitly {@link proto.Transaction.KDAFee.verify|verify} messages.
             * @function encode
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {proto.Transaction.IKDAFee} message KDAFee message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KDAFee.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.KDA != null && Object.hasOwnProperty.call(message, "KDA"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.KDA);
                if (message.Amount != null && Object.hasOwnProperty.call(message, "Amount"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.Amount);
                return writer;
            };

            /**
             * Encodes the specified KDAFee message, length delimited. Does not implicitly {@link proto.Transaction.KDAFee.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {proto.Transaction.IKDAFee} message KDAFee message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KDAFee.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a KDAFee message from the specified reader or buffer.
             * @function decode
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.Transaction.KDAFee} KDAFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KDAFee.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Transaction.KDAFee();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.KDA = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.Amount = reader.int64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a KDAFee message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.Transaction.KDAFee} KDAFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KDAFee.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KDAFee message.
             * @function verify
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KDAFee.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.KDA != null && message.hasOwnProperty("KDA"))
                    if (!(message.KDA && typeof message.KDA.length === "number" || $util.isString(message.KDA)))
                        return "KDA: buffer expected";
                if (message.Amount != null && message.hasOwnProperty("Amount"))
                    if (!$util.isInteger(message.Amount) && !(message.Amount && $util.isInteger(message.Amount.low) && $util.isInteger(message.Amount.high)))
                        return "Amount: integer|Long expected";
                return null;
            };

            /**
             * Creates a KDAFee message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.Transaction.KDAFee} KDAFee
             */
            KDAFee.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.Transaction.KDAFee)
                    return object;
                let message = new $root.proto.Transaction.KDAFee();
                if (object.KDA != null)
                    if (typeof object.KDA === "string")
                        $util.base64.decode(object.KDA, message.KDA = $util.newBuffer($util.base64.length(object.KDA)), 0);
                    else if (object.KDA.length >= 0)
                        message.KDA = object.KDA;
                if (object.Amount != null)
                    if ($util.Long)
                        (message.Amount = $util.Long.fromValue(object.Amount)).unsigned = false;
                    else if (typeof object.Amount === "string")
                        message.Amount = parseInt(object.Amount, 10);
                    else if (typeof object.Amount === "number")
                        message.Amount = object.Amount;
                    else if (typeof object.Amount === "object")
                        message.Amount = new $util.LongBits(object.Amount.low >>> 0, object.Amount.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a KDAFee message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {proto.Transaction.KDAFee} message KDAFee
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KDAFee.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.KDA = "";
                    else {
                        object.KDA = [];
                        if (options.bytes !== Array)
                            object.KDA = $util.newBuffer(object.KDA);
                    }
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.Amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.Amount = options.longs === String ? "0" : 0;
                }
                if (message.KDA != null && message.hasOwnProperty("KDA"))
                    object.KDA = options.bytes === String ? $util.base64.encode(message.KDA, 0, message.KDA.length) : options.bytes === Array ? Array.prototype.slice.call(message.KDA) : message.KDA;
                if (message.Amount != null && message.hasOwnProperty("Amount"))
                    if (typeof message.Amount === "number")
                        object.Amount = options.longs === String ? String(message.Amount) : message.Amount;
                    else
                        object.Amount = options.longs === String ? $util.Long.prototype.toString.call(message.Amount) : options.longs === Number ? new $util.LongBits(message.Amount.low >>> 0, message.Amount.high >>> 0).toNumber() : message.Amount;
                return object;
            };

            /**
             * Converts this KDAFee to JSON.
             * @function toJSON
             * @memberof proto.Transaction.KDAFee
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KDAFee.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for KDAFee
             * @function getTypeUrl
             * @memberof proto.Transaction.KDAFee
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            KDAFee.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.Transaction.KDAFee";
            };

            return KDAFee;
        })();

        Transaction.Raw = (function() {

            /**
             * Properties of a Raw.
             * @memberof proto.Transaction
             * @interface IRaw
             * @property {number|null} [Nonce] Raw Nonce
             * @property {Uint8Array|null} [Sender] Raw Sender
             * @property {Array.<proto.ITXContract>|null} [Contract] Raw Contract
             * @property {number|null} [PermissionID] Raw PermissionID
             * @property {Array.<Uint8Array>|null} [Data] Raw Data
             * @property {number|null} [KAppFee] Raw KAppFee
             * @property {number|null} [BandwidthFee] Raw BandwidthFee
             * @property {number|null} [Version] Raw Version
             * @property {Uint8Array|null} [ChainID] Raw ChainID
             * @property {proto.Transaction.IKDAFee|null} [KDAFee] Raw KDAFee
             */

            /**
             * Constructs a new Raw.
             * @memberof proto.Transaction
             * @classdesc Represents a Raw.
             * @implements IRaw
             * @constructor
             * @param {proto.Transaction.IRaw=} [properties] Properties to set
             */
            function Raw(properties) {
                this.Contract = [];
                this.Data = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Raw Nonce.
             * @member {number} Nonce
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.Nonce = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

            /**
             * Raw Sender.
             * @member {Uint8Array} Sender
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.Sender = $util.newBuffer([]);

            /**
             * Raw Contract.
             * @member {Array.<proto.ITXContract>} Contract
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.Contract = $util.emptyArray;

            /**
             * Raw PermissionID.
             * @member {number} PermissionID
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.PermissionID = 0;

            /**
             * Raw Data.
             * @member {Array.<Uint8Array>} Data
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.Data = $util.emptyArray;

            /**
             * Raw KAppFee.
             * @member {number} KAppFee
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.KAppFee = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Raw BandwidthFee.
             * @member {number} BandwidthFee
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.BandwidthFee = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Raw Version.
             * @member {number} Version
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.Version = 0;

            /**
             * Raw ChainID.
             * @member {Uint8Array} ChainID
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.ChainID = $util.newBuffer([]);

            /**
             * Raw KDAFee.
             * @member {proto.Transaction.IKDAFee|null|undefined} KDAFee
             * @memberof proto.Transaction.Raw
             * @instance
             */
            Raw.prototype.KDAFee = null;

            /**
             * Creates a new Raw instance using the specified properties.
             * @function create
             * @memberof proto.Transaction.Raw
             * @static
             * @param {proto.Transaction.IRaw=} [properties] Properties to set
             * @returns {proto.Transaction.Raw} Raw instance
             */
            Raw.create = function create(properties) {
                return new Raw(properties);
            };

            /**
             * Encodes the specified Raw message. Does not implicitly {@link proto.Transaction.Raw.verify|verify} messages.
             * @function encode
             * @memberof proto.Transaction.Raw
             * @static
             * @param {proto.Transaction.IRaw} message Raw message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Raw.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.Nonce != null && Object.hasOwnProperty.call(message, "Nonce"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.Nonce);
                if (message.Sender != null && Object.hasOwnProperty.call(message, "Sender"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.Sender);
                if (message.Contract != null && message.Contract.length)
                    for (let i = 0; i < message.Contract.length; ++i)
                        $root.proto.TXContract.encode(message.Contract[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.PermissionID != null && Object.hasOwnProperty.call(message, "PermissionID"))
                    writer.uint32(/* id 7, wireType 0 =*/56).int32(message.PermissionID);
                if (message.Data != null && message.Data.length)
                    for (let i = 0; i < message.Data.length; ++i)
                        writer.uint32(/* id 10, wireType 2 =*/82).bytes(message.Data[i]);
                if (message.KAppFee != null && Object.hasOwnProperty.call(message, "KAppFee"))
                    writer.uint32(/* id 13, wireType 0 =*/104).int64(message.KAppFee);
                if (message.BandwidthFee != null && Object.hasOwnProperty.call(message, "BandwidthFee"))
                    writer.uint32(/* id 14, wireType 0 =*/112).int64(message.BandwidthFee);
                if (message.Version != null && Object.hasOwnProperty.call(message, "Version"))
                    writer.uint32(/* id 15, wireType 0 =*/120).uint32(message.Version);
                if (message.ChainID != null && Object.hasOwnProperty.call(message, "ChainID"))
                    writer.uint32(/* id 16, wireType 2 =*/130).bytes(message.ChainID);
                if (message.KDAFee != null && Object.hasOwnProperty.call(message, "KDAFee"))
                    $root.proto.Transaction.KDAFee.encode(message.KDAFee, writer.uint32(/* id 17, wireType 2 =*/138).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Raw message, length delimited. Does not implicitly {@link proto.Transaction.Raw.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.Transaction.Raw
             * @static
             * @param {proto.Transaction.IRaw} message Raw message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Raw.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Raw message from the specified reader or buffer.
             * @function decode
             * @memberof proto.Transaction.Raw
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.Transaction.Raw} Raw
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Raw.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Transaction.Raw();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.Nonce = reader.uint64();
                            break;
                        }
                    case 2: {
                            message.Sender = reader.bytes();
                            break;
                        }
                    case 6: {
                            if (!(message.Contract && message.Contract.length))
                                message.Contract = [];
                            message.Contract.push($root.proto.TXContract.decode(reader, reader.uint32()));
                            break;
                        }
                    case 7: {
                            message.PermissionID = reader.int32();
                            break;
                        }
                    case 10: {
                            if (!(message.Data && message.Data.length))
                                message.Data = [];
                            message.Data.push(reader.bytes());
                            break;
                        }
                    case 13: {
                            message.KAppFee = reader.int64();
                            break;
                        }
                    case 14: {
                            message.BandwidthFee = reader.int64();
                            break;
                        }
                    case 15: {
                            message.Version = reader.uint32();
                            break;
                        }
                    case 16: {
                            message.ChainID = reader.bytes();
                            break;
                        }
                    case 17: {
                            message.KDAFee = $root.proto.Transaction.KDAFee.decode(reader, reader.uint32());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Raw message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.Transaction.Raw
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.Transaction.Raw} Raw
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Raw.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Raw message.
             * @function verify
             * @memberof proto.Transaction.Raw
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Raw.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.Nonce != null && message.hasOwnProperty("Nonce"))
                    if (!$util.isInteger(message.Nonce) && !(message.Nonce && $util.isInteger(message.Nonce.low) && $util.isInteger(message.Nonce.high)))
                        return "Nonce: integer|Long expected";
                if (message.Sender != null && message.hasOwnProperty("Sender"))
                    if (!(message.Sender && typeof message.Sender.length === "number" || $util.isString(message.Sender)))
                        return "Sender: buffer expected";
                if (message.Contract != null && message.hasOwnProperty("Contract")) {
                    if (!Array.isArray(message.Contract))
                        return "Contract: array expected";
                    for (let i = 0; i < message.Contract.length; ++i) {
                        let error = $root.proto.TXContract.verify(message.Contract[i]);
                        if (error)
                            return "Contract." + error;
                    }
                }
                if (message.PermissionID != null && message.hasOwnProperty("PermissionID"))
                    if (!$util.isInteger(message.PermissionID))
                        return "PermissionID: integer expected";
                if (message.Data != null && message.hasOwnProperty("Data")) {
                    if (!Array.isArray(message.Data))
                        return "Data: array expected";
                    for (let i = 0; i < message.Data.length; ++i)
                        if (!(message.Data[i] && typeof message.Data[i].length === "number" || $util.isString(message.Data[i])))
                            return "Data: buffer[] expected";
                }
                if (message.KAppFee != null && message.hasOwnProperty("KAppFee"))
                    if (!$util.isInteger(message.KAppFee) && !(message.KAppFee && $util.isInteger(message.KAppFee.low) && $util.isInteger(message.KAppFee.high)))
                        return "KAppFee: integer|Long expected";
                if (message.BandwidthFee != null && message.hasOwnProperty("BandwidthFee"))
                    if (!$util.isInteger(message.BandwidthFee) && !(message.BandwidthFee && $util.isInteger(message.BandwidthFee.low) && $util.isInteger(message.BandwidthFee.high)))
                        return "BandwidthFee: integer|Long expected";
                if (message.Version != null && message.hasOwnProperty("Version"))
                    if (!$util.isInteger(message.Version))
                        return "Version: integer expected";
                if (message.ChainID != null && message.hasOwnProperty("ChainID"))
                    if (!(message.ChainID && typeof message.ChainID.length === "number" || $util.isString(message.ChainID)))
                        return "ChainID: buffer expected";
                if (message.KDAFee != null && message.hasOwnProperty("KDAFee")) {
                    let error = $root.proto.Transaction.KDAFee.verify(message.KDAFee);
                    if (error)
                        return "KDAFee." + error;
                }
                return null;
            };

            /**
             * Creates a Raw message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.Transaction.Raw
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.Transaction.Raw} Raw
             */
            Raw.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.Transaction.Raw)
                    return object;
                let message = new $root.proto.Transaction.Raw();
                if (object.Nonce != null)
                    if ($util.Long)
                        (message.Nonce = $util.Long.fromValue(object.Nonce)).unsigned = true;
                    else if (typeof object.Nonce === "string")
                        message.Nonce = parseInt(object.Nonce, 10);
                    else if (typeof object.Nonce === "number")
                        message.Nonce = object.Nonce;
                    else if (typeof object.Nonce === "object")
                        message.Nonce = new $util.LongBits(object.Nonce.low >>> 0, object.Nonce.high >>> 0).toNumber(true);
                if (object.Sender != null)
                    if (typeof object.Sender === "string")
                        $util.base64.decode(object.Sender, message.Sender = $util.newBuffer($util.base64.length(object.Sender)), 0);
                    else if (object.Sender.length >= 0)
                        message.Sender = object.Sender;
                if (object.Contract) {
                    if (!Array.isArray(object.Contract))
                        throw TypeError(".proto.Transaction.Raw.Contract: array expected");
                    message.Contract = [];
                    for (let i = 0; i < object.Contract.length; ++i) {
                        if (typeof object.Contract[i] !== "object")
                            throw TypeError(".proto.Transaction.Raw.Contract: object expected");
                        message.Contract[i] = $root.proto.TXContract.fromObject(object.Contract[i]);
                    }
                }
                if (object.PermissionID != null)
                    message.PermissionID = object.PermissionID | 0;
                if (object.Data) {
                    if (!Array.isArray(object.Data))
                        throw TypeError(".proto.Transaction.Raw.Data: array expected");
                    message.Data = [];
                    for (let i = 0; i < object.Data.length; ++i)
                        if (typeof object.Data[i] === "string")
                            $util.base64.decode(object.Data[i], message.Data[i] = $util.newBuffer($util.base64.length(object.Data[i])), 0);
                        else if (object.Data[i].length >= 0)
                            message.Data[i] = object.Data[i];
                }
                if (object.KAppFee != null)
                    if ($util.Long)
                        (message.KAppFee = $util.Long.fromValue(object.KAppFee)).unsigned = false;
                    else if (typeof object.KAppFee === "string")
                        message.KAppFee = parseInt(object.KAppFee, 10);
                    else if (typeof object.KAppFee === "number")
                        message.KAppFee = object.KAppFee;
                    else if (typeof object.KAppFee === "object")
                        message.KAppFee = new $util.LongBits(object.KAppFee.low >>> 0, object.KAppFee.high >>> 0).toNumber();
                if (object.BandwidthFee != null)
                    if ($util.Long)
                        (message.BandwidthFee = $util.Long.fromValue(object.BandwidthFee)).unsigned = false;
                    else if (typeof object.BandwidthFee === "string")
                        message.BandwidthFee = parseInt(object.BandwidthFee, 10);
                    else if (typeof object.BandwidthFee === "number")
                        message.BandwidthFee = object.BandwidthFee;
                    else if (typeof object.BandwidthFee === "object")
                        message.BandwidthFee = new $util.LongBits(object.BandwidthFee.low >>> 0, object.BandwidthFee.high >>> 0).toNumber();
                if (object.Version != null)
                    message.Version = object.Version >>> 0;
                if (object.ChainID != null)
                    if (typeof object.ChainID === "string")
                        $util.base64.decode(object.ChainID, message.ChainID = $util.newBuffer($util.base64.length(object.ChainID)), 0);
                    else if (object.ChainID.length >= 0)
                        message.ChainID = object.ChainID;
                if (object.KDAFee != null) {
                    if (typeof object.KDAFee !== "object")
                        throw TypeError(".proto.Transaction.Raw.KDAFee: object expected");
                    message.KDAFee = $root.proto.Transaction.KDAFee.fromObject(object.KDAFee);
                }
                return message;
            };

            /**
             * Creates a plain object from a Raw message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.Transaction.Raw
             * @static
             * @param {proto.Transaction.Raw} message Raw
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Raw.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults) {
                    object.Contract = [];
                    object.Data = [];
                }
                if (options.defaults) {
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, true);
                        object.Nonce = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.Nonce = options.longs === String ? "0" : 0;
                    if (options.bytes === String)
                        object.Sender = "";
                    else {
                        object.Sender = [];
                        if (options.bytes !== Array)
                            object.Sender = $util.newBuffer(object.Sender);
                    }
                    object.PermissionID = 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.KAppFee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.KAppFee = options.longs === String ? "0" : 0;
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.BandwidthFee = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.BandwidthFee = options.longs === String ? "0" : 0;
                    object.Version = 0;
                    if (options.bytes === String)
                        object.ChainID = "";
                    else {
                        object.ChainID = [];
                        if (options.bytes !== Array)
                            object.ChainID = $util.newBuffer(object.ChainID);
                    }
                    object.KDAFee = null;
                }
                if (message.Nonce != null && message.hasOwnProperty("Nonce"))
                    if (typeof message.Nonce === "number")
                        object.Nonce = options.longs === String ? String(message.Nonce) : message.Nonce;
                    else
                        object.Nonce = options.longs === String ? $util.Long.prototype.toString.call(message.Nonce) : options.longs === Number ? new $util.LongBits(message.Nonce.low >>> 0, message.Nonce.high >>> 0).toNumber(true) : message.Nonce;
                if (message.Sender != null && message.hasOwnProperty("Sender"))
                    object.Sender = options.bytes === String ? $util.base64.encode(message.Sender, 0, message.Sender.length) : options.bytes === Array ? Array.prototype.slice.call(message.Sender) : message.Sender;
                if (message.Contract && message.Contract.length) {
                    object.Contract = [];
                    for (let j = 0; j < message.Contract.length; ++j)
                        object.Contract[j] = $root.proto.TXContract.toObject(message.Contract[j], options);
                }
                if (message.PermissionID != null && message.hasOwnProperty("PermissionID"))
                    object.PermissionID = message.PermissionID;
                if (message.Data && message.Data.length) {
                    object.Data = [];
                    for (let j = 0; j < message.Data.length; ++j)
                        object.Data[j] = options.bytes === String ? $util.base64.encode(message.Data[j], 0, message.Data[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.Data[j]) : message.Data[j];
                }
                if (message.KAppFee != null && message.hasOwnProperty("KAppFee"))
                    if (typeof message.KAppFee === "number")
                        object.KAppFee = options.longs === String ? String(message.KAppFee) : message.KAppFee;
                    else
                        object.KAppFee = options.longs === String ? $util.Long.prototype.toString.call(message.KAppFee) : options.longs === Number ? new $util.LongBits(message.KAppFee.low >>> 0, message.KAppFee.high >>> 0).toNumber() : message.KAppFee;
                if (message.BandwidthFee != null && message.hasOwnProperty("BandwidthFee"))
                    if (typeof message.BandwidthFee === "number")
                        object.BandwidthFee = options.longs === String ? String(message.BandwidthFee) : message.BandwidthFee;
                    else
                        object.BandwidthFee = options.longs === String ? $util.Long.prototype.toString.call(message.BandwidthFee) : options.longs === Number ? new $util.LongBits(message.BandwidthFee.low >>> 0, message.BandwidthFee.high >>> 0).toNumber() : message.BandwidthFee;
                if (message.Version != null && message.hasOwnProperty("Version"))
                    object.Version = message.Version;
                if (message.ChainID != null && message.hasOwnProperty("ChainID"))
                    object.ChainID = options.bytes === String ? $util.base64.encode(message.ChainID, 0, message.ChainID.length) : options.bytes === Array ? Array.prototype.slice.call(message.ChainID) : message.ChainID;
                if (message.KDAFee != null && message.hasOwnProperty("KDAFee"))
                    object.KDAFee = $root.proto.Transaction.KDAFee.toObject(message.KDAFee, options);
                return object;
            };

            /**
             * Converts this Raw to JSON.
             * @function toJSON
             * @memberof proto.Transaction.Raw
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Raw.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Raw
             * @function getTypeUrl
             * @memberof proto.Transaction.Raw
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Raw.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.Transaction.Raw";
            };

            return Raw;
        })();

        Transaction.Receipt = (function() {

            /**
             * Properties of a Receipt.
             * @memberof proto.Transaction
             * @interface IReceipt
             * @property {Array.<Uint8Array>|null} [Data] Receipt Data
             */

            /**
             * Constructs a new Receipt.
             * @memberof proto.Transaction
             * @classdesc Represents a Receipt.
             * @implements IReceipt
             * @constructor
             * @param {proto.Transaction.IReceipt=} [properties] Properties to set
             */
            function Receipt(properties) {
                this.Data = [];
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Receipt Data.
             * @member {Array.<Uint8Array>} Data
             * @memberof proto.Transaction.Receipt
             * @instance
             */
            Receipt.prototype.Data = $util.emptyArray;

            /**
             * Creates a new Receipt instance using the specified properties.
             * @function create
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {proto.Transaction.IReceipt=} [properties] Properties to set
             * @returns {proto.Transaction.Receipt} Receipt instance
             */
            Receipt.create = function create(properties) {
                return new Receipt(properties);
            };

            /**
             * Encodes the specified Receipt message. Does not implicitly {@link proto.Transaction.Receipt.verify|verify} messages.
             * @function encode
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {proto.Transaction.IReceipt} message Receipt message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Receipt.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.Data != null && message.Data.length)
                    for (let i = 0; i < message.Data.length; ++i)
                        writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.Data[i]);
                return writer;
            };

            /**
             * Encodes the specified Receipt message, length delimited. Does not implicitly {@link proto.Transaction.Receipt.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {proto.Transaction.IReceipt} message Receipt message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Receipt.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Receipt message from the specified reader or buffer.
             * @function decode
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.Transaction.Receipt} Receipt
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Receipt.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Transaction.Receipt();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            if (!(message.Data && message.Data.length))
                                message.Data = [];
                            message.Data.push(reader.bytes());
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Receipt message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.Transaction.Receipt} Receipt
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Receipt.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Receipt message.
             * @function verify
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Receipt.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.Data != null && message.hasOwnProperty("Data")) {
                    if (!Array.isArray(message.Data))
                        return "Data: array expected";
                    for (let i = 0; i < message.Data.length; ++i)
                        if (!(message.Data[i] && typeof message.Data[i].length === "number" || $util.isString(message.Data[i])))
                            return "Data: buffer[] expected";
                }
                return null;
            };

            /**
             * Creates a Receipt message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.Transaction.Receipt} Receipt
             */
            Receipt.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.Transaction.Receipt)
                    return object;
                let message = new $root.proto.Transaction.Receipt();
                if (object.Data) {
                    if (!Array.isArray(object.Data))
                        throw TypeError(".proto.Transaction.Receipt.Data: array expected");
                    message.Data = [];
                    for (let i = 0; i < object.Data.length; ++i)
                        if (typeof object.Data[i] === "string")
                            $util.base64.decode(object.Data[i], message.Data[i] = $util.newBuffer($util.base64.length(object.Data[i])), 0);
                        else if (object.Data[i].length >= 0)
                            message.Data[i] = object.Data[i];
                }
                return message;
            };

            /**
             * Creates a plain object from a Receipt message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {proto.Transaction.Receipt} message Receipt
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Receipt.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.arrays || options.defaults)
                    object.Data = [];
                if (message.Data && message.Data.length) {
                    object.Data = [];
                    for (let j = 0; j < message.Data.length; ++j)
                        object.Data[j] = options.bytes === String ? $util.base64.encode(message.Data[j], 0, message.Data[j].length) : options.bytes === Array ? Array.prototype.slice.call(message.Data[j]) : message.Data[j];
                }
                return object;
            };

            /**
             * Converts this Receipt to JSON.
             * @function toJSON
             * @memberof proto.Transaction.Receipt
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Receipt.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Receipt
             * @function getTypeUrl
             * @memberof proto.Transaction.Receipt
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Receipt.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.Transaction.Receipt";
            };

            return Receipt;
        })();

        return Transaction;
    })();

    proto.TransferContract = (function() {

        /**
         * Properties of a TransferContract.
         * @memberof proto
         * @interface ITransferContract
         * @property {Uint8Array|null} [ToAddress] TransferContract ToAddress
         * @property {number|null} [Amount] TransferContract Amount
         * @property {Uint8Array|null} [AssetID] TransferContract AssetID
         */

        /**
         * Constructs a new TransferContract.
         * @memberof proto
         * @classdesc Represents a TransferContract.
         * @implements ITransferContract
         * @constructor
         * @param {proto.ITransferContract=} [properties] Properties to set
         */
        function TransferContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TransferContract ToAddress.
         * @member {Uint8Array} ToAddress
         * @memberof proto.TransferContract
         * @instance
         */
        TransferContract.prototype.ToAddress = $util.newBuffer([]);

        /**
         * TransferContract Amount.
         * @member {number} Amount
         * @memberof proto.TransferContract
         * @instance
         */
        TransferContract.prototype.Amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * TransferContract AssetID.
         * @member {Uint8Array} AssetID
         * @memberof proto.TransferContract
         * @instance
         */
        TransferContract.prototype.AssetID = $util.newBuffer([]);

        /**
         * Creates a new TransferContract instance using the specified properties.
         * @function create
         * @memberof proto.TransferContract
         * @static
         * @param {proto.ITransferContract=} [properties] Properties to set
         * @returns {proto.TransferContract} TransferContract instance
         */
        TransferContract.create = function create(properties) {
            return new TransferContract(properties);
        };

        /**
         * Encodes the specified TransferContract message. Does not implicitly {@link proto.TransferContract.verify|verify} messages.
         * @function encode
         * @memberof proto.TransferContract
         * @static
         * @param {proto.ITransferContract} message TransferContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransferContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ToAddress != null && Object.hasOwnProperty.call(message, "ToAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ToAddress);
            if (message.Amount != null && Object.hasOwnProperty.call(message, "Amount"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.Amount);
            if (message.AssetID != null && Object.hasOwnProperty.call(message, "AssetID"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.AssetID);
            return writer;
        };

        /**
         * Encodes the specified TransferContract message, length delimited. Does not implicitly {@link proto.TransferContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.TransferContract
         * @static
         * @param {proto.ITransferContract} message TransferContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TransferContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TransferContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.TransferContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.TransferContract} TransferContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransferContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.TransferContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.ToAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.Amount = reader.int64();
                        break;
                    }
                case 3: {
                        message.AssetID = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TransferContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.TransferContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.TransferContract} TransferContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TransferContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TransferContract message.
         * @function verify
         * @memberof proto.TransferContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TransferContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ToAddress != null && message.hasOwnProperty("ToAddress"))
                if (!(message.ToAddress && typeof message.ToAddress.length === "number" || $util.isString(message.ToAddress)))
                    return "ToAddress: buffer expected";
            if (message.Amount != null && message.hasOwnProperty("Amount"))
                if (!$util.isInteger(message.Amount) && !(message.Amount && $util.isInteger(message.Amount.low) && $util.isInteger(message.Amount.high)))
                    return "Amount: integer|Long expected";
            if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                if (!(message.AssetID && typeof message.AssetID.length === "number" || $util.isString(message.AssetID)))
                    return "AssetID: buffer expected";
            return null;
        };

        /**
         * Creates a TransferContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.TransferContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.TransferContract} TransferContract
         */
        TransferContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.TransferContract)
                return object;
            let message = new $root.proto.TransferContract();
            if (object.ToAddress != null)
                if (typeof object.ToAddress === "string")
                    $util.base64.decode(object.ToAddress, message.ToAddress = $util.newBuffer($util.base64.length(object.ToAddress)), 0);
                else if (object.ToAddress.length >= 0)
                    message.ToAddress = object.ToAddress;
            if (object.Amount != null)
                if ($util.Long)
                    (message.Amount = $util.Long.fromValue(object.Amount)).unsigned = false;
                else if (typeof object.Amount === "string")
                    message.Amount = parseInt(object.Amount, 10);
                else if (typeof object.Amount === "number")
                    message.Amount = object.Amount;
                else if (typeof object.Amount === "object")
                    message.Amount = new $util.LongBits(object.Amount.low >>> 0, object.Amount.high >>> 0).toNumber();
            if (object.AssetID != null)
                if (typeof object.AssetID === "string")
                    $util.base64.decode(object.AssetID, message.AssetID = $util.newBuffer($util.base64.length(object.AssetID)), 0);
                else if (object.AssetID.length >= 0)
                    message.AssetID = object.AssetID;
            return message;
        };

        /**
         * Creates a plain object from a TransferContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.TransferContract
         * @static
         * @param {proto.TransferContract} message TransferContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TransferContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.ToAddress = "";
                else {
                    object.ToAddress = [];
                    if (options.bytes !== Array)
                        object.ToAddress = $util.newBuffer(object.ToAddress);
                }
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.Amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.Amount = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.AssetID = "";
                else {
                    object.AssetID = [];
                    if (options.bytes !== Array)
                        object.AssetID = $util.newBuffer(object.AssetID);
                }
            }
            if (message.ToAddress != null && message.hasOwnProperty("ToAddress"))
                object.ToAddress = options.bytes === String ? $util.base64.encode(message.ToAddress, 0, message.ToAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.ToAddress) : message.ToAddress;
            if (message.Amount != null && message.hasOwnProperty("Amount"))
                if (typeof message.Amount === "number")
                    object.Amount = options.longs === String ? String(message.Amount) : message.Amount;
                else
                    object.Amount = options.longs === String ? $util.Long.prototype.toString.call(message.Amount) : options.longs === Number ? new $util.LongBits(message.Amount.low >>> 0, message.Amount.high >>> 0).toNumber() : message.Amount;
            if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                object.AssetID = options.bytes === String ? $util.base64.encode(message.AssetID, 0, message.AssetID.length) : options.bytes === Array ? Array.prototype.slice.call(message.AssetID) : message.AssetID;
            return object;
        };

        /**
         * Converts this TransferContract to JSON.
         * @function toJSON
         * @memberof proto.TransferContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TransferContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TransferContract
         * @function getTypeUrl
         * @memberof proto.TransferContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TransferContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.TransferContract";
        };

        return TransferContract;
    })();

    proto.FreezeContract = (function() {

        /**
         * Properties of a FreezeContract.
         * @memberof proto
         * @interface IFreezeContract
         * @property {number|null} [Amount] FreezeContract Amount
         * @property {Uint8Array|null} [AssetID] FreezeContract AssetID
         */

        /**
         * Constructs a new FreezeContract.
         * @memberof proto
         * @classdesc Represents a FreezeContract.
         * @implements IFreezeContract
         * @constructor
         * @param {proto.IFreezeContract=} [properties] Properties to set
         */
        function FreezeContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * FreezeContract Amount.
         * @member {number} Amount
         * @memberof proto.FreezeContract
         * @instance
         */
        FreezeContract.prototype.Amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * FreezeContract AssetID.
         * @member {Uint8Array} AssetID
         * @memberof proto.FreezeContract
         * @instance
         */
        FreezeContract.prototype.AssetID = $util.newBuffer([]);

        /**
         * Creates a new FreezeContract instance using the specified properties.
         * @function create
         * @memberof proto.FreezeContract
         * @static
         * @param {proto.IFreezeContract=} [properties] Properties to set
         * @returns {proto.FreezeContract} FreezeContract instance
         */
        FreezeContract.create = function create(properties) {
            return new FreezeContract(properties);
        };

        /**
         * Encodes the specified FreezeContract message. Does not implicitly {@link proto.FreezeContract.verify|verify} messages.
         * @function encode
         * @memberof proto.FreezeContract
         * @static
         * @param {proto.IFreezeContract} message FreezeContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FreezeContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Amount != null && Object.hasOwnProperty.call(message, "Amount"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.Amount);
            if (message.AssetID != null && Object.hasOwnProperty.call(message, "AssetID"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.AssetID);
            return writer;
        };

        /**
         * Encodes the specified FreezeContract message, length delimited. Does not implicitly {@link proto.FreezeContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.FreezeContract
         * @static
         * @param {proto.IFreezeContract} message FreezeContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        FreezeContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a FreezeContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.FreezeContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.FreezeContract} FreezeContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FreezeContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.FreezeContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.Amount = reader.int64();
                        break;
                    }
                case 2: {
                        message.AssetID = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a FreezeContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.FreezeContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.FreezeContract} FreezeContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        FreezeContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a FreezeContract message.
         * @function verify
         * @memberof proto.FreezeContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        FreezeContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Amount != null && message.hasOwnProperty("Amount"))
                if (!$util.isInteger(message.Amount) && !(message.Amount && $util.isInteger(message.Amount.low) && $util.isInteger(message.Amount.high)))
                    return "Amount: integer|Long expected";
            if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                if (!(message.AssetID && typeof message.AssetID.length === "number" || $util.isString(message.AssetID)))
                    return "AssetID: buffer expected";
            return null;
        };

        /**
         * Creates a FreezeContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.FreezeContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.FreezeContract} FreezeContract
         */
        FreezeContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.FreezeContract)
                return object;
            let message = new $root.proto.FreezeContract();
            if (object.Amount != null)
                if ($util.Long)
                    (message.Amount = $util.Long.fromValue(object.Amount)).unsigned = false;
                else if (typeof object.Amount === "string")
                    message.Amount = parseInt(object.Amount, 10);
                else if (typeof object.Amount === "number")
                    message.Amount = object.Amount;
                else if (typeof object.Amount === "object")
                    message.Amount = new $util.LongBits(object.Amount.low >>> 0, object.Amount.high >>> 0).toNumber();
            if (object.AssetID != null)
                if (typeof object.AssetID === "string")
                    $util.base64.decode(object.AssetID, message.AssetID = $util.newBuffer($util.base64.length(object.AssetID)), 0);
                else if (object.AssetID.length >= 0)
                    message.AssetID = object.AssetID;
            return message;
        };

        /**
         * Creates a plain object from a FreezeContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.FreezeContract
         * @static
         * @param {proto.FreezeContract} message FreezeContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        FreezeContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.Amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.Amount = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.AssetID = "";
                else {
                    object.AssetID = [];
                    if (options.bytes !== Array)
                        object.AssetID = $util.newBuffer(object.AssetID);
                }
            }
            if (message.Amount != null && message.hasOwnProperty("Amount"))
                if (typeof message.Amount === "number")
                    object.Amount = options.longs === String ? String(message.Amount) : message.Amount;
                else
                    object.Amount = options.longs === String ? $util.Long.prototype.toString.call(message.Amount) : options.longs === Number ? new $util.LongBits(message.Amount.low >>> 0, message.Amount.high >>> 0).toNumber() : message.Amount;
            if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                object.AssetID = options.bytes === String ? $util.base64.encode(message.AssetID, 0, message.AssetID.length) : options.bytes === Array ? Array.prototype.slice.call(message.AssetID) : message.AssetID;
            return object;
        };

        /**
         * Converts this FreezeContract to JSON.
         * @function toJSON
         * @memberof proto.FreezeContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        FreezeContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for FreezeContract
         * @function getTypeUrl
         * @memberof proto.FreezeContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        FreezeContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.FreezeContract";
        };

        return FreezeContract;
    })();

    proto.UnfreezeContract = (function() {

        /**
         * Properties of an UnfreezeContract.
         * @memberof proto
         * @interface IUnfreezeContract
         * @property {Uint8Array|null} [AssetID] UnfreezeContract AssetID
         * @property {Uint8Array|null} [BucketID] UnfreezeContract BucketID
         */

        /**
         * Constructs a new UnfreezeContract.
         * @memberof proto
         * @classdesc Represents an UnfreezeContract.
         * @implements IUnfreezeContract
         * @constructor
         * @param {proto.IUnfreezeContract=} [properties] Properties to set
         */
        function UnfreezeContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UnfreezeContract AssetID.
         * @member {Uint8Array} AssetID
         * @memberof proto.UnfreezeContract
         * @instance
         */
        UnfreezeContract.prototype.AssetID = $util.newBuffer([]);

        /**
         * UnfreezeContract BucketID.
         * @member {Uint8Array} BucketID
         * @memberof proto.UnfreezeContract
         * @instance
         */
        UnfreezeContract.prototype.BucketID = $util.newBuffer([]);

        /**
         * Creates a new UnfreezeContract instance using the specified properties.
         * @function create
         * @memberof proto.UnfreezeContract
         * @static
         * @param {proto.IUnfreezeContract=} [properties] Properties to set
         * @returns {proto.UnfreezeContract} UnfreezeContract instance
         */
        UnfreezeContract.create = function create(properties) {
            return new UnfreezeContract(properties);
        };

        /**
         * Encodes the specified UnfreezeContract message. Does not implicitly {@link proto.UnfreezeContract.verify|verify} messages.
         * @function encode
         * @memberof proto.UnfreezeContract
         * @static
         * @param {proto.IUnfreezeContract} message UnfreezeContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UnfreezeContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.AssetID != null && Object.hasOwnProperty.call(message, "AssetID"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.AssetID);
            if (message.BucketID != null && Object.hasOwnProperty.call(message, "BucketID"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.BucketID);
            return writer;
        };

        /**
         * Encodes the specified UnfreezeContract message, length delimited. Does not implicitly {@link proto.UnfreezeContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.UnfreezeContract
         * @static
         * @param {proto.IUnfreezeContract} message UnfreezeContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UnfreezeContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UnfreezeContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.UnfreezeContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.UnfreezeContract} UnfreezeContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UnfreezeContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.UnfreezeContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.AssetID = reader.bytes();
                        break;
                    }
                case 2: {
                        message.BucketID = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an UnfreezeContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.UnfreezeContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.UnfreezeContract} UnfreezeContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UnfreezeContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UnfreezeContract message.
         * @function verify
         * @memberof proto.UnfreezeContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UnfreezeContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                if (!(message.AssetID && typeof message.AssetID.length === "number" || $util.isString(message.AssetID)))
                    return "AssetID: buffer expected";
            if (message.BucketID != null && message.hasOwnProperty("BucketID"))
                if (!(message.BucketID && typeof message.BucketID.length === "number" || $util.isString(message.BucketID)))
                    return "BucketID: buffer expected";
            return null;
        };

        /**
         * Creates an UnfreezeContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.UnfreezeContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.UnfreezeContract} UnfreezeContract
         */
        UnfreezeContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.UnfreezeContract)
                return object;
            let message = new $root.proto.UnfreezeContract();
            if (object.AssetID != null)
                if (typeof object.AssetID === "string")
                    $util.base64.decode(object.AssetID, message.AssetID = $util.newBuffer($util.base64.length(object.AssetID)), 0);
                else if (object.AssetID.length >= 0)
                    message.AssetID = object.AssetID;
            if (object.BucketID != null)
                if (typeof object.BucketID === "string")
                    $util.base64.decode(object.BucketID, message.BucketID = $util.newBuffer($util.base64.length(object.BucketID)), 0);
                else if (object.BucketID.length >= 0)
                    message.BucketID = object.BucketID;
            return message;
        };

        /**
         * Creates a plain object from an UnfreezeContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.UnfreezeContract
         * @static
         * @param {proto.UnfreezeContract} message UnfreezeContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UnfreezeContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.AssetID = "";
                else {
                    object.AssetID = [];
                    if (options.bytes !== Array)
                        object.AssetID = $util.newBuffer(object.AssetID);
                }
                if (options.bytes === String)
                    object.BucketID = "";
                else {
                    object.BucketID = [];
                    if (options.bytes !== Array)
                        object.BucketID = $util.newBuffer(object.BucketID);
                }
            }
            if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                object.AssetID = options.bytes === String ? $util.base64.encode(message.AssetID, 0, message.AssetID.length) : options.bytes === Array ? Array.prototype.slice.call(message.AssetID) : message.AssetID;
            if (message.BucketID != null && message.hasOwnProperty("BucketID"))
                object.BucketID = options.bytes === String ? $util.base64.encode(message.BucketID, 0, message.BucketID.length) : options.bytes === Array ? Array.prototype.slice.call(message.BucketID) : message.BucketID;
            return object;
        };

        /**
         * Converts this UnfreezeContract to JSON.
         * @function toJSON
         * @memberof proto.UnfreezeContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UnfreezeContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UnfreezeContract
         * @function getTypeUrl
         * @memberof proto.UnfreezeContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UnfreezeContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.UnfreezeContract";
        };

        return UnfreezeContract;
    })();

    proto.DelegateContract = (function() {

        /**
         * Properties of a DelegateContract.
         * @memberof proto
         * @interface IDelegateContract
         * @property {Uint8Array|null} [ToAddress] DelegateContract ToAddress
         * @property {Uint8Array|null} [BucketID] DelegateContract BucketID
         */

        /**
         * Constructs a new DelegateContract.
         * @memberof proto
         * @classdesc Represents a DelegateContract.
         * @implements IDelegateContract
         * @constructor
         * @param {proto.IDelegateContract=} [properties] Properties to set
         */
        function DelegateContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DelegateContract ToAddress.
         * @member {Uint8Array} ToAddress
         * @memberof proto.DelegateContract
         * @instance
         */
        DelegateContract.prototype.ToAddress = $util.newBuffer([]);

        /**
         * DelegateContract BucketID.
         * @member {Uint8Array} BucketID
         * @memberof proto.DelegateContract
         * @instance
         */
        DelegateContract.prototype.BucketID = $util.newBuffer([]);

        /**
         * Creates a new DelegateContract instance using the specified properties.
         * @function create
         * @memberof proto.DelegateContract
         * @static
         * @param {proto.IDelegateContract=} [properties] Properties to set
         * @returns {proto.DelegateContract} DelegateContract instance
         */
        DelegateContract.create = function create(properties) {
            return new DelegateContract(properties);
        };

        /**
         * Encodes the specified DelegateContract message. Does not implicitly {@link proto.DelegateContract.verify|verify} messages.
         * @function encode
         * @memberof proto.DelegateContract
         * @static
         * @param {proto.IDelegateContract} message DelegateContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DelegateContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ToAddress != null && Object.hasOwnProperty.call(message, "ToAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.ToAddress);
            if (message.BucketID != null && Object.hasOwnProperty.call(message, "BucketID"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.BucketID);
            return writer;
        };

        /**
         * Encodes the specified DelegateContract message, length delimited. Does not implicitly {@link proto.DelegateContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.DelegateContract
         * @static
         * @param {proto.IDelegateContract} message DelegateContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DelegateContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DelegateContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.DelegateContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.DelegateContract} DelegateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DelegateContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.DelegateContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.ToAddress = reader.bytes();
                        break;
                    }
                case 2: {
                        message.BucketID = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DelegateContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.DelegateContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.DelegateContract} DelegateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DelegateContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DelegateContract message.
         * @function verify
         * @memberof proto.DelegateContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DelegateContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ToAddress != null && message.hasOwnProperty("ToAddress"))
                if (!(message.ToAddress && typeof message.ToAddress.length === "number" || $util.isString(message.ToAddress)))
                    return "ToAddress: buffer expected";
            if (message.BucketID != null && message.hasOwnProperty("BucketID"))
                if (!(message.BucketID && typeof message.BucketID.length === "number" || $util.isString(message.BucketID)))
                    return "BucketID: buffer expected";
            return null;
        };

        /**
         * Creates a DelegateContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.DelegateContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.DelegateContract} DelegateContract
         */
        DelegateContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.DelegateContract)
                return object;
            let message = new $root.proto.DelegateContract();
            if (object.ToAddress != null)
                if (typeof object.ToAddress === "string")
                    $util.base64.decode(object.ToAddress, message.ToAddress = $util.newBuffer($util.base64.length(object.ToAddress)), 0);
                else if (object.ToAddress.length >= 0)
                    message.ToAddress = object.ToAddress;
            if (object.BucketID != null)
                if (typeof object.BucketID === "string")
                    $util.base64.decode(object.BucketID, message.BucketID = $util.newBuffer($util.base64.length(object.BucketID)), 0);
                else if (object.BucketID.length >= 0)
                    message.BucketID = object.BucketID;
            return message;
        };

        /**
         * Creates a plain object from a DelegateContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.DelegateContract
         * @static
         * @param {proto.DelegateContract} message DelegateContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DelegateContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.ToAddress = "";
                else {
                    object.ToAddress = [];
                    if (options.bytes !== Array)
                        object.ToAddress = $util.newBuffer(object.ToAddress);
                }
                if (options.bytes === String)
                    object.BucketID = "";
                else {
                    object.BucketID = [];
                    if (options.bytes !== Array)
                        object.BucketID = $util.newBuffer(object.BucketID);
                }
            }
            if (message.ToAddress != null && message.hasOwnProperty("ToAddress"))
                object.ToAddress = options.bytes === String ? $util.base64.encode(message.ToAddress, 0, message.ToAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.ToAddress) : message.ToAddress;
            if (message.BucketID != null && message.hasOwnProperty("BucketID"))
                object.BucketID = options.bytes === String ? $util.base64.encode(message.BucketID, 0, message.BucketID.length) : options.bytes === Array ? Array.prototype.slice.call(message.BucketID) : message.BucketID;
            return object;
        };

        /**
         * Converts this DelegateContract to JSON.
         * @function toJSON
         * @memberof proto.DelegateContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DelegateContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DelegateContract
         * @function getTypeUrl
         * @memberof proto.DelegateContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DelegateContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.DelegateContract";
        };

        return DelegateContract;
    })();

    proto.UndelegateContract = (function() {

        /**
         * Properties of an UndelegateContract.
         * @memberof proto
         * @interface IUndelegateContract
         * @property {Uint8Array|null} [BucketID] UndelegateContract BucketID
         */

        /**
         * Constructs a new UndelegateContract.
         * @memberof proto
         * @classdesc Represents an UndelegateContract.
         * @implements IUndelegateContract
         * @constructor
         * @param {proto.IUndelegateContract=} [properties] Properties to set
         */
        function UndelegateContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * UndelegateContract BucketID.
         * @member {Uint8Array} BucketID
         * @memberof proto.UndelegateContract
         * @instance
         */
        UndelegateContract.prototype.BucketID = $util.newBuffer([]);

        /**
         * Creates a new UndelegateContract instance using the specified properties.
         * @function create
         * @memberof proto.UndelegateContract
         * @static
         * @param {proto.IUndelegateContract=} [properties] Properties to set
         * @returns {proto.UndelegateContract} UndelegateContract instance
         */
        UndelegateContract.create = function create(properties) {
            return new UndelegateContract(properties);
        };

        /**
         * Encodes the specified UndelegateContract message. Does not implicitly {@link proto.UndelegateContract.verify|verify} messages.
         * @function encode
         * @memberof proto.UndelegateContract
         * @static
         * @param {proto.IUndelegateContract} message UndelegateContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UndelegateContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.BucketID != null && Object.hasOwnProperty.call(message, "BucketID"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.BucketID);
            return writer;
        };

        /**
         * Encodes the specified UndelegateContract message, length delimited. Does not implicitly {@link proto.UndelegateContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.UndelegateContract
         * @static
         * @param {proto.IUndelegateContract} message UndelegateContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UndelegateContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an UndelegateContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.UndelegateContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.UndelegateContract} UndelegateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UndelegateContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.UndelegateContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.BucketID = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an UndelegateContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.UndelegateContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.UndelegateContract} UndelegateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UndelegateContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an UndelegateContract message.
         * @function verify
         * @memberof proto.UndelegateContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        UndelegateContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.BucketID != null && message.hasOwnProperty("BucketID"))
                if (!(message.BucketID && typeof message.BucketID.length === "number" || $util.isString(message.BucketID)))
                    return "BucketID: buffer expected";
            return null;
        };

        /**
         * Creates an UndelegateContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.UndelegateContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.UndelegateContract} UndelegateContract
         */
        UndelegateContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.UndelegateContract)
                return object;
            let message = new $root.proto.UndelegateContract();
            if (object.BucketID != null)
                if (typeof object.BucketID === "string")
                    $util.base64.decode(object.BucketID, message.BucketID = $util.newBuffer($util.base64.length(object.BucketID)), 0);
                else if (object.BucketID.length >= 0)
                    message.BucketID = object.BucketID;
            return message;
        };

        /**
         * Creates a plain object from an UndelegateContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.UndelegateContract
         * @static
         * @param {proto.UndelegateContract} message UndelegateContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        UndelegateContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                if (options.bytes === String)
                    object.BucketID = "";
                else {
                    object.BucketID = [];
                    if (options.bytes !== Array)
                        object.BucketID = $util.newBuffer(object.BucketID);
                }
            if (message.BucketID != null && message.hasOwnProperty("BucketID"))
                object.BucketID = options.bytes === String ? $util.base64.encode(message.BucketID, 0, message.BucketID.length) : options.bytes === Array ? Array.prototype.slice.call(message.BucketID) : message.BucketID;
            return object;
        };

        /**
         * Converts this UndelegateContract to JSON.
         * @function toJSON
         * @memberof proto.UndelegateContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        UndelegateContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for UndelegateContract
         * @function getTypeUrl
         * @memberof proto.UndelegateContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        UndelegateContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.UndelegateContract";
        };

        return UndelegateContract;
    })();

    proto.WithdrawContract = (function() {

        /**
         * Properties of a WithdrawContract.
         * @memberof proto
         * @interface IWithdrawContract
         * @property {proto.WithdrawContract.WithdrawType|null} [Type] WithdrawContract Type
         * @property {Uint8Array|null} [AssetID] WithdrawContract AssetID
         * @property {number|null} [Amount] WithdrawContract Amount
         * @property {Uint8Array|null} [CurrencyID] WithdrawContract CurrencyID
         */

        /**
         * Constructs a new WithdrawContract.
         * @memberof proto
         * @classdesc Represents a WithdrawContract.
         * @implements IWithdrawContract
         * @constructor
         * @param {proto.IWithdrawContract=} [properties] Properties to set
         */
        function WithdrawContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WithdrawContract Type.
         * @member {proto.WithdrawContract.WithdrawType} Type
         * @memberof proto.WithdrawContract
         * @instance
         */
        WithdrawContract.prototype.Type = 0;

        /**
         * WithdrawContract AssetID.
         * @member {Uint8Array} AssetID
         * @memberof proto.WithdrawContract
         * @instance
         */
        WithdrawContract.prototype.AssetID = $util.newBuffer([]);

        /**
         * WithdrawContract Amount.
         * @member {number} Amount
         * @memberof proto.WithdrawContract
         * @instance
         */
        WithdrawContract.prototype.Amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * WithdrawContract CurrencyID.
         * @member {Uint8Array} CurrencyID
         * @memberof proto.WithdrawContract
         * @instance
         */
        WithdrawContract.prototype.CurrencyID = $util.newBuffer([]);

        /**
         * Creates a new WithdrawContract instance using the specified properties.
         * @function create
         * @memberof proto.WithdrawContract
         * @static
         * @param {proto.IWithdrawContract=} [properties] Properties to set
         * @returns {proto.WithdrawContract} WithdrawContract instance
         */
        WithdrawContract.create = function create(properties) {
            return new WithdrawContract(properties);
        };

        /**
         * Encodes the specified WithdrawContract message. Does not implicitly {@link proto.WithdrawContract.verify|verify} messages.
         * @function encode
         * @memberof proto.WithdrawContract
         * @static
         * @param {proto.IWithdrawContract} message WithdrawContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WithdrawContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Type != null && Object.hasOwnProperty.call(message, "Type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.Type);
            if (message.AssetID != null && Object.hasOwnProperty.call(message, "AssetID"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.AssetID);
            if (message.Amount != null && Object.hasOwnProperty.call(message, "Amount"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.Amount);
            if (message.CurrencyID != null && Object.hasOwnProperty.call(message, "CurrencyID"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.CurrencyID);
            return writer;
        };

        /**
         * Encodes the specified WithdrawContract message, length delimited. Does not implicitly {@link proto.WithdrawContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.WithdrawContract
         * @static
         * @param {proto.IWithdrawContract} message WithdrawContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WithdrawContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WithdrawContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.WithdrawContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.WithdrawContract} WithdrawContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WithdrawContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.WithdrawContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.Type = reader.int32();
                        break;
                    }
                case 2: {
                        message.AssetID = reader.bytes();
                        break;
                    }
                case 3: {
                        message.Amount = reader.int64();
                        break;
                    }
                case 4: {
                        message.CurrencyID = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WithdrawContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.WithdrawContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.WithdrawContract} WithdrawContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WithdrawContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WithdrawContract message.
         * @function verify
         * @memberof proto.WithdrawContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WithdrawContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Type != null && message.hasOwnProperty("Type"))
                switch (message.Type) {
                default:
                    return "Type: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    break;
                }
            if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                if (!(message.AssetID && typeof message.AssetID.length === "number" || $util.isString(message.AssetID)))
                    return "AssetID: buffer expected";
            if (message.Amount != null && message.hasOwnProperty("Amount"))
                if (!$util.isInteger(message.Amount) && !(message.Amount && $util.isInteger(message.Amount.low) && $util.isInteger(message.Amount.high)))
                    return "Amount: integer|Long expected";
            if (message.CurrencyID != null && message.hasOwnProperty("CurrencyID"))
                if (!(message.CurrencyID && typeof message.CurrencyID.length === "number" || $util.isString(message.CurrencyID)))
                    return "CurrencyID: buffer expected";
            return null;
        };

        /**
         * Creates a WithdrawContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.WithdrawContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.WithdrawContract} WithdrawContract
         */
        WithdrawContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.WithdrawContract)
                return object;
            let message = new $root.proto.WithdrawContract();
            switch (object.Type) {
            default:
                if (typeof object.Type === "number") {
                    message.Type = object.Type;
                    break;
                }
                break;
            case "StakingReward":
            case 0:
                message.Type = 0;
                break;
            case "KDAPool":
            case 1:
                message.Type = 1;
                break;
            case "KDAFeePool":
            case 2:
                message.Type = 2;
                break;
            case "MarketOrderIDXIN":
            case 3:
                message.Type = 3;
                break;
            case "MarketOrderIDXOUT":
            case 4:
                message.Type = 4;
                break;
            }
            if (object.AssetID != null)
                if (typeof object.AssetID === "string")
                    $util.base64.decode(object.AssetID, message.AssetID = $util.newBuffer($util.base64.length(object.AssetID)), 0);
                else if (object.AssetID.length >= 0)
                    message.AssetID = object.AssetID;
            if (object.Amount != null)
                if ($util.Long)
                    (message.Amount = $util.Long.fromValue(object.Amount)).unsigned = false;
                else if (typeof object.Amount === "string")
                    message.Amount = parseInt(object.Amount, 10);
                else if (typeof object.Amount === "number")
                    message.Amount = object.Amount;
                else if (typeof object.Amount === "object")
                    message.Amount = new $util.LongBits(object.Amount.low >>> 0, object.Amount.high >>> 0).toNumber();
            if (object.CurrencyID != null)
                if (typeof object.CurrencyID === "string")
                    $util.base64.decode(object.CurrencyID, message.CurrencyID = $util.newBuffer($util.base64.length(object.CurrencyID)), 0);
                else if (object.CurrencyID.length >= 0)
                    message.CurrencyID = object.CurrencyID;
            return message;
        };

        /**
         * Creates a plain object from a WithdrawContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.WithdrawContract
         * @static
         * @param {proto.WithdrawContract} message WithdrawContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WithdrawContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.Type = options.enums === String ? "StakingReward" : 0;
                if (options.bytes === String)
                    object.AssetID = "";
                else {
                    object.AssetID = [];
                    if (options.bytes !== Array)
                        object.AssetID = $util.newBuffer(object.AssetID);
                }
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.Amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.Amount = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.CurrencyID = "";
                else {
                    object.CurrencyID = [];
                    if (options.bytes !== Array)
                        object.CurrencyID = $util.newBuffer(object.CurrencyID);
                }
            }
            if (message.Type != null && message.hasOwnProperty("Type"))
                object.Type = options.enums === String ? $root.proto.WithdrawContract.WithdrawType[message.Type] === undefined ? message.Type : $root.proto.WithdrawContract.WithdrawType[message.Type] : message.Type;
            if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                object.AssetID = options.bytes === String ? $util.base64.encode(message.AssetID, 0, message.AssetID.length) : options.bytes === Array ? Array.prototype.slice.call(message.AssetID) : message.AssetID;
            if (message.Amount != null && message.hasOwnProperty("Amount"))
                if (typeof message.Amount === "number")
                    object.Amount = options.longs === String ? String(message.Amount) : message.Amount;
                else
                    object.Amount = options.longs === String ? $util.Long.prototype.toString.call(message.Amount) : options.longs === Number ? new $util.LongBits(message.Amount.low >>> 0, message.Amount.high >>> 0).toNumber() : message.Amount;
            if (message.CurrencyID != null && message.hasOwnProperty("CurrencyID"))
                object.CurrencyID = options.bytes === String ? $util.base64.encode(message.CurrencyID, 0, message.CurrencyID.length) : options.bytes === Array ? Array.prototype.slice.call(message.CurrencyID) : message.CurrencyID;
            return object;
        };

        /**
         * Converts this WithdrawContract to JSON.
         * @function toJSON
         * @memberof proto.WithdrawContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WithdrawContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WithdrawContract
         * @function getTypeUrl
         * @memberof proto.WithdrawContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WithdrawContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.WithdrawContract";
        };

        /**
         * WithdrawType enum.
         * @name proto.WithdrawContract.WithdrawType
         * @enum {number}
         * @property {number} StakingReward=0 StakingReward value
         * @property {number} KDAPool=1 KDAPool value
         * @property {number} KDAFeePool=2 KDAFeePool value
         * @property {number} MarketOrderIDXIN=3 MarketOrderIDXIN value
         * @property {number} MarketOrderIDXOUT=4 MarketOrderIDXOUT value
         */
        WithdrawContract.WithdrawType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "StakingReward"] = 0;
            values[valuesById[1] = "KDAPool"] = 1;
            values[valuesById[2] = "KDAFeePool"] = 2;
            values[valuesById[3] = "MarketOrderIDXIN"] = 3;
            values[valuesById[4] = "MarketOrderIDXOUT"] = 4;
            return values;
        })();

        return WithdrawContract;
    })();

    proto.ClaimContract = (function() {

        /**
         * Properties of a ClaimContract.
         * @memberof proto
         * @interface IClaimContract
         * @property {proto.ClaimContract.ClaimType|null} [Type] ClaimContract Type
         * @property {Uint8Array|null} [ID] ClaimContract ID
         */

        /**
         * Constructs a new ClaimContract.
         * @memberof proto
         * @classdesc Represents a ClaimContract.
         * @implements IClaimContract
         * @constructor
         * @param {proto.IClaimContract=} [properties] Properties to set
         */
        function ClaimContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ClaimContract Type.
         * @member {proto.ClaimContract.ClaimType} Type
         * @memberof proto.ClaimContract
         * @instance
         */
        ClaimContract.prototype.Type = 0;

        /**
         * ClaimContract ID.
         * @member {Uint8Array} ID
         * @memberof proto.ClaimContract
         * @instance
         */
        ClaimContract.prototype.ID = $util.newBuffer([]);

        /**
         * Creates a new ClaimContract instance using the specified properties.
         * @function create
         * @memberof proto.ClaimContract
         * @static
         * @param {proto.IClaimContract=} [properties] Properties to set
         * @returns {proto.ClaimContract} ClaimContract instance
         */
        ClaimContract.create = function create(properties) {
            return new ClaimContract(properties);
        };

        /**
         * Encodes the specified ClaimContract message. Does not implicitly {@link proto.ClaimContract.verify|verify} messages.
         * @function encode
         * @memberof proto.ClaimContract
         * @static
         * @param {proto.IClaimContract} message ClaimContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClaimContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Type != null && Object.hasOwnProperty.call(message, "Type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.Type);
            if (message.ID != null && Object.hasOwnProperty.call(message, "ID"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.ID);
            return writer;
        };

        /**
         * Encodes the specified ClaimContract message, length delimited. Does not implicitly {@link proto.ClaimContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.ClaimContract
         * @static
         * @param {proto.IClaimContract} message ClaimContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ClaimContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ClaimContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.ClaimContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.ClaimContract} ClaimContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClaimContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.ClaimContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.Type = reader.int32();
                        break;
                    }
                case 2: {
                        message.ID = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ClaimContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.ClaimContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.ClaimContract} ClaimContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ClaimContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ClaimContract message.
         * @function verify
         * @memberof proto.ClaimContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ClaimContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Type != null && message.hasOwnProperty("Type"))
                switch (message.Type) {
                default:
                    return "Type: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.ID != null && message.hasOwnProperty("ID"))
                if (!(message.ID && typeof message.ID.length === "number" || $util.isString(message.ID)))
                    return "ID: buffer expected";
            return null;
        };

        /**
         * Creates a ClaimContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.ClaimContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.ClaimContract} ClaimContract
         */
        ClaimContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.ClaimContract)
                return object;
            let message = new $root.proto.ClaimContract();
            switch (object.Type) {
            default:
                if (typeof object.Type === "number") {
                    message.Type = object.Type;
                    break;
                }
                break;
            case "StakingClaim":
            case 0:
                message.Type = 0;
                break;
            case "AllowanceClaim":
            case 1:
                message.Type = 1;
                break;
            case "MarketClaim":
            case 2:
                message.Type = 2;
                break;
            }
            if (object.ID != null)
                if (typeof object.ID === "string")
                    $util.base64.decode(object.ID, message.ID = $util.newBuffer($util.base64.length(object.ID)), 0);
                else if (object.ID.length >= 0)
                    message.ID = object.ID;
            return message;
        };

        /**
         * Creates a plain object from a ClaimContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.ClaimContract
         * @static
         * @param {proto.ClaimContract} message ClaimContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ClaimContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.Type = options.enums === String ? "StakingClaim" : 0;
                if (options.bytes === String)
                    object.ID = "";
                else {
                    object.ID = [];
                    if (options.bytes !== Array)
                        object.ID = $util.newBuffer(object.ID);
                }
            }
            if (message.Type != null && message.hasOwnProperty("Type"))
                object.Type = options.enums === String ? $root.proto.ClaimContract.ClaimType[message.Type] === undefined ? message.Type : $root.proto.ClaimContract.ClaimType[message.Type] : message.Type;
            if (message.ID != null && message.hasOwnProperty("ID"))
                object.ID = options.bytes === String ? $util.base64.encode(message.ID, 0, message.ID.length) : options.bytes === Array ? Array.prototype.slice.call(message.ID) : message.ID;
            return object;
        };

        /**
         * Converts this ClaimContract to JSON.
         * @function toJSON
         * @memberof proto.ClaimContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ClaimContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ClaimContract
         * @function getTypeUrl
         * @memberof proto.ClaimContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ClaimContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.ClaimContract";
        };

        /**
         * ClaimType enum.
         * @name proto.ClaimContract.ClaimType
         * @enum {number}
         * @property {number} StakingClaim=0 StakingClaim value
         * @property {number} AllowanceClaim=1 AllowanceClaim value
         * @property {number} MarketClaim=2 MarketClaim value
         */
        ClaimContract.ClaimType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "StakingClaim"] = 0;
            values[valuesById[1] = "AllowanceClaim"] = 1;
            values[valuesById[2] = "MarketClaim"] = 2;
            return values;
        })();

        return ClaimContract;
    })();

    proto.VoteContract = (function() {

        /**
         * Properties of a VoteContract.
         * @memberof proto
         * @interface IVoteContract
         * @property {number|null} [ProposalID] VoteContract ProposalID
         * @property {proto.VoteContract.VoteType|null} [Type] VoteContract Type
         * @property {number|null} [Amount] VoteContract Amount
         */

        /**
         * Constructs a new VoteContract.
         * @memberof proto
         * @classdesc Represents a VoteContract.
         * @implements IVoteContract
         * @constructor
         * @param {proto.IVoteContract=} [properties] Properties to set
         */
        function VoteContract(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * VoteContract ProposalID.
         * @member {number} ProposalID
         * @memberof proto.VoteContract
         * @instance
         */
        VoteContract.prototype.ProposalID = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * VoteContract Type.
         * @member {proto.VoteContract.VoteType} Type
         * @memberof proto.VoteContract
         * @instance
         */
        VoteContract.prototype.Type = 0;

        /**
         * VoteContract Amount.
         * @member {number} Amount
         * @memberof proto.VoteContract
         * @instance
         */
        VoteContract.prototype.Amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new VoteContract instance using the specified properties.
         * @function create
         * @memberof proto.VoteContract
         * @static
         * @param {proto.IVoteContract=} [properties] Properties to set
         * @returns {proto.VoteContract} VoteContract instance
         */
        VoteContract.create = function create(properties) {
            return new VoteContract(properties);
        };

        /**
         * Encodes the specified VoteContract message. Does not implicitly {@link proto.VoteContract.verify|verify} messages.
         * @function encode
         * @memberof proto.VoteContract
         * @static
         * @param {proto.IVoteContract} message VoteContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VoteContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.ProposalID != null && Object.hasOwnProperty.call(message, "ProposalID"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.ProposalID);
            if (message.Type != null && Object.hasOwnProperty.call(message, "Type"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.Type);
            if (message.Amount != null && Object.hasOwnProperty.call(message, "Amount"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.Amount);
            return writer;
        };

        /**
         * Encodes the specified VoteContract message, length delimited. Does not implicitly {@link proto.VoteContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.VoteContract
         * @static
         * @param {proto.IVoteContract} message VoteContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VoteContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a VoteContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.VoteContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.VoteContract} VoteContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VoteContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.VoteContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.ProposalID = reader.uint64();
                        break;
                    }
                case 2: {
                        message.Type = reader.int32();
                        break;
                    }
                case 3: {
                        message.Amount = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a VoteContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.VoteContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.VoteContract} VoteContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VoteContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a VoteContract message.
         * @function verify
         * @memberof proto.VoteContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        VoteContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.ProposalID != null && message.hasOwnProperty("ProposalID"))
                if (!$util.isInteger(message.ProposalID) && !(message.ProposalID && $util.isInteger(message.ProposalID.low) && $util.isInteger(message.ProposalID.high)))
                    return "ProposalID: integer|Long expected";
            if (message.Type != null && message.hasOwnProperty("Type"))
                switch (message.Type) {
                default:
                    return "Type: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.Amount != null && message.hasOwnProperty("Amount"))
                if (!$util.isInteger(message.Amount) && !(message.Amount && $util.isInteger(message.Amount.low) && $util.isInteger(message.Amount.high)))
                    return "Amount: integer|Long expected";
            return null;
        };

        /**
         * Creates a VoteContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.VoteContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.VoteContract} VoteContract
         */
        VoteContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.VoteContract)
                return object;
            let message = new $root.proto.VoteContract();
            if (object.ProposalID != null)
                if ($util.Long)
                    (message.ProposalID = $util.Long.fromValue(object.ProposalID)).unsigned = true;
                else if (typeof object.ProposalID === "string")
                    message.ProposalID = parseInt(object.ProposalID, 10);
                else if (typeof object.ProposalID === "number")
                    message.ProposalID = object.ProposalID;
                else if (typeof object.ProposalID === "object")
                    message.ProposalID = new $util.LongBits(object.ProposalID.low >>> 0, object.ProposalID.high >>> 0).toNumber(true);
            switch (object.Type) {
            default:
                if (typeof object.Type === "number") {
                    message.Type = object.Type;
                    break;
                }
                break;
            case "Yes":
            case 0:
                message.Type = 0;
                break;
            case "No":
            case 1:
                message.Type = 1;
                break;
            case "Abstain":
            case 2:
                message.Type = 2;
                break;
            }
            if (object.Amount != null)
                if ($util.Long)
                    (message.Amount = $util.Long.fromValue(object.Amount)).unsigned = false;
                else if (typeof object.Amount === "string")
                    message.Amount = parseInt(object.Amount, 10);
                else if (typeof object.Amount === "number")
                    message.Amount = object.Amount;
                else if (typeof object.Amount === "object")
                    message.Amount = new $util.LongBits(object.Amount.low >>> 0, object.Amount.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a VoteContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.VoteContract
         * @static
         * @param {proto.VoteContract} message VoteContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        VoteContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.ProposalID = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.ProposalID = options.longs === String ? "0" : 0;
                object.Type = options.enums === String ? "Yes" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.Amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.Amount = options.longs === String ? "0" : 0;
            }
            if (message.ProposalID != null && message.hasOwnProperty("ProposalID"))
                if (typeof message.ProposalID === "number")
                    object.ProposalID = options.longs === String ? String(message.ProposalID) : message.ProposalID;
                else
                    object.ProposalID = options.longs === String ? $util.Long.prototype.toString.call(message.ProposalID) : options.longs === Number ? new $util.LongBits(message.ProposalID.low >>> 0, message.ProposalID.high >>> 0).toNumber(true) : message.ProposalID;
            if (message.Type != null && message.hasOwnProperty("Type"))
                object.Type = options.enums === String ? $root.proto.VoteContract.VoteType[message.Type] === undefined ? message.Type : $root.proto.VoteContract.VoteType[message.Type] : message.Type;
            if (message.Amount != null && message.hasOwnProperty("Amount"))
                if (typeof message.Amount === "number")
                    object.Amount = options.longs === String ? String(message.Amount) : message.Amount;
                else
                    object.Amount = options.longs === String ? $util.Long.prototype.toString.call(message.Amount) : options.longs === Number ? new $util.LongBits(message.Amount.low >>> 0, message.Amount.high >>> 0).toNumber() : message.Amount;
            return object;
        };

        /**
         * Converts this VoteContract to JSON.
         * @function toJSON
         * @memberof proto.VoteContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        VoteContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for VoteContract
         * @function getTypeUrl
         * @memberof proto.VoteContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        VoteContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.VoteContract";
        };

        /**
         * VoteType enum.
         * @name proto.VoteContract.VoteType
         * @enum {number}
         * @property {number} Yes=0 Yes value
         * @property {number} No=1 No value
         * @property {number} Abstain=2 Abstain value
         */
        VoteContract.VoteType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "Yes"] = 0;
            values[valuesById[1] = "No"] = 1;
            values[valuesById[2] = "Abstain"] = 2;
            return values;
        })();

        return VoteContract;
    })();

    proto.CreateAssetContract = (function() {

        /**
         * Properties of a CreateAssetContract.
         * @memberof proto
         * @interface ICreateAssetContract
         * @property {proto.CreateAssetContract.AssetType|null} [Type] CreateAssetContract Type
         * @property {string|null} [Name] CreateAssetContract Name
         * @property {string|null} [Ticker] CreateAssetContract Ticker
         * @property {Uint8Array|null} [OwnerAddress] CreateAssetContract OwnerAddress
         * @property {string|null} [Logo] CreateAssetContract Logo
         * @property {Array.<string>|null} [URIs] CreateAssetContract URIs
         * @property {number|null} [Precision] CreateAssetContract Precision
         * @property {number|null} [InitialSupply] CreateAssetContract InitialSupply
         * @property {number|null} [MaxSupply] CreateAssetContract MaxSupply
         * @property {proto.CreateAssetContract.IAssetProperties|null} [Properties] CreateAssetContract Properties
         * @property {proto.CreateAssetContract.IAssetAttributes|null} [Attributes] CreateAssetContract Attributes
         */

        /**
         * Constructs a new CreateAssetContract.
         * @memberof proto
         * @classdesc Represents a CreateAssetContract.
         * @implements ICreateAssetContract
         * @constructor
         * @param {proto.ICreateAssetContract=} [properties] Properties to set
         */
        function CreateAssetContract(properties) {
            this.URIs = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * CreateAssetContract Type.
         * @member {proto.CreateAssetContract.AssetType} Type
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.Type = 0;

        /**
         * CreateAssetContract Name.
         * @member {string} Name
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.Name = "";

        /**
         * CreateAssetContract Ticker.
         * @member {string} Ticker
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.Ticker = "";

        /**
         * CreateAssetContract OwnerAddress.
         * @member {Uint8Array} OwnerAddress
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.OwnerAddress = $util.newBuffer([]);

        /**
         * CreateAssetContract Logo.
         * @member {string} Logo
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.Logo = "";

        /**
         * CreateAssetContract URIs.
         * @member {Array.<string>} URIs
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.URIs = $util.emptyArray;

        /**
         * CreateAssetContract Precision.
         * @member {number} Precision
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.Precision = 0;

        /**
         * CreateAssetContract InitialSupply.
         * @member {number} InitialSupply
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.InitialSupply = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * CreateAssetContract MaxSupply.
         * @member {number} MaxSupply
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.MaxSupply = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * CreateAssetContract Properties.
         * @member {proto.CreateAssetContract.IAssetProperties|null|undefined} Properties
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.Properties = null;

        /**
         * CreateAssetContract Attributes.
         * @member {proto.CreateAssetContract.IAssetAttributes|null|undefined} Attributes
         * @memberof proto.CreateAssetContract
         * @instance
         */
        CreateAssetContract.prototype.Attributes = null;

        /**
         * Creates a new CreateAssetContract instance using the specified properties.
         * @function create
         * @memberof proto.CreateAssetContract
         * @static
         * @param {proto.ICreateAssetContract=} [properties] Properties to set
         * @returns {proto.CreateAssetContract} CreateAssetContract instance
         */
        CreateAssetContract.create = function create(properties) {
            return new CreateAssetContract(properties);
        };

        /**
         * Encodes the specified CreateAssetContract message. Does not implicitly {@link proto.CreateAssetContract.verify|verify} messages.
         * @function encode
         * @memberof proto.CreateAssetContract
         * @static
         * @param {proto.ICreateAssetContract} message CreateAssetContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateAssetContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Type != null && Object.hasOwnProperty.call(message, "Type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.Type);
            if (message.Name != null && Object.hasOwnProperty.call(message, "Name"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.Name);
            if (message.Ticker != null && Object.hasOwnProperty.call(message, "Ticker"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.Ticker);
            if (message.OwnerAddress != null && Object.hasOwnProperty.call(message, "OwnerAddress"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.OwnerAddress);
            if (message.Logo != null && Object.hasOwnProperty.call(message, "Logo"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.Logo);
            if (message.URIs != null && message.URIs.length)
                for (let i = 0; i < message.URIs.length; ++i)
                    writer.uint32(/* id 6, wireType 2 =*/50).string(message.URIs[i]);
            if (message.Precision != null && Object.hasOwnProperty.call(message, "Precision"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint32(message.Precision);
            if (message.InitialSupply != null && Object.hasOwnProperty.call(message, "InitialSupply"))
                writer.uint32(/* id 8, wireType 0 =*/64).int64(message.InitialSupply);
            if (message.MaxSupply != null && Object.hasOwnProperty.call(message, "MaxSupply"))
                writer.uint32(/* id 9, wireType 0 =*/72).int64(message.MaxSupply);
            if (message.Properties != null && Object.hasOwnProperty.call(message, "Properties"))
                $root.proto.CreateAssetContract.AssetProperties.encode(message.Properties, writer.uint32(/* id 10, wireType 2 =*/82).fork()).ldelim();
            if (message.Attributes != null && Object.hasOwnProperty.call(message, "Attributes"))
                $root.proto.CreateAssetContract.AssetAttributes.encode(message.Attributes, writer.uint32(/* id 11, wireType 2 =*/90).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified CreateAssetContract message, length delimited. Does not implicitly {@link proto.CreateAssetContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.CreateAssetContract
         * @static
         * @param {proto.ICreateAssetContract} message CreateAssetContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CreateAssetContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a CreateAssetContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.CreateAssetContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.CreateAssetContract} CreateAssetContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateAssetContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.CreateAssetContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.Type = reader.int32();
                        break;
                    }
                case 2: {
                        message.Name = reader.string();
                        break;
                    }
                case 3: {
                        message.Ticker = reader.string();
                        break;
                    }
                case 4: {
                        message.OwnerAddress = reader.bytes();
                        break;
                    }
                case 5: {
                        message.Logo = reader.string();
                        break;
                    }
                case 6: {
                        if (!(message.URIs && message.URIs.length))
                            message.URIs = [];
                        message.URIs.push(reader.string());
                        break;
                    }
                case 7: {
                        message.Precision = reader.uint32();
                        break;
                    }
                case 8: {
                        message.InitialSupply = reader.int64();
                        break;
                    }
                case 9: {
                        message.MaxSupply = reader.int64();
                        break;
                    }
                case 10: {
                        message.Properties = $root.proto.CreateAssetContract.AssetProperties.decode(reader, reader.uint32());
                        break;
                    }
                case 11: {
                        message.Attributes = $root.proto.CreateAssetContract.AssetAttributes.decode(reader, reader.uint32());
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a CreateAssetContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.CreateAssetContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.CreateAssetContract} CreateAssetContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CreateAssetContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a CreateAssetContract message.
         * @function verify
         * @memberof proto.CreateAssetContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CreateAssetContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Type != null && message.hasOwnProperty("Type"))
                switch (message.Type) {
                default:
                    return "Type: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.Name != null && message.hasOwnProperty("Name"))
                if (!$util.isString(message.Name))
                    return "Name: string expected";
            if (message.Ticker != null && message.hasOwnProperty("Ticker"))
                if (!$util.isString(message.Ticker))
                    return "Ticker: string expected";
            if (message.OwnerAddress != null && message.hasOwnProperty("OwnerAddress"))
                if (!(message.OwnerAddress && typeof message.OwnerAddress.length === "number" || $util.isString(message.OwnerAddress)))
                    return "OwnerAddress: buffer expected";
            if (message.Logo != null && message.hasOwnProperty("Logo"))
                if (!$util.isString(message.Logo))
                    return "Logo: string expected";
            if (message.URIs != null && message.hasOwnProperty("URIs")) {
                if (!Array.isArray(message.URIs))
                    return "URIs: array expected";
                for (let i = 0; i < message.URIs.length; ++i)
                    if (!$util.isString(message.URIs[i]))
                        return "URIs: string[] expected";
            }
            if (message.Precision != null && message.hasOwnProperty("Precision"))
                if (!$util.isInteger(message.Precision))
                    return "Precision: integer expected";
            if (message.InitialSupply != null && message.hasOwnProperty("InitialSupply"))
                if (!$util.isInteger(message.InitialSupply) && !(message.InitialSupply && $util.isInteger(message.InitialSupply.low) && $util.isInteger(message.InitialSupply.high)))
                    return "InitialSupply: integer|Long expected";
            if (message.MaxSupply != null && message.hasOwnProperty("MaxSupply"))
                if (!$util.isInteger(message.MaxSupply) && !(message.MaxSupply && $util.isInteger(message.MaxSupply.low) && $util.isInteger(message.MaxSupply.high)))
                    return "MaxSupply: integer|Long expected";
            if (message.Properties != null && message.hasOwnProperty("Properties")) {
                let error = $root.proto.CreateAssetContract.AssetProperties.verify(message.Properties);
                if (error)
                    return "Properties." + error;
            }
            if (message.Attributes != null && message.hasOwnProperty("Attributes")) {
                let error = $root.proto.CreateAssetContract.AssetAttributes.verify(message.Attributes);
                if (error)
                    return "Attributes." + error;
            }
            return null;
        };

        /**
         * Creates a CreateAssetContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.CreateAssetContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.CreateAssetContract} CreateAssetContract
         */
        CreateAssetContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.CreateAssetContract)
                return object;
            let message = new $root.proto.CreateAssetContract();
            switch (object.Type) {
            default:
                if (typeof object.Type === "number") {
                    message.Type = object.Type;
                    break;
                }
                break;
            case "Fungible":
            case 0:
                message.Type = 0;
                break;
            case "NonFungible":
            case 1:
                message.Type = 1;
                break;
            case "SemiFungible":
            case 2:
                message.Type = 2;
                break;
            }
            if (object.Name != null)
                message.Name = String(object.Name);
            if (object.Ticker != null)
                message.Ticker = String(object.Ticker);
            if (object.OwnerAddress != null)
                if (typeof object.OwnerAddress === "string")
                    $util.base64.decode(object.OwnerAddress, message.OwnerAddress = $util.newBuffer($util.base64.length(object.OwnerAddress)), 0);
                else if (object.OwnerAddress.length >= 0)
                    message.OwnerAddress = object.OwnerAddress;
            if (object.Logo != null)
                message.Logo = String(object.Logo);
            if (object.URIs) {
                if (!Array.isArray(object.URIs))
                    throw TypeError(".proto.CreateAssetContract.URIs: array expected");
                message.URIs = [];
                for (let i = 0; i < object.URIs.length; ++i)
                    message.URIs[i] = String(object.URIs[i]);
            }
            if (object.Precision != null)
                message.Precision = object.Precision >>> 0;
            if (object.InitialSupply != null)
                if ($util.Long)
                    (message.InitialSupply = $util.Long.fromValue(object.InitialSupply)).unsigned = false;
                else if (typeof object.InitialSupply === "string")
                    message.InitialSupply = parseInt(object.InitialSupply, 10);
                else if (typeof object.InitialSupply === "number")
                    message.InitialSupply = object.InitialSupply;
                else if (typeof object.InitialSupply === "object")
                    message.InitialSupply = new $util.LongBits(object.InitialSupply.low >>> 0, object.InitialSupply.high >>> 0).toNumber();
            if (object.MaxSupply != null)
                if ($util.Long)
                    (message.MaxSupply = $util.Long.fromValue(object.MaxSupply)).unsigned = false;
                else if (typeof object.MaxSupply === "string")
                    message.MaxSupply = parseInt(object.MaxSupply, 10);
                else if (typeof object.MaxSupply === "number")
                    message.MaxSupply = object.MaxSupply;
                else if (typeof object.MaxSupply === "object")
                    message.MaxSupply = new $util.LongBits(object.MaxSupply.low >>> 0, object.MaxSupply.high >>> 0).toNumber();
            if (object.Properties != null) {
                if (typeof object.Properties !== "object")
                    throw TypeError(".proto.CreateAssetContract.Properties: object expected");
                message.Properties = $root.proto.CreateAssetContract.AssetProperties.fromObject(object.Properties);
            }
            if (object.Attributes != null) {
                if (typeof object.Attributes !== "object")
                    throw TypeError(".proto.CreateAssetContract.Attributes: object expected");
                message.Attributes = $root.proto.CreateAssetContract.AssetAttributes.fromObject(object.Attributes);
            }
            return message;
        };

        /**
         * Creates a plain object from a CreateAssetContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.CreateAssetContract
         * @static
         * @param {proto.CreateAssetContract} message CreateAssetContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CreateAssetContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.URIs = [];
            if (options.defaults) {
                object.Type = options.enums === String ? "Fungible" : 0;
                object.Name = "";
                object.Ticker = "";
                if (options.bytes === String)
                    object.OwnerAddress = "";
                else {
                    object.OwnerAddress = [];
                    if (options.bytes !== Array)
                        object.OwnerAddress = $util.newBuffer(object.OwnerAddress);
                }
                object.Logo = "";
                object.Precision = 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.InitialSupply = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.InitialSupply = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.MaxSupply = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.MaxSupply = options.longs === String ? "0" : 0;
                object.Properties = null;
                object.Attributes = null;
            }
            if (message.Type != null && message.hasOwnProperty("Type"))
                object.Type = options.enums === String ? $root.proto.CreateAssetContract.AssetType[message.Type] === undefined ? message.Type : $root.proto.CreateAssetContract.AssetType[message.Type] : message.Type;
            if (message.Name != null && message.hasOwnProperty("Name"))
                object.Name = message.Name;
            if (message.Ticker != null && message.hasOwnProperty("Ticker"))
                object.Ticker = message.Ticker;
            if (message.OwnerAddress != null && message.hasOwnProperty("OwnerAddress"))
                object.OwnerAddress = options.bytes === String ? $util.base64.encode(message.OwnerAddress, 0, message.OwnerAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.OwnerAddress) : message.OwnerAddress;
            if (message.Logo != null && message.hasOwnProperty("Logo"))
                object.Logo = message.Logo;
            if (message.URIs && message.URIs.length) {
                object.URIs = [];
                for (let j = 0; j < message.URIs.length; ++j)
                    object.URIs[j] = message.URIs[j];
            }
            if (message.Precision != null && message.hasOwnProperty("Precision"))
                object.Precision = message.Precision;
            if (message.InitialSupply != null && message.hasOwnProperty("InitialSupply"))
                if (typeof message.InitialSupply === "number")
                    object.InitialSupply = options.longs === String ? String(message.InitialSupply) : message.InitialSupply;
                else
                    object.InitialSupply = options.longs === String ? $util.Long.prototype.toString.call(message.InitialSupply) : options.longs === Number ? new $util.LongBits(message.InitialSupply.low >>> 0, message.InitialSupply.high >>> 0).toNumber() : message.InitialSupply;
            if (message.MaxSupply != null && message.hasOwnProperty("MaxSupply"))
                if (typeof message.MaxSupply === "number")
                    object.MaxSupply = options.longs === String ? String(message.MaxSupply) : message.MaxSupply;
                else
                    object.MaxSupply = options.longs === String ? $util.Long.prototype.toString.call(message.MaxSupply) : options.longs === Number ? new $util.LongBits(message.MaxSupply.low >>> 0, message.MaxSupply.high >>> 0).toNumber() : message.MaxSupply;
            if (message.Properties != null && message.hasOwnProperty("Properties"))
                object.Properties = $root.proto.CreateAssetContract.AssetProperties.toObject(message.Properties, options);
            if (message.Attributes != null && message.hasOwnProperty("Attributes"))
                object.Attributes = $root.proto.CreateAssetContract.AssetAttributes.toObject(message.Attributes, options);
            return object;
        };

        /**
         * Converts this CreateAssetContract to JSON.
         * @function toJSON
         * @memberof proto.CreateAssetContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CreateAssetContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for CreateAssetContract
         * @function getTypeUrl
         * @memberof proto.CreateAssetContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CreateAssetContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.CreateAssetContract";
        };

        /**
         * AssetType enum.
         * @name proto.CreateAssetContract.AssetType
         * @enum {number}
         * @property {number} Fungible=0 Fungible value
         * @property {number} NonFungible=1 NonFungible value
         * @property {number} SemiFungible=2 SemiFungible value
         */
        CreateAssetContract.AssetType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "Fungible"] = 0;
            values[valuesById[1] = "NonFungible"] = 1;
            values[valuesById[2] = "SemiFungible"] = 2;
            return values;
        })();

        CreateAssetContract.AssetProperties = (function() {

            /**
             * Properties of an AssetProperties.
             * @memberof proto.CreateAssetContract
             * @interface IAssetProperties
             * @property {boolean|null} [CanFreeze] AssetProperties CanFreeze
             * @property {boolean|null} [CanWipe] AssetProperties CanWipe
             * @property {boolean|null} [CanPause] AssetProperties CanPause
             * @property {boolean|null} [CanMint] AssetProperties CanMint
             * @property {boolean|null} [CanBurn] AssetProperties CanBurn
             * @property {boolean|null} [CanChangeOwner] AssetProperties CanChangeOwner
             * @property {boolean|null} [CanAddRoles] AssetProperties CanAddRoles
             */

            /**
             * Constructs a new AssetProperties.
             * @memberof proto.CreateAssetContract
             * @classdesc Represents an AssetProperties.
             * @implements IAssetProperties
             * @constructor
             * @param {proto.CreateAssetContract.IAssetProperties=} [properties] Properties to set
             */
            function AssetProperties(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AssetProperties CanFreeze.
             * @member {boolean} CanFreeze
             * @memberof proto.CreateAssetContract.AssetProperties
             * @instance
             */
            AssetProperties.prototype.CanFreeze = false;

            /**
             * AssetProperties CanWipe.
             * @member {boolean} CanWipe
             * @memberof proto.CreateAssetContract.AssetProperties
             * @instance
             */
            AssetProperties.prototype.CanWipe = false;

            /**
             * AssetProperties CanPause.
             * @member {boolean} CanPause
             * @memberof proto.CreateAssetContract.AssetProperties
             * @instance
             */
            AssetProperties.prototype.CanPause = false;

            /**
             * AssetProperties CanMint.
             * @member {boolean} CanMint
             * @memberof proto.CreateAssetContract.AssetProperties
             * @instance
             */
            AssetProperties.prototype.CanMint = false;

            /**
             * AssetProperties CanBurn.
             * @member {boolean} CanBurn
             * @memberof proto.CreateAssetContract.AssetProperties
             * @instance
             */
            AssetProperties.prototype.CanBurn = false;

            /**
             * AssetProperties CanChangeOwner.
             * @member {boolean} CanChangeOwner
             * @memberof proto.CreateAssetContract.AssetProperties
             * @instance
             */
            AssetProperties.prototype.CanChangeOwner = false;

            /**
             * AssetProperties CanAddRoles.
             * @member {boolean} CanAddRoles
             * @memberof proto.CreateAssetContract.AssetProperties
             * @instance
             */
            AssetProperties.prototype.CanAddRoles = false;

            /**
             * Creates a new AssetProperties instance using the specified properties.
             * @function create
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {proto.CreateAssetContract.IAssetProperties=} [properties] Properties to set
             * @returns {proto.CreateAssetContract.AssetProperties} AssetProperties instance
             */
            AssetProperties.create = function create(properties) {
                return new AssetProperties(properties);
            };

            /**
             * Encodes the specified AssetProperties message. Does not implicitly {@link proto.CreateAssetContract.AssetProperties.verify|verify} messages.
             * @function encode
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {proto.CreateAssetContract.IAssetProperties} message AssetProperties message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AssetProperties.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.CanFreeze != null && Object.hasOwnProperty.call(message, "CanFreeze"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.CanFreeze);
                if (message.CanWipe != null && Object.hasOwnProperty.call(message, "CanWipe"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.CanWipe);
                if (message.CanPause != null && Object.hasOwnProperty.call(message, "CanPause"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.CanPause);
                if (message.CanMint != null && Object.hasOwnProperty.call(message, "CanMint"))
                    writer.uint32(/* id 4, wireType 0 =*/32).bool(message.CanMint);
                if (message.CanBurn != null && Object.hasOwnProperty.call(message, "CanBurn"))
                    writer.uint32(/* id 5, wireType 0 =*/40).bool(message.CanBurn);
                if (message.CanChangeOwner != null && Object.hasOwnProperty.call(message, "CanChangeOwner"))
                    writer.uint32(/* id 6, wireType 0 =*/48).bool(message.CanChangeOwner);
                if (message.CanAddRoles != null && Object.hasOwnProperty.call(message, "CanAddRoles"))
                    writer.uint32(/* id 7, wireType 0 =*/56).bool(message.CanAddRoles);
                return writer;
            };

            /**
             * Encodes the specified AssetProperties message, length delimited. Does not implicitly {@link proto.CreateAssetContract.AssetProperties.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {proto.CreateAssetContract.IAssetProperties} message AssetProperties message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AssetProperties.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AssetProperties message from the specified reader or buffer.
             * @function decode
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.CreateAssetContract.AssetProperties} AssetProperties
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AssetProperties.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.CreateAssetContract.AssetProperties();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.CanFreeze = reader.bool();
                            break;
                        }
                    case 2: {
                            message.CanWipe = reader.bool();
                            break;
                        }
                    case 3: {
                            message.CanPause = reader.bool();
                            break;
                        }
                    case 4: {
                            message.CanMint = reader.bool();
                            break;
                        }
                    case 5: {
                            message.CanBurn = reader.bool();
                            break;
                        }
                    case 6: {
                            message.CanChangeOwner = reader.bool();
                            break;
                        }
                    case 7: {
                            message.CanAddRoles = reader.bool();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AssetProperties message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.CreateAssetContract.AssetProperties} AssetProperties
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AssetProperties.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AssetProperties message.
             * @function verify
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AssetProperties.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.CanFreeze != null && message.hasOwnProperty("CanFreeze"))
                    if (typeof message.CanFreeze !== "boolean")
                        return "CanFreeze: boolean expected";
                if (message.CanWipe != null && message.hasOwnProperty("CanWipe"))
                    if (typeof message.CanWipe !== "boolean")
                        return "CanWipe: boolean expected";
                if (message.CanPause != null && message.hasOwnProperty("CanPause"))
                    if (typeof message.CanPause !== "boolean")
                        return "CanPause: boolean expected";
                if (message.CanMint != null && message.hasOwnProperty("CanMint"))
                    if (typeof message.CanMint !== "boolean")
                        return "CanMint: boolean expected";
                if (message.CanBurn != null && message.hasOwnProperty("CanBurn"))
                    if (typeof message.CanBurn !== "boolean")
                        return "CanBurn: boolean expected";
                if (message.CanChangeOwner != null && message.hasOwnProperty("CanChangeOwner"))
                    if (typeof message.CanChangeOwner !== "boolean")
                        return "CanChangeOwner: boolean expected";
                if (message.CanAddRoles != null && message.hasOwnProperty("CanAddRoles"))
                    if (typeof message.CanAddRoles !== "boolean")
                        return "CanAddRoles: boolean expected";
                return null;
            };

            /**
             * Creates an AssetProperties message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.CreateAssetContract.AssetProperties} AssetProperties
             */
            AssetProperties.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.CreateAssetContract.AssetProperties)
                    return object;
                let message = new $root.proto.CreateAssetContract.AssetProperties();
                if (object.CanFreeze != null)
                    message.CanFreeze = Boolean(object.CanFreeze);
                if (object.CanWipe != null)
                    message.CanWipe = Boolean(object.CanWipe);
                if (object.CanPause != null)
                    message.CanPause = Boolean(object.CanPause);
                if (object.CanMint != null)
                    message.CanMint = Boolean(object.CanMint);
                if (object.CanBurn != null)
                    message.CanBurn = Boolean(object.CanBurn);
                if (object.CanChangeOwner != null)
                    message.CanChangeOwner = Boolean(object.CanChangeOwner);
                if (object.CanAddRoles != null)
                    message.CanAddRoles = Boolean(object.CanAddRoles);
                return message;
            };

            /**
             * Creates a plain object from an AssetProperties message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {proto.CreateAssetContract.AssetProperties} message AssetProperties
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AssetProperties.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.CanFreeze = false;
                    object.CanWipe = false;
                    object.CanPause = false;
                    object.CanMint = false;
                    object.CanBurn = false;
                    object.CanChangeOwner = false;
                    object.CanAddRoles = false;
                }
                if (message.CanFreeze != null && message.hasOwnProperty("CanFreeze"))
                    object.CanFreeze = message.CanFreeze;
                if (message.CanWipe != null && message.hasOwnProperty("CanWipe"))
                    object.CanWipe = message.CanWipe;
                if (message.CanPause != null && message.hasOwnProperty("CanPause"))
                    object.CanPause = message.CanPause;
                if (message.CanMint != null && message.hasOwnProperty("CanMint"))
                    object.CanMint = message.CanMint;
                if (message.CanBurn != null && message.hasOwnProperty("CanBurn"))
                    object.CanBurn = message.CanBurn;
                if (message.CanChangeOwner != null && message.hasOwnProperty("CanChangeOwner"))
                    object.CanChangeOwner = message.CanChangeOwner;
                if (message.CanAddRoles != null && message.hasOwnProperty("CanAddRoles"))
                    object.CanAddRoles = message.CanAddRoles;
                return object;
            };

            /**
             * Converts this AssetProperties to JSON.
             * @function toJSON
             * @memberof proto.CreateAssetContract.AssetProperties
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AssetProperties.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AssetProperties
             * @function getTypeUrl
             * @memberof proto.CreateAssetContract.AssetProperties
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AssetProperties.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.CreateAssetContract.AssetProperties";
            };

            return AssetProperties;
        })();

        CreateAssetContract.AssetAttributes = (function() {

            /**
             * Properties of an AssetAttributes.
             * @memberof proto.CreateAssetContract
             * @interface IAssetAttributes
             * @property {boolean|null} [IsPaused] AssetAttributes IsPaused
             * @property {boolean|null} [IsNFTMintStopped] AssetAttributes IsNFTMintStopped
             */

            /**
             * Constructs a new AssetAttributes.
             * @memberof proto.CreateAssetContract
             * @classdesc Represents an AssetAttributes.
             * @implements IAssetAttributes
             * @constructor
             * @param {proto.CreateAssetContract.IAssetAttributes=} [properties] Properties to set
             */
            function AssetAttributes(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * AssetAttributes IsPaused.
             * @member {boolean} IsPaused
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @instance
             */
            AssetAttributes.prototype.IsPaused = false;

            /**
             * AssetAttributes IsNFTMintStopped.
             * @member {boolean} IsNFTMintStopped
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @instance
             */
            AssetAttributes.prototype.IsNFTMintStopped = false;

            /**
             * Creates a new AssetAttributes instance using the specified properties.
             * @function create
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {proto.CreateAssetContract.IAssetAttributes=} [properties] Properties to set
             * @returns {proto.CreateAssetContract.AssetAttributes} AssetAttributes instance
             */
            AssetAttributes.create = function create(properties) {
                return new AssetAttributes(properties);
            };

            /**
             * Encodes the specified AssetAttributes message. Does not implicitly {@link proto.CreateAssetContract.AssetAttributes.verify|verify} messages.
             * @function encode
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {proto.CreateAssetContract.IAssetAttributes} message AssetAttributes message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AssetAttributes.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.IsPaused != null && Object.hasOwnProperty.call(message, "IsPaused"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.IsPaused);
                if (message.IsNFTMintStopped != null && Object.hasOwnProperty.call(message, "IsNFTMintStopped"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.IsNFTMintStopped);
                return writer;
            };

            /**
             * Encodes the specified AssetAttributes message, length delimited. Does not implicitly {@link proto.CreateAssetContract.AssetAttributes.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {proto.CreateAssetContract.IAssetAttributes} message AssetAttributes message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            AssetAttributes.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an AssetAttributes message from the specified reader or buffer.
             * @function decode
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.CreateAssetContract.AssetAttributes} AssetAttributes
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AssetAttributes.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.CreateAssetContract.AssetAttributes();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.IsPaused = reader.bool();
                            break;
                        }
                    case 2: {
                            message.IsNFTMintStopped = reader.bool();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an AssetAttributes message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.CreateAssetContract.AssetAttributes} AssetAttributes
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            AssetAttributes.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an AssetAttributes message.
             * @function verify
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            AssetAttributes.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.IsPaused != null && message.hasOwnProperty("IsPaused"))
                    if (typeof message.IsPaused !== "boolean")
                        return "IsPaused: boolean expected";
                if (message.IsNFTMintStopped != null && message.hasOwnProperty("IsNFTMintStopped"))
                    if (typeof message.IsNFTMintStopped !== "boolean")
                        return "IsNFTMintStopped: boolean expected";
                return null;
            };

            /**
             * Creates an AssetAttributes message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.CreateAssetContract.AssetAttributes} AssetAttributes
             */
            AssetAttributes.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.CreateAssetContract.AssetAttributes)
                    return object;
                let message = new $root.proto.CreateAssetContract.AssetAttributes();
                if (object.IsPaused != null)
                    message.IsPaused = Boolean(object.IsPaused);
                if (object.IsNFTMintStopped != null)
                    message.IsNFTMintStopped = Boolean(object.IsNFTMintStopped);
                return message;
            };

            /**
             * Creates a plain object from an AssetAttributes message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {proto.CreateAssetContract.AssetAttributes} message AssetAttributes
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            AssetAttributes.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.IsPaused = false;
                    object.IsNFTMintStopped = false;
                }
                if (message.IsPaused != null && message.hasOwnProperty("IsPaused"))
                    object.IsPaused = message.IsPaused;
                if (message.IsNFTMintStopped != null && message.hasOwnProperty("IsNFTMintStopped"))
                    object.IsNFTMintStopped = message.IsNFTMintStopped;
                return object;
            };

            /**
             * Converts this AssetAttributes to JSON.
             * @function toJSON
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            AssetAttributes.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for AssetAttributes
             * @function getTypeUrl
             * @memberof proto.CreateAssetContract.AssetAttributes
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            AssetAttributes.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.CreateAssetContract.AssetAttributes";
            };

            return AssetAttributes;
        })();

        return CreateAssetContract;
    })();

    proto.SmartContract = (function() {

        /**
         * Properties of a SmartContract.
         * @memberof proto
         * @interface ISmartContract
         * @property {proto.SmartContract.SCType|null} [Type] SmartContract Type
         * @property {Uint8Array|null} [Address] SmartContract Address
         * @property {Array.<proto.SmartContract.ICallValueData>|null} [CallValue] SmartContract CallValue
         * @property {Uint8Array|null} [Input] SmartContract Input
         * @property {string|null} [VirtualMachine] SmartContract VirtualMachine
         */

        /**
         * Constructs a new SmartContract.
         * @memberof proto
         * @classdesc Represents a SmartContract.
         * @implements ISmartContract
         * @constructor
         * @param {proto.ISmartContract=} [properties] Properties to set
         */
        function SmartContract(properties) {
            this.CallValue = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SmartContract Type.
         * @member {proto.SmartContract.SCType} Type
         * @memberof proto.SmartContract
         * @instance
         */
        SmartContract.prototype.Type = 0;

        /**
         * SmartContract Address.
         * @member {Uint8Array} Address
         * @memberof proto.SmartContract
         * @instance
         */
        SmartContract.prototype.Address = $util.newBuffer([]);

        /**
         * SmartContract CallValue.
         * @member {Array.<proto.SmartContract.ICallValueData>} CallValue
         * @memberof proto.SmartContract
         * @instance
         */
        SmartContract.prototype.CallValue = $util.emptyArray;

        /**
         * SmartContract Input.
         * @member {Uint8Array} Input
         * @memberof proto.SmartContract
         * @instance
         */
        SmartContract.prototype.Input = $util.newBuffer([]);

        /**
         * SmartContract VirtualMachine.
         * @member {string} VirtualMachine
         * @memberof proto.SmartContract
         * @instance
         */
        SmartContract.prototype.VirtualMachine = "";

        /**
         * Creates a new SmartContract instance using the specified properties.
         * @function create
         * @memberof proto.SmartContract
         * @static
         * @param {proto.ISmartContract=} [properties] Properties to set
         * @returns {proto.SmartContract} SmartContract instance
         */
        SmartContract.create = function create(properties) {
            return new SmartContract(properties);
        };

        /**
         * Encodes the specified SmartContract message. Does not implicitly {@link proto.SmartContract.verify|verify} messages.
         * @function encode
         * @memberof proto.SmartContract
         * @static
         * @param {proto.ISmartContract} message SmartContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SmartContract.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Type != null && Object.hasOwnProperty.call(message, "Type"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.Type);
            if (message.Address != null && Object.hasOwnProperty.call(message, "Address"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.Address);
            if (message.CallValue != null && message.CallValue.length)
                for (let i = 0; i < message.CallValue.length; ++i)
                    $root.proto.SmartContract.CallValueData.encode(message.CallValue[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.Input != null && Object.hasOwnProperty.call(message, "Input"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.Input);
            if (message.VirtualMachine != null && Object.hasOwnProperty.call(message, "VirtualMachine"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.VirtualMachine);
            return writer;
        };

        /**
         * Encodes the specified SmartContract message, length delimited. Does not implicitly {@link proto.SmartContract.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.SmartContract
         * @static
         * @param {proto.ISmartContract} message SmartContract message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SmartContract.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SmartContract message from the specified reader or buffer.
         * @function decode
         * @memberof proto.SmartContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.SmartContract} SmartContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SmartContract.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.SmartContract();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.Type = reader.int32();
                        break;
                    }
                case 2: {
                        message.Address = reader.bytes();
                        break;
                    }
                case 3: {
                        if (!(message.CallValue && message.CallValue.length))
                            message.CallValue = [];
                        message.CallValue.push($root.proto.SmartContract.CallValueData.decode(reader, reader.uint32()));
                        break;
                    }
                case 4: {
                        message.Input = reader.bytes();
                        break;
                    }
                case 5: {
                        message.VirtualMachine = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SmartContract message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.SmartContract
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.SmartContract} SmartContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SmartContract.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SmartContract message.
         * @function verify
         * @memberof proto.SmartContract
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SmartContract.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Type != null && message.hasOwnProperty("Type"))
                switch (message.Type) {
                default:
                    return "Type: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.Address != null && message.hasOwnProperty("Address"))
                if (!(message.Address && typeof message.Address.length === "number" || $util.isString(message.Address)))
                    return "Address: buffer expected";
            if (message.CallValue != null && message.hasOwnProperty("CallValue")) {
                if (!Array.isArray(message.CallValue))
                    return "CallValue: array expected";
                for (let i = 0; i < message.CallValue.length; ++i) {
                    let error = $root.proto.SmartContract.CallValueData.verify(message.CallValue[i]);
                    if (error)
                        return "CallValue." + error;
                }
            }
            if (message.Input != null && message.hasOwnProperty("Input"))
                if (!(message.Input && typeof message.Input.length === "number" || $util.isString(message.Input)))
                    return "Input: buffer expected";
            if (message.VirtualMachine != null && message.hasOwnProperty("VirtualMachine"))
                if (!$util.isString(message.VirtualMachine))
                    return "VirtualMachine: string expected";
            return null;
        };

        /**
         * Creates a SmartContract message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.SmartContract
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.SmartContract} SmartContract
         */
        SmartContract.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.SmartContract)
                return object;
            let message = new $root.proto.SmartContract();
            switch (object.Type) {
            default:
                if (typeof object.Type === "number") {
                    message.Type = object.Type;
                    break;
                }
                break;
            case "SCInvokeType":
            case 0:
                message.Type = 0;
                break;
            case "SCDeployType":
            case 1:
                message.Type = 1;
                break;
            case "SCUpgradeType":
            case 2:
                message.Type = 2;
                break;
            }
            if (object.Address != null)
                if (typeof object.Address === "string")
                    $util.base64.decode(object.Address, message.Address = $util.newBuffer($util.base64.length(object.Address)), 0);
                else if (object.Address.length >= 0)
                    message.Address = object.Address;
            if (object.CallValue) {
                if (!Array.isArray(object.CallValue))
                    throw TypeError(".proto.SmartContract.CallValue: array expected");
                message.CallValue = [];
                for (let i = 0; i < object.CallValue.length; ++i) {
                    if (typeof object.CallValue[i] !== "object")
                        throw TypeError(".proto.SmartContract.CallValue: object expected");
                    message.CallValue[i] = $root.proto.SmartContract.CallValueData.fromObject(object.CallValue[i]);
                }
            }
            if (object.Input != null)
                if (typeof object.Input === "string")
                    $util.base64.decode(object.Input, message.Input = $util.newBuffer($util.base64.length(object.Input)), 0);
                else if (object.Input.length >= 0)
                    message.Input = object.Input;
            if (object.VirtualMachine != null)
                message.VirtualMachine = String(object.VirtualMachine);
            return message;
        };

        /**
         * Creates a plain object from a SmartContract message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.SmartContract
         * @static
         * @param {proto.SmartContract} message SmartContract
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SmartContract.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.CallValue = [];
            if (options.defaults) {
                object.Type = options.enums === String ? "SCInvokeType" : 0;
                if (options.bytes === String)
                    object.Address = "";
                else {
                    object.Address = [];
                    if (options.bytes !== Array)
                        object.Address = $util.newBuffer(object.Address);
                }
                if (options.bytes === String)
                    object.Input = "";
                else {
                    object.Input = [];
                    if (options.bytes !== Array)
                        object.Input = $util.newBuffer(object.Input);
                }
                object.VirtualMachine = "";
            }
            if (message.Type != null && message.hasOwnProperty("Type"))
                object.Type = options.enums === String ? $root.proto.SmartContract.SCType[message.Type] === undefined ? message.Type : $root.proto.SmartContract.SCType[message.Type] : message.Type;
            if (message.Address != null && message.hasOwnProperty("Address"))
                object.Address = options.bytes === String ? $util.base64.encode(message.Address, 0, message.Address.length) : options.bytes === Array ? Array.prototype.slice.call(message.Address) : message.Address;
            if (message.CallValue && message.CallValue.length) {
                object.CallValue = [];
                for (let j = 0; j < message.CallValue.length; ++j)
                    object.CallValue[j] = $root.proto.SmartContract.CallValueData.toObject(message.CallValue[j], options);
            }
            if (message.Input != null && message.hasOwnProperty("Input"))
                object.Input = options.bytes === String ? $util.base64.encode(message.Input, 0, message.Input.length) : options.bytes === Array ? Array.prototype.slice.call(message.Input) : message.Input;
            if (message.VirtualMachine != null && message.hasOwnProperty("VirtualMachine"))
                object.VirtualMachine = message.VirtualMachine;
            return object;
        };

        /**
         * Converts this SmartContract to JSON.
         * @function toJSON
         * @memberof proto.SmartContract
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SmartContract.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for SmartContract
         * @function getTypeUrl
         * @memberof proto.SmartContract
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        SmartContract.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.SmartContract";
        };

        /**
         * SCType enum.
         * @name proto.SmartContract.SCType
         * @enum {number}
         * @property {number} SCInvokeType=0 SCInvokeType value
         * @property {number} SCDeployType=1 SCDeployType value
         * @property {number} SCUpgradeType=2 SCUpgradeType value
         */
        SmartContract.SCType = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "SCInvokeType"] = 0;
            values[valuesById[1] = "SCDeployType"] = 1;
            values[valuesById[2] = "SCUpgradeType"] = 2;
            return values;
        })();

        SmartContract.CallValueData = (function() {

            /**
             * Properties of a CallValueData.
             * @memberof proto.SmartContract
             * @interface ICallValueData
             * @property {Uint8Array|null} [AssetID] CallValueData AssetID
             * @property {number|null} [Amount] CallValueData Amount
             */

            /**
             * Constructs a new CallValueData.
             * @memberof proto.SmartContract
             * @classdesc Represents a CallValueData.
             * @implements ICallValueData
             * @constructor
             * @param {proto.SmartContract.ICallValueData=} [properties] Properties to set
             */
            function CallValueData(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CallValueData AssetID.
             * @member {Uint8Array} AssetID
             * @memberof proto.SmartContract.CallValueData
             * @instance
             */
            CallValueData.prototype.AssetID = $util.newBuffer([]);

            /**
             * CallValueData Amount.
             * @member {number} Amount
             * @memberof proto.SmartContract.CallValueData
             * @instance
             */
            CallValueData.prototype.Amount = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

            /**
             * Creates a new CallValueData instance using the specified properties.
             * @function create
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {proto.SmartContract.ICallValueData=} [properties] Properties to set
             * @returns {proto.SmartContract.CallValueData} CallValueData instance
             */
            CallValueData.create = function create(properties) {
                return new CallValueData(properties);
            };

            /**
             * Encodes the specified CallValueData message. Does not implicitly {@link proto.SmartContract.CallValueData.verify|verify} messages.
             * @function encode
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {proto.SmartContract.ICallValueData} message CallValueData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CallValueData.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.AssetID != null && Object.hasOwnProperty.call(message, "AssetID"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.AssetID);
                if (message.Amount != null && Object.hasOwnProperty.call(message, "Amount"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.Amount);
                return writer;
            };

            /**
             * Encodes the specified CallValueData message, length delimited. Does not implicitly {@link proto.SmartContract.CallValueData.verify|verify} messages.
             * @function encodeDelimited
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {proto.SmartContract.ICallValueData} message CallValueData message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CallValueData.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CallValueData message from the specified reader or buffer.
             * @function decode
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {proto.SmartContract.CallValueData} CallValueData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CallValueData.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.SmartContract.CallValueData();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.AssetID = reader.bytes();
                            break;
                        }
                    case 2: {
                            message.Amount = reader.int64();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CallValueData message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {proto.SmartContract.CallValueData} CallValueData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CallValueData.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CallValueData message.
             * @function verify
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CallValueData.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                    if (!(message.AssetID && typeof message.AssetID.length === "number" || $util.isString(message.AssetID)))
                        return "AssetID: buffer expected";
                if (message.Amount != null && message.hasOwnProperty("Amount"))
                    if (!$util.isInteger(message.Amount) && !(message.Amount && $util.isInteger(message.Amount.low) && $util.isInteger(message.Amount.high)))
                        return "Amount: integer|Long expected";
                return null;
            };

            /**
             * Creates a CallValueData message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {proto.SmartContract.CallValueData} CallValueData
             */
            CallValueData.fromObject = function fromObject(object) {
                if (object instanceof $root.proto.SmartContract.CallValueData)
                    return object;
                let message = new $root.proto.SmartContract.CallValueData();
                if (object.AssetID != null)
                    if (typeof object.AssetID === "string")
                        $util.base64.decode(object.AssetID, message.AssetID = $util.newBuffer($util.base64.length(object.AssetID)), 0);
                    else if (object.AssetID.length >= 0)
                        message.AssetID = object.AssetID;
                if (object.Amount != null)
                    if ($util.Long)
                        (message.Amount = $util.Long.fromValue(object.Amount)).unsigned = false;
                    else if (typeof object.Amount === "string")
                        message.Amount = parseInt(object.Amount, 10);
                    else if (typeof object.Amount === "number")
                        message.Amount = object.Amount;
                    else if (typeof object.Amount === "object")
                        message.Amount = new $util.LongBits(object.Amount.low >>> 0, object.Amount.high >>> 0).toNumber();
                return message;
            };

            /**
             * Creates a plain object from a CallValueData message. Also converts values to other types if specified.
             * @function toObject
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {proto.SmartContract.CallValueData} message CallValueData
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CallValueData.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.AssetID = "";
                    else {
                        object.AssetID = [];
                        if (options.bytes !== Array)
                            object.AssetID = $util.newBuffer(object.AssetID);
                    }
                    if ($util.Long) {
                        let long = new $util.Long(0, 0, false);
                        object.Amount = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.Amount = options.longs === String ? "0" : 0;
                }
                if (message.AssetID != null && message.hasOwnProperty("AssetID"))
                    object.AssetID = options.bytes === String ? $util.base64.encode(message.AssetID, 0, message.AssetID.length) : options.bytes === Array ? Array.prototype.slice.call(message.AssetID) : message.AssetID;
                if (message.Amount != null && message.hasOwnProperty("Amount"))
                    if (typeof message.Amount === "number")
                        object.Amount = options.longs === String ? String(message.Amount) : message.Amount;
                    else
                        object.Amount = options.longs === String ? $util.Long.prototype.toString.call(message.Amount) : options.longs === Number ? new $util.LongBits(message.Amount.low >>> 0, message.Amount.high >>> 0).toNumber() : message.Amount;
                return object;
            };

            /**
             * Converts this CallValueData to JSON.
             * @function toJSON
             * @memberof proto.SmartContract.CallValueData
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CallValueData.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for CallValueData
             * @function getTypeUrl
             * @memberof proto.SmartContract.CallValueData
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            CallValueData.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.SmartContract.CallValueData";
            };

            return CallValueData;
        })();

        return SmartContract;
    })();

    return proto;
})();

export const google = $root.google = (() => {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    const google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        const protobuf = {};

        protobuf.Any = (function() {

            /**
             * Properties of an Any.
             * @memberof google.protobuf
             * @interface IAny
             * @property {string|null} [type_url] Any type_url
             * @property {Uint8Array|null} [value] Any value
             */

            /**
             * Constructs a new Any.
             * @memberof google.protobuf
             * @classdesc Represents an Any.
             * @implements IAny
             * @constructor
             * @param {google.protobuf.IAny=} [properties] Properties to set
             */
            function Any(properties) {
                if (properties)
                    for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Any type_url.
             * @member {string} type_url
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.type_url = "";

            /**
             * Any value.
             * @member {Uint8Array} value
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.value = $util.newBuffer([]);

            /**
             * Creates a new Any instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny=} [properties] Properties to set
             * @returns {google.protobuf.Any} Any instance
             */
            Any.create = function create(properties) {
                return new Any(properties);
            };

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type_url != null && Object.hasOwnProperty.call(message, "type_url"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.type_url);
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.value);
                return writer;
            };

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decode = function decode(reader, length, error) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                let end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Any();
                while (reader.pos < end) {
                    let tag = reader.uint32();
                    if (tag === error)
                        break;
                    switch (tag >>> 3) {
                    case 1: {
                            message.type_url = reader.string();
                            break;
                        }
                    case 2: {
                            message.value = reader.bytes();
                            break;
                        }
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Any message.
             * @function verify
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Any.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    if (!$util.isString(message.type_url))
                        return "type_url: string expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                        return "value: buffer expected";
                return null;
            };

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Any} Any
             */
            Any.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Any)
                    return object;
                let message = new $root.google.protobuf.Any();
                if (object.type_url != null)
                    message.type_url = String(object.type_url);
                if (object.value != null)
                    if (typeof object.value === "string")
                        $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                    else if (object.value.length >= 0)
                        message.value = object.value;
                return message;
            };

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.Any} message Any
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Any.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                let object = {};
                if (options.defaults) {
                    object.type_url = "";
                    if (options.bytes === String)
                        object.value = "";
                    else {
                        object.value = [];
                        if (options.bytes !== Array)
                            object.value = $util.newBuffer(object.value);
                    }
                }
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    object.type_url = message.type_url;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
                return object;
            };

            /**
             * Converts this Any to JSON.
             * @function toJSON
             * @memberof google.protobuf.Any
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Any.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            /**
             * Gets the default type url for Any
             * @function getTypeUrl
             * @memberof google.protobuf.Any
             * @static
             * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns {string} The default type url
             */
            Any.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/google.protobuf.Any";
            };

            return Any;
        })();

        return protobuf;
    })();

    return google;
})();

export { $root as default };
