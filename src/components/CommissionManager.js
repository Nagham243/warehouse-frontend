
class CommissionManager {
    constructor() {
        this.baseURL = 'https://warehouse-frontend-production.up.railway.app/api';
    }

    /**
     * Get cookie value by name
     */
    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    /**
     * Get request headers with CSRF token
     */
    getHeaders() {
        const csrfToken = this.getCookie('csrftoken');
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        return headers;
    }

    /**
     * Update commission
     */
    async updateCommission(commissionId, data) {
        try {
            const response = await fetch(`${this.baseURL}/commissions/${commissionId}/`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating commission:', error);
            throw error;
        }
    }

    /**
     * Handle form submission
     */
    async handleCommissionUpdate(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const commissionId = form.dataset.commissionId;
        
        const data = {
            percentage: parseFloat(formData.get('percentage')),
            // Add other fields as needed
        };

        try {
            const result = await this.updateCommission(commissionId, data);
            console.log('Commission updated successfully:', result);
            
            // Handle success (close modal, refresh data, etc.)
            this.handleUpdateSuccess(result);
            
        } catch (error) {
            console.error('Failed to update commission:', error);
            this.handleUpdateError(error);
        }
    }

    handleUpdateSuccess(result) {
        // Close modal
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Show success message
        alert('Commission updated successfully!');
        
        // Refresh the page or update the UI
        window.location.reload();
    }

    handleUpdateError(error) {
        // Show error message
        const errorDiv = document.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = `Error: ${error.message}`;
            errorDiv.style.display = 'block';
        } else {
            alert(`Error updating commission: ${error.message}`);
        }
    }
}

// Initialize the commission manager
const commissionManager = new CommissionManager();

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Find all commission forms and add event listeners
    const forms = document.querySelectorAll('form[data-commission-id]');
    forms.forEach(form => {
        form.addEventListener('submit', (event) => {
            commissionManager.handleCommissionUpdate(event);
        });
    });
});
