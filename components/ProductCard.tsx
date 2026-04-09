import { Product } from '../contexts/ProductContext';
import { formatNairaPrice } from '../utils/currency';
import ProductCardContent from './ProductCardContent';

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

export default function ProductCard({ product, addToCart }: ProductCardProps) {
  return (
    <ProductCardContent product={product} addToCart={addToCart} />
  );
}