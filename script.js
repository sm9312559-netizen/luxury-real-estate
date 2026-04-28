// Initialize AOS Animation Library
AOS.init({
    duration: 800,
    easing: 'slide',
    once: true,
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Dynamic Data
    fetchData();

    // 2. Navigation Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });

    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // 4. Booking Form Submission
    const bookingForm = document.getElementById('booking-form');
    const successPopup = document.getElementById('success-popup');
    const closePopupBtn = document.querySelector('.close-popup');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate form submission to Formspree/EmailJS
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                bookingForm.reset();
                successPopup.classList.add('active');
            }, 1500);
        });
    }

    closePopupBtn.addEventListener('click', () => {
        successPopup.classList.remove('active');
    });

    // Close popup on outside click
    successPopup.addEventListener('click', (e) => {
        if (e.target === successPopup) {
            successPopup.classList.remove('active');
        }
    });
});

// Fetch Property Data
async function fetchData() {
    try {
        const response = await fetch('property.json');
        const data = await response.json();

        // Update Dynamic Title & Price
        document.querySelector('.hero-title').textContent = data.title;
        document.getElementById('dynamic-price').textContent = data.price;

        // Render Overview
        const overviewGrid = document.getElementById('overview-grid');
        data.overview.forEach((item, index) => {
            const delay = index * 100;
            overviewGrid.innerHTML += `
                <div class="overview-card" data-aos="fade-up" data-aos-delay="${delay}">
                    <i class="fa-solid ${item.icon}"></i>
                    <h3>${item.text}</h3>
                </div>
            `;
        });

        // Render Amenities
        const amenitiesGrid = document.getElementById('amenities-grid');
        data.amenities.forEach((item, index) => {
            const delay = index * 50;
            amenitiesGrid.innerHTML += `
                <div class="amenity-card" data-aos="fade-up" data-aos-delay="${delay}">
                    <i class="fa-solid ${item.icon}"></i>
                    <h4>${item.name}</h4>
                </div>
            `;
        });

        // Render Gallery
        const galleryContainer = document.getElementById('gallery-container');
        data.images.forEach((imgSrc, index) => {
            const delay = index * 100;
            galleryContainer.innerHTML += `
                <div class="gallery-item" data-aos="zoom-in" data-aos-delay="${delay}" onclick="openLightbox(${index})">
                    <img src="${imgSrc}" alt="Gallery Image ${index + 1}" loading="lazy">
                    <div class="gallery-overlay">
                        <i class="fa-solid fa-magnifying-glass-plus"></i>
                    </div>
                </div>
            `;
        });

        // Initialize Lightbox functionality with fetched images
        initLightbox(data.images);

    } catch (error) {
        console.error('Error fetching property data:', error);
    }
}

// Lightbox Logic
let currentImageIndex = 0;
let galleryImages = [];

function initLightbox(images) {
    galleryImages = images;
    
    const lightbox = document.getElementById('lightbox');
    const closeLightboxBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    closeLightboxBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex === 0) ? galleryImages.length - 1 : currentImageIndex - 1;
        updateLightboxImage();
    });

    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex === galleryImages.length - 1) ? 0 : currentImageIndex + 1;
        updateLightboxImage();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') lightbox.classList.remove('active');
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn.click();
    });
}

function openLightbox(index) {
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    updateLightboxImage();
    lightbox.classList.add('active');
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = galleryImages[currentImageIndex];
}
