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


// --- ΝΕΟ: Background Collage Generation ---
function generateBackgroundCollage() {
    const collageContainer = document.getElementById('background-collage');
    const numberOfElements = 150; // Αύξηση στοιχείων

    // Πίνακας με μαθηματικά σύμβολα
    const symbols = ['+', '-', '×', '÷', '=', '≈', '≠', '≤', '≥', '∞', 'π', 'e', '√', '∫', '∑', '∏'];

    for (let i = 0; i < numberOfElements; i++) {
        const numSpan = document.createElement('span');
        numSpan.classList.add('bg-number');
        
        // Τυχαία επιλογή: Αριθμός ή Σύμβολο
        if (Math.random() > 0.3) { // 70% πιθανότητα για αριθμό
            numSpan.innerText = Math.floor(Math.random() * 1000);
        } else { // 30% πιθανότητα για σύμβολο
            const randomIndex = Math.floor(Math.random() * symbols.length);
            numSpan.innerText = symbols[randomIndex];
        }

        // Τυχαία θέση
        numSpan.style.left = Math.random() * 100 + 'vw';
        numSpan.style.top = Math.random() * 100 + 'vh';

        // Τυχαίο μέγεθος (λίγο μεγαλύτερο εύρος)
        const randomSize = Math.random() * 4 + 1;
        numSpan.style.fontSize = randomSize + 'rem';

        // Τυχαία περιστροφή
        const randomRotation = Math.random() * 360;
        numSpan.style.transform = `rotate(${randomRotation}deg)`;
        
        // Τυχαία διαφάνεια
        numSpan.style.opacity = Math.random() * 0.5 + 0.3;

        collageContainer.appendChild(numSpan);
    }
}

// Εκτέλεση της συνάρτησης όταν φορτώσει η σελίδα
window.addEventListener('DOMContentLoaded', generateBackgroundCollage);


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