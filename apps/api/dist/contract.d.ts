import { ethers } from "ethers";
export declare const verifierAbi: ({
    inputs: never[];
    stateMutability: string;
    type: string;
    name?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
})[];
export declare const moduleAbi: ({
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
    name?: undefined;
    outputs?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    outputs?: undefined;
} | {
    stateMutability: string;
    type: string;
    inputs?: undefined;
    anonymous?: undefined;
    name?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
export declare const verifierAddress = "0xBbce25dA74eAF7A86A039F0Ecf74485D9665365A";
export declare const moduleAddress = "0x0Fc51aaE5dD89843d40F6057bcC111ae2787a46e";
export declare const verifierContract: ethers.Contract;
export declare const moduleContract: ethers.Contract;
