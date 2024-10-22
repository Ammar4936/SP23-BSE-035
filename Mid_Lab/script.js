function startFloating() {
    const skillItems = document.querySelectorAll('#skills-list li');
    
    skillItems.forEach((item, index) => {
        item.style.transform = 'translateY(0px)';
        
        let startTime = Date.now() + (index * 500);
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const position = Math.sin(elapsed / 1000) * 10;
            
            item.style.transform = `translateY(${position}px)`;
            requestAnimationFrame(animate);
        }
        
        // Only start animation on devices that support hover
        if (window.matchMedia('(hover: hover)').matches) {
            animate();
        }
    });
}

function setupHoverEffects() {
    const skillItems = document.querySelectorAll('#skills-list li');
    
    // Only add hover effects on devices that support hover
    if (window.matchMedia('(hover: hover)').matches) {
        skillItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.1)';
                item.style.boxShadow = '0 5px 15px rgba(52, 152, 219, 0.4)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0)';
                item.style.boxShadow = 'none';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    startFloating();
    setupHoverEffects();
});