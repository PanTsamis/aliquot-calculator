// Configuration
const API_URL = "https://cgi.di.uoa.gr/~sdi2500194/aliquot_api.cgi";

// --- Theme Logic ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateIcon(newTheme);
}

function updateIcon(theme) {
    const btn = document.getElementById("themeBtn");
    btn.innerHTML = theme === "dark" ? "☀️" : "🌙";
}

// Load saved theme immediately
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
updateIcon(savedTheme);


// --- Calculation Logic ---
async function calculateSequence() {
    const num = document.getElementById('startNum').value;
    const maxlen = document.getElementById('maxLen').value;
    const mode = document.getElementById('mode').value;
    const resultsDiv = document.getElementById('results-area');
    const btn = document.getElementById('calcBtn');

    if (!num) {
        alert("Please enter a starting number.");
        return;
    }

    // UI Loading state
    btn.disabled = true;
    btn.innerText = "Calculating...";
    resultsDiv.innerHTML = '<div style="text-align:center;">Processing...</div>';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ num, maxlen, mode })
        });

        const text = await response.text();
        let data;
        
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Invalid Server Response: " + text.substring(0, 50) + "...");
        }

        if (data.error) {
            throw new Error(data.error);
        }

        // Display Results
        if (data.type === 'sequence') {
            if (data.data.length === 0) {
                 resultsDiv.innerHTML = 'Empty sequence';
            } else {
                // Join numbers with an arrow for better visualization
                resultsDiv.innerHTML = data.data.join(' → ');
            }
        } else if (data.type === 'length') {
            resultsDiv.innerHTML = `<div class="success-len">Sequence Length: ${data.data}</div>`;
        }

    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = `<div class="error">Error:<br>${error.message}</div>`;
    } finally {
        btn.disabled = false;
        btn.innerText = "Calculate";
    }
}