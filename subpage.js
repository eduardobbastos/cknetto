const SERVICES_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1TQ_xM-NIjgikHM4DHDJxQUtFQySUglSRVs-Dcqzfi7U/export?format=csv&gid=1540766818';

const SubpageApp = (() => {
    let cursor = null;
    let currentProjectImages = [];
    let currentImageIndex = 0;
    let currentSubpageGalleries = [];
    let currentGalleryIndex = 0;
    let currentSubpageTitle = "";

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
            
            const firstCols = rows[0];
            
            // Render menu items
            const tituloPag1 = firstCols[3] ? firstCols[3].trim().replace(/^"|"$/g, '') : '';
            const tituloPag2 = firstCols[11] ? firstCols[11].trim().replace(/^"|"$/g, '') : '';
            const menu1 = document.getElementById('submenu-pag1');
            const menu2 = document.getElementById('submenu-pag2');
            if (menu1 && tituloPag1) menu1.innerText = tituloPag1;
            if (menu2 && tituloPag2) menu2.innerText = tituloPag2;

            currentSubpageTitle = pageId === '1' ? tituloPag1 : tituloPag2;
            document.title = `${currentSubpageTitle} | cknetto interiores`;

            currentSubpageGalleries = [];
            
            rows.forEach(cols => {
                let desc = '';
                let photos = [];
                if (pageId === '1') {
                    if (cols.length >= 11) {
                        desc = cols[4] ? cols[4].trim().replace(/^"|"$/g, '') : '';
                        if (desc) {
                            photos.push({ url: cols[5], desc: cols[6] });
                            photos.push({ url: cols[7], desc: cols[8] });
                            photos.push({ url: cols[9], desc: cols[10] });
                            currentSubpageGalleries.push({ description: desc, photos: photos });
                        }
                    }
                } else {
                    if (cols.length >= 19) {
                        desc = cols[12] ? cols[12].trim().replace(/^"|"$/g, '') : '';
                        if (desc) {
                            photos.push({ url: cols[13], desc: cols[14] });
                            photos.push({ url: cols[15], desc: cols[16] });
                            photos.push({ url: cols[17], desc: cols[18] });
                            currentSubpageGalleries.push({ description: desc, photos: photos });
                        }
                    }
                }
            });

            currentGalleryIndex = 0;
            renderCurrentGallery();

        } catch (error) {
            console.error(error);
            document.getElementById('subpage-content').innerHTML = '<p>Erro ao carregar dados.</p>';
        }
    }

    function nextGallery() {
        if (currentGalleryIndex < currentSubpageGalleries.length - 1) {
            currentGalleryIndex++;
            renderCurrentGallery();
        }
    }

    function prevGallery() {
        if (currentGalleryIndex > 0) {
            currentGalleryIndex--;
            renderCurrentGallery();
        }
    }

    function renderCurrentGallery() {
        if (currentSubpageGalleries.length === 0) {
            document.getElementById('subpage-content').innerHTML = '<p>Nenhuma galeria encontrada para esta página.</p>';
            return;
        }

        const gallery = currentSubpageGalleries[currentGalleryIndex];
        const container = document.getElementById('subpage-content');
        const formattedDesc = gallery.description ? gallery.description.replace(/\n/g, '<br>') : '';
        const title = currentSubpageTitle;
        
        // Map current gallery images for the modal
        currentProjectImages = gallery.photos.map(photo => ({
            url: photo.url ? getDirectImageUrl(photo.url.trim().replace(/^"|"$/g, '')) : '',
            desc: photo.desc ? photo.desc.trim().replace(/^"|"$/g, '') : ''
        })).filter(photo => photo.url !== '' && photo.url !== 'assets/portfolio/living_room.png');
        
        let contentHtml = '';

        contentHtml += '<div class="timeline-container">';
        currentProjectImages.forEach((photo, index) => {
            const position = index % 2 === 0 ? 'left' : 'right';
            contentHtml += `
                <div class="timeline-item ${position}">
                    <div class="timeline-content">
                        <img src="${photo.url}" alt="${title} - Imagem ${index + 1}" onclick="SubpageApp.openGallery(${index})">
                        ${photo.desc ? `<div class="timeline-desc">${photo.desc}</div>` : ''}
                    </div>
                </div>
            `;
        });
        contentHtml += '</div>';

        let innerContent = '';
        if (currentSubpageGalleries.length > 1) {
            let navHtml = `
                <button class="gallery-side-btn prev" onclick="SubpageApp.prevGallery()" ${currentGalleryIndex === 0 ? 'disabled' : ''}>&#10094;</button>
                <button class="gallery-side-btn next" onclick="SubpageApp.nextGallery()" ${currentGalleryIndex === currentSubpageGalleries.length - 1 ? 'disabled' : ''}>&#10095;</button>
            `;
            
            innerContent = `
                <div class="gallery-nav-container">
                    ${navHtml}
                    ${contentHtml}
                </div>
                <div class="gallery-counter">Galeria ${currentGalleryIndex + 1} de ${currentSubpageGalleries.length}</div>
            `;
        } else {
            innerContent = contentHtml;
        }

        // Apply a quick animation reflow to show transition
        container.style.animation = 'none';
        container.offsetHeight; 
        container.style.animation = 'zoom 0.5s';

        container.innerHTML = `
            <h1 class="hero-title" style="margin-bottom: 30px;"><span>${title}</span></h1>
            <p class="subpage-description">${formattedDesc}</p>
            ${innerContent}
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
        openGallery: openGallery,
        nextGallery: nextGallery,
        prevGallery: prevGallery
    };
})();

window.addEventListener('DOMContentLoaded', SubpageApp.init);
