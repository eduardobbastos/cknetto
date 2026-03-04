// Google Sheets URL (CSV Export)
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1TQ_xM-NIjgikHM4DHDJxQUtFQySUglSRVs-Dcqzfi7U/export?format=csv&gid=0';

// Custom Cursor
const cursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Dynamic Projects Loading
async function fetchProjects() {
    try {
        const response = await fetch(SHEETS_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Skip header
        const carousel = document.getElementById('projects-carousel');

        if (!carousel) return;
        carousel.innerHTML = ''; // Clear loader

        const projects = rows.map(row => {
            // Basic CSV parsing (handles simple cases, but interior design data usually doesn't have nested commas)
            const cols = row.split(',');
            if (cols.length < 6) return null;
            return {
                cliente: cols[0],
                local: cols[1],
                ambiente: cols[2],
                descricao: cols[3],
                estilo: cols[4],
                img: cols[5].trim()
            };
        }).filter(p => p !== null);

        // Generate Cards
        renderCarousel(projects);
    } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        document.getElementById('projects-carousel').innerHTML = '<div class="loader">Erro ao carregar projetos.</div>';
    }
}

function renderCarousel(projects) {
    const carousel = document.getElementById('projects-carousel');

    // Create triple set for infinite loop illusion
    const items = [...projects, ...projects, ...projects];

    items.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-img-wrapper">
                <img src="${project.img}" alt="${project.ambiente}" class="project-img" onerror="this.src='assets/portfolio/living_room.png'">
            </div>
            <div class="project-info">
                <h3 class="project-name">${project.ambiente}</h3>
                <p class="project-cat">${project.cliente} • ${project.estilo}</p>
                <p style="font-size: 0.8rem; color: #888; margin-top: 10px;">${project.local}</p>
            </div>
        `;
        carousel.appendChild(card);
    });

    initCarouselLogic();
}

function initCarouselLogic() {
    const track = document.getElementById('projects-carousel');
    const container = document.querySelector('.carousel-container');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    let isDragging = false;
    let startX;
    let scrollLeft;
    let animationId;
    let currentTranslate = 0;

    // Scroll automatically
    const autoScroll = () => {
        currentTranslate -= 1;
        track.style.transform = `translateX(${currentTranslate}px)`;

        // Reset position for infinite loop
        const cardWidth = track.querySelector('.project-card').offsetWidth + 30;
        const totalProjects = track.querySelectorAll('.project-card').length / 3;

        if (Math.abs(currentTranslate) >= cardWidth * totalProjects) {
            currentTranslate = 0;
        }

        animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);

    // Pause on hover
    container.addEventListener('mouseenter', () => cancelAnimationFrame(animationId));
    container.addEventListener('mouseleave', () => animationId = requestAnimationFrame(autoScroll));

    // Interaction for buttons
    nextBtn.addEventListener('click', () => {
        currentTranslate -= 300;
        if (Math.abs(currentTranslate) >= track.scrollWidth / 2) currentTranslate = 0;
    });

    prevBtn.addEventListener('click', () => {
        currentTranslate += 300;
        if (currentTranslate > 0) currentTranslate = -track.scrollWidth / 3;
    });

    // Cursor effects for new cards
    track.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        card.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    revealOnScroll();
});

// Scroll Reveal
const reveals = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);

// Header Style on Scroll
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scroll = window.pageYOffset;
    if (hero) hero.style.backgroundPositionY = scroll * 0.5 + 'px';
});
