// Initialize AOS Animation Library
AOS.init({
    duration: 800,
    easing: 'slide',
    once: true,
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Dynamic Data
    fetchData();
    fetchProperties();

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
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

            // EmailJS Integration setup for samimmobile@gmail.com
            // Ensure you create a Service and Template in EmailJS
            const templateParams = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                message: document.getElementById('message').value,
                to_email: 'samimmobile@gmail.com'
            };

            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
                .then(function(response) {
                    submitBtn.innerHTML = originalText;
                    bookingForm.reset();
                    successPopup.classList.add('active');
                }, function(error) {
                    submitBtn.innerHTML = originalText;
                    alert('Failed to send request. Please try again.');
                    console.error('EmailJS Error:', error);
                });
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

// Fetch Multiple Properties
async function fetchProperties() {
    try {
        const response = await fetch('properties.json');
        const properties = await response.json();
        
        const villasGrid = document.getElementById('villas-grid');
        if (!villasGrid) return;
        
        properties.forEach((villa, index) => {
            const delay = index * 100;
            // The WhatsApp message template
            const message = encodeURIComponent(`Hi Samim, I am interested in ${villa.name}. Can we schedule a visit?`);
            // Add your WhatsApp number here (e.g. 919876543210)
            const whatsappLink = `https://wa.me/1234567890?text=${message}`; 
            
            villasGrid.innerHTML += `
                <div class="villa-card" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="villa-img-container" onclick="openPropertyLightbox('${villa.image}')">
                        <div class="villa-badge">For Sale</div>
                        <img src="${villa.image}" alt="${villa.name}" loading="lazy">
                    </div>
                    <div class="villa-details">
                        <div class="villa-price">${villa.price}</div>
                        <h3 class="villa-name">${villa.name}</h3>
                        <div class="villa-location">
                            <i class="fa-solid fa-location-dot"></i> ${villa.location}
                        </div>
                        <div class="villa-stats">
                            <div class="stat">
                                <span class="stat-value">${villa.bhk}</span>
                                <span class="stat-label">BHK</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${villa.sqft}</span>
                                <span class="stat-label">Sqft</span>
                            </div>
                        </div>
                        <a href="${whatsappLink}" target="_blank" class="btn btn-whatsapp btn-block" style="margin-top: 15px;">
                            <i class="fa-brands fa-whatsapp"></i> Schedule a Visit
                        </a>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
    }
}

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
    
    // Show arrows for gallery
    document.querySelector('.lightbox-prev').style.display = 'block';
    document.querySelector('.lightbox-next').style.display = 'block';
    
    updateLightboxImage();
    lightbox.classList.add('active');
}

function openPropertyLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    // Hide arrows for single image preview
    document.querySelector('.lightbox-prev').style.display = 'none';
    document.querySelector('.lightbox-next').style.display = 'none';
    
    lightboxImg.src = imgSrc;
    lightbox.classList.add('active');
}

function updateLightboxImage() {
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = galleryImages[currentImageIndex];
}
