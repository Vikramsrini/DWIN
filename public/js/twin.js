/**
 * Digital Twin Avatar Renderer
 * Updates the twin visualization based on health status
 */
const Twin = {
    healthColors: {
        good: '#22c55e',
        moderate: '#f59e0b',
        poor: '#ef4444',
        'no-data': '#64748b'
    },

    update(twinData) {
        if (!twinData) return;

        // Update name
        const nameEl = document.getElementById('twinName');
        if (nameEl && twinData.user) {
            nameEl.textContent = twinData.user.name;
        }

        // Update health badge
        const badge = document.getElementById('twinHealthBadge');
        const badgeDot = badge?.querySelector('.badge-dot');
        const badgeText = badge?.querySelector('.badge-text');
        const health = twinData.overallHealth || 'no-data';
        const color = this.healthColors[health] || this.healthColors['no-data'];

        if (badgeDot) {
            badgeDot.style.background = color;
        }
        if (badgeText) {
            badgeText.textContent = health === 'no-data' ? 'No Data' : health;
            badgeText.style.color = color;
        }
        if (badge) {
            badge.style.background = `${color}15`;
            badge.style.borderColor = `${color}30`;
        }

        // Update aura
        const aura = document.getElementById('twinAura');
        if (aura) {
            aura.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        }

        // Update avatar expression
        const mouth = document.getElementById('avatarMouth');
        if (mouth) {
            mouth.className = 'avatar-mouth';
            if (health === 'poor') mouth.classList.add('sad');
            else if (health === 'moderate') mouth.classList.add('neutral');
        }

        // Update heartbeat line
        this.updateHeartbeat(health);

        // Update summary
        this.updateSummary(twinData);
    },

    updateHeartbeat(health) {
        const path = document.getElementById('heartbeatPath');
        if (!path) return;

        const color = this.healthColors[health] || this.healthColors['no-data'];
        path.setAttribute('stroke', color);

        // Generate heartbeat pattern
        let points = '';
        const segments = 40;
        const width = 200;
        const mid = 25;

        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * width;
            let y = mid;

            // Create heartbeat spikes at specific points
            const pos = i / segments;
            if (health !== 'no-data') {
                if (pos > 0.2 && pos < 0.25) y = mid - 15;
                else if (pos > 0.25 && pos < 0.3) y = mid + 20;
                else if (pos > 0.3 && pos < 0.35) y = mid - 10;
                else if (pos > 0.6 && pos < 0.65) y = mid - 15;
                else if (pos > 0.65 && pos < 0.7) y = mid + 20;
                else if (pos > 0.7 && pos < 0.75) y = mid - 10;
            }

            points += `${x},${y} `;
        }

        path.setAttribute('points', points.trim());
    },

    updateSummary(twinData) {
        const el = document.getElementById('twinSummary');
        if (!el) return;

        const status = twinData.status;
        if (!status) {
            el.textContent = 'No health data available for today. Start logging activities!';
            return;
        }

        const parts = [];
        if (status.calories?.total > 0) parts.push(`${status.calories.total} kcal consumed`);
        if (status.sleep?.total > 0) parts.push(`${status.sleep.total}h of sleep`);
        if (status.exercise?.total > 0) parts.push(`${status.exercise.total} min of exercise`);
        if (status.hygiene?.total > 0) parts.push(`hygiene score: ${status.hygiene.total}/10`);

        if (parts.length === 0) {
            el.textContent = 'No health data available for today. Start logging activities!';
        } else {
            el.textContent = `Today: ${parts.join(' · ')}`;
        }
    }
};
