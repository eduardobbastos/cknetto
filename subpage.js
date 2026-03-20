const SERVICES_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1TQ_xM-NIjgikHM4DHDJxQUtFQySUglSRVs-Dcqzfi7U/export?format=csv&gid=1540766818';

const SubpageApp = (() => {
    let cursor = null;
    let currentProjectImages = [];
    let currentImageIndex = 0;

    function initCursor() {
        cursor = document.querySelector('.custom-cursor');
        document.addEventListener('mousemove', (e) => {
            if (cursor) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }
        });
    }

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

    async function loadSubpageData() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageId = urlParams.get('page') || '1';

        try {
            const response = await fetch(SERVICES_SHEETS_URL);
            const data = await response.text();
            
            const rows = parseCSV(data).slice(1);
            if (rows.length === 0) return;
            
            const cols = rows[0];
            
            // Render menu items
            const tituloPag1 = cols[3] ? cols[3].trim().replace(/^"|"$/g, '') : '';
            const tituloPag2 = cols[11] ? cols[11].trim().replace(/^"|"$/g, '') : ''; // Changed from 10 to 11 due to new col
            const menu1 = document.getElementById('submenu-pag1');
            const menu2 = document.getElementById('submenu-pag2');
            if (menu1 && tituloPag1) menu1.innerText = tituloPag1;
            if (menu2 && tituloPag2) menu2.innerText = tituloPag2;

            // Page settings mapped to appropriate indices
            let title, description;
            let photos = [];

            if (pageId === '1') {
                document.title = `${tituloPag1} | cknetto interiores`;
                title = tituloPag1;
                description = cols[4] ? cols[4].trim().replace(/^"|"$/g, '') : '';
                photos.push({ url: cols[5], desc: cols[6] });
                photos.push({ url: cols[7], desc: cols[8] });
                photos.push({ url: cols[9], desc: cols[10] }); // Added col 10 mapping
            } else {
                document.title = `${tituloPag2} | cknetto interiores`;
                title = tituloPag2;
                description = cols[12] ? cols[12].trim().replace(/^"|"$/g, '') : '';
                photos.push({ url: cols[13], desc: cols[14] });
                photos.push({ url: cols[15], desc: cols[16] });
                photos.push({ url: cols[17], desc: cols[18] });
            }

            renderPage(title, description, photos);

        } catch (error) {
            console.error(error);
            document.getElementById('subpage-content').innerHTML = '<p>Erro ao carregar dados.</p>';
        }
    }

    function renderPage(title, description, photos) {
        const container = document.getElementById('subpage-content');
        const formattedDesc = description ? description.replace(/\n/g, '<br>') : '';
        
        // Map current gallery images for the modal
        currentProjectImages = photos.map(photo => ({
            url: photo.url ? getDirectImageUrl(photo.url.trim().replace(/^"|"$/g, '')) : '',
            desc: photo.desc ? photo.desc.trim().replace(/^"|"$/g, '') : ''
        })).filter(photo => photo.url !== '' && photo.url !== 'assets/portfolio/living_room.png');
        
        let galleryHtml = '<div class="gallery-grid">';
        currentProjectImages.forEach((photo, index) => {
            galleryHtml += `
                <div class="gallery-item" onclick="SubpageApp.openGallery(${index})" style="cursor: zoom-in;">
                    <img src="${photo.url}" alt="${photo.desc || title}">
                    ${photo.desc ? `<div class="gallery-desc">${photo.desc}</div>` : ''}
                </div>
            `;
        });
        galleryHtml += '</div>';

        container.innerHTML = `
            <h1 class="hero-title" style="margin-bottom: 30px;"><span>${title}</span></h1>
            <p class="subpage-description">${formattedDesc}</p>
            ${galleryHtml}
        `;
    }

    // ---- Gallery / Modal Logic ----
    function openGallery(idx) {
        if (currentProjectImages.length === 0) return;
        currentImageIndex = idx;

        const modal = document.getElementById('project-modal');
        const modalTitle = document.getElementById('modal-title');
        const container = document.getElementById('subpage-content');

        if (modal) {
            modal.style.display = "block";
            const currentTitle = container.querySelector('.hero-title span').innerText;
            modalTitle.innerText = currentTitle;
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

    return {
        init: function() {
            initCursor();
            initMobileMenu();
            initModalLogic();
            loadSubpageData();
            
            // Hover states
            document.querySelectorAll('.nav-link, .dropdown-link').forEach(el => {
                el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
                el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
            });
        },
        openGallery: openGallery
    };
})();

window.addEventListener('DOMContentLoaded', SubpageApp.init);
