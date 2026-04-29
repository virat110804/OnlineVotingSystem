// js/results.js

document.addEventListener('DOMContentLoaded', () => {
    
    const election = getElection();
    const parties = getParties();
    const votes = getVotes();
    const users = getUsers();
    
    const contentArea = document.getElementById('results-content');
    const notEndedMsg = document.getElementById('not-ended-message');
    
    if (!election || !election.isActive) {
        // No election active at all
        return; // UI stays at not available
    }

    const now = Date.now();
    const isEnded = now > election.endTime;
    
    if (isEnded) {
        notEndedMsg.classList.add('hidden');
        contentArea.classList.remove('hidden');
        
        // Metrics
        document.getElementById('res-election-title').textContent = election.title;
        
        const totalVoters = users.length;
        const totalVotes = votes.length;
        const turnout = totalVoters > 0 ? ((totalVotes / totalVoters) * 100).toFixed(1) : 0;
        
        document.getElementById('res-total-voters').textContent = totalVoters;
        document.getElementById('res-total-votes').textContent = totalVotes;
        document.getElementById('res-turnout').textContent = turnout + '%';
        
        // Demographics
        let maleVotes = 0;
        let femaleVotes = 0;
        let otherVotes = 0;
        
        votes.forEach(vote => {
            const voter = users.find(u => u.voterId === vote.voterId);
            if (voter) {
                if (voter.gender === 'Male') maleVotes++;
                else if (voter.gender === 'Female') femaleVotes++;
                else otherVotes++;
            }
        });
        
        document.getElementById('res-male-votes').textContent = maleVotes;
        document.getElementById('res-female-votes').textContent = femaleVotes;
        document.getElementById('res-other-votes').textContent = otherVotes;
        
        // Rankings
        let result = {};
        votes.forEach(vote => {
            result[vote.partyId] = (result[vote.partyId] || 0) + 1;
        });
        
        const sortedParties = [...parties].sort((a, b) => {
            const votesA = result[a.id] || 0;
            const votesB = result[b.id] || 0;
            return votesB - votesA;
        });

        const rankingsList = document.getElementById('res-rankings-list');
        rankingsList.innerHTML = '';
        
        if (sortedParties.length === 0) {
            rankingsList.innerHTML = '<p>No candidates available.</p>';
            return;
        }

        const winnerVotes = result[sortedParties[0].id] || 0;

        sortedParties.forEach((party, index) => {
            const partyVotes = result[party.id] || 0;
            const isWinner = index === 0 && partyVotes > 0 && partyVotes === winnerVotes;
            const percentage = totalVotes > 0 ? ((partyVotes / totalVotes) * 100).toFixed(1) : 0;
            
            const resItem = document.createElement('div');
            resItem.style.display = 'flex';
            resItem.style.alignItems = 'center';
            resItem.style.justifyContent = 'space-between';
            resItem.style.padding = '1.5rem';
            resItem.style.marginBottom = '1rem';
            resItem.style.background = isWinner ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.4)';
            resItem.style.border = isWinner ? '1px solid var(--secondary)' : '1px solid var(--border-color)';
            resItem.style.borderRadius = '0.5rem';
            
            resItem.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <div style="font-size: 1.5rem; font-weight: bold; width: 30px; color: var(--text-muted);">${index + 1}</div>
                    <div style="display: flex; gap: 1rem;">
                        ${party.candidatePhoto ? `<img src="${party.candidatePhoto}" alt="${party.candidateName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">` : '<div style="font-size: 2rem;">👤</div>'}
                        ${party.partySymbol ? `<img src="${party.partySymbol}" alt="${party.partyName}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 4px; background: white;">` : ''}
                    </div>
                    <div>
                        <strong style="font-size: 1.25rem;">${party.candidateName}</strong> 
                        <span style="color: var(--text-muted);">(${party.partyName})</span>
                        ${isWinner ? '<span style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; background: var(--secondary); color: white; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">WINNER</span>' : ''}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; font-size: 1.5rem;">${partyVotes}</div>
                    <div style="color: var(--text-muted); font-size: 0.875rem;">${percentage}%</div>
                </div>
            `;
            rankingsList.appendChild(resItem);
        });
    }
});
