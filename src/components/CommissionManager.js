// components/CommissionManager.js

class CommissionManager {
    constructor() {
        this.baseURL = 'https://warehouse-frontend-production.up.railway.app/api';
    }

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

    async handleCommissionUpdate(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const commissionId = form.dataset.commissionId;
        
        const data = {
            percentage: parseFloat(formData.get('percentage')),
        };

        try {
            const result = await this.updateCommission(commissionId, data);
            console.log('Commission updated successfully:', result);
            this.handleUpdateSuccess(result);
        } catch (error) {
            console.error('Failed to update commission:', error);
            this.handleUpdateError(error);
        }
    }

    handleUpdateSuccess(result) {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
        alert('Commission updated successfully!');
        window.location.reload();
    }

    handleUpdateError(error) {
        const errorDiv = document.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = `Error: ${error.message}`;
            errorDiv.style.display = 'block';
        } else {
            alert(`Error updating commission: ${error.message}`);
        }
    }
}

// ES6 Export
export default CommissionManager;

// Or named export
// export { CommissionManager };
