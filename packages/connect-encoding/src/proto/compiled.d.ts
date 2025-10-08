import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace proto. */
export namespace proto {

    /** Properties of a TXContract. */
    interface ITXContract {

        /** TXContract Type */
        Type?: (proto.TXContract.ContractType|null);

        /** TXContract Parameter */
        Parameter?: (google.protobuf.IAny|null);
    }

    /** Represents a TXContract. */
    class TXContract implements ITXContract {

        /**
         * Constructs a new TXContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ITXContract);

        /** TXContract Type. */
        public Type: proto.TXContract.ContractType;

        /** TXContract Parameter. */
        public Parameter?: (google.protobuf.IAny|null);

        /**
         * Creates a new TXContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TXContract instance
         */
        public static create(properties?: proto.ITXContract): proto.TXContract;

        /**
         * Encodes the specified TXContract message. Does not implicitly {@link proto.TXContract.verify|verify} messages.
         * @param message TXContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.ITXContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TXContract message, length delimited. Does not implicitly {@link proto.TXContract.verify|verify} messages.
         * @param message TXContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.ITXContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TXContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TXContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.TXContract;

        /**
         * Decodes a TXContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TXContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.TXContract;

        /**
         * Verifies a TXContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TXContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TXContract
         */
        public static fromObject(object: { [k: string]: any }): proto.TXContract;

        /**
         * Creates a plain object from a TXContract message. Also converts values to other types if specified.
         * @param message TXContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.TXContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TXContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TXContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace TXContract {

        /** ContractType enum. */
        enum ContractType {
            TransferContractType = 0,
            CreateAssetContractType = 1,
            CreateValidatorContractType = 2,
            ValidatorConfigContractType = 3,
            FreezeContractType = 4,
            UnfreezeContractType = 5,
            DelegateContractType = 6,
            UndelegateContractType = 7,
            WithdrawContractType = 8,
            ClaimContractType = 9,
            UnjailContractType = 10,
            AssetTriggerContractType = 11,
            SetAccountNameContractType = 12,
            ProposalContractType = 13,
            VoteContractType = 14,
            ConfigITOContractType = 15,
            SetITOPricesContractType = 16,
            BuyContractType = 17,
            SellContractType = 18,
            CancelMarketOrderContractType = 19,
            CreateMarketplaceContractType = 20,
            ConfigMarketplaceContractType = 21,
            UpdateAccountPermissionContractType = 22,
            DepositContractType = 23,
            ITOTriggerContractType = 24,
            SmartContractType = 63
        }
    }

    /** Properties of a Transaction. */
    interface ITransaction {

        /** Transaction RawData */
        RawData?: (proto.Transaction.IRaw|null);

        /** Transaction Signature */
        Signature?: (Uint8Array[]|null);

        /** Transaction Result */
        Result?: (proto.Transaction.TXResult|null);

        /** Transaction ResultCode */
        ResultCode?: (proto.Transaction.TXResultCode|null);

        /** Transaction Receipts */
        Receipts?: (proto.Transaction.IReceipt[]|null);

        /** Transaction Block */
        Block?: (number|null);

        /** Transaction GasLimit */
        GasLimit?: (number|null);

        /** Transaction GasMultiplier */
        GasMultiplier?: (number|null);
    }

    /** Represents a Transaction. */
    class Transaction implements ITransaction {

        /**
         * Constructs a new Transaction.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ITransaction);

        /** Transaction RawData. */
        public RawData?: (proto.Transaction.IRaw|null);

        /** Transaction Signature. */
        public Signature: Uint8Array[];

        /** Transaction Result. */
        public Result: proto.Transaction.TXResult;

        /** Transaction ResultCode. */
        public ResultCode: proto.Transaction.TXResultCode;

        /** Transaction Receipts. */
        public Receipts: proto.Transaction.IReceipt[];

        /** Transaction Block. */
        public Block: number;

        /** Transaction GasLimit. */
        public GasLimit: number;

        /** Transaction GasMultiplier. */
        public GasMultiplier: number;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Transaction instance
         */
        public static create(properties?: proto.ITransaction): proto.Transaction;

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @param message Transaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.ITransaction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @param message Transaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.ITransaction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Transaction;

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Transaction;

        /**
         * Verifies a Transaction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Transaction
         */
        public static fromObject(object: { [k: string]: any }): proto.Transaction;

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @param message Transaction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.Transaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Transaction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Transaction
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace Transaction {

        /** TXResult enum. */
        enum TXResult {
            SUCCESS = 0,
            FAILED = 1
        }

        /** TXResultCode enum. */
        enum TXResultCode {
            Ok = 0,
            OutOfFunds = 1,
            AccountError = 2,
            AssetError = 3,
            ContractInvalid = 4,
            ContractNotFound = 5,
            FeeInvalid = 6,
            ParameterInvalid = 7,
            APRInvalid = 8,
            AssetIDInvalid = 9,
            AssetTypeInvalid = 10,
            AssetCantBeMinted = 11,
            AssetCantBeBurned = 12,
            AssetCantBePaused = 13,
            AssetCantBeDelegated = 14,
            AssetOwnerCantBeChanged = 15,
            AccountNotOwner = 16,
            CommissionTooHigh = 17,
            DelegationAmountInvalid = 18,
            ProposalNotActive = 19,
            ValueInvalid = 20,
            AmountInvalid = 21,
            BucketIDInvalid = 22,
            KeyConflict = 23,
            MaxDelegationAmount = 24,
            InvalidPeerKey = 25,
            MinKFIStakedUnreached = 26,
            MaxSupplyExceeded = 27,
            SaveAccountError = 28,
            LoadAccountError = 29,
            SameAccountError = 30,
            AssetPaused = 31,
            DeletegateError = 32,
            WithdrawNotAvailable = 33,
            ErrOverflow = 34,
            SetStakingErr = 35,
            SetMarketOrderErr = 36,
            BalanceError = 37,
            KAPPError = 38,
            UnfreezeError = 39,
            UndelegateError = 40,
            WithdrawError = 41,
            ClaimError = 42,
            BucketsExceeded = 43,
            AssetCantBeWiped = 44,
            AssetCantAddRoles = 45,
            FreezeError = 46,
            ITONotActive = 47,
            NFTMintStopped = 48,
            RoyaltiesChangeStopped = 49,
            ITOKAPPError = 50,
            ITOWhiteListError = 51,
            NFTMetadataChangeStopped = 52,
            AlreadyExists = 53,
            IteratorLimitReached = 54,
            VMFunctionNotFound = 55,
            VMFunctionWrongSignature = 56,
            VMUserError = 57,
            VMOutOfGas = 58,
            VMAccountCollision = 59,
            VMCallStackOverFlow = 60,
            VMExecutionPanicked = 61,
            VMExecutionFailed = 62,
            VMUpgradeFailed = 63,
            VMSimulateFailed = 64,
            KDATransferNotAllowed = 65,
            Fail = 99
        }

        /** Properties of a KDAFee. */
        interface IKDAFee {

            /** KDAFee KDA */
            KDA?: (Uint8Array|null);

            /** KDAFee Amount */
            Amount?: (number|null);
        }

        /** Represents a KDAFee. */
        class KDAFee implements IKDAFee {

            /**
             * Constructs a new KDAFee.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.Transaction.IKDAFee);

            /** KDAFee KDA. */
            public KDA: Uint8Array;

            /** KDAFee Amount. */
            public Amount: number;

            /**
             * Creates a new KDAFee instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KDAFee instance
             */
            public static create(properties?: proto.Transaction.IKDAFee): proto.Transaction.KDAFee;

            /**
             * Encodes the specified KDAFee message. Does not implicitly {@link proto.Transaction.KDAFee.verify|verify} messages.
             * @param message KDAFee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.Transaction.IKDAFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KDAFee message, length delimited. Does not implicitly {@link proto.Transaction.KDAFee.verify|verify} messages.
             * @param message KDAFee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.Transaction.IKDAFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KDAFee message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KDAFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Transaction.KDAFee;

            /**
             * Decodes a KDAFee message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KDAFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Transaction.KDAFee;

            /**
             * Verifies a KDAFee message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KDAFee message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KDAFee
             */
            public static fromObject(object: { [k: string]: any }): proto.Transaction.KDAFee;

            /**
             * Creates a plain object from a KDAFee message. Also converts values to other types if specified.
             * @param message KDAFee
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.Transaction.KDAFee, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KDAFee to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for KDAFee
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Raw. */
        interface IRaw {

            /** Raw Nonce */
            Nonce?: (number|null);

            /** Raw Sender */
            Sender?: (Uint8Array|null);

            /** Raw Contract */
            Contract?: (proto.ITXContract[]|null);

            /** Raw PermissionID */
            PermissionID?: (number|null);

            /** Raw Data */
            Data?: (Uint8Array[]|null);

            /** Raw KAppFee */
            KAppFee?: (number|null);

            /** Raw BandwidthFee */
            BandwidthFee?: (number|null);

            /** Raw Version */
            Version?: (number|null);

            /** Raw ChainID */
            ChainID?: (Uint8Array|null);

            /** Raw KDAFee */
            KDAFee?: (proto.Transaction.IKDAFee|null);
        }

        /** Represents a Raw. */
        class Raw implements IRaw {

            /**
             * Constructs a new Raw.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.Transaction.IRaw);

            /** Raw Nonce. */
            public Nonce: number;

            /** Raw Sender. */
            public Sender: Uint8Array;

            /** Raw Contract. */
            public Contract: proto.ITXContract[];

            /** Raw PermissionID. */
            public PermissionID: number;

            /** Raw Data. */
            public Data: Uint8Array[];

            /** Raw KAppFee. */
            public KAppFee: number;

            /** Raw BandwidthFee. */
            public BandwidthFee: number;

            /** Raw Version. */
            public Version: number;

            /** Raw ChainID. */
            public ChainID: Uint8Array;

            /** Raw KDAFee. */
            public KDAFee?: (proto.Transaction.IKDAFee|null);

            /**
             * Creates a new Raw instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Raw instance
             */
            public static create(properties?: proto.Transaction.IRaw): proto.Transaction.Raw;

            /**
             * Encodes the specified Raw message. Does not implicitly {@link proto.Transaction.Raw.verify|verify} messages.
             * @param message Raw message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.Transaction.IRaw, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Raw message, length delimited. Does not implicitly {@link proto.Transaction.Raw.verify|verify} messages.
             * @param message Raw message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.Transaction.IRaw, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Raw message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Raw
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Transaction.Raw;

            /**
             * Decodes a Raw message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Raw
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Transaction.Raw;

            /**
             * Verifies a Raw message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Raw message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Raw
             */
            public static fromObject(object: { [k: string]: any }): proto.Transaction.Raw;

            /**
             * Creates a plain object from a Raw message. Also converts values to other types if specified.
             * @param message Raw
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.Transaction.Raw, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Raw to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Raw
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Receipt. */
        interface IReceipt {

            /** Receipt Data */
            Data?: (Uint8Array[]|null);
        }

        /** Represents a Receipt. */
        class Receipt implements IReceipt {

            /**
             * Constructs a new Receipt.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.Transaction.IReceipt);

            /** Receipt Data. */
            public Data: Uint8Array[];

            /**
             * Creates a new Receipt instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Receipt instance
             */
            public static create(properties?: proto.Transaction.IReceipt): proto.Transaction.Receipt;

            /**
             * Encodes the specified Receipt message. Does not implicitly {@link proto.Transaction.Receipt.verify|verify} messages.
             * @param message Receipt message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.Transaction.IReceipt, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Receipt message, length delimited. Does not implicitly {@link proto.Transaction.Receipt.verify|verify} messages.
             * @param message Receipt message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.Transaction.IReceipt, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Receipt message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Receipt
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Transaction.Receipt;

            /**
             * Decodes a Receipt message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Receipt
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Transaction.Receipt;

            /**
             * Verifies a Receipt message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Receipt message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Receipt
             */
            public static fromObject(object: { [k: string]: any }): proto.Transaction.Receipt;

            /**
             * Creates a plain object from a Receipt message. Also converts values to other types if specified.
             * @param message Receipt
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.Transaction.Receipt, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Receipt to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Receipt
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of a TransferContract. */
    interface ITransferContract {

        /** TransferContract ToAddress */
        ToAddress?: (Uint8Array|null);

        /** TransferContract Amount */
        Amount?: (number|null);

        /** TransferContract AssetID */
        AssetID?: (Uint8Array|null);
    }

    /** Represents a TransferContract. */
    class TransferContract implements ITransferContract {

        /**
         * Constructs a new TransferContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ITransferContract);

        /** TransferContract ToAddress. */
        public ToAddress: Uint8Array;

        /** TransferContract Amount. */
        public Amount: number;

        /** TransferContract AssetID. */
        public AssetID: Uint8Array;

        /**
         * Creates a new TransferContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TransferContract instance
         */
        public static create(properties?: proto.ITransferContract): proto.TransferContract;

        /**
         * Encodes the specified TransferContract message. Does not implicitly {@link proto.TransferContract.verify|verify} messages.
         * @param message TransferContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.ITransferContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TransferContract message, length delimited. Does not implicitly {@link proto.TransferContract.verify|verify} messages.
         * @param message TransferContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.ITransferContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TransferContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TransferContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.TransferContract;

        /**
         * Decodes a TransferContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TransferContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.TransferContract;

        /**
         * Verifies a TransferContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TransferContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TransferContract
         */
        public static fromObject(object: { [k: string]: any }): proto.TransferContract;

        /**
         * Creates a plain object from a TransferContract message. Also converts values to other types if specified.
         * @param message TransferContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.TransferContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TransferContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TransferContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FreezeContract. */
    interface IFreezeContract {

        /** FreezeContract Amount */
        Amount?: (number|null);

        /** FreezeContract AssetID */
        AssetID?: (Uint8Array|null);
    }

    /** Represents a FreezeContract. */
    class FreezeContract implements IFreezeContract {

        /**
         * Constructs a new FreezeContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IFreezeContract);

        /** FreezeContract Amount. */
        public Amount: number;

        /** FreezeContract AssetID. */
        public AssetID: Uint8Array;

        /**
         * Creates a new FreezeContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FreezeContract instance
         */
        public static create(properties?: proto.IFreezeContract): proto.FreezeContract;

        /**
         * Encodes the specified FreezeContract message. Does not implicitly {@link proto.FreezeContract.verify|verify} messages.
         * @param message FreezeContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IFreezeContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FreezeContract message, length delimited. Does not implicitly {@link proto.FreezeContract.verify|verify} messages.
         * @param message FreezeContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IFreezeContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FreezeContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FreezeContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.FreezeContract;

        /**
         * Decodes a FreezeContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FreezeContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.FreezeContract;

        /**
         * Verifies a FreezeContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FreezeContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FreezeContract
         */
        public static fromObject(object: { [k: string]: any }): proto.FreezeContract;

        /**
         * Creates a plain object from a FreezeContract message. Also converts values to other types if specified.
         * @param message FreezeContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.FreezeContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FreezeContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for FreezeContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UnfreezeContract. */
    interface IUnfreezeContract {

        /** UnfreezeContract AssetID */
        AssetID?: (Uint8Array|null);

        /** UnfreezeContract BucketID */
        BucketID?: (Uint8Array|null);
    }

    /** Represents an UnfreezeContract. */
    class UnfreezeContract implements IUnfreezeContract {

        /**
         * Constructs a new UnfreezeContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IUnfreezeContract);

        /** UnfreezeContract AssetID. */
        public AssetID: Uint8Array;

        /** UnfreezeContract BucketID. */
        public BucketID: Uint8Array;

        /**
         * Creates a new UnfreezeContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UnfreezeContract instance
         */
        public static create(properties?: proto.IUnfreezeContract): proto.UnfreezeContract;

        /**
         * Encodes the specified UnfreezeContract message. Does not implicitly {@link proto.UnfreezeContract.verify|verify} messages.
         * @param message UnfreezeContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IUnfreezeContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UnfreezeContract message, length delimited. Does not implicitly {@link proto.UnfreezeContract.verify|verify} messages.
         * @param message UnfreezeContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IUnfreezeContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UnfreezeContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UnfreezeContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.UnfreezeContract;

        /**
         * Decodes an UnfreezeContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UnfreezeContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.UnfreezeContract;

        /**
         * Verifies an UnfreezeContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UnfreezeContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UnfreezeContract
         */
        public static fromObject(object: { [k: string]: any }): proto.UnfreezeContract;

        /**
         * Creates a plain object from an UnfreezeContract message. Also converts values to other types if specified.
         * @param message UnfreezeContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.UnfreezeContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UnfreezeContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UnfreezeContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DelegateContract. */
    interface IDelegateContract {

        /** DelegateContract ToAddress */
        ToAddress?: (Uint8Array|null);

        /** DelegateContract BucketID */
        BucketID?: (Uint8Array|null);
    }

    /** Represents a DelegateContract. */
    class DelegateContract implements IDelegateContract {

        /**
         * Constructs a new DelegateContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IDelegateContract);

        /** DelegateContract ToAddress. */
        public ToAddress: Uint8Array;

        /** DelegateContract BucketID. */
        public BucketID: Uint8Array;

        /**
         * Creates a new DelegateContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DelegateContract instance
         */
        public static create(properties?: proto.IDelegateContract): proto.DelegateContract;

        /**
         * Encodes the specified DelegateContract message. Does not implicitly {@link proto.DelegateContract.verify|verify} messages.
         * @param message DelegateContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IDelegateContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DelegateContract message, length delimited. Does not implicitly {@link proto.DelegateContract.verify|verify} messages.
         * @param message DelegateContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IDelegateContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DelegateContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DelegateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.DelegateContract;

        /**
         * Decodes a DelegateContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DelegateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.DelegateContract;

        /**
         * Verifies a DelegateContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DelegateContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DelegateContract
         */
        public static fromObject(object: { [k: string]: any }): proto.DelegateContract;

        /**
         * Creates a plain object from a DelegateContract message. Also converts values to other types if specified.
         * @param message DelegateContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.DelegateContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DelegateContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DelegateContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an UndelegateContract. */
    interface IUndelegateContract {

        /** UndelegateContract BucketID */
        BucketID?: (Uint8Array|null);
    }

    /** Represents an UndelegateContract. */
    class UndelegateContract implements IUndelegateContract {

        /**
         * Constructs a new UndelegateContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IUndelegateContract);

        /** UndelegateContract BucketID. */
        public BucketID: Uint8Array;

        /**
         * Creates a new UndelegateContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UndelegateContract instance
         */
        public static create(properties?: proto.IUndelegateContract): proto.UndelegateContract;

        /**
         * Encodes the specified UndelegateContract message. Does not implicitly {@link proto.UndelegateContract.verify|verify} messages.
         * @param message UndelegateContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IUndelegateContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UndelegateContract message, length delimited. Does not implicitly {@link proto.UndelegateContract.verify|verify} messages.
         * @param message UndelegateContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IUndelegateContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UndelegateContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UndelegateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.UndelegateContract;

        /**
         * Decodes an UndelegateContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UndelegateContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.UndelegateContract;

        /**
         * Verifies an UndelegateContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UndelegateContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UndelegateContract
         */
        public static fromObject(object: { [k: string]: any }): proto.UndelegateContract;

        /**
         * Creates a plain object from an UndelegateContract message. Also converts values to other types if specified.
         * @param message UndelegateContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.UndelegateContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UndelegateContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for UndelegateContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a WithdrawContract. */
    interface IWithdrawContract {

        /** WithdrawContract Type */
        Type?: (proto.WithdrawContract.WithdrawType|null);

        /** WithdrawContract AssetID */
        AssetID?: (Uint8Array|null);

        /** WithdrawContract Amount */
        Amount?: (number|null);

        /** WithdrawContract CurrencyID */
        CurrencyID?: (Uint8Array|null);
    }

    /** Represents a WithdrawContract. */
    class WithdrawContract implements IWithdrawContract {

        /**
         * Constructs a new WithdrawContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IWithdrawContract);

        /** WithdrawContract Type. */
        public Type: proto.WithdrawContract.WithdrawType;

        /** WithdrawContract AssetID. */
        public AssetID: Uint8Array;

        /** WithdrawContract Amount. */
        public Amount: number;

        /** WithdrawContract CurrencyID. */
        public CurrencyID: Uint8Array;

        /**
         * Creates a new WithdrawContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns WithdrawContract instance
         */
        public static create(properties?: proto.IWithdrawContract): proto.WithdrawContract;

        /**
         * Encodes the specified WithdrawContract message. Does not implicitly {@link proto.WithdrawContract.verify|verify} messages.
         * @param message WithdrawContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IWithdrawContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified WithdrawContract message, length delimited. Does not implicitly {@link proto.WithdrawContract.verify|verify} messages.
         * @param message WithdrawContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IWithdrawContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a WithdrawContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns WithdrawContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.WithdrawContract;

        /**
         * Decodes a WithdrawContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns WithdrawContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.WithdrawContract;

        /**
         * Verifies a WithdrawContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a WithdrawContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns WithdrawContract
         */
        public static fromObject(object: { [k: string]: any }): proto.WithdrawContract;

        /**
         * Creates a plain object from a WithdrawContract message. Also converts values to other types if specified.
         * @param message WithdrawContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.WithdrawContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this WithdrawContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for WithdrawContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace WithdrawContract {

        /** WithdrawType enum. */
        enum WithdrawType {
            StakingReward = 0,
            KDAPool = 1,
            KDAFeePool = 2,
            MarketOrderIDXIN = 3,
            MarketOrderIDXOUT = 4
        }
    }

    /** Properties of a ClaimContract. */
    interface IClaimContract {

        /** ClaimContract Type */
        Type?: (proto.ClaimContract.ClaimType|null);

        /** ClaimContract ID */
        ID?: (Uint8Array|null);
    }

    /** Represents a ClaimContract. */
    class ClaimContract implements IClaimContract {

        /**
         * Constructs a new ClaimContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IClaimContract);

        /** ClaimContract Type. */
        public Type: proto.ClaimContract.ClaimType;

        /** ClaimContract ID. */
        public ID: Uint8Array;

        /**
         * Creates a new ClaimContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ClaimContract instance
         */
        public static create(properties?: proto.IClaimContract): proto.ClaimContract;

        /**
         * Encodes the specified ClaimContract message. Does not implicitly {@link proto.ClaimContract.verify|verify} messages.
         * @param message ClaimContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IClaimContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ClaimContract message, length delimited. Does not implicitly {@link proto.ClaimContract.verify|verify} messages.
         * @param message ClaimContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IClaimContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ClaimContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ClaimContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.ClaimContract;

        /**
         * Decodes a ClaimContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ClaimContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.ClaimContract;

        /**
         * Verifies a ClaimContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ClaimContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ClaimContract
         */
        public static fromObject(object: { [k: string]: any }): proto.ClaimContract;

        /**
         * Creates a plain object from a ClaimContract message. Also converts values to other types if specified.
         * @param message ClaimContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.ClaimContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ClaimContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ClaimContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace ClaimContract {

        /** ClaimType enum. */
        enum ClaimType {
            StakingClaim = 0,
            AllowanceClaim = 1,
            MarketClaim = 2
        }
    }

    /** Properties of a VoteContract. */
    interface IVoteContract {

        /** VoteContract ProposalID */
        ProposalID?: (number|null);

        /** VoteContract Type */
        Type?: (proto.VoteContract.VoteType|null);

        /** VoteContract Amount */
        Amount?: (number|null);
    }

    /** Represents a VoteContract. */
    class VoteContract implements IVoteContract {

        /**
         * Constructs a new VoteContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IVoteContract);

        /** VoteContract ProposalID. */
        public ProposalID: number;

        /** VoteContract Type. */
        public Type: proto.VoteContract.VoteType;

        /** VoteContract Amount. */
        public Amount: number;

        /**
         * Creates a new VoteContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns VoteContract instance
         */
        public static create(properties?: proto.IVoteContract): proto.VoteContract;

        /**
         * Encodes the specified VoteContract message. Does not implicitly {@link proto.VoteContract.verify|verify} messages.
         * @param message VoteContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IVoteContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified VoteContract message, length delimited. Does not implicitly {@link proto.VoteContract.verify|verify} messages.
         * @param message VoteContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IVoteContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a VoteContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns VoteContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.VoteContract;

        /**
         * Decodes a VoteContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns VoteContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.VoteContract;

        /**
         * Verifies a VoteContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a VoteContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns VoteContract
         */
        public static fromObject(object: { [k: string]: any }): proto.VoteContract;

        /**
         * Creates a plain object from a VoteContract message. Also converts values to other types if specified.
         * @param message VoteContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.VoteContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this VoteContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for VoteContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace VoteContract {

        /** VoteType enum. */
        enum VoteType {
            Yes = 0,
            No = 1,
            Abstain = 2
        }
    }

    /** Properties of a CreateAssetContract. */
    interface ICreateAssetContract {

        /** CreateAssetContract Type */
        Type?: (proto.CreateAssetContract.AssetType|null);

        /** CreateAssetContract Name */
        Name?: (string|null);

        /** CreateAssetContract Ticker */
        Ticker?: (string|null);

        /** CreateAssetContract OwnerAddress */
        OwnerAddress?: (Uint8Array|null);

        /** CreateAssetContract Logo */
        Logo?: (string|null);

        /** CreateAssetContract URIs */
        URIs?: (string[]|null);

        /** CreateAssetContract Precision */
        Precision?: (number|null);

        /** CreateAssetContract InitialSupply */
        InitialSupply?: (number|null);

        /** CreateAssetContract MaxSupply */
        MaxSupply?: (number|null);

        /** CreateAssetContract Properties */
        Properties?: (proto.CreateAssetContract.IAssetProperties|null);

        /** CreateAssetContract Attributes */
        Attributes?: (proto.CreateAssetContract.IAssetAttributes|null);
    }

    /** Represents a CreateAssetContract. */
    class CreateAssetContract implements ICreateAssetContract {

        /**
         * Constructs a new CreateAssetContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ICreateAssetContract);

        /** CreateAssetContract Type. */
        public Type: proto.CreateAssetContract.AssetType;

        /** CreateAssetContract Name. */
        public Name: string;

        /** CreateAssetContract Ticker. */
        public Ticker: string;

        /** CreateAssetContract OwnerAddress. */
        public OwnerAddress: Uint8Array;

        /** CreateAssetContract Logo. */
        public Logo: string;

        /** CreateAssetContract URIs. */
        public URIs: string[];

        /** CreateAssetContract Precision. */
        public Precision: number;

        /** CreateAssetContract InitialSupply. */
        public InitialSupply: number;

        /** CreateAssetContract MaxSupply. */
        public MaxSupply: number;

        /** CreateAssetContract Properties. */
        public Properties?: (proto.CreateAssetContract.IAssetProperties|null);

        /** CreateAssetContract Attributes. */
        public Attributes?: (proto.CreateAssetContract.IAssetAttributes|null);

        /**
         * Creates a new CreateAssetContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateAssetContract instance
         */
        public static create(properties?: proto.ICreateAssetContract): proto.CreateAssetContract;

        /**
         * Encodes the specified CreateAssetContract message. Does not implicitly {@link proto.CreateAssetContract.verify|verify} messages.
         * @param message CreateAssetContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.ICreateAssetContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateAssetContract message, length delimited. Does not implicitly {@link proto.CreateAssetContract.verify|verify} messages.
         * @param message CreateAssetContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.ICreateAssetContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateAssetContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateAssetContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.CreateAssetContract;

        /**
         * Decodes a CreateAssetContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateAssetContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.CreateAssetContract;

        /**
         * Verifies a CreateAssetContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateAssetContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateAssetContract
         */
        public static fromObject(object: { [k: string]: any }): proto.CreateAssetContract;

        /**
         * Creates a plain object from a CreateAssetContract message. Also converts values to other types if specified.
         * @param message CreateAssetContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.CreateAssetContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateAssetContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CreateAssetContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace CreateAssetContract {

        /** AssetType enum. */
        enum AssetType {
            Fungible = 0,
            NonFungible = 1,
            SemiFungible = 2
        }

        /** Properties of an AssetProperties. */
        interface IAssetProperties {

            /** AssetProperties CanFreeze */
            CanFreeze?: (boolean|null);

            /** AssetProperties CanWipe */
            CanWipe?: (boolean|null);

            /** AssetProperties CanPause */
            CanPause?: (boolean|null);

            /** AssetProperties CanMint */
            CanMint?: (boolean|null);

            /** AssetProperties CanBurn */
            CanBurn?: (boolean|null);

            /** AssetProperties CanChangeOwner */
            CanChangeOwner?: (boolean|null);

            /** AssetProperties CanAddRoles */
            CanAddRoles?: (boolean|null);
        }

        /** Represents an AssetProperties. */
        class AssetProperties implements IAssetProperties {

            /**
             * Constructs a new AssetProperties.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.CreateAssetContract.IAssetProperties);

            /** AssetProperties CanFreeze. */
            public CanFreeze: boolean;

            /** AssetProperties CanWipe. */
            public CanWipe: boolean;

            /** AssetProperties CanPause. */
            public CanPause: boolean;

            /** AssetProperties CanMint. */
            public CanMint: boolean;

            /** AssetProperties CanBurn. */
            public CanBurn: boolean;

            /** AssetProperties CanChangeOwner. */
            public CanChangeOwner: boolean;

            /** AssetProperties CanAddRoles. */
            public CanAddRoles: boolean;

            /**
             * Creates a new AssetProperties instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AssetProperties instance
             */
            public static create(properties?: proto.CreateAssetContract.IAssetProperties): proto.CreateAssetContract.AssetProperties;

            /**
             * Encodes the specified AssetProperties message. Does not implicitly {@link proto.CreateAssetContract.AssetProperties.verify|verify} messages.
             * @param message AssetProperties message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.CreateAssetContract.IAssetProperties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AssetProperties message, length delimited. Does not implicitly {@link proto.CreateAssetContract.AssetProperties.verify|verify} messages.
             * @param message AssetProperties message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.CreateAssetContract.IAssetProperties, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AssetProperties message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AssetProperties
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.CreateAssetContract.AssetProperties;

            /**
             * Decodes an AssetProperties message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AssetProperties
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.CreateAssetContract.AssetProperties;

            /**
             * Verifies an AssetProperties message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AssetProperties message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AssetProperties
             */
            public static fromObject(object: { [k: string]: any }): proto.CreateAssetContract.AssetProperties;

            /**
             * Creates a plain object from an AssetProperties message. Also converts values to other types if specified.
             * @param message AssetProperties
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.CreateAssetContract.AssetProperties, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AssetProperties to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AssetProperties
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an AssetAttributes. */
        interface IAssetAttributes {

            /** AssetAttributes IsPaused */
            IsPaused?: (boolean|null);

            /** AssetAttributes IsNFTMintStopped */
            IsNFTMintStopped?: (boolean|null);
        }

        /** Represents an AssetAttributes. */
        class AssetAttributes implements IAssetAttributes {

            /**
             * Constructs a new AssetAttributes.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.CreateAssetContract.IAssetAttributes);

            /** AssetAttributes IsPaused. */
            public IsPaused: boolean;

            /** AssetAttributes IsNFTMintStopped. */
            public IsNFTMintStopped: boolean;

            /**
             * Creates a new AssetAttributes instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AssetAttributes instance
             */
            public static create(properties?: proto.CreateAssetContract.IAssetAttributes): proto.CreateAssetContract.AssetAttributes;

            /**
             * Encodes the specified AssetAttributes message. Does not implicitly {@link proto.CreateAssetContract.AssetAttributes.verify|verify} messages.
             * @param message AssetAttributes message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.CreateAssetContract.IAssetAttributes, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AssetAttributes message, length delimited. Does not implicitly {@link proto.CreateAssetContract.AssetAttributes.verify|verify} messages.
             * @param message AssetAttributes message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.CreateAssetContract.IAssetAttributes, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AssetAttributes message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AssetAttributes
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.CreateAssetContract.AssetAttributes;

            /**
             * Decodes an AssetAttributes message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AssetAttributes
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.CreateAssetContract.AssetAttributes;

            /**
             * Verifies an AssetAttributes message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AssetAttributes message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AssetAttributes
             */
            public static fromObject(object: { [k: string]: any }): proto.CreateAssetContract.AssetAttributes;

            /**
             * Creates a plain object from an AssetAttributes message. Also converts values to other types if specified.
             * @param message AssetAttributes
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.CreateAssetContract.AssetAttributes, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AssetAttributes to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for AssetAttributes
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Properties of a SmartContract. */
    interface ISmartContract {

        /** SmartContract Type */
        Type?: (proto.SmartContract.SCType|null);

        /** SmartContract Address */
        Address?: (Uint8Array|null);

        /** SmartContract CallValue */
        CallValue?: (proto.SmartContract.ICallValueData[]|null);

        /** SmartContract Input */
        Input?: (Uint8Array|null);

        /** SmartContract VirtualMachine */
        VirtualMachine?: (string|null);
    }

    /** Represents a SmartContract. */
    class SmartContract implements ISmartContract {

        /**
         * Constructs a new SmartContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ISmartContract);

        /** SmartContract Type. */
        public Type: proto.SmartContract.SCType;

        /** SmartContract Address. */
        public Address: Uint8Array;

        /** SmartContract CallValue. */
        public CallValue: proto.SmartContract.ICallValueData[];

        /** SmartContract Input. */
        public Input: Uint8Array;

        /** SmartContract VirtualMachine. */
        public VirtualMachine: string;

        /**
         * Creates a new SmartContract instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SmartContract instance
         */
        public static create(properties?: proto.ISmartContract): proto.SmartContract;

        /**
         * Encodes the specified SmartContract message. Does not implicitly {@link proto.SmartContract.verify|verify} messages.
         * @param message SmartContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.ISmartContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SmartContract message, length delimited. Does not implicitly {@link proto.SmartContract.verify|verify} messages.
         * @param message SmartContract message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.ISmartContract, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SmartContract message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SmartContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.SmartContract;

        /**
         * Decodes a SmartContract message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SmartContract
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.SmartContract;

        /**
         * Verifies a SmartContract message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SmartContract message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SmartContract
         */
        public static fromObject(object: { [k: string]: any }): proto.SmartContract;

        /**
         * Creates a plain object from a SmartContract message. Also converts values to other types if specified.
         * @param message SmartContract
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.SmartContract, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SmartContract to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for SmartContract
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace SmartContract {

        /** SCType enum. */
        enum SCType {
            SCInvokeType = 0,
            SCDeployType = 1,
            SCUpgradeType = 2
        }

        /** Properties of a CallValueData. */
        interface ICallValueData {

            /** CallValueData AssetID */
            AssetID?: (Uint8Array|null);

            /** CallValueData Amount */
            Amount?: (number|null);
        }

        /** Represents a CallValueData. */
        class CallValueData implements ICallValueData {

            /**
             * Constructs a new CallValueData.
             * @param [properties] Properties to set
             */
            constructor(properties?: proto.SmartContract.ICallValueData);

            /** CallValueData AssetID. */
            public AssetID: Uint8Array;

            /** CallValueData Amount. */
            public Amount: number;

            /**
             * Creates a new CallValueData instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CallValueData instance
             */
            public static create(properties?: proto.SmartContract.ICallValueData): proto.SmartContract.CallValueData;

            /**
             * Encodes the specified CallValueData message. Does not implicitly {@link proto.SmartContract.CallValueData.verify|verify} messages.
             * @param message CallValueData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: proto.SmartContract.ICallValueData, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CallValueData message, length delimited. Does not implicitly {@link proto.SmartContract.CallValueData.verify|verify} messages.
             * @param message CallValueData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: proto.SmartContract.ICallValueData, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CallValueData message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CallValueData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.SmartContract.CallValueData;

            /**
             * Decodes a CallValueData message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CallValueData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.SmartContract.CallValueData;

            /**
             * Verifies a CallValueData message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CallValueData message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CallValueData
             */
            public static fromObject(object: { [k: string]: any }): proto.SmartContract.CallValueData;

            /**
             * Creates a plain object from a CallValueData message. Also converts values to other types if specified.
             * @param message CallValueData
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: proto.SmartContract.CallValueData, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CallValueData to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CallValueData
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of an Any. */
        interface IAny {

            /** Any type_url */
            type_url?: (string|null);

            /** Any value */
            value?: (Uint8Array|null);
        }

        /** Represents an Any. */
        class Any implements IAny {

            /**
             * Constructs a new Any.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IAny);

            /** Any type_url. */
            public type_url: string;

            /** Any value. */
            public value: Uint8Array;

            /**
             * Creates a new Any instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Any instance
             */
            public static create(properties?: google.protobuf.IAny): google.protobuf.Any;

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IAny, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IAny, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Any;

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Any;

            /**
             * Verifies an Any message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Any
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Any;

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @param message Any
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Any, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Any to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Any
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
