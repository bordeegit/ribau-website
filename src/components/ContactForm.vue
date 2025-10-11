<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-btn" @click="closeModal">×</button>
      <h2>Richiesta di Contatto</h2>
      
      <form @submit.prevent="submitInquiry" name="ribau-contact" method="POST" data-netlify="true">
        <input type="hidden" name="form-name" value="ribau-contact">
        
        <div class="form-group">
          <label>Prodotto:</label>
          <input 
            type="text" 
            v-model="formData.productName" 
            readonly 
            class="readonly-input"
          >
        </div>

        <div class="form-group">
          <label>Nome: *</label>
          <input 
            type="text" 
            v-model="formData.name" 
            required 
            placeholder="Mario Rossi"
          >
        </div>

        <div class="form-group">
          <label>Email: *</label>
          <input 
            type="email" 
            v-model="formData.email" 
            required 
            placeholder="mario.rossi@esempio.com"
          >
        </div>

        <div class="form-group">
          <label>Telefono (opzionale):</label>
          <input 
            type="tel" 
            v-model="formData.phone" 
            placeholder="+39 123 456 7890"
          >
        </div>

        <div class="form-group">
          <label>Messaggio: *</label>
          <textarea 
            v-model="formData.message" 
            required 
            rows="5" 
            placeholder="Il tuo messaggio..."
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn-cancel">
            Annulla
          </button>
          <button type="submit" class="btn-submit" :disabled="submitting">
            {{ submitting ? 'Invio...' : 'Invia Richiesta' }}
          </button>
        </div>

        <p v-if="submitSuccess" class="success-message">
          ✓ La tua richiesta è stata inviata con successo!
        </p>
        <p v-if="submitError" class="error-message">
          {{ submitError }}
        </p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactForm',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
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
  watch: {
    product: {
      immediate: true,
      handler(newProduct) {
        if (newProduct) {
          this.formData.productName = `${newProduct.name} (ID: ${newProduct.id})`;
          this.formData.productId = newProduct.id;
          this.formData.message = `Ciao, sono interessato/a a ${newProduct.name}. È ancora disponibile?`;
        }
      }
    },
    isVisible(newVal) {
      if (newVal) {
        this.resetForm();
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    resetForm() {
      this.submitSuccess = false;
      this.submitError = null;
      this.submitting = false;
      // Keep product info, reset user fields
      this.formData.name = '';
      this.formData.email = '';
      this.formData.phone = '';
      if (this.product) {
        this.formData.message = `Ciao, sono interessato/a a ${this.product.name}. È ancora disponibile?`;
      }
    },
    async submitInquiry() {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = false;

      try {
        const formData = new FormData();
        formData.append('form-name', 'ribau-contact');
        formData.append('productName', this.formData.productName);
        formData.append('productId', this.formData.productId);
        formData.append('name', this.formData.name);
        formData.append('email', this.formData.email);
        formData.append('phone', this.formData.phone);
        formData.append('message', this.formData.message);

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
  box-sizing: border-box;
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
