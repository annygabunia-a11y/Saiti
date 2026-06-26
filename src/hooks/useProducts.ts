import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../lib/types';
import React from 'react';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const prods: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        prods.push({
          id: doc.id,
          type: data.type,
          title: data.title,
          seller: data.sellerName,
          sellerId: data.sellerId,
          price: data.price.toString(),
          color: data.color || 'bg-slate-500',
          rating: data.rating || 0,
          reviewsCount: data.reviewsCount || 0
        });
      });
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (productData: any) => {
    try {
      await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (e) {
      console.error("Error adding product: ", e);
      return false;
    }
  };

  return { products, loading, addProduct };
}
