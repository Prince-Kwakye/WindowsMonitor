// Initialize charts
let cpuChart, memoryChart, diskChart, networkChart;
let cpuData = [], memoryData = [], diskData = [], uploadData = [], downloadData = [];
const maxDataPoints = 20;
let lastNetworkStats = { upload: 0, download: 0, timestamp: Date.now() };

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

themeToggle.addEventListener('click', function () {
    if (html.getAttribute('data-bs-theme') === 'light') {
        html.setAttribute('data-bs-theme', 'dark');
        themeToggle.classList.remove('fa-sun');
        themeToggle.classList.add('fa-moon');
    } else {
        html.setAttribute('data-bs-theme', 'light');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    }
});

// Initialize charts
function initializeCharts() {
    // CPU Chart
    cpuChart = new Chart(
        document.getElementById('cpuChart'),
        {
            type: 'line',
            data: {
                labels: Array(maxDataPoints).fill(''),
                datasets: [{
                    label: 'CPU Usage %',
                    data: cpuData,
                    borderColor: 'rgba(0, 120, 215, 1)',
                    backgroundColor: 'rgba(0, 120, 215, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: 'var(--dark-color)' }
                    },
                    x: { display: false }
                },
                animation: { duration: 0 }
            }
        }
    );

    // Memory Chart
    memoryChart = new Chart(
        document.getElementById('memoryChart'),
        {
            type: 'line',
            data: {
                labels: Array(maxDataPoints).fill(''),
                datasets: [{
                    label: 'Memory Usage %',
                    data: memoryData,
                    borderColor: 'rgba(23, 162, 184, 1)',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: 'var(--dark-color)' }
                    },
                    x: { display: false }
                },
                animation: { duration: 0 }
            }
        }
    );

    // Disk Chart
    diskChart = new Chart(
        document.getElementById('diskChart'),
        {
            type: 'line',
            data: {
                labels: Array(maxDataPoints).fill(''),
                datasets: [{
                    label: 'Disk Usage %',
                    data: diskData,
                    borderColor: 'rgba(255, 193, 7, 1)',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: 'var(--dark-color)' }
                    },
                    x: { display: false }
                },
                animation: { duration: 0 }
            }
        }
    );

    // Network Chart
    networkChart = new Chart(
        document.getElementById('networkChart'),
        {
            type: 'line',
            data: {
                labels: Array(maxDataPoints).fill(''),
                datasets: [
                    {
                        label: 'Upload (Mbps)',
                        data: uploadData,
                        borderColor: 'rgba(220, 53, 69, 1)',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Download (Mbps)',
                        data: downloadData,
                        borderColor: 'rgba(40, 167, 69, 1)',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { color: 'var(--dark-color)' }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label:function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}Mbps`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: { color: 'var(--dark-color)' }
                    },
                    x: { display: false }
                },
                animation: { duration: 0 }
            }
        }
    );
}

// Update time
function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleTimeString();
    document.getElementById('current-date').textContent = now.toLocaleDateString();
}
setInterval(updateTime, 1000);
updateTime();

// Format bytes to human readable
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format seconds to days, hours, minutes
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0 || days > 0) result += `${hours}h `;
    result += `${mins}m`;

    return result;
}

// Get process status color
function getProcessStatus(cpuUsage, memUsage) {
    if (cpuUsage > 70 || memUsage > 500) return 'danger';
    if (cpuUsage > 30 || memUsage > 200) return 'warning';
    return 'success';
}

async function fetchSystemData() {
    try {
        const response = await fetch('https://localhost:7193/api/System');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const timestamp = new Date().toLocaleTimeString();
        const now = Date.now();

        // Update last updated time
        document.getElementById('last-updated').textContent = timestamp;

        // Update system info
        document.getElementById('system-name').textContent = data.systemInfo.machineName;
        document.getElementById('os-version').textContent = data.systemInfo.osName;
        document.getElementById('cpu-name').textContent = data.systemInfo.cpuName;

        // Update CPU
        const cpuUsage = data.cpuUsage;
        document.getElementById('cpu-stat').textContent = `${cpuUsage.toFixed(1)}%`;
        document.getElementById('cpu-usage').textContent = `${cpuUsage.toFixed(1)}%`;
        document.getElementById('cpu-progress').style.width = `${cpuUsage}%`;
        document.getElementById('cpu-cores').textContent = data.systemInfo.cpuCores;
        document.getElementById('cpu-processes').textContent = data.processes.length;

        // Update CPU chart
        cpuData.push(cpuUsage);
        if (cpuData.length > maxDataPoints) cpuData.shift();
        cpuChart.data.datasets[0].data = cpuData;
        cpuChart.update();

        // Update Memory
        const memUsedGB = (data.memoryUsage.usedMB / 1024).toFixed(2);
        const memTotalGB = (data.memoryUsage.totalMB / 1024).toFixed(1);
        const memPercent = data.memoryUsage.percentUsed;

        document.getElementById('memory-stat').textContent = `${memPercent.toFixed(1)}%`;
        document.getElementById('memory-used').textContent = `${memUsedGB} GB`;
        document.getElementById('memory-total').textContent = `${memTotalGB} GB`;
        document.getElementById('memory-available').textContent = `${(data.memoryUsage.availableMB / 1024).toFixed(2)} GB`;
        document.getElementById('memory-progress').style.width = `${memPercent}%`;

        // Update Memory chart
        memoryData.push(memPercent);
        if (memoryData.length > maxDataPoints) memoryData.shift();
        memoryChart.data.datasets[0].data = memoryData;
        memoryChart.update();

        // Update Disk
        const diskPercent = data.diskUsage.percentUsed;
        document.getElementById('disk-stat').textContent = `${diskPercent}%`;
        document.getElementById('disk-used').textContent = `${data.diskUsage.usedGB} GB`;
        document.getElementById('disk-total').textContent = `${data.diskUsage.totalGB} GB`;
        document.getElementById('disk-free').textContent = `${data.diskUsage.freeGB} GB`;
        document.getElementById('disk-progress').style.width = `${diskPercent}%`;

        // Update Disk chart
        diskData.push(diskPercent);
        if (diskData.length > maxDataPoints) diskData.shift();
        diskChart.data.datasets[0].data = diskData;
        diskChart.update();

        // Enhanced Network Monitoring
        const currentUploadBytes = data.networkUsage.uploadSpeed;
        const currentDownloadBytes = data.networkUsage.downloadSpeed;

        // Calculate time difference in seconds
        const timeDiff = (now - lastNetworkStats.timestamp) / 1000;

        // Calculate speed in Mbps (8 bits per byte, 1024*1024 bits per Mb)
        const uploadSpeed = ((currentUploadBytes - lastNetworkStats.upload) * 8 / (1024 * 1024)) / timeDiff;
        const downloadSpeed = ((currentDownloadBytes - lastNetworkStats.download) * 8 / (1024 * 1024)) / timeDiff;

        // Update last stats
        lastNetworkStats = {
            upload: currentUploadBytes,
            download: currentDownloadBytes,
            timestamp: now
        };

        // Update UI
        document.getElementById('network-upload').textContent = `${uploadSpeed.toFixed(2)} Mbps`;
        document.getElementById('network-download').textContent = `${downloadSpeed.toFixed(2)} Mbps`;
        document.getElementById('network-total').textContent = `${(uploadSpeed + downloadSpeed).toFixed(2)} Mbps`;
        document.getElementById('network-interface').textContent = data.networkUsage.name;

        // Update Network chart with dynamic scaling
        uploadData.push(uploadSpeed);
        downloadData.push(downloadSpeed);
        if (uploadData.length > maxDataPoints) uploadData.shift();
        if (downloadData.length > maxDataPoints) downloadData.shift();

        // Calculate max value for scaling
        const maxValue = Math.max(
            Math.max(...uploadData),
            Math.max(...downloadData),
            1 // Minimum of 1 Mbps scale
        ) * 1.2; // Add 20% padding

        networkChart.options.scales.y.max = maxValue;
        networkChart.data.datasets[0].data = uploadData;
        networkChart.data.datasets[1].data = downloadData;
        networkChart.update();

        // Update Processes
        const processList = document.getElementById('process-list');
        processList.innerHTML = '';
        data.processes.forEach(proc => {
            const status = getProcessStatus(proc.cpu, proc.memoryMB);
            const statusClass = `badge bg-${status}`;

            processList.innerHTML += `
                <tr>
                    <td>${proc.name}</td>
                    <td>${proc.cpu.toFixed(1)}%</td>
                    <td>${proc.memoryMB.toFixed(1)} MB</td>
                    <td>${proc.pid}</td>
                    <td><span class="${statusClass}">${status}</span></td>
                </tr>
            `;
        });

        document.getElementById('process-count').textContent = `${data.processes.length} processes`;

    } catch (error) {
        console.error('Error fetching system data:', error);
        document.getElementById('last-updated').textContent = `Error: ${error.message}`;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeCharts();

    // Get initial network stats
    fetch('https://localhost:7193/api/System')
        .then(response => response.json())
        .then(data => {
            lastNetworkStats = {
                upload: data.networkUsage.uploadSpeed,
                download: data.networkUsage.downloadSpeed,
                timestamp: Date.now()
            };

            // Start regular polling
            fetchSystemData();
            setInterval(fetchSystemData, 2000);
        })
        .catch(error => {
            console.error('Initial fetch failed:', error);
            // Start anyway with defaults
            fetchSystemData();
            setInterval(fetchSystemData, 2000);
        });
});