export interface IOrderBase {
  name: string;
  ingredients: string[];
  number: number;
  createdAt: Date;
}

export interface IInProgressOrder extends IOrderBase {}
export interface IReadyOrder extends IOrderBase {}
