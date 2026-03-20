// Google Sheets URL (CSV Export)
const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1TQ_xM-NIjgikHM4DHDJxQUtFQySUglSRVs-Dcqzfi7U/export?format=csv&gid=0';

const PortfolioApp = (() => {
    // ---- Private state ----
    const ABOUT_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1TQ_xM-NIjgikHM4DHDJxQUtFQySUglSRVs-Dcqzfi7U/export?format=csv&gid=575897866';
    const SERVICES_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1TQ_xM-NIjgikHM4DHDJxQUtFQySUglSRVs-Dcqzfi7U/export?format=csv&gid=1540766818';
    const CONTACT_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1TQ_xM-NIjgikHM4DHDJxQUtFQySUglSRVs-Dcqzfi7U/export?format=csv&gid=1883894334';
    let allProjects = [];
    let currentProjectImages = [];
    let currentImageIndex = 0;
    let cursor = null;

    // ---- Helper functions ----
    function getDirectImageUrl(url) {
        if (!url) return 'assets/portfolio/living_room.png';
        url = url.trim().replace(/^"|"$/g, '');

        if (url.includes('drive.google.com')) {
            const idMatch = url.match(/\/d\/([^/&?]+)/) || url.match(/id=([^&]+)/);
            if (idMatch && idMatch[1]) {
                return `https://lh3.googleusercontent.com/u/0/d/${idMatch[1]}`;
            }
        }

        if (!url.startsWith('http') && !url.startsWith('assets/')) {
            return `assets/portfolio/${url}`;
        }

        return url;
    }

    function parseCSV(str) {
        const result = [];
        let row = [];
        let inQuotes = false;
        let val = '';
        for (let i = 0; i < str.length; i++) {
            let cc = str[i], nc = str[i+1];
            if (cc === '"' && inQuotes && nc === '"') {
                val += '"';
                i++; // skip next quote
            } else if (cc === '"') {
                inQuotes = !inQuotes;
            } else if (cc === ',' && !inQuotes) {
                row.push(val); val = '';
            } else if ((cc === '\r' || cc === '\n') && !inQuotes) {
                if (cc === '\r' && nc === '\n') i++;
                row.push(val); val = '';
                result.push(row); row = [];
            } else {
                val += cc;
            }
        }
        if (val || row.length) {
            row.push(val);
            result.push(row);
        }
        return result;
    }

    // ---- Cursor Logic ----
    function initCursor() {
        cursor = document.querySelector('.custom-cursor');
        document.addEventListener('mousemove', (e) => {
            if (cursor) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });
    }

    // ---- Data Fetching & Rendering ----
    async function fetchProjects() {
        try {
            const response = await fetch(SHEETS_URL);
            const data = await response.text();

            const rows = parseCSV(data).slice(1);
            const carousel = document.getElementById('projects-carousel');

            if (!carousel) return;
            carousel.innerHTML = '';

            allProjects = rows.map(cols => {
                if (!cols || cols.length < 6) return null;

                const gallery = [];
                const mainImgUrl = cols[5] ? cols[5].trim().replace(/^"|"$/g, '') : '';
                if (mainImgUrl) {
                    gallery.push({
                        url: getDirectImageUrl(mainImgUrl),
                        desc: cols[3].trim().replace(/^"|"$/g, '')
                    });
                }

                for (let i = 6; i < cols.length; i += 2) {
                    const imgUrl = cols[i] ? cols[i].trim().replace(/^"|"$/g, '') : '';
                    const imgDesc = cols[i + 1] ? cols[i + 1].trim().replace(/^"|"$/g, '') : '';
                    if (imgUrl && imgUrl.startsWith('http')) {
                        gallery.push({
                            url: getDirectImageUrl(imgUrl),
                            desc: imgDesc || cols[3].trim().replace(/^"|"$/g, '')
                        });
                    }
                }

                return {
                    projeto: cols[0].trim().replace(/^"|"$/g, ''),
                    local: cols[1].trim().replace(/^"|"$/g, ''),
                    ambiente: cols[2].trim().replace(/^"|"$/g, ''),
                    descricao: cols[3].trim().replace(/^"|"$/g, ''),
                    estilo: cols[4].trim().replace(/^"|"$/g, ''),
                    mainImg: getDirectImageUrl(cols[5]),
                    gallery: gallery
                };
            }).filter(p => p !== null);

            renderCarousel(allProjects);
        } catch (error) {
            console.error('Erro ao buscar projetos:', error);
            const carousel = document.getElementById('projects-carousel');
            if (carousel) carousel.innerHTML = '<div class="loader">Erro ao carregar projetos.</div>';
        }
    }

    async function fetchAbout() {
        try {
            const response = await fetch(ABOUT_SHEETS_URL);
            const data = await response.text();
            
            const rows = parseCSV(data).slice(1); // skip header
            if (!rows.length || !rows[0]) return;
            
            const cols = rows[0];
            if (cols.length < 3) return;
            
            const nome = cols[0] ? cols[0].trim().replace(/^"|"$/g, '') : '';
            const slogan = cols[1] ? cols[1].trim().replace(/^"|"$/g, '') : '';
            const descricaoRaw = cols[2] ? cols[2].trim().replace(/^"|"$/g, '') : '';
            const imgUrl = cols[3] ? cols[3].trim().replace(/^"|"$/g, '') : '';
            
            const aboutTitle = document.getElementById('about-title');
            const aboutText = document.getElementById('about-text');
            const aboutImg = document.getElementById('about-img');
            
            if (aboutTitle && nome) {
                aboutTitle.innerText = nome;
            }
            
            if (aboutText && descricaoRaw) {
                const formattedDesc = descricaoRaw.replace(/\n/g, '<br>');
                aboutText.innerHTML = `<strong>${slogan}</strong><br><br>${formattedDesc}`;
            }
            
            if (aboutImg && imgUrl) {
                aboutImg.src = getDirectImageUrl(imgUrl);
                aboutImg.alt = nome;
            }
        } catch (error) {
            console.error('Erro ao buscar dados do Sobre:', error);
        }
    }

    async function fetchServices() {
        try {
            const response = await fetch(SERVICES_SHEETS_URL);
            const data = await response.text();
            
            const rows = parseCSV(data).slice(1);
            const servicesGrid = document.getElementById('services-grid');
            if (!servicesGrid) return;
            
            servicesGrid.innerHTML = '';
            
            const icons = [
                `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" stroke-linecap="round" stroke-linejoin="round" /></svg>`,
                `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke-linecap="round" stroke-linejoin="round" /><polyline points="9 22 9 12 15 12 15 22" stroke-linecap="round" stroke-linejoin="round" /></svg>`,
                `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke-linecap="round" stroke-linejoin="round" /></svg>`
            ];
            
            rows.forEach((cols, index) => {
                const titulo = cols[0] ? cols[0].trim().replace(/^"|"$/g, '') : '';
                const descricaoRaw = cols[1] ? cols[1].trim().replace(/^"|"$/g, '') : '';
                const saibaMais = cols[2] ? cols[2].trim().replace(/^"|"$/g, '') : '';
                if (!titulo) return;
                
                const formattedDesc = descricaoRaw.replace(/\n/g, '<br>');
                const iconSvg = icons[index % icons.length];
                
                const serviceCard = document.createElement('div');
                serviceCard.className = 'service-card reveal active';
                serviceCard.innerHTML = `
                    <div class="service-icon">
                        ${iconSvg}
                    </div>
                    <h3>${titulo}</h3>
                    <p>${formattedDesc}</p>
                    <a href="${saibaMais}" target="_blank" class="service-link">Saiba mais &rsaquo;</a>
                `;
                servicesGrid.appendChild(serviceCard);
            });
        } catch(error) {
            console.error('Erro ao buscar dados de Serviços:', error);
            const servicesGrid = document.getElementById('services-grid');
            if (servicesGrid) servicesGrid.innerHTML = '<div class="loader">Erro ao carregar serviços.</div>';
        }
    }

    async function fetchContact() {
        try {
            const response = await fetch(CONTACT_SHEETS_URL);
            const data = await response.text();
            
            const rows = parseCSV(data).slice(1);
            if (!rows.length || !rows[0]) return;
            const cols = rows[0];
            
            const sloganMain = cols[0] ? cols[0].trim().replace(/^"|"$/g, '') : '';
            const sloganSub = cols[1] ? cols[1].trim().replace(/^"|"$/g, '') : '';
            const phone = cols[2] ? cols[2].trim().replace(/^"|"$/g, '') : '';
            const email = cols[3] ? cols[3].trim().replace(/^"|"$/g, '') : '';
            const instaUrl = cols[4] ? cols[4].trim().replace(/^"|"$/g, '') : '';
            const pinterestUrl = cols[5] ? cols[5].trim().replace(/^"|"$/g, '') : '';
            const linkedinUrl = cols[6] ? cols[6].trim().replace(/^"|"$/g, '') : '';
            const footerRights = cols[7] ? cols[7].trim().replace(/^"|"$/g, '') : '';
            
            const elSloganMain = document.getElementById('contact-slogan-main');
            const elSloganSub = document.getElementById('contact-slogan-sub');
            const elEmail = document.getElementById('contact-email');
            const elEmailText = document.getElementById('contact-email-text');
            const elPhone = document.getElementById('contact-phone');
            const elPhoneText = document.getElementById('contact-phone-text');
            const elInsta = document.getElementById('contact-instagram');
            const elPinterest = document.getElementById('contact-pinterest');
            const elLinkedin = document.getElementById('contact-linkedin');
            const elFooter = document.getElementById('footer-rights');
            
            if (elSloganMain && sloganMain) elSloganMain.innerText = sloganMain;
            if (elSloganSub && sloganSub) elSloganSub.innerText = sloganSub;
            
            if (elEmail && email) {
                elEmail.href = `mailto:${email}`;
                if (elEmailText) elEmailText.innerText = email;
            }
            if (elPhone && phone) {
                const sanitizedPhone = phone.replace(/\D/g, '');
                elPhone.href = `https://wa.me/${sanitizedPhone}`;
                if (elPhoneText) elPhoneText.innerText = phone;
            }
            
            if (elInsta && instaUrl) elInsta.href = instaUrl;
            if (elPinterest && pinterestUrl) elPinterest.href = pinterestUrl;
            if (elLinkedin && linkedinUrl) elLinkedin.href = linkedinUrl;
            
            if (elFooter && footerRights) {
                // Determine if copyright symbol is already there, if not add it
                const formattedRights = footerRights.includes('©') || footerRights.includes('&copy;') 
                    ? footerRights 
                    : `&copy; ${footerRights}`;
                elFooter.innerHTML = formattedRights;
            }
            
        } catch(error) {
            console.error('Erro ao buscar dados de Contato:', error);
        }
    }

    function renderCarousel(projects) {
        const carousel = document.getElementById('projects-carousel');
        if (!carousel) return;

        projects.forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-img-wrapper" data-index="${index}">
                    <img src="${project.mainImg}" alt="${project.ambiente}" class="project-img" onerror="this.src='assets/portfolio/living_room.png'">
                </div>
                <div class="project-info">
                    <span class="project-label">Projeto</span>
                    <span class="project-value">${project.projeto}</span>
                    <span class="project-label">Localização</span>
                    <span class="project-value">${project.local}</span>
                    <span class="project-label">Ambiente</span>
                    <h3 class="project-ambiente">${project.ambiente}</h3>
                    <span class="project-label">Estilo de Design</span>
                    <p class="project-estilo">${project.estilo}</p>
                </div>
            `;
            carousel.appendChild(card);
            
            // Event delegation / direct binding instead of inline handlers
            const imgWrapper = card.querySelector('.project-img-wrapper');
            imgWrapper.addEventListener('click', () => openGallery(index));
        });

        initCarouselLogic();
    }

    function initCarouselLogic() {
        const track = document.getElementById('projects-carousel');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        const nextBtn = document.querySelector('.carousel-btn.next');

        if (!track || !prevBtn || !nextBtn) return;

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
                const cardWidth = cards.length > 0 ? cards[0].offsetWidth + gap : 0;
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

        // Touch Support for Swipe
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                nextBtn.click();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                prevBtn.click();
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            clearTimeout(window.resizeTimer);
            window.resizeTimer = setTimeout(updateCarousel, 250);
        });

        track.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
            card.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
        });
    }

    // ---- Gallery / Modal Logic ----
    function openGallery(projectIdx) {
        const project = allProjects[projectIdx];
        currentProjectImages = project.gallery;
        currentImageIndex = 0;

        const modal = document.getElementById('project-modal');
        const modalTitle = document.getElementById('modal-title');

        if (modal) {
            modal.style.display = "block";
            modalTitle.innerText = project.ambiente;
            updateModalImage();
        }
    }

    function updateModalImage() {
        const modalImg = document.getElementById('modal-img');
        const modalDesc = document.getElementById('modal-desc');
        const currentIdxEl = document.getElementById('current-img-idx');
        const totalCountEl = document.getElementById('total-img-count');

        const imageData = currentProjectImages[currentImageIndex];
        if (imageData && modalImg) {
            modalImg.src = imageData.url;
            modalDesc.innerText = imageData.desc;
            currentIdxEl.innerText = currentImageIndex + 1;
            totalCountEl.innerText = currentProjectImages.length;
        }
    }

    function flipPage(direction) {
        const activeImg = document.getElementById('modal-img');
        if (!activeImg || currentProjectImages.length < 2) return;

        const animationClass = direction === 'next' ? 'flip-right' : 'flip-left';
        activeImg.classList.add(animationClass);

        setTimeout(() => {
            if (direction === 'next') {
                currentImageIndex = (currentImageIndex + 1) % currentProjectImages.length;
            } else {
                currentImageIndex = (currentImageIndex - 1 + currentProjectImages.length) % currentProjectImages.length;
            }
            updateModalImage();
            activeImg.classList.remove(animationClass);
        }, 400);
    }

    function initModalLogic() {
        const nextBtn = document.getElementById('modal-next');
        const prevBtn = document.getElementById('modal-prev');
        if (nextBtn) nextBtn.onclick = () => flipPage('next');
        if (prevBtn) prevBtn.onclick = () => flipPage('prev');

        const closeBtn = document.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = function () {
                document.getElementById('project-modal').style.display = "none";
            }
        }

        window.addEventListener('click', function (event) {
            const modal = document.getElementById('project-modal');
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    // ---- Hero Puzzle Logic ----
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

    // ---- Window / Global Events ----
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - 150) {
                reveal.classList.add('active');
            }
        });
    }

    function initScrollEvents() {
        window.addEventListener('scroll', revealOnScroll);

        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (header) {
                if (window.scrollY > 50) header.classList.add('scrolled');
                else header.classList.remove('scrolled');
            }
        });
    }

    function initMobileMenu() {
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
    }

    // ---- Public API ----
    return {
        init: function() {
            initCursor();
            fetchProjects();
            fetchAbout();
            fetchServices();
            fetchContact();
            createHeroPuzzle();
            initModalLogic();
            initMobileMenu();
            initScrollEvents();
            // Trigger initially
            revealOnScroll();
        }
    };
})();

// Initialize the app on DOM loading
window.addEventListener('DOMContentLoaded', PortfolioApp.init);
