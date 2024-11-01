document.addEventListener('DOMContentLoaded', function() {
    const circle = document.querySelector('.progress-ring-circle');
    const timeDisplay = document.getElementById('timeLeft');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    // Set the initial stroke properties
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    function updateTimer() {
        const now = new Date();
        const start = new Date(now);
        const end = new Date(now);
        
        // Set office hours
        start.setHours(10, 0, 0, 0);
        end.setHours(20, 0, 0, 0);

        // Calculate total office duration in milliseconds
        const totalDuration = end - start;
        
        // Calculate remaining time
        let timeLeft;
        if (now < start) {
            timeLeft = 0;
        } else if (now > end) {
            timeLeft = 0;
        } else {
            timeLeft = end - now;
        }

        // Calculate progress percentage
        const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
        setProgress(progress);

        // Format time display
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Update every second
    setInterval(updateTimer, 1000);
    updateTimer(); // Initial update
}); 