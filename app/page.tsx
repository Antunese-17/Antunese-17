"use client";

import { useMemo, useState } from "react";
import Cart from "@/components/Cart";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";
import { categories, formatPrice, products } from "@/lib/products";

const ALL = "Todos";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategory === ALL) return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const cartItems = useMemo(
    () =>
      products
        .filter((product) => (cart[product.id] ?? 0) > 0)
        .map((product) => ({ product, quantity: cart[product.id] })),
    [cart]
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  function addToCart(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  function increment(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  function decrement(id: string) {
    setCart((prev) => {
      const nextQuantity = (prev[id] ?? 0) - 1;
      if (nextQuantity <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: nextQuantity };
    });
  }

  function removeItem(id: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 bg-sofia-cream/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 pb-1 pt-5">
          <span className="text-3xl">🧁</span>
          <div>
            <h1 className="text-lg font-bold text-sofia-choco">Doceria Sofia</h1>
            <p className="text-xs text-sofia-choco-light">Doces artesanais feitos com carinho</p>
          </div>
        </div>
        <FilterBar
          categories={[ALL, ...categories]}
          active={activeCategory}
          onSelect={setActiveCategory}
        />
      </header>

      <main className="px-4 py-4">
        <ul className="flex flex-col gap-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cart[product.id] ?? 0}
              onAdd={addToCart}
              onIncrement={increment}
              onDecrement={decrement}
            />
          ))}
        </ul>

        {filteredProducts.length === 0 && (
          <p className="mt-10 text-center text-sm text-sofia-choco-light">
            Nenhum doce encontrado nessa categoria.
          </p>
        )}
      </main>

      {totalItems > 0 && (
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="animate-fade-in fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-full bg-sofia-purple px-5 py-4 text-white shadow-lg transition-transform duration-150 active:scale-[0.98]"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-xs font-bold text-sofia-purple">
              {totalItems}
            </span>
            Ver carrinho
          </span>
          <span className="text-sm font-bold">{formatPrice(totalPrice)}</span>
        </button>
      )}

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        totalPrice={totalPrice}
        onIncrement={increment}
        onDecrement={decrement}
        onRemove={removeItem}
      />
    </div>
  );
}
