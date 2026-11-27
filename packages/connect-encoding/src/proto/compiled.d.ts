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

    /** TXContract available */
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

    /** Transaction holds all the data needed for a value transfer */
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

        /** TransferContract AssetID */
        AssetID?: (Uint8Array|null);

        /** TransferContract Amount */
        Amount?: (number|null);

        /** TransferContract KDARoyalties */
        KDARoyalties?: (number|null);

        /** TransferContract KLVRoyalties */
        KLVRoyalties?: (number|null);
    }

    /** TXContract available */
    class TransferContract implements ITransferContract {

        /**
         * Constructs a new TransferContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ITransferContract);

        /** TransferContract ToAddress. */
        public ToAddress: Uint8Array;

        /** TransferContract AssetID. */
        public AssetID: Uint8Array;

        /** TransferContract Amount. */
        public Amount: number;

        /** TransferContract KDARoyalties. */
        public KDARoyalties: number;

        /** TransferContract KLVRoyalties. */
        public KLVRoyalties: number;

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

    /** Properties of a CreateAssetContract. */
    interface ICreateAssetContract {

        /** CreateAssetContract Type */
        Type?: (proto.CreateAssetContract.EnumAssetType|null);

        /** CreateAssetContract Name */
        Name?: (Uint8Array|null);

        /** CreateAssetContract Ticker */
        Ticker?: (Uint8Array|null);

        /** CreateAssetContract OwnerAddress */
        OwnerAddress?: (Uint8Array|null);

        /** CreateAssetContract Logo */
        Logo?: (string|null);

        /** CreateAssetContract URIs */
        URIs?: ({ [k: string]: string }|null);

        /** CreateAssetContract Precision */
        Precision?: (number|null);

        /** CreateAssetContract InitialSupply */
        InitialSupply?: (number|null);

        /** CreateAssetContract MaxSupply */
        MaxSupply?: (number|null);

        /** CreateAssetContract Royalties */
        Royalties?: (proto.IRoyaltiesInfo|null);

        /** CreateAssetContract Properties */
        Properties?: (proto.IPropertiesInfo|null);

        /** CreateAssetContract Attributes */
        Attributes?: (proto.IAttributesInfo|null);

        /** CreateAssetContract Staking */
        Staking?: (proto.IStakingInfo|null);

        /** CreateAssetContract Roles */
        Roles?: (proto.IRolesInfo[]|null);

        /** CreateAssetContract AdminAddress */
        AdminAddress?: (Uint8Array|null);
    }

    /** CreateAssetContract holds the data for a Klever digital asset */
    class CreateAssetContract implements ICreateAssetContract {

        /**
         * Constructs a new CreateAssetContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ICreateAssetContract);

        /** CreateAssetContract Type. */
        public Type: proto.CreateAssetContract.EnumAssetType;

        /** CreateAssetContract Name. */
        public Name: Uint8Array;

        /** CreateAssetContract Ticker. */
        public Ticker: Uint8Array;

        /** CreateAssetContract OwnerAddress. */
        public OwnerAddress: Uint8Array;

        /** CreateAssetContract Logo. */
        public Logo: string;

        /** CreateAssetContract URIs. */
        public URIs: { [k: string]: string };

        /** CreateAssetContract Precision. */
        public Precision: number;

        /** CreateAssetContract InitialSupply. */
        public InitialSupply: number;

        /** CreateAssetContract MaxSupply. */
        public MaxSupply: number;

        /** CreateAssetContract Royalties. */
        public Royalties?: (proto.IRoyaltiesInfo|null);

        /** CreateAssetContract Properties. */
        public Properties?: (proto.IPropertiesInfo|null);

        /** CreateAssetContract Attributes. */
        public Attributes?: (proto.IAttributesInfo|null);

        /** CreateAssetContract Staking. */
        public Staking?: (proto.IStakingInfo|null);

        /** CreateAssetContract Roles. */
        public Roles: proto.IRolesInfo[];

        /** CreateAssetContract AdminAddress. */
        public AdminAddress: Uint8Array;

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

        /** EnumAssetType enum. */
        enum EnumAssetType {
            Fungible = 0,
            NonFungible = 1,
            SemiFungible = 2
        }
    }

    /** Properties of a PropertiesInfo. */
    interface IPropertiesInfo {

        /** PropertiesInfo CanFreeze */
        CanFreeze?: (boolean|null);

        /** PropertiesInfo CanWipe */
        CanWipe?: (boolean|null);

        /** PropertiesInfo CanPause */
        CanPause?: (boolean|null);

        /** PropertiesInfo CanMint */
        CanMint?: (boolean|null);

        /** PropertiesInfo CanBurn */
        CanBurn?: (boolean|null);

        /** PropertiesInfo CanChangeOwner */
        CanChangeOwner?: (boolean|null);

        /** PropertiesInfo CanAddRoles */
        CanAddRoles?: (boolean|null);

        /** PropertiesInfo LimitTransfer */
        LimitTransfer?: (boolean|null);
    }

    /** PropertiesInfo hold the properties structure for the KDA asset */
    class PropertiesInfo implements IPropertiesInfo {

        /**
         * Constructs a new PropertiesInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IPropertiesInfo);

        /** PropertiesInfo CanFreeze. */
        public CanFreeze: boolean;

        /** PropertiesInfo CanWipe. */
        public CanWipe: boolean;

        /** PropertiesInfo CanPause. */
        public CanPause: boolean;

        /** PropertiesInfo CanMint. */
        public CanMint: boolean;

        /** PropertiesInfo CanBurn. */
        public CanBurn: boolean;

        /** PropertiesInfo CanChangeOwner. */
        public CanChangeOwner: boolean;

        /** PropertiesInfo CanAddRoles. */
        public CanAddRoles: boolean;

        /** PropertiesInfo LimitTransfer. */
        public LimitTransfer: boolean;

        /**
         * Creates a new PropertiesInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PropertiesInfo instance
         */
        public static create(properties?: proto.IPropertiesInfo): proto.PropertiesInfo;

        /**
         * Encodes the specified PropertiesInfo message. Does not implicitly {@link proto.PropertiesInfo.verify|verify} messages.
         * @param message PropertiesInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IPropertiesInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PropertiesInfo message, length delimited. Does not implicitly {@link proto.PropertiesInfo.verify|verify} messages.
         * @param message PropertiesInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IPropertiesInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PropertiesInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PropertiesInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.PropertiesInfo;

        /**
         * Decodes a PropertiesInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PropertiesInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.PropertiesInfo;

        /**
         * Verifies a PropertiesInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PropertiesInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PropertiesInfo
         */
        public static fromObject(object: { [k: string]: any }): proto.PropertiesInfo;

        /**
         * Creates a plain object from a PropertiesInfo message. Also converts values to other types if specified.
         * @param message PropertiesInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.PropertiesInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PropertiesInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PropertiesInfo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AttributesInfo. */
    interface IAttributesInfo {

        /** AttributesInfo IsPaused */
        IsPaused?: (boolean|null);

        /** AttributesInfo IsNFTMintStopped */
        IsNFTMintStopped?: (boolean|null);

        /** AttributesInfo IsRoyaltiesChangeStopped */
        IsRoyaltiesChangeStopped?: (boolean|null);

        /** AttributesInfo IsNFTMetadataChangeStopped */
        IsNFTMetadataChangeStopped?: (boolean|null);
    }

    /** AttributesInfo hold the attributes structure for the KDA asset */
    class AttributesInfo implements IAttributesInfo {

        /**
         * Constructs a new AttributesInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IAttributesInfo);

        /** AttributesInfo IsPaused. */
        public IsPaused: boolean;

        /** AttributesInfo IsNFTMintStopped. */
        public IsNFTMintStopped: boolean;

        /** AttributesInfo IsRoyaltiesChangeStopped. */
        public IsRoyaltiesChangeStopped: boolean;

        /** AttributesInfo IsNFTMetadataChangeStopped. */
        public IsNFTMetadataChangeStopped: boolean;

        /**
         * Creates a new AttributesInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AttributesInfo instance
         */
        public static create(properties?: proto.IAttributesInfo): proto.AttributesInfo;

        /**
         * Encodes the specified AttributesInfo message. Does not implicitly {@link proto.AttributesInfo.verify|verify} messages.
         * @param message AttributesInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IAttributesInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified AttributesInfo message, length delimited. Does not implicitly {@link proto.AttributesInfo.verify|verify} messages.
         * @param message AttributesInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IAttributesInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AttributesInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns AttributesInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.AttributesInfo;

        /**
         * Decodes an AttributesInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns AttributesInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.AttributesInfo;

        /**
         * Verifies an AttributesInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an AttributesInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns AttributesInfo
         */
        public static fromObject(object: { [k: string]: any }): proto.AttributesInfo;

        /**
         * Creates a plain object from an AttributesInfo message. Also converts values to other types if specified.
         * @param message AttributesInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.AttributesInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AttributesInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for AttributesInfo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a StakingInfo. */
    interface IStakingInfo {

        /** StakingInfo Type */
        Type?: (proto.StakingInfo.InterestType|null);

        /** StakingInfo APR */
        APR?: (number|null);

        /** StakingInfo MinEpochsToClaim */
        MinEpochsToClaim?: (number|null);

        /** StakingInfo MinEpochsToUnstake */
        MinEpochsToUnstake?: (number|null);

        /** StakingInfo MinEpochsToWithdraw */
        MinEpochsToWithdraw?: (number|null);
    }

    /** StakingInfo hold the staking structure for the KDA asset */
    class StakingInfo implements IStakingInfo {

        /**
         * Constructs a new StakingInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IStakingInfo);

        /** StakingInfo Type. */
        public Type: proto.StakingInfo.InterestType;

        /** StakingInfo APR. */
        public APR: number;

        /** StakingInfo MinEpochsToClaim. */
        public MinEpochsToClaim: number;

        /** StakingInfo MinEpochsToUnstake. */
        public MinEpochsToUnstake: number;

        /** StakingInfo MinEpochsToWithdraw. */
        public MinEpochsToWithdraw: number;

        /**
         * Creates a new StakingInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns StakingInfo instance
         */
        public static create(properties?: proto.IStakingInfo): proto.StakingInfo;

        /**
         * Encodes the specified StakingInfo message. Does not implicitly {@link proto.StakingInfo.verify|verify} messages.
         * @param message StakingInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IStakingInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified StakingInfo message, length delimited. Does not implicitly {@link proto.StakingInfo.verify|verify} messages.
         * @param message StakingInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IStakingInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a StakingInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns StakingInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.StakingInfo;

        /**
         * Decodes a StakingInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns StakingInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.StakingInfo;

        /**
         * Verifies a StakingInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a StakingInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns StakingInfo
         */
        public static fromObject(object: { [k: string]: any }): proto.StakingInfo;

        /**
         * Creates a plain object from a StakingInfo message. Also converts values to other types if specified.
         * @param message StakingInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.StakingInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this StakingInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for StakingInfo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    namespace StakingInfo {

        /** InterestType enum. */
        enum InterestType {
            APRI = 0,
            FPRI = 1
        }
    }

    /** Properties of a RolesInfo. */
    interface IRolesInfo {

        /** RolesInfo Address */
        Address?: (Uint8Array|null);

        /** RolesInfo HasRoleMint */
        HasRoleMint?: (boolean|null);

        /** RolesInfo HasRoleSetITOPrices */
        HasRoleSetITOPrices?: (boolean|null);

        /** RolesInfo HasRoleDeposit */
        HasRoleDeposit?: (boolean|null);

        /** RolesInfo HasRoleTransfer */
        HasRoleTransfer?: (boolean|null);
    }

    /** RolesInfo holds the roles for a given asset and the given address */
    class RolesInfo implements IRolesInfo {

        /**
         * Constructs a new RolesInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IRolesInfo);

        /** RolesInfo Address. */
        public Address: Uint8Array;

        /** RolesInfo HasRoleMint. */
        public HasRoleMint: boolean;

        /** RolesInfo HasRoleSetITOPrices. */
        public HasRoleSetITOPrices: boolean;

        /** RolesInfo HasRoleDeposit. */
        public HasRoleDeposit: boolean;

        /** RolesInfo HasRoleTransfer. */
        public HasRoleTransfer: boolean;

        /**
         * Creates a new RolesInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RolesInfo instance
         */
        public static create(properties?: proto.IRolesInfo): proto.RolesInfo;

        /**
         * Encodes the specified RolesInfo message. Does not implicitly {@link proto.RolesInfo.verify|verify} messages.
         * @param message RolesInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IRolesInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RolesInfo message, length delimited. Does not implicitly {@link proto.RolesInfo.verify|verify} messages.
         * @param message RolesInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IRolesInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RolesInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RolesInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.RolesInfo;

        /**
         * Decodes a RolesInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RolesInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.RolesInfo;

        /**
         * Verifies a RolesInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RolesInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RolesInfo
         */
        public static fromObject(object: { [k: string]: any }): proto.RolesInfo;

        /**
         * Creates a plain object from a RolesInfo message. Also converts values to other types if specified.
         * @param message RolesInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.RolesInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RolesInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RolesInfo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RoyaltiesInfo. */
    interface IRoyaltiesInfo {

        /** RoyaltiesInfo Address */
        Address?: (Uint8Array|null);

        /** RoyaltiesInfo TransferPercentage */
        TransferPercentage?: (proto.IRoyaltyInfo[]|null);

        /** RoyaltiesInfo TransferFixed */
        TransferFixed?: (number|null);

        /** RoyaltiesInfo MarketPercentage */
        MarketPercentage?: (number|null);

        /** RoyaltiesInfo MarketFixed */
        MarketFixed?: (number|null);

        /** RoyaltiesInfo SplitRoyalties */
        SplitRoyalties?: ({ [k: string]: proto.IRoyaltySplitInfo }|null);

        /** RoyaltiesInfo ITOFixed */
        ITOFixed?: (number|null);

        /** RoyaltiesInfo ITOPercentage */
        ITOPercentage?: (number|null);
    }

    /** RoyaltiesInfo holds the royalties for a given asset */
    class RoyaltiesInfo implements IRoyaltiesInfo {

        /**
         * Constructs a new RoyaltiesInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IRoyaltiesInfo);

        /** RoyaltiesInfo Address. */
        public Address: Uint8Array;

        /** RoyaltiesInfo TransferPercentage. */
        public TransferPercentage: proto.IRoyaltyInfo[];

        /** RoyaltiesInfo TransferFixed. */
        public TransferFixed: number;

        /** RoyaltiesInfo MarketPercentage. */
        public MarketPercentage: number;

        /** RoyaltiesInfo MarketFixed. */
        public MarketFixed: number;

        /** RoyaltiesInfo SplitRoyalties. */
        public SplitRoyalties: { [k: string]: proto.IRoyaltySplitInfo };

        /** RoyaltiesInfo ITOFixed. */
        public ITOFixed: number;

        /** RoyaltiesInfo ITOPercentage. */
        public ITOPercentage: number;

        /**
         * Creates a new RoyaltiesInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RoyaltiesInfo instance
         */
        public static create(properties?: proto.IRoyaltiesInfo): proto.RoyaltiesInfo;

        /**
         * Encodes the specified RoyaltiesInfo message. Does not implicitly {@link proto.RoyaltiesInfo.verify|verify} messages.
         * @param message RoyaltiesInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IRoyaltiesInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RoyaltiesInfo message, length delimited. Does not implicitly {@link proto.RoyaltiesInfo.verify|verify} messages.
         * @param message RoyaltiesInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IRoyaltiesInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RoyaltiesInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RoyaltiesInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.RoyaltiesInfo;

        /**
         * Decodes a RoyaltiesInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RoyaltiesInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.RoyaltiesInfo;

        /**
         * Verifies a RoyaltiesInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RoyaltiesInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RoyaltiesInfo
         */
        public static fromObject(object: { [k: string]: any }): proto.RoyaltiesInfo;

        /**
         * Creates a plain object from a RoyaltiesInfo message. Also converts values to other types if specified.
         * @param message RoyaltiesInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.RoyaltiesInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RoyaltiesInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RoyaltiesInfo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RoyaltySplitInfo. */
    interface IRoyaltySplitInfo {

        /** RoyaltySplitInfo PercentTransferPercentage */
        PercentTransferPercentage?: (number|null);

        /** RoyaltySplitInfo PercentTransferFixed */
        PercentTransferFixed?: (number|null);

        /** RoyaltySplitInfo PercentMarketPercentage */
        PercentMarketPercentage?: (number|null);

        /** RoyaltySplitInfo PercentMarketFixed */
        PercentMarketFixed?: (number|null);

        /** RoyaltySplitInfo PercentITOPercentage */
        PercentITOPercentage?: (number|null);

        /** RoyaltySplitInfo PercentITOFixed */
        PercentITOFixed?: (number|null);
    }

    /** RoyaltySplitInfo holds the royalty split */
    class RoyaltySplitInfo implements IRoyaltySplitInfo {

        /**
         * Constructs a new RoyaltySplitInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IRoyaltySplitInfo);

        /** RoyaltySplitInfo PercentTransferPercentage. */
        public PercentTransferPercentage: number;

        /** RoyaltySplitInfo PercentTransferFixed. */
        public PercentTransferFixed: number;

        /** RoyaltySplitInfo PercentMarketPercentage. */
        public PercentMarketPercentage: number;

        /** RoyaltySplitInfo PercentMarketFixed. */
        public PercentMarketFixed: number;

        /** RoyaltySplitInfo PercentITOPercentage. */
        public PercentITOPercentage: number;

        /** RoyaltySplitInfo PercentITOFixed. */
        public PercentITOFixed: number;

        /**
         * Creates a new RoyaltySplitInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RoyaltySplitInfo instance
         */
        public static create(properties?: proto.IRoyaltySplitInfo): proto.RoyaltySplitInfo;

        /**
         * Encodes the specified RoyaltySplitInfo message. Does not implicitly {@link proto.RoyaltySplitInfo.verify|verify} messages.
         * @param message RoyaltySplitInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IRoyaltySplitInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RoyaltySplitInfo message, length delimited. Does not implicitly {@link proto.RoyaltySplitInfo.verify|verify} messages.
         * @param message RoyaltySplitInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IRoyaltySplitInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RoyaltySplitInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RoyaltySplitInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.RoyaltySplitInfo;

        /**
         * Decodes a RoyaltySplitInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RoyaltySplitInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.RoyaltySplitInfo;

        /**
         * Verifies a RoyaltySplitInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RoyaltySplitInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RoyaltySplitInfo
         */
        public static fromObject(object: { [k: string]: any }): proto.RoyaltySplitInfo;

        /**
         * Creates a plain object from a RoyaltySplitInfo message. Also converts values to other types if specified.
         * @param message RoyaltySplitInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.RoyaltySplitInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RoyaltySplitInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RoyaltySplitInfo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a RoyaltyInfo. */
    interface IRoyaltyInfo {

        /** RoyaltyInfo Amount */
        Amount?: (number|null);

        /** RoyaltyInfo Percentage */
        Percentage?: (number|null);
    }

    /** RoyaltyInfo holds the royalty threshold */
    class RoyaltyInfo implements IRoyaltyInfo {

        /**
         * Constructs a new RoyaltyInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IRoyaltyInfo);

        /** RoyaltyInfo Amount. */
        public Amount: number;

        /** RoyaltyInfo Percentage. */
        public Percentage: number;

        /**
         * Creates a new RoyaltyInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns RoyaltyInfo instance
         */
        public static create(properties?: proto.IRoyaltyInfo): proto.RoyaltyInfo;

        /**
         * Encodes the specified RoyaltyInfo message. Does not implicitly {@link proto.RoyaltyInfo.verify|verify} messages.
         * @param message RoyaltyInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.IRoyaltyInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified RoyaltyInfo message, length delimited. Does not implicitly {@link proto.RoyaltyInfo.verify|verify} messages.
         * @param message RoyaltyInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.IRoyaltyInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a RoyaltyInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns RoyaltyInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.RoyaltyInfo;

        /**
         * Decodes a RoyaltyInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns RoyaltyInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.RoyaltyInfo;

        /**
         * Verifies a RoyaltyInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a RoyaltyInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns RoyaltyInfo
         */
        public static fromObject(object: { [k: string]: any }): proto.RoyaltyInfo;

        /**
         * Creates a plain object from a RoyaltyInfo message. Also converts values to other types if specified.
         * @param message RoyaltyInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.RoyaltyInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this RoyaltyInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for RoyaltyInfo
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a FreezeContract. */
    interface IFreezeContract {

        /** FreezeContract AssetID */
        AssetID?: (Uint8Array|null);

        /** FreezeContract Amount */
        Amount?: (number|null);
    }

    /** FreezeContract holds the data for a freeze transaction */
    class FreezeContract implements IFreezeContract {

        /**
         * Constructs a new FreezeContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IFreezeContract);

        /** FreezeContract AssetID. */
        public AssetID: Uint8Array;

        /** FreezeContract Amount. */
        public Amount: number;

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

    /** UnfreezeContract holds the data for a unfreeze transaction */
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

    /** DelegateContract holds the data for a delegate transaction */
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

    /** UndelegateContract holds the data for a undelegate transaction */
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

        /** WithdrawContract AssetID */
        AssetID?: (Uint8Array|null);

        /** WithdrawContract WithdrawType */
        WithdrawType?: (proto.WithdrawContract.EnumWithdrawType|null);

        /** WithdrawContract amount */
        amount?: (number|null);

        /** WithdrawContract CurrencyID */
        CurrencyID?: (Uint8Array|null);
    }

    /** WithdrawContract holds the data for a withdraw transaction */
    class WithdrawContract implements IWithdrawContract {

        /**
         * Constructs a new WithdrawContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IWithdrawContract);

        /** WithdrawContract AssetID. */
        public AssetID: Uint8Array;

        /** WithdrawContract WithdrawType. */
        public WithdrawType: proto.WithdrawContract.EnumWithdrawType;

        /** WithdrawContract amount. */
        public amount: number;

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

        /** EnumWithdrawType enum. */
        enum EnumWithdrawType {
            Staking = 0,
            KDAPool = 1
        }
    }

    /** Properties of a ClaimContract. */
    interface IClaimContract {

        /** ClaimContract ClaimType */
        ClaimType?: (proto.ClaimContract.EnumClaimType|null);

        /** ClaimContract ID */
        ID?: (Uint8Array|null);
    }

    /** ClaimContract holds the data for a claim transaction */
    class ClaimContract implements IClaimContract {

        /**
         * Constructs a new ClaimContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IClaimContract);

        /** ClaimContract ClaimType. */
        public ClaimType: proto.ClaimContract.EnumClaimType;

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

        /** EnumClaimType enum. */
        enum EnumClaimType {
            StakingClaim = 0,
            AllowanceClaim = 1,
            MarketClaim = 2
        }
    }

    /** Properties of a VoteContract. */
    interface IVoteContract {

        /** VoteContract ProposalID */
        ProposalID?: (number|null);

        /** VoteContract Amount */
        Amount?: (number|null);

        /** VoteContract Type */
        Type?: (proto.VoteContract.EnumVoteType|null);
    }

    /** VoteContract holds the data for a vote transaction */
    class VoteContract implements IVoteContract {

        /**
         * Constructs a new VoteContract.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.IVoteContract);

        /** VoteContract ProposalID. */
        public ProposalID: number;

        /** VoteContract Amount. */
        public Amount: number;

        /** VoteContract Type. */
        public Type: proto.VoteContract.EnumVoteType;

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

        /** EnumVoteType enum. */
        enum EnumVoteType {
            Yes = 0,
            No = 1
        }
    }

    /** Properties of a CallValue. */
    interface ICallValue {

        /** CallValue Amount */
        Amount?: (number|null);

        /** CallValue KDARoyalties */
        KDARoyalties?: (number|null);

        /** CallValue KLVRoyalties */
        KLVRoyalties?: (number|null);
    }

    /** Represents a CallValue. */
    class CallValue implements ICallValue {

        /**
         * Constructs a new CallValue.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ICallValue);

        /** CallValue Amount. */
        public Amount: number;

        /** CallValue KDARoyalties. */
        public KDARoyalties: number;

        /** CallValue KLVRoyalties. */
        public KLVRoyalties: number;

        /**
         * Creates a new CallValue instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CallValue instance
         */
        public static create(properties?: proto.ICallValue): proto.CallValue;

        /**
         * Encodes the specified CallValue message. Does not implicitly {@link proto.CallValue.verify|verify} messages.
         * @param message CallValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.ICallValue, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CallValue message, length delimited. Does not implicitly {@link proto.CallValue.verify|verify} messages.
         * @param message CallValue message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.ICallValue, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CallValue message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CallValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.CallValue;

        /**
         * Decodes a CallValue message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CallValue
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.CallValue;

        /**
         * Verifies a CallValue message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CallValue message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CallValue
         */
        public static fromObject(object: { [k: string]: any }): proto.CallValue;

        /**
         * Creates a plain object from a CallValue message. Also converts values to other types if specified.
         * @param message CallValue
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.CallValue, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CallValue to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for CallValue
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a SmartContract. */
    interface ISmartContract {

        /** SmartContract Type */
        Type?: (proto.SmartContract.SCType|null);

        /** SmartContract Address */
        Address?: (Uint8Array|null);

        /**
         * SmartContract CallValue is represented by a map of currencyID and amount
         * should be limited to 50 currencies
         */
        CallValue?: ({ [k: string]: proto.ICallValue }|null);
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

        /**
         * SmartContract CallValue is represented by a map of currencyID and amount
         * should be limited to 50 currencies
         */
        public CallValue: { [k: string]: proto.ICallValue };

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
            SCInvoke = 0,
            SCDeploy = 1
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
