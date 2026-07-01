"use client";

import { Product, formatPrice } from "@/lib/products";

type ProductCardProps = {
  product: Product;
  quantity: number;
  onAdd: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
};

export default function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
}: ProductCardProps) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-sofia-rose/15">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sofia-rose/40 to-sofia-purple/25 text-3xl">
        {product.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-sofia-choco">{product.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-sofia-choco-light">
          {product.description}
        </p>
        <p className="mt-1 text-sm font-bold text-sofia-purple-dark">
          {formatPrice(product.price)}
        </p>
      </div>

      {quantity === 0 ? (
        <button
          type="button"
          onClick={() => onAdd(product.id)}
          className="shrink-0 rounded-full bg-sofia-rose px-4 py-2 text-sm font-semibold text-sofia-choco transition-transform duration-150 active:scale-95"
        >
          Add
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-sofia-cream px-1 py-1 ring-1 ring-sofia-rose/40">
          <button
            type="button"
            aria-label={`Diminuir quantidade de ${product.name}`}
            onClick={() => onDecrement(product.id)}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-base font-bold text-sofia-purple-dark transition-transform duration-150 active:scale-90"
          >
            −
          </button>
          <span className="w-4 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            aria-label={`Aumentar quantidade de ${product.name}`}
            onClick={() => onIncrement(product.id)}
            className="grid h-8 w-8 place-items-center rounded-full bg-sofia-rose text-base font-bold text-sofia-choco transition-transform duration-150 active:scale-90"
          >
            +
          </button>
        </div>
      )}
    </li>
  );
}
