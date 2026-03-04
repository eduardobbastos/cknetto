// Google Sheets URL (CSV Export)
// Format based on user request: Nome do Cliente, Localização, Nome do Ambiente, Descrição do Ambiente, Estilo de Design, URL da Imagem
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1TQ_xM-NIjgikHM4DHDJxQUtFQySUglSRVs-Dcqzfi7U/export?format=csv&gid=0';

// Custom Cursor
const cursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Helper to convert Google Drive links to direct image links
function getDirectImageUrl(url) {
    if (!url) return 'assets/portfolio/living_room.png';
    url = url.trim().replace(/^"|"$/g, '');

    // If it's a Google Drive link, extract ID and convert
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(?:&|$)/);
        if (idMatch && idMatch[1]) {
            return `https://lh3.googleusercontent.com/u/0/d/${idMatch[1]}`;
        }
    }

    if (!url.startsWith('http') && !url.startsWith('assets/')) {
        return `assets/portfolio/${url}`;
    }

    return url;
}

// Dynamic Projects Loading
async function fetchProjects() {
    try {
        const response = await fetch(SHEETS_URL);
        const data = await response.text();

        const rows = data.split(/\r?\n/).slice(1);
        const carousel = document.getElementById('projects-carousel');

        if (!carousel) return;
        carousel.innerHTML = '';

        const projects = rows.map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (!cols || cols.length < 6) return null;

            return {
                cliente: cols[0].trim().replace(/^"|"$/g, ''),
                local: cols[1].trim().replace(/^"|"$/g, ''),
                ambiente: cols[2].trim().replace(/^"|"$/g, ''),
                descricao: cols[3].trim().replace(/^"|"$/g, ''),
                estilo: cols[4].trim().replace(/^"|"$/g, ''),
                img: getDirectImageUrl(cols[5])
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
            piece.style.backgroundPosition = `${(c / (cols - 1)) * 100}% ${(r / (rows - 1)) * 100}%`;
            heroWrapper.appendChild(piece);
        }
    }

    const pieces = document.querySelectorAll('.puzzle-piece');
    const indices = Array.from(Array(pieces.length).keys());
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    indices.forEach((idx, i) => {
        setTimeout(() => {
            pieces[idx].classList.add('visible');
        }, i * 30);
    });
}

function initCarouselLogic() {
    const track = document.getElementById('projects-carousel');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');

    let currentIndex = 0;
    const cards = track.querySelectorAll('.project-card');
    const totalCards = cards.length;

    function getCardsPerView() {
        return window.innerWidth <= 968 ? 1 : 3;
    }

    function updateCarousel() {
        track.style.opacity = '0';
        setTimeout(() => {
            const gap = window.innerWidth <= 968 ? 20 : 30;
            const cardWidth = cards[0].offsetWidth + gap;
            const cardsPerView = getCardsPerView();
            if (currentIndex > totalCards - cardsPerView) {
                currentIndex = Math.max(0, totalCards - cardsPerView);
            }
            const offset = -currentIndex * cardWidth;
            track.style.transform = `translateX(${offset}px)`;
            track.style.opacity = '1';
        }, 500);
    }

    nextBtn.addEventListener('click', () => {
        const cardsPerView = getCardsPerView();
        if (currentIndex < totalCards - cardsPerView) {
            currentIndex += 1;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex -= 1;
        } else {
            currentIndex = Math.max(0, totalCards - getCardsPerView());
        }
        updateCarousel();
    });

    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(updateCarousel, 250);
    });

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
        if (elementTop < windowHeight - 150) {
            reveal.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);

// Header Style on Scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu
const initMobileMenu = () => {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.querySelector('.nav-list');
    const links = document.querySelectorAll('.nav-link');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        links.forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    createHeroPuzzle();
    initMobileMenu();
    revealOnScroll();
});
