// Google Sheets URL (CSV Export)
// Format based on user request: Nome do Cliente, Localização, Nome do Ambiente, Descrição do Ambiente, Estilo de Design, URL da Imagem
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

        // Simple CSV parse (handling potential commas in quoted strings if needed, though split(',') is often enough for simple sheets)
        // Using a more robust regex to split by comma but preserve quoted content if any
        const rows = data.split(/\r?\n/).slice(1);
        const carousel = document.getElementById('projects-carousel');

        if (!carousel) return;
        carousel.innerHTML = ''; // Clear loader

        const projects = rows.map(row => {
            // Regex to handle potential commas inside quotes
            const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!cols || cols.length < 6) {
                // Fallback for simple split if regex fails
                const simpleCols = row.split(',');
                if (simpleCols.length < 6) return null;
                return {
                    cliente: simpleCols[0].replace(/"/g, ''),
                    local: simpleCols[1].replace(/"/g, ''),
                    ambiente: simpleCols[2].replace(/"/g, ''),
                    descricao: simpleCols[3].replace(/"/g, ''),
                    estilo: simpleCols[4].replace(/"/g, ''),
                    img: simpleCols[5].trim().replace(/"/g, '')
                };
            }
            return {
                cliente: cols[0].replace(/"/g, ''),
                local: cols[1].replace(/"/g, ''),
                ambiente: cols[2].replace(/"/g, ''),
                descricao: cols[3].replace(/"/g, ''),
                estilo: cols[4].replace(/"/g, ''),
                img: cols[5].trim().replace(/"/g, '')
            };
        }).filter(p => p !== null);

        renderCarousel(projects);
    } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        document.getElementById('projects-carousel').innerHTML = '<div class="loader">Erro ao carregar projetos.</div>';
    }
}

function renderCarousel(projects) {
    const carousel = document.getElementById('projects-carousel');

    projects.forEach((project) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-img-wrapper" onclick="openModal('${project.img}', '${project.descricao.replace(/'/g, "\\'")}')">
                <img src="${project.img}" alt="${project.ambiente}" class="project-img" onerror="this.src='assets/portfolio/living_room.png'">
            </div>
            <div class="project-info">
                <span class="project-label">Cliente</span>
                <span class="project-value">${project.cliente}</span>
                
                <span class="project-label">Localização</span>
                <span class="project-value">${project.local}</span>
                
                <span class="project-label">Ambiente</span>
                <h3 class="project-ambiente">${project.ambiente}</h3>
                
                <span class="project-label">Estilo de Design</span>
                <p class="project-estilo">${project.estilo}</p>
            </div>
        `;
        carousel.appendChild(card);
    });

    initCarouselLogic();
}

// Modal Logic
function openModal(imgSrc, description) {
    const modal = document.getElementById('project-modal');
    const modalImg = document.getElementById('modal-img');
    const modalDesc = document.getElementById('modal-desc');

    modal.style.display = "block";
    modalImg.src = imgSrc;
    modalDesc.innerText = description;
}

document.querySelector('.modal-close').onclick = function () {
    document.getElementById('project-modal').style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById('project-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    createHeroPuzzle();
});

// Hero Puzzle Animation
function createHeroPuzzle() {
    const heroWrapper = document.getElementById('hero-puzzle');
    if (!heroWrapper) return;

    const rows = 5;
    const cols = 8;
    heroWrapper.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    heroWrapper.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';

            // Set background position based on grid coordinates
            piece.style.backgroundPosition = `${(c / (cols - 1)) * 100}% ${(r / (rows - 1)) * 100}%`;

            heroWrapper.appendChild(piece);
        }
    }

    // Staggered Reveal
    const pieces = document.querySelectorAll('.puzzle-piece');
    const indices = Array.from(Array(pieces.length).keys());

    // Shuffle indices for a random puzzle effect
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    indices.forEach((idx, i) => {
        setTimeout(() => {
            pieces[idx].classList.add('visible');
        }, i * 30); // Reveal one by one quickly
    });
}

function initCarouselLogic() {
    const track = document.getElementById('projects-carousel');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    let currentIndex = 0;
    const cards = track.querySelectorAll('.project-card');
    const totalCards = cards.length;
    const cardsPerView = 3;

    function updateCarousel() {
        track.style.opacity = '0'; // Fade out

        setTimeout(() => {
            const cardWidth = cards[0].offsetWidth + 30; // 30 is the gap
            const offset = -currentIndex * cardWidth;
            track.style.transform = `translateX(${offset}px)`;
            track.style.opacity = '1'; // Fade in
        }, 500); // Wait for fade out to complete
    }

    nextBtn.addEventListener('click', () => {
        if (currentIndex < totalCards - cardsPerView) {
            currentIndex += cardsPerView;
            if (currentIndex > totalCards - cardsPerView) currentIndex = totalCards - cardsPerView;
        } else {
            currentIndex = 0; // Wrap around
        }
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex -= cardsPerView;
            if (currentIndex < 0) currentIndex = 0;
        } else {
            currentIndex = Math.max(0, totalCards - cardsPerView); // Wrap to end
        }
        updateCarousel();
    });

    // Cursor effects for new cards
    track.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        card.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Scroll Reveal
const revealOnScroll = () => {
    const reveals = document.querySelectorAll('.reveal');
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
