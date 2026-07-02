document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // GUEST NAME DETECTION FROM URL
  // ==========================================================================
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to');
  const guestContainer = document.getElementById('guest-name');
  if (guestName && guestContainer) {
    guestContainer.textContent = decodeURIComponent(guestName.replace(/\+/g, ' '));
  }

  // ==========================================================================
  // COVER 1: SWIPE TO UNLOCK LOGIC
  // ==========================================================================
  const swipeTrack = document.getElementById('swipe-track');
  const swipeHandle = document.getElementById('swipe-handle');
  const cover1 = document.getElementById('cover-1');
  const cover2 = document.getElementById('cover-2');

  let isDragging = false;
  let startX = 0;
  let currentTranslateX = 0;
  let maxDistance = 0;

  // Function to calculate drag limit
  function updateMaxDistance() {
    maxDistance = swipeTrack.clientWidth - swipeHandle.clientWidth - 10;
  }
  updateMaxDistance();
  window.addEventListener('resize', updateMaxDistance);

  // Drag start
  function dragStart(e) {
    isDragging = true;
    startX = (e.type === 'touchstart') ? e.touches[0].clientX : e.clientX;
    swipeHandle.style.transition = 'none';
  }

  // Dragging
  function dragMove(e) {
    if (!isDragging) return;
    const currentX = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
    let diff = currentX - startX;
    
    // Constraint drag between 0 and maxDistance
    currentTranslateX = Math.max(0, Math.min(diff, maxDistance));
    swipeHandle.style.transform = `translateX(${currentTranslateX}px)`;

    // Visual effect: fade text opacity based on swipe progress
    const swipeText = swipeTrack.querySelector('.swipe-text');
    if (swipeText) {
      const opacity = 1 - (currentTranslateX / maxDistance);
      swipeText.style.opacity = Math.max(0.1, opacity);
    }
  }

  // Drag end
  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    // Check if swipe crossed 85% threshold
    if (currentTranslateX >= maxDistance * 0.85) {
      unlockCover1();
    } else {
      // Snap back
      swipeHandle.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      swipeHandle.style.transform = 'translateX(0)';
      const swipeText = swipeTrack.querySelector('.swipe-text');
      if (swipeText) swipeText.style.opacity = '1';
      currentTranslateX = 0;
    }
  }

  // Bind Mouse & Touch events
  swipeHandle.addEventListener('mousedown', dragStart);
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup', dragEnd);

  swipeHandle.addEventListener('touchstart', dragStart, { passive: true });
  window.addEventListener('touchmove', dragMove, { passive: true });
  window.addEventListener('touchend', dragEnd);

  // Function to transition from Cover 1 to Cover 2
  function unlockCover1() {
    cover1.classList.add('slide-up-exit');
    cover2.classList.remove('hidden');
    
    // Putar musik saat selesai menggeser tombol geser
    playMusic();
    
    // Remove Cover 1 from DOM after animation completed
    setTimeout(() => {
      cover1.style.display = 'none';
    }, 1000);
  }

  // ==========================================================================
  // COVER 2: BACKGROUND SLIDESHOW LOGIC
  // ==========================================================================
  const coverSlides = document.querySelectorAll('.cover-slide');
  let currentCoverSlide = 0;
  const coverSlideInterval = 4000; // Ganti slide setiap 4 detik

  if (coverSlides.length > 0) {
    setInterval(() => {
      coverSlides[currentCoverSlide].classList.remove('active');
      currentCoverSlide = (currentCoverSlide + 1) % coverSlides.length;
      coverSlides[currentCoverSlide].classList.add('active');
    }, coverSlideInterval);
  }

  // ==========================================================================
  // GLOBAL BACKGROUND SLIDESHOW LOGIC (g1 - g18)
  // ==========================================================================
  const globalSlides = document.querySelectorAll('.global-slide');
  let currentGlobalSlide = 0;
  const globalSlideInterval = 5000; // Ganti slide setiap 5 detik

  if (globalSlides.length > 0) {
    setInterval(() => {
      globalSlides[currentGlobalSlide].classList.remove('active');
      currentGlobalSlide = (currentGlobalSlide + 1) % globalSlides.length;
      globalSlides[currentGlobalSlide].classList.add('active');
    }, globalSlideInterval);
  }

  // ==========================================================================
  // COVER 2: OPEN INVITATION & MUSIC AUTOPLAY LOGIC
  // ==========================================================================
  const btnOpen = document.getElementById('btn-open-invitation');
  const mainInvitation = document.getElementById('main-invitation');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');

  btnOpen.addEventListener('click', () => {
    // 1. Play Background Music
    playMusic();
    
    // 2. Animate and exit Cover 2
    cover2.classList.add('slide-up-exit');
    
    // 3. Reveal Main content
    mainInvitation.classList.remove('hidden');
    mainInvitation.classList.add('active-invitation'); // Trigger CSS entrance animations
    musicToggle.classList.remove('hidden');
    
    // Initialize AOS after the elements are rendered and visible in the DOM
    setTimeout(() => {
      AOS.init({
        duration: 1400,
        once: false, // Animasi akan terus terpicu berulang kali
        mirror: true, // Animasi akan berputar balik saat di-scroll ke atas maupun ke bawah
        easing: 'ease-out-cubic'
      });
      cover2.style.display = 'none';
    }, 400); // 400ms is the sweet spot: elements are visible, and it initializes before the cover transition ends
  });

  // Music Playback functions
  function playMusic() {
    bgMusic.play()
      .then(() => {
        musicToggle.classList.add('playing');
        musicToggle.innerHTML = '<i class="fas fa-music"></i>';
      })
      .catch((error) => {
        console.log('Autoplay blocked by browser. User interaction needed to play audio.', error);
      });
  }

  function pauseMusic() {
    bgMusic.pause();
    musicToggle.classList.remove('playing');
    musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
  }

  // Toggle Music play/pause
  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  });

  // ==========================================================================
  // EVENT COUNTDOWN TIMER
  // ==========================================================================
  // Set wedding date: July 6, 2026 08:00:00 (Jakarta Time/WIB, UTC+7)
  const weddingDate = new Date('2026-07-06T08:00:00+07:00').getTime();

  const timerInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const zeroTime = '00';
    if (distance < 0) {
      clearInterval(timerInterval);
      // Update event countdown
      document.getElementById('days').textContent = zeroTime;
      document.getElementById('hours').textContent = zeroTime;
      document.getElementById('minutes').textContent = zeroTime;
      document.getElementById('seconds').textContent = zeroTime;
      
      // Update hero countdown
      const heroDays = document.getElementById('hero-days');
      if (heroDays) {
        heroDays.textContent = zeroTime;
        document.getElementById('hero-hours').textContent = zeroTime;
        document.getElementById('hero-minutes').textContent = zeroTime;
        document.getElementById('hero-seconds').textContent = zeroTime;
      }
      
      const countdownTitle = document.querySelector('.countdown-title');
      if (countdownTitle) countdownTitle.textContent = 'Acara Sedang Berlangsung / Telah Selesai';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dStr = String(days).padStart(2, '0');
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    // Update event countdown
    document.getElementById('days').textContent = dStr;
    document.getElementById('hours').textContent = hStr;
    document.getElementById('minutes').textContent = mStr;
    document.getElementById('seconds').textContent = sStr;

    // Update hero countdown
    const heroDays = document.getElementById('hero-days');
    if (heroDays) {
      heroDays.textContent = dStr;
      document.getElementById('hero-hours').textContent = hStr;
      document.getElementById('hero-minutes').textContent = mStr;
      document.getElementById('hero-seconds').textContent = sStr;
    }
  }, 1000);

  // ==========================================================================
  // PHOTO GALLERY LIGHTBOX POPUP
  // ==========================================================================
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxCaption = document.getElementById('lightbox-caption');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('.gallery-img');
      lightbox.style.display = 'block';
      lightboxImg.src = img.src;
      lightboxCaption.textContent = img.alt;
      document.body.style.overflow = 'hidden'; // Lock scrolling
    });
  });

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto'; // Unlock scrolling
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });

  // Close lightbox on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'block') {
      closeLightbox();
    }
  });

  // ==========================================================================
  // RSVP & WISHES GUESTBOOK (GOOGLE SHEETS INTEGRATION)
  // ==========================================================================
  // MASUKKAN URL DEPLOYMENT GOOGLE APPS SCRIPT WEB APP ANDA DI SINI:
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwLeaIys4hMYt5ydmC6Cep-qM36l2ZhJji3RbSqbd63e0jjDwA9yfbS3spHd8myaBpe/exec';
  const rsvpForm = document.getElementById('rsvp-form');
  const wishesListContainer = document.getElementById('wishes-list-container');
  const wishCountSpan = document.getElementById('wish-count');

  // Pre-load default aesthetic wishes if database is empty or connection fails
  const defaultWishes = [
    {
      name: "Rian & Keluarga",
      status: "Hadir",
      message: "Selamat Ucil dan Ainun! Semoga pernikahan kalian dipenuhi berkah, dilancarkan acaranya, dan menjadi keluarga yang sakinah, mawaddah, warahmah. Amin!",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      name: "Siti Rahma",
      status: "Hadir",
      message: "Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khair. Cantik sekali Ainun! Bahagia selalu ya sampai kakek nenek.",
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    },
    {
      name: "Dodi Kurniawan",
      status: "Tidak Hadir",
      message: "Selamat ya Ucil dan Ainun. Mohon maaf belum bisa hadir secara langsung karena sedang bertugas di luar kota. Doa terbaik untuk kalian berdua!",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
    }
  ];

  // Fetch all wishes
  async function getWishes() {
    if (!SCRIPT_URL) {
      // Fallback ke LocalStorage jika URL belum diisi
      const stored = localStorage.getItem('ucil_ainun_wishes');
      if (!stored) {
        localStorage.setItem('ucil_ainun_wishes', JSON.stringify(defaultWishes));
        return defaultWishes;
      }
      return JSON.parse(stored);
    }

    try {
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return data.length > 0 ? data : defaultWishes;
    } catch (error) {
      console.error('Gagal mengambil data dari Google Sheets, menggunakan fallback:', error);
      const stored = localStorage.getItem('ucil_ainun_wishes');
      return stored ? JSON.parse(stored) : defaultWishes;
    }
  }

  // Save a new wish
  async function saveWish(newWish) {
    if (!SCRIPT_URL) {
      // Fallback ke LocalStorage jika URL belum diisi
      const wishes = JSON.parse(localStorage.getItem('ucil_ainun_wishes') || '[]');
      wishes.push(newWish);
      localStorage.setItem('ucil_ainun_wishes', JSON.stringify(wishes));
      return true;
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: newWish.name,
          status: newWish.status,
          message: newWish.message
        })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      return result.result === 'success';
    } catch (error) {
      console.error('Gagal mengirim ke Google Sheets:', error);
      return false;
    }
  }

  // Render wishes into the container
  async function renderWishes() {
    wishesListContainer.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-spinner fa-spin" style="font-size: 1.8rem; color: var(--primary-color, #c5a880);"></i>
        <p class="text-muted mt-2" style="font-size: 0.9rem;">Memuat ucapan...</p>
      </div>
    `;

    const wishes = await getWishes();
    
    // Sort wishes: newest first
    wishes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    wishCountSpan.textContent = wishes.length;

    if (wishes.length === 0) {
      wishesListContainer.innerHTML = `
        <div class="wish-item empty-state text-center py-4">
          <p class="text-muted">Belum ada ucapan. Jadilah yang pertama!</p>
        </div>
      `;
      return;
    }

    wishesListContainer.innerHTML = wishes.map(wish => {
      // Format timestamp elegantly
      const wishDate = new Date(wish.timestamp);
      const timeStr = isNaN(wishDate.getTime()) ? 'Baru saja' : wishDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Format status classes
      let statusClass = 'ragu';
      if (wish.status === 'Hadir') statusClass = 'hadir';
      if (wish.status === 'Tidak Hadir') statusClass = 'tidak-hadir';

      return `
        <div class="wish-item">
          <div class="wish-header">
            <span class="wish-name">${escapeHTML(wish.name)}</span>
            <span class="wish-status ${statusClass}">${wish.status}</span>
          </div>
          <p class="wish-text">${escapeHTML(wish.message)}</p>
          <span class="wish-time">${timeStr}</span>
        </div>
      `;
    }).join('');
  }

  // Form submission handler
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('input-name');
      const statusInput = document.getElementById('input-status');
      const messageInput = document.getElementById('input-message');
      const submitBtn = rsvpForm.querySelector('button[type="submit"]');

      const newWish = {
        name: nameInput.value.trim(),
        status: statusInput.value,
        message: messageInput.value.trim(),
        timestamp: new Date().toISOString()
      };

      if (!newWish.name || !newWish.status || !newWish.message) return;

      // Disable button & show loading state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

      const success = await saveWish(newWish);

      if (success) {
        rsvpForm.reset();
        await renderWishes();
        
        const wishesTitle = document.querySelector('.wishes-title');
        if (wishesTitle) {
          wishesTitle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        alert('Gagal mengirim ucapan. Silakan coba beberapa saat lagi.');
      }

      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    });
  }

  // Simple HTML Escaping for security
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Initial load of guestbook
  renderWishes();
});

// ==========================================================================
// COPY ACCOUNT NUMBER TO CLIPBOARD
// ==========================================================================
function copyAccountNumber(elementId, buttonElement) {
  const numberText = document.getElementById(elementId).textContent;
  
  // Clean special characters if any
  const cleanNumber = numberText.replace(/[^0-9-]/g, '');
  
  navigator.clipboard.writeText(cleanNumber).then(() => {
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
    buttonElement.style.borderColor = '#2E7D32';
    buttonElement.style.color = '#2E7D32';
    
    setTimeout(() => {
      buttonElement.innerHTML = originalText;
      buttonElement.style.borderColor = '';
      buttonElement.style.color = '';
    }, 2000);
  }).catch(err => {
    console.error('Gagal menyalin rekening: ', err);
  });
}
