export type Transaction = {
    type: string
    date: Date
    description: string,
    ISIN: string
    amount: number,
    amountAsString: string
}

export const Transaction = {
    Type: {
        UNKNOWN: 'Unknown'
    }
};
