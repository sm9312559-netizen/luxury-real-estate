// Initialize AOS
AOS.init({
    duration: 1000,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50
});

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.querySelector('.loader-wrapper');
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 800);
    }, 1500);
});

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.querySelector('.scroll-progress').style.width = scrolled + '%';
});

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    fetchPropertyData();
    setupNavigation();
    setupBookingForm();
    setupCurrencySwitcher();
});

// Setup Navigation & Mobile Menu
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeMenu = document.querySelector('.close-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    menuToggle.addEventListener('click', () => mobileMenu.classList.add('active'));
    closeMenu.addEventListener('click', () => mobileMenu.classList.remove('active'));
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('active'));
    });
}

// Fetch Property Data from JSON
let basePriceUSD = 25000000;
let formattedPrice = "Starting From $2.5 Million"; // Default

async function fetchPropertyData() {
    try {
        const response = await fetch('property.json');
        const data = await response.json();

        // Populate Text Data
        document.getElementById('dynamic-title').textContent = data.title;
        document.getElementById('dynamic-price').textContent = data.price;
        document.getElementById('dynamic-desc').textContent = data.description;
        document.getElementById('dynamic-location').textContent = data.location;
        
        document.getElementById('stat-rooms').textContent = `${data.rooms} Bedrooms`;
        document.getElementById('stat-baths').textContent = `${data.baths} Bathrooms`;
        document.getElementById('stat-sqft').textContent = `${data.sqft} Sqft`;

        basePriceUSD = data.price_usd || 25000000;

        // Populate Floor Plan & Agent
        if (data.floor_plan) document.getElementById('dynamic-floorplan').src = data.floor_plan;
        if (data.agent_profile) document.getElementById('dynamic-agent').src = data.agent_profile;

        // Populate Amenities
        const amenitiesGrid = document.getElementById('amenities-grid');
        amenitiesGrid.innerHTML = '';
        data.amenities.forEach((item, index) => {
            const delay = index * 50;
            amenitiesGrid.innerHTML += `
                <div class="amenity-card" data-aos="fade-up" data-aos-delay="${delay}">
                    <i class="fa-solid ${item.icon}"></i>
                    <h4>${item.name}</h4>
                </div>
            `;
        });

        // Populate Gallery
        const galleryContainer = document.getElementById('gallery-container');
        galleryContainer.innerHTML = '';
        data.images.forEach((imgSrc, index) => {
            const delay = index * 100;
            galleryContainer.innerHTML += `
                <div class="gallery-item" data-aos="zoom-in" data-aos-delay="${delay}" onclick="openLightbox(${index})">
                    <img src="${imgSrc}" alt="Gallery Image ${index + 1}" loading="lazy">
                    <div class="gallery-overlay"><i class="fa-solid fa-expand"></i></div>
                </div>
            `;
        });

        initLightbox(data.images);

    } catch (error) {
        console.error('Error fetching property data:', error);
    }
}

// Currency Switcher
function setupCurrencySwitcher() {
    const switcher = document.getElementById('currency-switcher');
    const priceEl = document.getElementById('dynamic-price');
    
    const rates = { USD: 1, AED: 3.67, EUR: 0.92 };
    const symbols = { USD: '$', AED: 'AED ', EUR: '€' };

    switcher.addEventListener('change', (e) => {
        const currency = e.target.value;
        const converted = basePriceUSD * rates[currency];
        
        // Format to millions
        const inMillions = (converted / 1000000).toFixed(1);
        priceEl.textContent = `Starting From ${symbols[currency]}${inMillions} Million`;
        
        // Flash animation
        priceEl.style.opacity = 0;
        setTimeout(() => { priceEl.style.opacity = 1; }, 300);
    });
}

// Mortgage Calculator
function calculateMortgage() {
    const price = basePriceUSD;
    const dpPercent = parseFloat(document.getElementById('down-payment').value) / 100;
    const rate = parseFloat(document.getElementById('interest-rate').value) / 100 / 12;
    const years = parseInt(document.getElementById('loan-term').value);
    const months = years * 12;

    const principal = price - (price * dpPercent);
    let monthly = 0;

    if (rate === 0) {
        monthly = principal / months;
    } else {
        monthly = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1);
    }

    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    document.getElementById('calc-result').innerHTML = `Est. Monthly: <strong>${formatter.format(monthly)}</strong>`;
}

// Lightbox Logic
let currentImageIndex = 0;
let galleryImages = [];

function initLightbox(images) {
    galleryImages = images;
    
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex === 0) ? galleryImages.length - 1 : currentImageIndex - 1;
        updateLightboxImage();
    });
    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex === galleryImages.length - 1) ? 0 : currentImageIndex + 1;
        updateLightboxImage();
    });

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
    document.querySelector('.lightbox-prev').style.display = 'block';
    document.querySelector('.lightbox-next').style.display = 'block';
    updateLightboxImage();
    lightbox.classList.add('active');
}

function openPropertyLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    document.querySelector('.lightbox-prev').style.display = 'none';
    document.querySelector('.lightbox-next').style.display = 'none';
    lightboxImg.src = imgSrc;
    lightbox.classList.add('active');
}

function updateLightboxImage() {
    document.getElementById('lightbox-img').src = galleryImages[currentImageIndex];
}

// Booking Form setup (EmailJS)
function setupBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    const successPopup = document.getElementById('success-popup');
    const closePopupBtn = document.querySelector('.close-popup');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

            const templateParams = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                message: document.getElementById('message').value,
                to_email: 'samimmobile@gmail.com'
            };

            // NOTE: Replace with actual Service & Template IDs
            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
                .then(function(response) {
                    submitBtn.innerHTML = originalText;
                    bookingForm.reset();
                    successPopup.classList.add('active');
                }, function(error) {
                    // Fallback simulation if keys not set
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        bookingForm.reset();
                        successPopup.classList.add('active');
                        console.log('Simulation: Success (EmailJS not configured)');
                    }, 1000);
                });
        });
    }

    closePopupBtn.addEventListener('click', () => successPopup.classList.remove('active'));
    successPopup.addEventListener('click', (e) => {
        if (e.target === successPopup) successPopup.classList.remove('active');
    });
}
