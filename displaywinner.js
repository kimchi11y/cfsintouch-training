class WinnerManager {
    constructor(displayElementId) {
        this.displayElement = document.getElementById(displayElementId);
    }

    // This method gets the winner and starts the celebration
    showCelebration() {
        const winnerName = localStorage.getItem('winner');

        if (winnerName) {
            // 1. Update the text
            this.displayElement.innerText = `Congratulations! ${winnerName} Wins!`;
            
            // 2. Add the CSS class for the animation
            this.displayElement.classList.add('reveal-winner');

            // 3. Fire the confetti
            this.launchConfetti();
        }
    }

    launchConfetti() {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// How to use it:
const winnerScreen = new WinnerManager('winner-display');
winnerScreen.showCelebration();

// Add this inside your class or app.js
window.addEventListener('storage', (event) => {
    if (event.key === 'winner') {
        winnerScreen.showCelebration();
    }
});