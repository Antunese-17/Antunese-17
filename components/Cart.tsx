"use client";

import { useMemo, useState } from "react";
import { CartItem, STORE_WHATSAPP, formatPrice } from "@/lib/products";

type CartProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
};

type Step = "cart" | "confirm";

const PAYMENT_OPTIONS = ["Pix", "Dinheiro", "Cartão na entrega"];

export default function Cart({
  isOpen,
  onClose,
  items,
  totalPrice,
  onIncrement,
  onDecrement,
  onRemove,
}: CartProps) {
  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState(PAYMENT_OPTIONS[0]);

  const whatsappLink = useMemo(() => {
    const lines = [
      "Olá, Doceria Sofia! 🧁",
      "Gostaria de fazer o seguinte pedido:",
      "",
      ...items.map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} — ${formatPrice(
            item.product.price * item.quantity
          )}`
      ),
      "",
      `Total: ${formatPrice(totalPrice)}`,
      "",
      `Nome: ${name || "-"}`,
      `Endereço: ${address || "-"}`,
      `Pagamento: ${payment}`,
      "",
      "Aguardo a confirmação, obrigado(a)! 💕",
    ];
    return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [items, totalPrice, name, address, payment]);

  function handleClose() {
    setStep("cart");
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-40 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-sofia-choco/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-sofia-rose/40" />

        {step === "cart" ? (
          <CartStep
            items={items}
            totalPrice={totalPrice}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onRemove={onRemove}
            onClose={handleClose}
            onCheckout={() => setStep("confirm")}
          />
        ) : (
          <ConfirmStep
            name={name}
            setName={setName}
            address={address}
            setAddress={setAddress}
            payment={payment}
            setPayment={setPayment}
            whatsappLink={whatsappLink}
            onBack={() => setStep("cart")}
          />
        )}
      </div>
    </div>
  );
}

type CartStepProps = {
  items: CartItem[];
  totalPrice: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onCheckout: () => void;
};

function CartStep({
  items,
  totalPrice,
  onIncrement,
  onDecrement,
  onRemove,
  onClose,
  onCheckout,
}: CartStepProps) {
  return (
    <div className="animate-fade-in flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3">
        <h2 className="text-lg font-bold text-sofia-choco">Seu carrinho</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar carrinho"
          className="grid h-8 w-8 place-items-center rounded-full bg-sofia-cream text-sofia-choco-light"
        >
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-sofia-choco-light">
          Seu carrinho está vazio. Adicione alguns docinhos! 🍬
        </p>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
          {items.map(({ product, quantity }) => (
            <li
              key={product.id}
              className="flex items-center gap-3 border-b border-sofia-rose/15 py-3 last:border-none"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sofia-rose/20 text-xl">
                {product.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-sofia-choco">{product.name}</p>
                <p className="text-xs text-sofia-choco-light">{formatPrice(product.price)} un.</p>
                <button
                  type="button"
                  onClick={() => onRemove(product.id)}
                  className="mt-0.5 text-xs font-medium text-sofia-purple-dark underline underline-offset-2"
                >
                  Remover
                </button>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-full bg-sofia-cream px-1 py-1 ring-1 ring-sofia-rose/40">
                <button
                  type="button"
                  aria-label={`Diminuir quantidade de ${product.name}`}
                  onClick={() => onDecrement(product.id)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-white text-base font-bold text-sofia-purple-dark transition-transform duration-150 active:scale-90"
                >
                  −
                </button>
                <span className="w-4 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label={`Aumentar quantidade de ${product.name}`}
                  onClick={() => onIncrement(product.id)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-sofia-rose text-base font-bold text-sofia-choco transition-transform duration-150 active:scale-90"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="shrink-0 border-t border-sofia-rose/15 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-sofia-choco-light">Total</span>
            <span className="text-lg font-bold text-sofia-choco">{formatPrice(totalPrice)}</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            className="w-full rounded-full bg-sofia-purple py-3.5 text-sm font-bold text-white transition-transform duration-150 active:scale-[0.98]"
          >
            Finalizar pedido
          </button>
        </div>
      )}
    </div>
  );
}

type ConfirmStepProps = {
  name: string;
  setName: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  payment: string;
  setPayment: (value: string) => void;
  whatsappLink: string;
  onBack: () => void;
};

function ConfirmStep({
  name,
  setName,
  address,
  setAddress,
  payment,
  setPayment,
  whatsappLink,
  onBack,
}: ConfirmStepProps) {
  return (
    <div className="animate-slide-up flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para o carrinho"
          className="grid h-8 w-8 place-items-center rounded-full bg-sofia-cream text-sofia-choco-light"
        >
          ←
        </button>
        <h2 className="text-lg font-bold text-sofia-choco">Confirmar pedido</h2>
      </div>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block font-medium text-sofia-choco">Seu nome</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Como podemos te chamar?"
          className="w-full rounded-xl border border-sofia-rose/30 bg-sofia-cream px-3 py-2.5 text-sofia-choco outline-none focus:border-sofia-purple"
        />
      </label>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block font-medium text-sofia-choco">Endereço de entrega</span>
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Rua, número, bairro"
          className="w-full rounded-xl border border-sofia-rose/30 bg-sofia-cream px-3 py-2.5 text-sofia-choco outline-none focus:border-sofia-purple"
        />
      </label>

      <div className="mb-5">
        <span className="mb-1 block text-sm font-medium text-sofia-choco">Forma de pagamento</span>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPayment(option)}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ${
                payment === option
                  ? "bg-sofia-yellow text-sofia-choco"
                  : "bg-sofia-cream text-sofia-choco-light ring-1 ring-sofia-rose/30"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-bold text-white transition-transform duration-150 active:scale-[0.98]"
      >
        Enviar pedido no WhatsApp
      </a>
    </div>
  );
}
