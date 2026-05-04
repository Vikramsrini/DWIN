/**
 * Chart.js Visualizations — 7-day trend line charts
 */
const Charts = {
    instances: {},

    colors: {
        calories: { line: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
        sleep: { line: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)' },
        hygiene: { line: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
        exercise: { line: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)' }
    },

    units: {
        calories: 'kcal',
        sleep: 'hours',
        hygiene: 'score',
        exercise: 'minutes'
    },

    baseOptions: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: {
                    color: '#64748b',
                    font: { family: 'Inter', size: 11 }
                }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: {
                    color: '#64748b',
                    font: { family: 'Inter', size: 11 }
                },
                beginAtZero: true
            }
        }
    },

    init() {
        for (const type of ['calories', 'sleep', 'hygiene', 'exercise']) {
            const canvas = document.getElementById(`chart${type.charAt(0).toUpperCase() + type.slice(1)}`);
            if (!canvas) continue;

            const ctx = canvas.getContext('2d');
            const color = this.colors[type];

            this.instances[type] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: type.charAt(0).toUpperCase() + type.slice(1),
                        data: [],
                        borderColor: color.line,
                        backgroundColor: color.bg,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: color.line,
                        pointBorderColor: 'rgba(17, 24, 39, 0.8)',
                        pointBorderWidth: 2,
                        borderWidth: 2
                    }]
                },
                options: {
                    ...this.baseOptions,
                    scales: {
                        ...this.baseOptions.scales,
                        y: {
                            ...this.baseOptions.scales.y,
                            ticks: {
                                ...this.baseOptions.scales.y.ticks,
                                callback: (val) => `${val} ${this.units[type]}`
                            }
                        }
                    }
                }
            });
        }
    },

    update(weeklyTrends) {
        if (!weeklyTrends || weeklyTrends.length === 0) {
            // Clear all charts
            for (const type of Object.keys(this.instances)) {
                this.instances[type].data.labels = [];
                this.instances[type].data.datasets[0].data = [];
                this.instances[type].update();
            }
            return;
        }

        // Group by type
        const grouped = {};
        const allDates = new Set();

        for (const entry of weeklyTrends) {
            if (!grouped[entry.type]) grouped[entry.type] = {};
            grouped[entry.type][entry.date] = entry.total;
            allDates.add(entry.date);
        }

        const sortedDates = [...allDates].sort();
        const labels = sortedDates.map(d => {
            const date = new Date(d + 'T00:00:00');
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        });

        for (const type of Object.keys(this.instances)) {
            const chart = this.instances[type];
            const typeData = grouped[type] || {};
            const data = sortedDates.map(d => typeData[d] || 0);

            chart.data.labels = labels;
            chart.data.datasets[0].data = data;
            chart.update('none');
        }
    }
};
