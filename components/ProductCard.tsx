import { Product } from '../contexts/ProductContext';
import { formatNairaPrice } from '../utils/currency';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  addToCart: (product: Product) => void;
}

export default function ProductCard({ product, addToCart }: ProductCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-green-600 rounded-2xl shadow-xl overflow-hidden hover:border-green-400 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-105 group animate-float">
      <div className="relative overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={192}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 right-3">
          <span className="bg-green-600 text-black px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            NEW
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-300">
            {product.category || 'Gaming'}
          </span>
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span key={idx} className={idx < Math.round(product.rating || 4.5) ? 'opacity-100' : 'opacity-40'}>★</span>
            ))}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">
          {product.name}
        </h3>
        <p className="text-green-100 text-sm leading-relaxed mb-5 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-green-400">{formatNairaPrice(product.price)}</span>
            <span className="text-xs text-green-500">Fast shipping</span>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="bg-green-600 text-black px-5 py-3 rounded-full font-semibold hover:bg-green-500 transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/25 flex items-center gap-2 animate-pulse-glow"
          >
            <span>Buy</span>
            <span className="text-lg">🛒</span>
          </button>
        </div>
      </div>
    </div>
  );
}