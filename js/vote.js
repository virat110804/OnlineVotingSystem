// js/vote.js

document.addEventListener('DOMContentLoaded', () => {
    
    const currentVoterId = getCurrentUser();
    if (!currentVoterId) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('voter-id-display').textContent = currentVoterId;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutUser();
            window.location.href = 'index.html';
        });
    }

    const users = getUsers();
    const currentUser = users.find(u => u.voterId === currentVoterId);
    
    const election = getElection();
    const parties = getParties();

    const titleEl = document.getElementById('election-title');
    const statusTextEl = document.getElementById('election-status-text');
    const timerContainer = document.getElementById('timer-container');
    const countdownEl = document.getElementById('countdown');
    const votingArea = document.getElementById('voting-area');
    const candidatesGrid = document.getElementById('candidates-grid');

    let timerInterval;

    const updateDisplay = () => {
        const now = Date.now();

        if (!election || !election.isActive) {
            titleEl.textContent = "No Election Available";
            statusTextEl.textContent = "There is currently no active election configured.";
            return;
        }

        titleEl.textContent = election.title;

        if (currentUser.hasVoted) {
            statusTextEl.textContent = "You have already cast your vote.";
            statusTextEl.style.color = "var(--secondary)";
            showAlert('alert-container', 'Thank you for voting! Your vote has been recorded.', 'success');
            return;
        }

        if (now < election.startTime) {
            statusTextEl.textContent = "Voting has not started yet.";
            // Optionally could show a countdown TO start time, but sticking to simple rules
            return;
        }

        if (now > election.endTime) {
            statusTextEl.textContent = "Voting has ended.";
            statusTextEl.style.color = "var(--danger)";
            return;
        }

        // Voting is active
        statusTextEl.textContent = "Voting is currently open.";
        timerContainer.classList.remove('hidden');
        votingArea.classList.remove('hidden');

        updateTimer();
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);
        }
        renderCandidates();
    };

    const updateTimer = () => {
        const now = Date.now();
        const remaining = election.endTime - now;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            countdownEl.textContent = "00:00:00";
            votingArea.classList.add('hidden');
            timerContainer.classList.add('hidden');
            statusTextEl.textContent = "Voting has ended.";
            statusTextEl.style.color = "var(--danger)";
            showAlert('alert-container', 'The election has ended.', 'danger');
            return;
        }

        // Format remaining time
        const hours = Math.floor((remaining / (1000 * 60 * 60)));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        countdownEl.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const renderCandidates = () => {
        candidatesGrid.innerHTML = '';
        if (parties.length === 0) {
            candidatesGrid.innerHTML = '<p>No candidates available.</p>';
            return;
        }

        parties.forEach(party => {
            const card = document.createElement('div');
            card.className = 'candidate-card';
            card.innerHTML = `
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
                    ${party.candidatePhoto ? `<img src="${party.candidatePhoto}" alt="${party.candidateName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%;">` : '<div style="font-size: 3rem;">👤</div>'}
                    ${party.partySymbol ? `<img src="${party.partySymbol}" alt="${party.partyName}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 4px; background: white;">` : ''}
                </div>
                <h3>${party.candidateName}</h3>
                <p>Party: <strong>${party.partyName}</strong></p>
                <button class="btn btn-primary" onclick="castVote('${party.id}')">Vote</button>
            `;
            candidatesGrid.appendChild(card);
        });
    };

    window.castVote = (partyId) => {
        // Double check time and voted status
        const now = Date.now();
        if (now > election.endTime) {
            alert("Voting ended!");
            updateDisplay();
            return;
        }

        // Refresh user state in case of multiple tabs
        const freshUsers = getUsers();
        const freshUser = freshUsers.find(u => u.voterId === currentVoterId);

        if (freshUser.hasVoted) {
            alert("You already voted!");
            // Update local memory and re-render
            currentUser.hasVoted = true;
            votingArea.classList.add('hidden');
            updateDisplay();
            return;
        }

        // Record vote
        const votes = getVotes();
        votes.push({
            voterId: currentVoterId,
            partyId: partyId,
            time: now
        });
        setVotes(votes);

        // Update user
        freshUser.hasVoted = true;
        setUsers(freshUsers);
        currentUser.hasVoted = true; // Update local ref

        // Update UI
        votingArea.classList.add('hidden');
        timerContainer.classList.add('hidden');
        updateDisplay();
    };

    // Initial run
    updateDisplay();
});
