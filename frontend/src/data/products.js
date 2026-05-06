export const PRODUCTS = [
  // Electronics
  {
    id: 1, category: "Electronics",
    name: "ProSound X3 Headphones", price: 24999, originalPrice: 33199,
    rating: 4.8, reviews: 3241, emoji: "🎧",
    gradient: "linear-gradient(135deg,#1a1a2e,#16213e)",
    badge: "Best Seller",
    description: "Active noise cancellation, 40-hour battery, premium Hi-Res audio. Compatible with all devices via Bluetooth 5.3 or USB-C.",
    features: ["40h battery", "ANC", "Hi-Res Audio", "Foldable"],
  },
  {
    id: 2, category: "Electronics",
    name: "NovaSmart Watch Pro", price: 37299, originalPrice: 45599,
    rating: 4.6, reviews: 1892, emoji: "⌚",
    gradient: "linear-gradient(135deg,#0f3460,#533483)",
    badge: "New",
    description: "Health tracking with ECG, SpO2, GPS, 7-day battery. AMOLED display with always-on mode.",
    features: ["ECG Monitor", "GPS", "7-day battery", "Waterproof IP68"],
  },
  {
    id: 3, category: "Electronics",
    name: "GameForce Laptop 15", price: 107999, originalPrice: 132999,
    rating: 4.7, reviews: 876, emoji: "💻",
    gradient: "linear-gradient(135deg,#0d1117,#21262d)",
    badge: "Top Pick",
    description: "RTX 4060, AMD Ryzen 9, 32GB DDR5, 1TB NVMe SSD. 144Hz QHD display for ultimate gaming & work performance.",
    features: ["RTX 4060", "32GB RAM", "144Hz QHD", "1TB SSD"],
  },
  {
    id: 4, category: "Electronics",
    name: "BassWave Speaker", price: 12399, originalPrice: 16599,
    rating: 4.5, reviews: 2107, emoji: "🔊",
    gradient: "linear-gradient(135deg,#134e5e,#71b280)",
    badge: null,
    description: "360 degree surround sound, IPX7 waterproof, 24-hour playtime. Perfect for outdoor adventures.",
    features: ["360 Sound", "IPX7", "24h battery", "Built-in mic"],
  },

  // Fashion
  {
    id: 5, category: "Fashion",
    name: "AeroRun Pro Sneakers", price: 15699, originalPrice: 20699,
    rating: 4.9, reviews: 5632, emoji: "👟",
    gradient: "linear-gradient(135deg,#f7797d,#fbd3e9)",
    badge: "Trending",
    description: "Ultra-lightweight foam sole, breathable mesh upper, responsive cushioning. Available in 8 colours.",
    features: ["Lightweight", "Breathable", "Responsive sole", "Vegan"],
  },
  {
    id: 6, category: "Fashion",
    name: "Urban Leather Jacket", price: 28999, originalPrice: 41499,
    rating: 4.7, reviews: 1203, emoji: "🧥",
    gradient: "linear-gradient(135deg,#373b44,#4286f4)",
    badge: null,
    description: "Full-grain genuine leather, YKK zippers, quilted inner lining. Classic moto style meets modern cut.",
    features: ["Genuine Leather", "YKK Zippers", "Inner lining", "S-XXL"],
  },
  {
    id: 7, category: "Fashion",
    name: "Street Cap Classic", price: 4099, originalPrice: 5399,
    rating: 4.4, reviews: 892, emoji: "🧢",
    gradient: "linear-gradient(135deg,#11998e,#38ef7d)",
    badge: "Sale",
    description: "Structured 6-panel cap with embroidered logo, adjustable snapback, UV-protective fabric.",
    features: ["UV Protection", "Adjustable", "Embroidered", "One size"],
  },
  {
    id: 8, category: "Fashion",
    name: "Slim Fit Denim Jeans", price: 10699, originalPrice: 13999,
    rating: 4.6, reviews: 3401, emoji: "👖",
    gradient: "linear-gradient(135deg,#2980b9,#6dd5fa)",
    badge: null,
    description: "Premium Japanese selvedge denim, slim tapered fit, reinforced stress points. Improves with every wash.",
    features: ["Selvedge Denim", "Slim Taper", "Reinforced", "28-40W"],
  },

  // Books
  {
    id: 9, category: "Books",
    name: "Machine Learning with Python", price: 4899, originalPrice: 6599,
    rating: 4.9, reviews: 7841, emoji: "📘",
    gradient: "linear-gradient(135deg,#4776e6,#8e54e9)",
    badge: "Best Seller",
    description: "Comprehensive 750-page guide covering neural networks, ANFIS, fuzzy logic, scikit-learn and TensorFlow with real projects.",
    features: ["750 pages", "Code examples", "Projects", "TensorFlow"],
  },
  {
    id: 10, category: "Books",
    name: "Data Science Handbook", price: 4099, originalPrice: 5729,
    rating: 4.7, reviews: 4312, emoji: "📗",
    gradient: "linear-gradient(135deg,#11998e,#38ef7d)",
    badge: null,
    description: "From data wrangling to deployment. Covers Pandas, NumPy, visualization, and statistical modelling.",
    features: ["500 pages", "Pandas/NumPy", "Visualization", "Projects"],
  },
  {
    id: 11, category: "Books",
    name: "Deep Learning Fundamentals", price: 5399, originalPrice: 7399,
    rating: 4.8, reviews: 3198, emoji: "📙",
    gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
    badge: "New Edition",
    description: "CNNs, RNNs, Transformers, and Diffusion Models explained from first principles with PyTorch implementations.",
    features: ["600 pages", "PyTorch", "Transformers", "Projects"],
  },
  {
    id: 12, category: "Books",
    name: "AI Ethics & Society", price: 3239, originalPrice: 4549,
    rating: 4.6, reviews: 1087, emoji: "📕",
    gradient: "linear-gradient(135deg,#c94b4b,#4b134f)",
    badge: null,
    description: "Explores bias, fairness, explainability, and governance in AI systems. Essential for every AI practitioner.",
    features: ["380 pages", "Case studies", "Policy", "References"],
  },

  // Home
  {
    id: 13, category: "Home",
    name: "ErgoLux Office Chair", price: 49999, originalPrice: 66299,
    rating: 4.8, reviews: 2341, emoji: "🪑",
    gradient: "linear-gradient(135deg,#4e54c8,#8f94fb)",
    badge: "Premium",
    description: "Lumbar support, breathable mesh back, adjustable armrests and headrest. 5-year warranty.",
    features: ["Lumbar support", "Mesh back", "Adjustable", "5yr warranty"],
  },
  {
    id: 14, category: "Home",
    name: "BrewMaster Pro Coffee Maker", price: 20699, originalPrice: 27299,
    rating: 4.7, reviews: 1893, emoji: "☕",
    gradient: "linear-gradient(135deg,#3c1518,#69140e)",
    badge: null,
    description: "12-cup capacity, built-in grinder, programmable 24h timer, thermal carafe keeps coffee hot for 4 hours.",
    features: ["12-cup", "Built-in grinder", "24h timer", "Thermal carafe"],
  },
  {
    id: 15, category: "Home",
    name: "LumiDesk Smart Lamp", price: 7399, originalPrice: 9899,
    rating: 4.5, reviews: 1421, emoji: "💡",
    gradient: "linear-gradient(135deg,#f6d365,#fda085)",
    badge: null,
    description: "16M colour modes, wireless phone charging base, touch dimmer, USB-A output. Smart home compatible.",
    features: ["16M colours", "Wireless charging", "Touch control", "Smart home"],
  },
  {
    id: 16, category: "Home",
    name: "FocusPod Noise Machine", price: 6599, originalPrice: 8199,
    rating: 4.6, reviews: 987, emoji: "🌿",
    gradient: "linear-gradient(135deg,#0f9b58,#00bf8f)",
    badge: "Sale",
    description: "30 nature sounds, white/pink/brown noise, sleep timer, night light. Perfect for work-from-home focus.",
    features: ["30 sounds", "Sleep timer", "Night light", "USB-C"],
  },
];

export const CATEGORIES = ["All", "Electronics", "Fashion", "Books", "Home"];

// Indian Rupee formatter — use this everywhere instead of $
export const formatINR = (amount) =>
  "₹" + amount.toLocaleString("en-IN");
