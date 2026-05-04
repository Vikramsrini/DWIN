/**
 * Main App Controller
 * Handles state management, event binding, modals, and data refresh
 */
const App = {
    state: {
        currentUserId: null,
        users: [],
        twinStatus: null,
        activities: []
    },

    typeIcons: {
        calories: '🔥',
        sleep: '😴',
        hygiene: '🧼',
        exercise: '💪'
    },

    // Progress ring max values for calculating fill percentage
    maxValues: {
        calories: 2500,
        sleep: 9,
        hygiene: 10,
        exercise: 120
    },

    async init() {
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        if (!userId || !userName) {
            window.location.href = '/login.html';
            return;
        }

        this.state.currentUserId = parseInt(userId, 10);
        document.getElementById('loggedInUserName').textContent = userName;

        // Set today's date in the header
        const dateDisplay = document.getElementById('dateDisplay');
        if (dateDisplay) {
            dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }

        // Initialize charts
        Charts.init();

        // Set default date in form
        const actDate = document.getElementById('actDate');
        if (actDate) {
            actDate.value = new Date().toISOString().split('T')[0];
        }

        // Bind events
        this.bindEvents();

        // Initial fetch
        await this.refreshData();
    },

    bindEvents() {
        // Logout
        document.getElementById('btnLogout')?.addEventListener('click', () => {
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            window.location.href = '/login.html';
        });

        // FAB
        document.getElementById('fabAdd')?.addEventListener('click', () => {
            this.openModal();
        });

        // Modal close
        document.getElementById('modalClose')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Escape key closes modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // Type selector in form
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('actUnit').textContent = btn.dataset.unit;
            });
        });

        // Form submit
        document.getElementById('activityForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
    },

    async refreshData() {
        const userId = this.state.currentUserId;
        if (!userId) return;

        try {
            const today = new Date().toISOString().split('T')[0];

            // Fetch twin status and activities in parallel
            const [twinStatus, activities] = await Promise.all([
                API.getTwinStatus(userId, today),
                API.getActivities(userId)
            ]);

            this.state.twinStatus = twinStatus;
            this.state.activities = activities;

            // Update all UI sections
            this.updateActivityCards(twinStatus.status);
            Twin.update(twinStatus);
            Charts.update(twinStatus.weeklyTrends);
            this.updateHistory(activities);

        } catch (err) {
            this.showToast('Failed to load data', 'error');
            console.error(err);
        }
    },

    updateActivityCards(status) {
        if (!status) return;

        for (const type of ['calories', 'sleep', 'hygiene', 'exercise']) {
            const data = status[type];
            if (!data) continue;

            // Update value
            const valEl = document.getElementById(`val${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (valEl) {
                this.animateNumber(valEl, data.total);
            }

            // Update rating badge
            const ratingEl = document.getElementById(`rating${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (ratingEl) {
                ratingEl.textContent = data.rating === 'no-data' ? 'No Data' : data.rating;
                ratingEl.className = `card-rating ${data.rating}`;
            }

            // Update progress ring
            const ringEl = document.getElementById(`ring${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (ringEl) {
                const circumference = 2 * Math.PI * 52; // r=52
                const pct = Math.min(data.total / this.maxValues[type], 1);
                const offset = circumference * (1 - pct);
                ringEl.style.strokeDasharray = circumference;
                ringEl.style.strokeDashoffset = offset;
            }
        }
    },

    animateNumber(el, target) {
        const start = parseFloat(el.textContent) || 0;
        const duration = 800;
        const startTime = performance.now();
        const isFloat = target % 1 !== 0;

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = start + (target - start) * eased;

            el.textContent = isFloat ? current.toFixed(1) : Math.round(current);

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    },

    updateHistory(activities) {
        const container = document.getElementById('historyList');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="history-placeholder">No activities logged yet. Hit the + button to start!</div>';
            return;
        }

        // Show most recent 20
        const recent = activities.slice(0, 20);
        container.innerHTML = recent.map(a => `
      <div class="history-item" data-id="${a.id}">
        <span class="history-icon">${this.typeIcons[a.type] || '📋'}</span>
        <div class="history-details">
          <div class="history-type">${a.type}</div>
          ${a.notes ? `<div class="history-notes">${this.escapeHtml(a.notes)}</div>` : ''}
        </div>
        <div class="history-meta">
          <div class="history-value">${a.value} ${a.unit}</div>
          <div class="history-date">${this.formatDate(a.date)}</div>
        </div>
        <div class="history-actions">
          <button class="btn-edit" onclick="App.editActivity(${a.id})" title="Edit">✏️</button>
          <button class="btn-delete" onclick="App.deleteActivity(${a.id})" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
    },

    openModal(activity = null) {
        const overlay = document.getElementById('modalOverlay');
        const form = document.getElementById('activityForm');
        const title = document.getElementById('modalTitle');
        const editId = document.getElementById('editActivityId');
        const submitBtn = document.getElementById('btnSubmit');
        const submitText = submitBtn?.querySelector('.btn-text');

        if (activity) {
            // Edit mode
            title.textContent = 'Edit Activity';
            editId.value = activity.id;
            submitText.textContent = 'Update Activity';

            // Set form values
            document.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.type === activity.type);
                if (btn.dataset.type === activity.type) {
                    document.getElementById('actUnit').textContent = btn.dataset.unit;
                }
            });

            document.getElementById('actValue').value = activity.value;
            document.getElementById('actDate').value = activity.date;
            document.getElementById('actNotes').value = activity.notes || '';
        } else {
            // Create mode
            title.textContent = 'Log Activity';
            editId.value = '';
            submitText.textContent = 'Log Activity';
            form.reset();

            // Reset type selector
            document.querySelectorAll('.type-btn').forEach((btn, i) => {
                btn.classList.toggle('active', i === 0);
            });
            document.getElementById('actUnit').textContent = 'kcal';
            document.getElementById('actDate').value = new Date().toISOString().split('T')[0];
        }

        overlay.classList.add('active');
    },

    closeModal() {
        document.getElementById('modalOverlay')?.classList.remove('active');
    },

    async handleFormSubmit() {
        const userId = this.state.currentUserId;
        if (!userId) return;

        const editId = document.getElementById('editActivityId').value;
        const activeType = document.querySelector('.type-btn.active');
        const type = activeType?.dataset.type;
        const unit = activeType?.dataset.unit;
        const value = parseFloat(document.getElementById('actValue').value);
        const date = document.getElementById('actDate').value;
        const notes = document.getElementById('actNotes').value;

        if (!type || !unit || isNaN(value) || !date) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const submitBtn = document.getElementById('btnSubmit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Show loading state
        submitBtn.disabled = true;
        btnText.hidden = true;
        btnLoader.hidden = false;

        try {
            if (editId) {
                await API.updateActivity(userId, editId, { type, value, unit, date, notes });
                this.showToast('Activity updated! ✅', 'success');
            } else {
                await API.createActivity(userId, { type, value, unit, date, notes });
                this.showToast('Activity logged! 🎉', 'success');
            }

            this.closeModal();
            await this.refreshData();
        } catch (err) {
            this.showToast(err.message || 'Failed to save activity', 'error');
        } finally {
            submitBtn.disabled = false;
            btnText.hidden = false;
            btnLoader.hidden = true;
        }
    },

    async editActivity(id) {
        const activity = this.state.activities.find(a => a.id === id);
        if (activity) {
            this.openModal(activity);
        }
    },

    async deleteActivity(id) {
        if (!confirm('Delete this activity?')) return;

        try {
            await API.deleteActivity(this.state.currentUserId, id);
            this.showToast('Activity deleted', 'info');
            await this.refreshData();
        } catch (err) {
            this.showToast('Failed to delete activity', 'error');
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diff = (today - date) / (1000 * 60 * 60 * 24);
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
