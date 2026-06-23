import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ShoppingBag, Plus, Pencil, Trash2, Star, Search, Package,
  Coins, Tag, Image, Save, X, Download, BarChart3, Eye,
} from "lucide-react";
import { downloadCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────
type Category = "Fashion" | "Beauty" | "Electronics" | "Home";

interface Product {
  id: string;
  name: string;
  price: number;       // in coins
  category: Category;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  active: boolean;
}

// ── Initial data (mirrors artifacts/ridhi/data/mockData.ts PRODUCTS) ──────────
const INITIAL_PRODUCTS: Product[] = [
  { id: "prod1",  name: "Classic Silk Kurta Set",    price: 1200, category: "Fashion",     image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500",  description: "Elegant silk kurta set with intricate embroidery, perfect for festive occasions.", rating: 4.8, reviews: 124, active: true },
  { id: "prod2",  name: "Canvas Sneakers",           price: 850,  category: "Fashion",     image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500",  description: "Comfortable and stylish canvas sneakers for everyday wear.", rating: 4.5, reviews: 89,  active: true },
  { id: "prod3",  name: "Aviator Sunglasses",        price: 450,  category: "Fashion",     image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=500",  description: "Timeless aviator design with UV protection lenses.", rating: 4.2, reviews: 56,  active: true },
  { id: "prod4",  name: "Matte Lipstick Set",        price: 600,  category: "Beauty",      image: "https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=500",  description: "Long-lasting matte lipsticks in 5 trending shades.", rating: 4.7, reviews: 210, active: true },
  { id: "prod5",  name: "Organic Face Serum",        price: 750,  category: "Beauty",      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",  description: "Vitamin C enriched serum for glowing and healthy skin.", rating: 4.6, reviews: 145, active: true },
  { id: "prod6",  name: "Wireless Earbuds",          price: 1500, category: "Electronics", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",  description: "Noise-cancelling earbuds with 24-hour battery life.", rating: 4.4, reviews: 320, active: true },
  { id: "prod7",  name: "Premium Phone Case",        price: 350,  category: "Electronics", image: "https://images.unsplash.com/photo-1586105251261-72a756657fd1?w=500",  description: "Durable and slim case for ultimate phone protection.", rating: 4.9, reviews: 78,  active: true },
  { id: "prod8",  name: "Canvas Tote Bag",           price: 250,  category: "Fashion",     image: "https://images.unsplash.com/photo-1544816153-39ad03578334?w=500",  description: "Spacious eco-friendly tote bag for all your essentials.", rating: 4.3, reviews: 42,  active: true },
  { id: "prod9",  name: "Scented Soy Candle",        price: 300,  category: "Home",        image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500",  description: "Lavender scented hand-poured soy candle for a relaxing ambiance.", rating: 4.8, reviews: 65,  active: true },
  { id: "prod10", name: "Smart Watch Band",          price: 400,  category: "Electronics", image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500",  description: "Silicone replacement band for most smartwatches.", rating: 4.1, reviews: 33,  active: true },
];

const CATEGORIES: Category[] = ["Fashion", "Beauty", "Electronics", "Home"];

const CAT_COLOR: Record<Category, string> = {
  Fashion:     "bg-pink-100 text-pink-700 border-pink-200",
  Beauty:      "bg-rose-100 text-rose-700 border-rose-200",
  Electronics: "bg-blue-100 text-blue-700 border-blue-200",
  Home:        "bg-amber-100 text-amber-700 border-amber-200",
};

// ── Blank product template ─────────────────────────────────────────────────────
const blank = (): Omit<Product, "id"> => ({
  name: "", price: 500, category: "Fashion", image: "", description: "", rating: 4.5, reviews: 0, active: true,
});

// ── Inline price editor ────────────────────────────────────────────────────────
function PriceEditor({
  value,
  onSave,
}: {
  value: number;
  onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const save = () => {
    const n = parseInt(draft);
    if (!isNaN(n) && n > 0) onSave(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Coins className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
        <input
          ref={inputRef}
          type="number"
          min={1}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          onBlur={save}
          className="w-20 text-sm font-bold border border-purple-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
    );
  }

  return (
    <button
      onClick={start}
      title="Click to edit coin price"
      className="flex items-center gap-1 group hover:text-purple-700 transition-colors"
    >
      <Coins className="w-3.5 h-3.5 text-yellow-500" />
      <span className="font-bold text-sm">{value.toLocaleString()}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  );
}

// ── Product Form Modal ─────────────────────────────────────────────────────────
function ProductModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Product | null;
  onClose: () => void;
  onSave: (p: Omit<Product, "id"> & { id?: string }) => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<Omit<Product, "id"> & { id?: string }>(
    initial ? { ...initial } : blank()
  );

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const valid = form.name.trim() && form.image.trim() && form.price > 0;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-600" />
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label>Product Name *</Label>
            <Input
              placeholder="e.g. Classic Silk Kurta Set"
              value={form.name}
              onChange={e => set("name", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => set("category", v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Coin Price */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-yellow-500" /> Coin Price *
            </Label>
            <Input
              type="number"
              min={1}
              placeholder="500"
              value={form.price}
              onChange={e => set("price", parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Set how many Ridhi Coins users spend to buy this product
            </p>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              <Image className="w-3.5 h-3.5" /> Image URL *
            </Label>
            <Input
              placeholder="https://images.unsplash.com/photo-…"
              value={form.image}
              onChange={e => set("image", e.target.value)}
            />
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="w-full h-36 object-cover rounded-lg border border-border mt-2"
                onError={e => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea
              rows={3}
              placeholder="Short product description…"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              className="w-full text-sm border border-input rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Rating & Reviews */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" /> Rating (1–5)
              </Label>
              <Input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={e => set("rating", parseFloat(e.target.value) || 4.5)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Reviews Count
              </Label>
              <Input
                type="number"
                min={0}
                value={form.reviews}
                onChange={e => set("reviews", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium">Visible in App</p>
              <p className="text-xs text-muted-foreground">Show this product to users in the Home feed and Shop screen</p>
            </div>
            <button
              onClick={() => set("active", !form.active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-purple-600" : "bg-muted-foreground/30"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${form.active ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}><X className="w-3.5 h-3.5 mr-1" />Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() => { onSave(form); onClose(); }}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            {isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ShopProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch]     = useState("");
  const [catFilter, setCatFilter] = useState<"All" | Category>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  const nextId = () => `prod${Date.now()}`;

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleSave = (data: Omit<Product, "id"> & { id?: string }) => {
    if (data.id) {
      setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ...data, id: p.id } : p));
      toast({ title: "Product updated", description: `"${data.name}" saved successfully.` });
    } else {
      const newProd: Product = { ...data, id: nextId() };
      setProducts(prev => [newProd, ...prev]);
      toast({ title: "Product added", description: `"${data.name}" is now live in the Shop.` });
    }
  };

  const handlePriceChange = (id: string, price: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, price } : p));
    const name = products.find(p => p.id === id)?.name ?? "";
    toast({ title: "Price updated", description: `${name} → ${price.toLocaleString()} coins` });
  };

  const handleDelete = (id: string) => {
    const name = products.find(p => p.id === id)?.name ?? "";
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
    toast({ title: "Product removed", description: `"${name}" deleted from the Shop.`, variant: "destructive" });
  };

  const handleToggleActive = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const totalCoins = products.filter(p => p.active).reduce((s, p) => s + p.price, 0);
  const avgPrice   = products.length ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-purple-600" />
            Shop Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit, and manage all products in the Ridhi Shop · prices are in Ridhi Coins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            className="gap-1 text-xs"
            onClick={() => downloadCSV("shop_products.csv", products.map(p => ({
              ID: p.id, Name: p.name, Category: p.category, "Coins (Price)": p.price,
              Rating: p.rating, Reviews: p.reviews, Active: p.active ? "Yes" : "No",
            })))}
          >
            <Download className="w-3 h-3" /> Export CSV
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Products",   value: products.length,              icon: Package,   color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20 border-violet-200" },
          { label: "Active in App",    value: products.filter(p=>p.active).length, icon: ShoppingBag, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20 border-green-200" },
          { label: "Avg Coin Price",   value: `${avgPrice.toLocaleString()} 🪙`, icon: Coins, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200" },
          { label: "Categories",       value: CATEGORIES.length,            icon: Tag,       color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className={`border ${bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg} border`}><Icon className={`w-4 h-4 ${color}`} /></div>
              <div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coin price tip */}
      <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg px-4 py-3">
        <Coins className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <span className="font-semibold">Tip:</span> To quickly update a product's coin price, click the price number directly in the table below — it becomes an editable field. Press Enter or click away to save.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["All", ...CATEGORIES] as const).map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                catFilter === c
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-background border-border text-muted-foreground hover:border-purple-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No products match your filter.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <Card
              key={product.id}
              className={`border overflow-hidden transition-all hover:shadow-md ${!product.active ? "opacity-60" : ""}`}
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-44 object-cover"
                  onError={e => { e.currentTarget.src = "https://placehold.co/400x300?text=No+Image"; }}
                />
                <div className="absolute top-2 left-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CAT_COLOR[product.category]}`}>
                    {product.category}
                  </span>
                </div>
                {!product.active && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Hidden
                  </div>
                )}
              </div>

              <CardContent className="p-3 space-y-2.5">
                {/* Name */}
                <p className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{product.rating}</span>
                  <span>· {product.reviews.toLocaleString()} reviews</span>
                </div>

                {/* Coin price — inline editable */}
                <div className="flex items-center justify-between">
                  <PriceEditor value={product.price} onSave={v => handlePriceChange(product.id, v)} />
                  <span className="text-[10px] text-muted-foreground">coins</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <button
                    onClick={() => handleToggleActive(product.id)}
                    title={product.active ? "Hide from app" : "Show in app"}
                    className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${
                      product.active
                        ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/70 border border-border"
                    }`}
                  >
                    {product.active ? "● Live" : "○ Hidden"}
                  </button>
                  <button
                    onClick={() => { setEditTarget(product); setModalOpen(true); }}
                    className="p-1.5 rounded-md hover:bg-purple-50 hover:text-purple-700 transition-colors border border-transparent hover:border-purple-200"
                    title="Edit product"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteId(product.id)}
                    className="p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-200"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <ProductModal
          open={modalOpen}
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-4 h-4" /> Remove Product?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            "{products.find(p => p.id === deleteId)?.name}" will be permanently removed from the Shop. This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
