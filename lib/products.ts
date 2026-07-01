export type Category = "Brigadeiro" | "Chocolate" | "Nutella" | "Morango" | "Bolo";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  emoji: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export const categories: Category[] = [
  "Brigadeiro",
  "Chocolate",
  "Nutella",
  "Morango",
  "Bolo",
];

export const products: Product[] = [
  {
    id: "brigadeiro-tradicional",
    name: "Brigadeiro Tradicional",
    category: "Brigadeiro",
    price: 3.5,
    description: "O clássico de chocolate com granulado, feito na hora.",
    emoji: "🍫",
  },
  {
    id: "brigadeiro-gourmet-trufado",
    name: "Brigadeiro Gourmet Trufado",
    category: "Brigadeiro",
    price: 5.0,
    description: "Recheio cremoso trufado com cobertura de cacau belga.",
    emoji: "🍬",
  },
  {
    id: "trufa-chocolate-belga",
    name: "Trufa de Chocolate Belga",
    category: "Chocolate",
    price: 6.0,
    description: "Trufa artesanal com casca crocante e recheio derretido.",
    emoji: "🍩",
  },
  {
    id: "bombom-meio-amargo",
    name: "Bombom Meio Amargo",
    category: "Chocolate",
    price: 4.5,
    description: "Chocolate meio amargo com recheio de ganache.",
    emoji: "🍫",
  },
  {
    id: "brigadeiro-nutella",
    name: "Brigadeiro de Nutella",
    category: "Nutella",
    price: 5.5,
    description: "Brigadeiro cremoso com Nutella e avelãs picadas.",
    emoji: "🌰",
  },
  {
    id: "copinho-nutella-morango",
    name: "Copinho de Nutella com Morango",
    category: "Nutella",
    price: 8.0,
    description: "Camadas de Nutella, morango fresco e chantininho.",
    emoji: "🍨",
  },
  {
    id: "morango-do-amor",
    name: "Morango do Amor",
    category: "Morango",
    price: 7.0,
    description: "Morango fresco envolto em caramelo e chocolate crocante.",
    emoji: "🍓",
  },
  {
    id: "bolo-pote-ninho-morango",
    name: "Bolo de Pote Ninho com Morango",
    category: "Bolo",
    price: 9.5,
    description: "Bolo de pote com creme de leite Ninho e morangos frescos.",
    emoji: "🍰",
  },
];

export const STORE_WHATSAPP = "5511999999999";

export function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
