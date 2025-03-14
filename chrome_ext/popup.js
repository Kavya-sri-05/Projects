document.addEventListener('DOMContentLoaded', async () => {
    // Load time statistics
    const stats = await chrome.storage.local.get(['timeData', 'lastResetDate']);
    const timeStats = document.getElementById('timeStats');
    
    // Check if we need to reset daily stats
    const today = new Date().toDateString();
    if (!stats.lastResetDate || stats.lastResetDate !== today) {
        if (stats.timeData) {
            const archive = await chrome.storage.local.get('statsArchive') || {};
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            archive[yesterdayStr] = stats.timeData;
            await chrome.storage.local.set({ 
                statsArchive: archive,
                timeData: {},
                lastResetDate: today 
            });
        }
    }

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

    function updateStats(timeData) {
        if (!timeData) return;

        const sortedSites = Object.entries(timeData)
            .sort(([, a], [, b]) => b.totalTime - a.totalTime);

        timeStats.innerHTML = '<h2>Today\'s Activity</h2>';
        
        let totalSeconds = 0;
        
        sortedSites.forEach(([domain, data]) => {
            const seconds = data.totalTime;
            totalSeconds += seconds;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const div = document.createElement('div');
            div.className = 'stat-item';
            
            let timeString = '';
            if (hours > 0) {
                timeString += `${hours}h `;
            }
            if (minutes > 0 || hours === 0) {
                timeString += `${minutes}m`;
            }
            
            div.textContent = `${domain}: ${timeString}`;
            timeStats.appendChild(div);
        });

        // Update daily report
        const mostVisited = sortedSites[0];
        if (mostVisited) {
            document.getElementById('mostVisited').textContent = mostVisited[0];
        }

        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        document.getElementById('totalTime').textContent = 
            `${totalHours}h ${totalMinutes}m`;

        // Calculate and update productivity score
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
            totalTime += data.totalTime;
            if (productiveDomains.some(pd => domain.includes(pd))) {
                productiveTime += data.totalTime;
            }
            if (unproductiveDomains.some(ud => domain.includes(ud))) {
                productiveTime -= data.totalTime * 0.5;
            }
        });
        
        return Math.max(0, Math.min(100, Math.round((productiveTime / totalTime) * 100)));
    }

    // Initial update
    updateStats(stats.timeData);

    // Handle blocking sites
    const blockInput = document.getElementById('blockSite');
    const addBlockButton = document.getElementById('addBlock');
    const blockedList = document.getElementById('blockedList');

    // Load blocked sites
    const blockedSites = await chrome.storage.local.get('blockedSites');
    if (blockedSites.blockedSites) {
        blockedSites.blockedSites.forEach(site => {
            addBlockedSite(site);
        });
    }

    addBlockButton.addEventListener('click', async () => {
        const site = blockInput.value.trim();
        if (site) {
            const blockedSites = (await chrome.storage.local.get('blockedSites')).blockedSites || [];
            blockedSites.push(site);
            await chrome.storage.local.set({ blockedSites });
            addBlockedSite(site);
            blockInput.value = '';
        }
    });

    function addBlockedSite(site) {
        const li = document.createElement('li');
        li.textContent = site;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-btn';
        removeButton.onclick = async () => {
            const blockedSites = (await chrome.storage.local.get('blockedSites')).blockedSites;
            const updatedSites = blockedSites.filter(s => s !== site);
            await chrome.storage.local.set({ blockedSites: updatedSites });
            li.remove();
        };
        li.appendChild(removeButton);
        blockedList.appendChild(li);
    }

    // Add enter key support for blocking sites
    blockInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBlockButton.click();
        }
    });

    // Refresh stats every minute
    setInterval(async () => {
        const newStats = await chrome.storage.local.get('timeData');
        if (newStats.timeData) {
            updateStats(newStats.timeData);
        }
    }, 60000);
});