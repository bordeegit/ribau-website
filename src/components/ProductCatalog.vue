<template>
  <div class="catalog">
    <header class="header">
      <h1>🐾 RiBau </h1>
      <p>Supporta i nostri amici a quattro zampe del Canile di Varese!</p>
    </header>

    <!-- Contact Form Popup -->
    <div v-if="showContactForm" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>
        <h2>Richiesta di Contatto</h2>
        <form @submit.prevent="submitInquiry" name="ribau-contact" method="POST" data-netlify="true">
          <input type="hidden" name="form-name" value="ribau-contact">
          
          <div class="form-group">
            <label>Prodotto:</label>
            <input type="text" v-model="formData.productName" readonly class="readonly-input">
          </div>

          <div class="form-group">
            <label>Nome: *</label>
            <input type="text" v-model="formData.name" required placeholder="Ri Bau">
          </div>

          <div class="form-group">
            <label>Email: *</label>
            <input type="email" v-model="formData.email" required placeholder="ribau@esempio.com">
          </div>

          <div class="form-group">
            <label>Telefono (opzionale):</label>
            <input type="tel" v-model="formData.phone" placeholder="+39 123 456 7890">
          </div>

          <div class="form-group">
            <label>Messaggio: *</label>
            <textarea v-model="formData.message" required rows="5" placeholder="Il tuo messaggio..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Cancella</button>
            <button type="submit" class="btn-submit" :disabled="submitting">
              {{ submitting ? 'Invio...' : 'Richiesta Inviata!' }}
            </button>
          </div>

          <p v-if="submitSuccess" class="success-message">✓ La tua richiesta è stata inviata con successo!</p>
          <p v-if="submitError" class="error-message">{{ submitError }}</p>
        </form>
      </div>
    </div>

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
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-card"
      >
        <div class="image-container">
          <img 
            :src="product.image1 || '/images/lobo_fallback.jpeg'" 
            :alt="product.name"
            @error="handleImageError"
          >
          <span v-if="product.featured" class="badge">⭐ Featured</span>
          <span v-if="!product.inStock" class="badge out-of-stock">Sold Out</span>
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
      Nessun prodotto presente in questa categoria.
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCatalog',
  data() {
    return {
      products: [],
      selectedCategory: 'All',
      loading: true,
      error: null,
      showContactForm: false,
      selectedProduct: null,
      formData: {
        productName: '',
        productId: '',
        name: '',
        email: '',
        phone: '',
        message: ''
      },
      submitting: false,
      submitSuccess: false,
      submitError: null
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
    parseCSV(text) {
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
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
        const csvText = await response.text();
        const rows = this.parseCSV(csvText);
        
        this.products = rows.map(row => ({
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
      } catch (err) {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
        console.error(err);
      }
    },
    handleImageError(event) {
      event.target.src = '/images/lobo_fallback.jpeg';
    },
    contactAboutProduct(product) {
      this.selectedProduct = product;
      this.formData = {
        productName: `${product.name} (${product.id})`,
        productId: product.id,
        name: '',
        email: '',
        phone: '',
        message: `Ciao, Sono interessato/a a ${product.name}. È ancora disponibile?`
      };
      this.showContactForm = true;
      this.submitSuccess = false;
      this.submitError = null;
    },
    closeModal() {
      this.showContactForm = false;
      this.selectedProduct = null;
    },
    async submitInquiry() {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = false;

      try {
        const formElement = document.querySelector('form[name="ribau-contact"]');
        const formData = new FormData(formElement);
        
        // Add all form fields to FormData
        formData.set('productName', this.formData.productName);
        formData.set('productId', this.formData.productId);
        formData.set('name', this.formData.name);
        formData.set('email', this.formData.email);
        formData.set('phone', this.formData.phone);
        formData.set('message', this.formData.message);

        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString()
        });

        if (response.ok) {
          this.submitSuccess = true;
          setTimeout(() => {
            this.closeModal();
          }, 2000);
        } else {
          throw new Error('Errore invio richiesta');
        }
      } catch (error) {
        this.submitError = 'Errore nell\'invio della richiesta. Riprova o contattaci direttamente.';
        console.error('Form submission error:', error);
      } finally {
        this.submitting = false;
      }
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

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #7f8c8d;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-content h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.readonly-input {
  background: #f8f9fa;
  color: #7f8c8d;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-cancel {
  background: #ecf0f1;
  color: #7f8c8d;
}

.btn-cancel:hover {
  background: #d5dbdb;
}

.btn-submit {
  background: #3498db;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2980b9;
}

.btn-submit:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.success-message {
  margin-top: 15px;
  padding: 10px;
  background: #d4edda;
  color: #155724;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
}
</style>