import React from 'react';

export type ProductType = 'Account' | 'Diamonds' | 'Boost';

export interface Product {
  id: string;
  type: ProductType;
  title: string;
  seller: string;
  sellerId: string;
  price: string;
  color: string;
  icon?: React.ReactNode;
  rating: number;
  reviewsCount: number;
}
