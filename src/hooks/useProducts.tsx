import { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../types/index";

type UseProductsReturnType = {
  products: Product[] | [];
  activeProducts: Product[] | [];
  addProduct: (product: { name: string }) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, name: string, active?: boolean) => void;
};

function useProducts(update?: boolean): UseProductsReturnType {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [trigger, updateList] = useState<boolean>(update ?? false);

  useEffect(() => {
    axios
      .get<Product[]>(process.env.REACT_APP_API_URL + "products")
      .then((response) => response.data)
      .then((data) => {
        setProducts(data);
        setActiveProducts(data.filter((product) => product.active));
      });

  }, [trigger]);


  const addProduct = (product: { name: string }) => {
    axios
      .post<Product>(process.env.REACT_APP_API_URL + "products", {
        name: product.name,
      })
      .then((response) => response.data)
      .then((data) => {
        setProducts([...products, data]);
        updateList(update || ((state) => !state));
      });
  };

  const deleteProduct = (id: string) => {
    if (!id) return;
    axios
      .delete<Product>(process.env.REACT_APP_API_URL + "products/" + id)
      .then((response) => response.data)
      .then(() => {
        updateList(update || ((state) => !state));
      });
  };

  const updateProduct = (id: string, name: string, active?: boolean) => {
    if (!id) return;
    axios
      .put<Product>(process.env.REACT_APP_API_URL + "products", { id, name, active })
      .then((response) => response.data)
      .then((data) => {
        updateList(update || ((state) => !state));
      });
  }


  return { products, activeProducts, addProduct, deleteProduct, updateProduct };
}

export default useProducts;
