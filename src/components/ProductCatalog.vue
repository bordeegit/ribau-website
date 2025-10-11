<template>
  <div class="catalog">
    <header class="header">
      <h1>🐾 RiBau</h1>
      <p>Supporta i nostri amici a quattro zampe del Canile di Varese!</p>
    </header>

    <!-- Contact Form Modal -->
    <ContactForm 
      :is-visible="showContactForm"
      :product="selectedProduct"
      @close="closeContactForm"
    />

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
    <div v-if="loading" class="loading">Caricamento prodotti...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="products-grid">
      <ProductCard 
        v-for="product in filteredProducts" 
        :key="product.id"
        :product="product"
        @contact="openContactForm"
      />
    </div>

    <div v-if="filteredProducts.length === 0 && !loading" class="no-products">
      Nessun prodotto presente in questa categoria.
    </div>
  </div>
</template>

<script>
import ProductCard from './ProductCard.vue';
import ContactForm from './ContactForm.vue';

export default {
  name: 'ProductCatalog',
  components: {
    ProductCard,
    ContactForm
  },
  data() {
    return {
      products: [],
      selectedCategory: 'Tutti',
      loading: true,
      error: null,
      showContactForm: false,
      selectedProduct: null
    };
  },
  computed: {
    categories() {
      const cats = ['Tutti', ...new Set(this.products.map(p => p.category))];
      return cats.filter(Boolean);
    },
    filteredProducts() {
      if (this.selectedCategory === 'Tutti') {
        return this.products;
      }
      return this.products.filter(p => p.category === this.selectedCategory);
    }
  },
  mounted() {
    this.loadProducts();
  },
  methods: {
    parseCSV(text) {
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length === 0) return [];
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      return lines.slice(1).map(line => {
        // Handle CSV with quoted values
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });
    },
    
    async loadProducts() {
      try {
        const response = await fetch('/data/products.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const csvText = await response.text();
        const rows = this.parseCSV(csvText);
        
        this.products = rows
          .filter(row => row.id) // Only include rows with IDs
          .map(row => ({
            id: row.id,
            name: row.nome || 'Prodotto Senza Nome',
            description: row.descrizione || '',
            category: row.categoria || 'Altro',
            price: parseFloat(row.prezzo) || 0,
            inStock: row.disponibile === 'true' || row.disponibile === 'TRUE' || row.disponibile === '1',
            featured: row.primoPiano === 'true' || row.primoPiano === 'TRUE' || row.primoPiano === '1'
          }));
        
        this.loading = false;
      } catch (err) {
        this.error = 'Impossibile caricare i prodotti. Riprova più tardi.';
        this.loading = false;
        console.error('Error loading products:', err);
      }
    },
    
    openContactForm(product) {
      this.selectedProduct = product;
      this.showContactForm = true;
    },
    
    closeContactForm() {
      this.showContactForm = false;
      this.selectedProduct = null;
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
