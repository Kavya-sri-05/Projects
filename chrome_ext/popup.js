document.addEventListener('DOMContentLoaded', async () => {
    const timeStats = document.getElementById('timeStats');
    const blockInput = document.getElementById('blockSite');
    const addBlockButton = document.getElementById('addBlock');
    const blockedList = document.getElementById('blockedList');

    // Create daily report section
    const reportContainer = document.createElement('div');
    reportContainer.className = 'report-container';
    reportContainer.innerHTML = `
        <h2>Daily Report</h2>
        <div class="report-stats">
            <div>Most visited: <span id="mostVisited">-</span></div>
            <div>Total active time: <span id="totalTime">-</span></div>
            <div>Productivity score: <span id="productivityScore">-</span></div>
        </div>
    `;
    timeStats.parentNode.insertBefore(reportContainer, timeStats);

    // Load and display stats
    async function loadStats() {
        const { timeData, lastResetDate } = await chrome.storage.local.get(['timeData', 'lastResetDate']);
        
        // Check for day reset
        const today = new Date().toDateString();
        if (!lastResetDate || lastResetDate !== today) {
            const archive = await chrome.storage.local.get('statsArchive') || {};
            if (timeData) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();
                archive[yesterdayStr] = timeData;
            }
            await chrome.storage.local.set({ 
                statsArchive: archive,
                timeData: {},
                lastResetDate: today 
            });
            updateStats({});
        } else {
            updateStats(timeData);
        }
    }

    function updateStats(timeData) {
        if (!timeData) timeData = {};

        const sortedSites = Object.entries(timeData)
            .sort(([, a], [, b]) => (b.totalTime || 0) - (a.totalTime || 0));

        timeStats.innerHTML = '<h2>Today\'s Activity</h2>';
        
        let totalSeconds = 0;
        
        sortedSites.forEach(([domain, data]) => {
            const seconds = data.totalTime || 0;
            totalSeconds += seconds;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            
            const div = document.createElement('div');
            div.className = 'stat-item';
            div.textContent = `${domain}: ${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
            timeStats.appendChild(div);
        });

        // Update daily report
        document.getElementById('mostVisited').textContent = 
            sortedSites.length > 0 ? sortedSites[0][0] : 'No visits yet';

        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        document.getElementById('totalTime').textContent = 
            `${totalHours}h ${totalMinutes}m`;

        const productivityScore = calculateProductivityScore(sortedSites);
        document.getElementById('productivityScore').textContent = 
            `${productivityScore}%`;
    }

    function calculateProductivityScore(sites) {
        if (!sites.length) return 0;
        
        const productiveDomains = ['github.com', 'stackoverflow.com', 'docs.google.com'];
        const unproductiveDomains = ['facebook.com', 'instagram.com', 'twitter.com'];
        
        let productiveTime = 0;
        let totalTime = 0;
        
        sites.forEach(([domain, data]) => {
            const time = data.totalTime || 0;
            totalTime += time;
            
            if (productiveDomains.some(pd => domain.includes(pd))) {
                productiveTime += time;
            }
            if (unproductiveDomains.some(ud => domain.includes(ud))) {
                productiveTime -= time * 0.5;
            }
        });
        
        return totalTime === 0 ? 0 : 
            Math.max(0, Math.min(100, Math.round((productiveTime / totalTime) * 100)));
    }

    // Handle blocked sites
    async function loadBlockedSites() {
        const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
        blockedSites.forEach(site => addBlockedSite(site));
    }

    function addBlockedSite(site) {
        const li = document.createElement('li');
        li.textContent = site;
        
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-btn';
        removeButton.onclick = async () => {
            const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
            const updatedSites = blockedSites.filter(s => s !== site);
            await chrome.storage.local.set({ blockedSites: updatedSites });
            li.remove();
        };
        
        li.appendChild(removeButton);
        blockedList.appendChild(li);
    }

    addBlockButton.addEventListener('click', async () => {
        const site = blockInput.value.trim();
        if (site) {
            const { blockedSites = [] } = await chrome.storage.local.get('blockedSites');
            if (!blockedSites.includes(site)) {
                blockedSites.push(site);
                await chrome.storage.local.set({ blockedSites });
                addBlockedSite(site);
                blockInput.value = '';
            }
        }
    });

    blockInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBlockButton.click();
        }
    });

    // Initialize
    await loadStats();
    await loadBlockedSites();

    // Refresh stats every minute
    setInterval(loadStats, 60000);
});