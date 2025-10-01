<template>
  <div class="catalog">
    <header class="header">
      <h1>🐾 Mercatino RiBau 🐾</h1>
      <p>Supporta i nostri amici a 4 zampe del canile di Varese!</p>
    </header>

    <!-- Category Filter -->
    <div class="filters">
      <button 
        v-for="cat in categories" 
        :key="cat"
        :class="['filter-btn', { active: selectedCategory === cat }]"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Products Grid -->
    <div v-if="loading" class="loading">Loading products...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="products-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-card"
      >
        <div class="image-container">
          <img 
            :src="product.image1 || '/lobo_fallback.jpeg'" 
            :alt="product.name"
            @error="handleImageError"
          >
          <span v-if="product.featured" class="badge">⭐ Featured</span>
          <span v-if="!product.inStock" class="badge out-of-stock">Out of Stock</span>
        </div>
        
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="category">{{ product.category }}</p>
          <p class="description">{{ product.description }}</p>
          <div class="product-footer">
            <span class="price">${{ product.price }}</span>
            <button 
              class="contact-btn"
              :disabled="!product.inStock"
              @click="contactAboutProduct(product)"
            >
              {{ product.inStock ? 'Inquire' : 'Unavailable' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredProducts.length === 0 && !loading" class="no-products">
      No products found in this category.
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';

export default {
  name: 'ProductCatalog',
  data() {
    return {
      products: [],
      selectedCategory: 'All',
      loading: true,
      error: null
    };
  },
  computed: {
    categories() {
      const cats = ['All', ...new Set(this.products.map(p => p.category))];
      return cats.filter(Boolean);
    },
    filteredProducts() {
      if (this.selectedCategory === 'All') {
        return this.products;
      }
      return this.products.filter(p => p.category === this.selectedCategory);
    }
  },
  mounted() {
    this.loadProducts();
  },
  methods: {
    async loadProducts() {
      try {
        const response = await fetch('/data/products.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            this.products = results.data.map(row => ({
              id: row.id,
              name: row.name,
              description: row.description,
              category: row.category,
              price: parseFloat(row.price) || 0,
              image1: row.image1,
              image2: row.image2,
              inStock: row.inStock === 'true' || row.inStock === 'TRUE',
              featured: row.featured === 'true' || row.featured === 'TRUE'
            }));
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Failed to load products: ' + error.message;
            this.loading = false;
          }
        });
      } catch (err) {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
      }
    },
    handleImageError(event) {
      event.target.src = '/lobo_fallback.jpeg';
    },
    contactAboutProduct(product) {
      // Customize this - could open email, WhatsApp, contact form, etc.
      const subject = encodeURIComponent(`Inquiry about ${product.name}`);
      const body = encodeURIComponent(`Hi, I'm interested in the ${product.name} (${product.id}). Is it still available?`);
      window.location.href = `mailto:shelter@example.com?subject=${subject}&body=${body}`;
    }
  }
};
</script>

<style scoped>
.catalog {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 30px;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #ecf0f1;
}

.filter-btn.active {
  background: #3498db;
  color: white;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.image-container {
  position: relative;
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: #f8f9fa;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f39c12;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: bold;
}

.badge.out-of-stock {
  background: #e74c3c;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.category {
  color: #3498db;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.description {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 15px;
  min-height: 60px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.5rem;
  color: #27ae60;
  font-weight: bold;
}

.contact-btn {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.contact-btn:hover:not(:disabled) {
  background: #2980b9;
}

.contact-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.loading, .error, .no-products {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.error {
  color: #e74c3c;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}
</style>