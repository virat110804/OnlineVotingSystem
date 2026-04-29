// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    
    const loginSection = document.getElementById('admin-login-section');
    const dashboardSection = document.getElementById('admin-dashboard-section');
    
    // Check session
    const isDashboardActive = sessionStorage.getItem('adminActive') === 'true';
    if (isDashboardActive) {
        showDashboard();
    }

    // --- Admin Login ---
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = document.getElementById('admin-username').value;
            const p = document.getElementById('admin-password').value;
            
            const adminData = getAdmin();
            if (u === adminData.username && p === adminData.password) {
                sessionStorage.setItem('adminActive', 'true');
                showDashboard();
            } else {
                showAlert('login-alert-container', 'Invalid admin credentials.', 'danger');
            }
        });
    }

    // --- Admin Logout ---
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminActive');
            window.location.reload();
        });
    }

    function showDashboard() {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        refreshDashboard();
        // Set interval to refresh dashboard automatically
        setInterval(refreshDashboard, 5000); 
    }

    // --- Create Election ---
    const createElectionForm = document.getElementById('create-election-form');
    if (createElectionForm) {
        createElectionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('election-title').value;
            const durationMs = parseInt(document.getElementById('election-duration').value);
            
            const now = Date.now();
            const newElection = {
                title: title,
                startTime: now,
                endTime: now + durationMs,
                isActive: true
            };
            
            setElection(newElection);
            
            // Optionally clear existing votes and parties on new election
            setVotes([]);
            setParties([]);
            
            // Reset users hasVoted status
            const users = getUsers();
            const resetUsers = users.map(u => ({ ...u, hasVoted: false }));
            setUsers(resetUsers);

            showAlert('dashboard-alert-container', `Election "${title}" started successfully!`, 'success');
            createElectionForm.reset();
            refreshDashboard();
        });
    }

    // --- Add Party ---
    const resizeImage = (file) => {
        return new Promise((resolve) => {
            if (!file) return resolve(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 150;
                    const MAX_HEIGHT = 150;
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const addPartyForm = document.getElementById('add-party-form');
    if (addPartyForm) {
        addPartyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const partyName = document.getElementById('party-name').value;
            const candidateName = document.getElementById('candidate-name').value;
            const partySymbolFile = document.getElementById('party-symbol').files[0];
            const candidatePhotoFile = document.getElementById('candidate-photo').files[0];
            
            const partySymbol = await resizeImage(partySymbolFile);
            const candidatePhoto = await resizeImage(candidatePhotoFile);

            const parties = getParties();
            const newParty = {
                id: 'PARTY_' + Math.floor(Math.random() * 100000),
                partyName,
                candidateName,
                partySymbol,
                candidatePhoto
            };
            
            parties.push(newParty);
            setParties(parties);
            
            showAlert('dashboard-alert-container', `Candidate ${candidateName} added.`, 'info');
            addPartyForm.reset();
            refreshDashboard();
        });
    }

    // --- Dashboard Live Stats & Results ---
    function refreshDashboard() {
        if (!sessionStorage.getItem('adminActive')) return;

        const election = getElection();
        const parties = getParties();
        const votes = getVotes();
        
        const statusText = document.getElementById('dashboard-status-text');
        const liveContainer = document.getElementById('live-votes-container');
        const resultsContainer = document.getElementById('results-container');
        const finalResultsList = document.getElementById('final-results-list');
        
        if (!election || !election.isActive) {
            statusText.textContent = "No active election.";
            liveContainer.innerHTML = '';
            resultsContainer.classList.add('hidden');
            return;
        }

        const now = Date.now();
        const isEnded = now > election.endTime;
        
        if (isEnded) {
            statusText.textContent = `Election Ended. (Title: ${election.title})`;
            statusText.style.color = "var(--danger)";
        } else {
            statusText.textContent = `Election Active: ${election.title} (Ends in ~${Math.ceil((election.endTime - now)/60000)} mins)`;
            statusText.style.color = "var(--secondary)";
        }

        // Count votes logic
        function getResults() {
            let result = {};
            votes.forEach(vote => {
                result[vote.partyId] = (result[vote.partyId] || 0) + 1;
            });
            return result;
        }

        const currentResults = getResults();

        // Render Live Overview (Cards)
        liveContainer.innerHTML = '';
        parties.forEach(party => {
            const voteCount = currentResults[party.id] || 0;
            const card = document.createElement('div');
            card.className = 'candidate-card';
            card.style.padding = '1rem';
            card.innerHTML = `
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    ${party.candidatePhoto ? `<img src="${party.candidatePhoto}" alt="${party.candidateName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">` : '<div style="font-size: 2rem;">👤</div>'}
                    ${party.partySymbol ? `<img src="${party.partySymbol}" alt="${party.partyName}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; background: white;">` : ''}
                </div>
                <h4 style="margin-bottom: 0.25rem;">${party.candidateName}</h4>
                <p style="margin-bottom: 0.5rem; font-size: 0.75rem;">${party.partyName}</p>
                <div class="vote-count" style="font-size: 1.5rem; margin: 0;">${voteCount} Votes</div>
            `;
            liveContainer.appendChild(card);
        });

        // Show Final Results if ended
        if (isEnded) {
            resultsContainer.classList.remove('hidden');
            
            // Sort parties by votes
            const sortedParties = [...parties].sort((a, b) => {
                const votesA = currentResults[a.id] || 0;
                const votesB = currentResults[b.id] || 0;
                return votesB - votesA;
            });

            finalResultsList.innerHTML = '';
            if (sortedParties.length === 0) {
                finalResultsList.innerHTML = '<p>No candidates available.</p>';
                return;
            }

            const winnerVotes = currentResults[sortedParties[0].id] || 0;

            sortedParties.forEach((party, index) => {
                const votes = currentResults[party.id] || 0;
                const isWinner = index === 0 && votes > 0 && votes === winnerVotes;
                
                const resItem = document.createElement('div');
                resItem.style.display = 'flex';
                resItem.style.justifyContent = 'space-between';
                resItem.style.padding = '1rem';
                resItem.style.marginBottom = '0.5rem';
                resItem.style.background = isWinner ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)';
                resItem.style.border = isWinner ? '1px solid var(--secondary)' : '1px solid var(--border-color)';
                resItem.style.borderRadius = '0.5rem';
                
                resItem.innerHTML = `
                    <div>
                        <strong>${party.candidateName}</strong> (${party.partyName})
                        ${isWinner ? '<span style="margin-left: 0.5rem; color: var(--secondary);">🏆 Winner</span>' : ''}
                    </div>
                    <div style="font-weight: bold;">${votes}</div>
                `;
                finalResultsList.appendChild(resItem);
            });
        } else {
            resultsContainer.classList.add('hidden');
        }
    }
});
