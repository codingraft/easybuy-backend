import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
  name: string;
  email: string;
  image: string;
  role: string;
  gender: string;
  dob: Date;
  _id: string;
  
}
export interface NewProductRequestBody {
  name: string;
  // image: string;
  price: number;
  // description: string;
  stock: number;
  category: string;
}

export interface SearchRequestQuery {
  search?: string;
  sort?: string;
  category?: string;
  page?: string;
  price?: string;
}

export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export interface BaseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: {
    $lte: number;
  };
  category?: string;
}

export type InvalidCacheProps = {
  product?: boolean;
  admin?: boolean;
  order?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];
};
export type ShippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
  // phoneNo: number;
};
export type OrderItemType = {
  name: string;
  price: number;
  quantity: number;
  image: string;
  productId: string;
};
export interface NewOrderRequestBody {
  shippingInfo: ShippingInfoType;
  user: string;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  orderItems: OrderItemType[];
}
