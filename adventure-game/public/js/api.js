const API = {
    getManifest: async () => {
        const res = await fetch('/api/manifest');
        return await res.json();
    },
    startSession: async (profileName, charId, themeId) => {
        const res = await fetch('/api/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileName, charId, themeId })
        });
        return await res.json();
    },
    updateProgress: async (sessionId, result) => {
        const res = await fetch('/api/session/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, result })
        });
        return await res.json();
    }
};
