export interface Market {
  id: number;
  creator: string;
  question: string;
  endTime: number;
  resolved: boolean;
  yesShares: string;
  noShares: string;
}
