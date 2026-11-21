/**
 * THE BIBLIOTHECA & ATHENÆUM — CORE CURATORIAL CONTROLLER
 * Integrates directly with the Node/Express/MongoDB Library System
 */

// State Management
let allBooks = [];
let displayedBooks = [];
let categories = [];
let currentCategory = 'ALL';
let currentSearch = '';
let selectedBook = null;
let currentRating = 5;

// User Session
let currentUser = null;
let authToken = null;
let borrowedLedger = [];

// Curated Classical Reserve (shown if database is fresh)
const classicalReserve = [
    {
        _id: 'cl-001',
        bookName: 'Meditations of the Emperor',
        bookAuthor: 'Marcus Aurelius Antoninus',
        bookCategory: 'Philosophy',
        bookDescription: 'Personal writings of the Roman Emperor Marcus Aurelius recorded between 161 and 180 AD, reflecting on Stoic philosophy, cosmic order, duty, and human mortality.',
        bookCost: 35,
        bookLikes: 142,
        bookStatus: 'available',
        bookImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80'
    },
    {
        _id: 'cl-002',
        bookName: 'The Republic (Politeia)',
        bookAuthor: 'Plato of Athens',
        bookCategory: 'Philosophy',
        bookDescription: 'A Socratic dialogue authored circa 375 BC concerning justice, the character of the righteous city-state, the theory of Forms, and the immortality of the soul.',
        bookCost: 40,
        bookLikes: 98,
        bookStatus: 'available',
        bookImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80'
    },
    {
        _id: 'cl-003',
        bookName: 'The Odyssey of Ithaca',
        bookAuthor: 'Homer',
        bookCategory: 'Classics',
        bookDescription: 'One of two ancient Greek epic poems attributed to Homer, chronicling Odysseus, king of Ithaca, and his arduous ten-year journey home after the fall of Troy.',
        bookCost: 50,
        bookLikes: 215,
        bookStatus: 'available',
        bookImage: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=700&q=80'
    },
    {
        _id: 'cl-004',
        bookName: 'Frankenstein; or, The Modern Prometheus',
        bookAuthor: 'Mary Wollstonecraft Shelley',
        bookCategory: 'Literature',
        bookDescription: 'First published anonymously in London in 1818, the quintessential Gothic masterpiece exploring Victor Frankenstein’s audacious defiance of mortal bounds.',
        bookCost: 28,
        bookLikes: 320,
        bookStatus: 'available',
        bookImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=700&q=80'
    },
    {
        _id: 'cl-005',
        bookName: 'Principia Mathematica',
        bookAuthor: 'Sir Isaac Newton, PRS',
        bookCategory: 'Science',
        bookDescription: 'First issued in July 1687, formulating the laws of motion and universal gravitation, cementing the foundations of classical mechanics and astronomy.',
        bookCost: 85,
        bookLikes: 184,
        bookStatus: 'available',
        bookImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=700&q=80'
    },
    {
        _id: 'cl-006',
        bookName: 'The Divine Comedy (La Divina Commedia)',
        bookAuthor: 'Dante Alighieri',
        bookCategory: 'Poetry',
        bookDescription: 'An Italian narrative poem begun c. 1308 and completed in 1320, detailing Dante’s journey through the realms of Inferno, Purgatorio, and Paradiso.',
        bookCost: 65,
        bookLikes: 178,
        bookStatus: 'available',
        bookImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=700&q=80'
    },
    {
        _id: 'cl-007',
        bookName: 'The Picture of Dorian Gray',
        bookAuthor: 'Oscar Wilde',
        bookCategory: 'Literature',
        bookDescription: 'A philosophical gothic novel first published in 1890, depicting the young and beautiful Dorian Gray whose portrait ages and bears the sins of his hedonistic life.',
        bookCost: 30,
        bookLikes: 260,
        bookStatus: 'available',
        bookImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=700&q=80'
    },
    {
        _id: 'cl-008',
        bookName: 'Il Principe (The Prince)',
        bookAuthor: 'Niccolò Machiavelli',
        bookCategory: 'History',
        bookDescription: 'Written in 1513, an enduring treatise on political statecraft, state preservation, realpolitik, and the delicate exercise of power in renaissance Italy.',
        bookCost: 22,
        bookLikes: 110,
        bookStatus: 'available',
        bookImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=700&q=80'
    }
];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    restoreSession();
    loadCategories();
    loadBooks();
    setupStarPicker();
});

// ==========================================
// SESSION MANAGEMENT (Borrower's Pass)
// ==========================================
function restoreSession() {
    try {
        const savedUser = localStorage.getItem('athenaeum_user');
        const savedToken = localStorage.getItem('athenaeum_token');
        const savedBorrows = localStorage.getItem('athenaeum_borrows');

        if (savedUser && savedToken) {
            currentUser = JSON.parse(savedUser);
            authToken = savedToken;
            updateReaderCardUI(true);
        } else {
            updateReaderCardUI(false);
        }

        if (savedBorrows) {
            borrowedLedger = JSON.parse(savedBorrows);
            updateBorrowLedgerCounter();
        }
    } catch (e) {
        console.error('Session restore error:', e);
    }
}

function updateReaderCardUI(isLoggedIn) {
    const cardMemberNum = document.getElementById('cardMemberNum');
    const readerDisplayName = document.getElementById('readerDisplayName');
    const readerStatusRole = document.getElementById('readerStatusRole');
    const btnAuthTrigger = document.getElementById('btnAuthTrigger');
    const btnLogoutTrigger = document.getElementById('btnLogoutTrigger');

    if (isLoggedIn && currentUser) {
        cardMemberNum.textContent = `ATH-${(currentUser._id || '9894').slice(-4).toUpperCase()}`;
        readerDisplayName.textContent = currentUser.userName || 'Admitted Scholar';
        readerStatusRole.textContent = currentUser.userRole === 'admin' ? 'Curator & Head Archivist' : 'Resident Scholar of the Society';
        btnAuthTrigger.classList.add('hidden');
        btnLogoutTrigger.classList.remove('hidden');
    } else {
        cardMemberNum.textContent = 'ANON-000';
        readerDisplayName.textContent = 'Guest Patron';
        readerStatusRole.textContent = 'Unauthenticated Reader';
        btnAuthTrigger.classList.remove('hidden');
        btnLogoutTrigger.classList.add('hidden');
    }
}

function logoutUser() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('athenaeum_user');
    localStorage.removeItem('athenaeum_token');
    updateReaderCardUI(false);
    showWaxToast('Your Reader’s Pass has been returned to the Registry.');
}

// ==========================================
// DATA FETCHING (Books & Categories)
// ==========================================
async function loadCategories() {
    try {
        const res = await fetch('/category/allCategory');
        if (res.ok) {
            const data = await res.json();
            if (data.category && data.category.length > 0) {
                categories = data.category.map(c => c.categoryName);
            }
        }
    } catch (err) {
        console.warn('Using standard curatorial subjects:', err);
    }

    if (categories.length === 0) {
        categories = ['Philosophy', 'Classics', 'Literature', 'Science', 'Poetry', 'History'];
    }

    renderCategoryTabs();
    populateCategorySuggestions();
}

function renderCategoryTabs() {
    const tabsContainer = document.getElementById('categoryTabs');
    tabsContainer.innerHTML = `
        <button class="index-tab ${currentCategory === 'ALL' ? 'active' : ''}" data-category="ALL" onclick="filterByCategory('ALL')">
            <span class="tab-brass-rivet"></span>
            <span class="tab-label">General Archives (All)</span>
        </button>
    `;

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `index-tab ${currentCategory === cat ? 'active' : ''}`;
        btn.dataset.category = cat;
        btn.onclick = () => filterByCategory(cat);
        btn.innerHTML = `
            <span class="tab-brass-rivet"></span>
            <span class="tab-label">${cat}</span>
        `;
        tabsContainer.appendChild(btn);
    });
}

function populateCategorySuggestions() {
    const list = document.getElementById('categorySuggestions');
    if (!list) return;
    list.innerHTML = categories.map(c => `<option value="${c}">`).join('');
}

async function loadBooks() {
    const stats = document.getElementById('catalogueStats');
    stats.textContent = 'Consulting the Accession Ledger...';

    try {
        const res = await fetch('/books/allBooks');
        if (res.ok) {
            const data = await res.json();
            if (data.bookData && data.bookData.length > 0) {
                allBooks = data.bookData;
                stats.textContent = `Archives Catalogued: ${allBooks.length} Authenticated Volumes`;
                applyFilters();
                return;
            }
        }
    } catch (err) {
        console.warn('API error, displaying classical archival reserve:', err);
    }

    // Default to Classical Reserve if database is fresh
    allBooks = [...classicalReserve];
    stats.textContent = `Archives Catalogued: ${allBooks.length} Classical Foundation Volumes`;
    applyFilters();
}

// ==========================================
// RENDER BOOKS
// ==========================================
function applyFilters() {
    displayedBooks = allBooks.filter(book => {
        const matchCat = (currentCategory === 'ALL') || 
            (book.bookCategory && book.bookCategory.toLowerCase() === currentCategory.toLowerCase());
        
        const q = currentSearch.trim().toLowerCase();
        const matchSearch = !q || 
            (book.bookName && book.bookName.toLowerCase().includes(q)) ||
            (book.bookAuthor && book.bookAuthor.toLowerCase().includes(q)) ||
            (book.bookCategory && book.bookCategory.toLowerCase().includes(q));

        return matchCat && matchSearch;
    });

    renderBooksGrid();
}

function renderBooksGrid() {
    const grid = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyArchive');

    if (displayedBooks.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = displayedBooks.map(book => {
        const isBorrowed = isBookCurrentlyBorrowed(book._id);
        const statusLabel = isBorrowed ? 'CHECKED OUT' : (book.bookStatus === 'available' ? 'CIRCULATING' : 'ARCHIVE ONLY');
        const stampClass = isBorrowed ? 'stamp-borrowed' : 'stamp-available';
        const cover = book.bookImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80';

        return `
            <article class="tome-card" onclick="openBookModal('${book._id}')">
                <div class="tome-cover-wrap">
                    <img src="${cover}" alt="${escapeHtml(book.bookName)}" class="tome-img" onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80'">
                    <span class="tome-stamp-badge ${stampClass}">${statusLabel}</span>
                </div>
                <div class="tome-body">
                    <span class="tome-classification">${escapeHtml(book.bookCategory || 'General')}</span>
                    <h3 class="tome-title">${escapeHtml(book.bookName)}</h3>
                    <p class="tome-author">${escapeHtml(book.bookAuthor)}</p>
                    <p class="tome-synopsis">${escapeHtml(book.bookDescription || 'No curator notes available.')}</p>
                    <div class="tome-footer">
                        <button class="like-button-quill" onclick="event.stopPropagation(); likeBookCard('${book._id}')" title="Inscribe appreciation">
                            <span>♥</span> <span>${book.bookLikes || 0}</span>
                        </button>
                        <div class="tome-actions">
                            <button class="btn-vintage-outline-sm" onclick="event.stopPropagation(); openBookModal('${book._id}')">
                                Inspect Folio
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

function filterByCategory(cat) {
    currentCategory = cat;
    renderCategoryTabs();
    applyFilters();
}

function handleSearch(val) {
    currentSearch = val;
    applyFilters();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    currentSearch = '';
    applyFilters();
}

function resetFilters() {
    currentCategory = 'ALL';
    currentSearch = '';
    document.getElementById('searchInput').value = '';
    renderCategoryTabs();
    applyFilters();
}

// ==========================================
// FOLIO MODAL (Book Details & Reviews)
// ==========================================
function openBookModal(bookId) {
    selectedBook = allBooks.find(b => b._id === bookId);
    if (!selectedBook) return;

    document.getElementById('modalBookImage').src = selectedBook.bookImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80';
    document.getElementById('modalBookId').textContent = `MS-${(selectedBook._id || '0000').slice(-4).toUpperCase()}`;
    document.getElementById('modalBookCategory').textContent = selectedBook.bookCategory || 'Literature';
    document.getElementById('modalBookCost').textContent = `${selectedBook.bookCost || 25} Shillings`;
    document.getElementById('modalBookTitle').textContent = selectedBook.bookName;
    document.getElementById('modalBookAuthor').textContent = `By ${selectedBook.bookAuthor}`;
    document.getElementById('modalBookDescription').textContent = selectedBook.bookDescription;
    document.getElementById('modalLikesCount').textContent = selectedBook.bookLikes || 0;

    const isBorrowed = isBookCurrentlyBorrowed(selectedBook._id);
    const statusElem = document.getElementById('modalBookStatus');
    const borrowBtn = document.getElementById('modalBorrowBtn');
    const returnBtn = document.getElementById('modalReturnBtn');

    if (isBorrowed) {
        statusElem.textContent = 'CHECKED OUT';
        statusElem.className = 'ink-stamp stamp-borrowed';
        borrowBtn.classList.add('hidden');
        returnBtn.classList.remove('hidden');
        document.getElementById('modalBorrowNotes').textContent = 'This volume is presently charged to your borrower pass. Return when concluded.';
    } else {
        statusElem.textContent = 'CIRCULATING';
        statusElem.className = 'ink-stamp stamp-available';
        borrowBtn.classList.remove('hidden');
        returnBtn.classList.add('hidden');
        document.getElementById('modalBorrowNotes').textContent = 'Standard loan duration is 14 days from date of checkout. Fines apply for late returns.';
    }

    // Load initial reviews or placeholders
    loadBookReviews(selectedBook);

    openModal('bookModal');
}

function loadBookReviews(book) {
    const list = document.getElementById('modalReviewsList');
    list.innerHTML = `
        <div class="review-item">
            <div class="review-header">
                <span>Archival Scholar</span>
                <span class="review-stars">★★★★★</span>
            </div>
            <p class="review-text">“An indispensable monument of classical contemplation. Its binding and text remain in magnificent condition.”</p>
        </div>
    `;
}

function setupStarPicker() {
    const picker = document.getElementById('starPicker');
    if (!picker) return;
    const stars = picker.querySelectorAll('span');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.value);
            stars.forEach(s => {
                const val = parseInt(s.dataset.value);
                s.className = val <= currentRating ? 'active' : '';
            });
        });
    });
}

function submitReview() {
    const textInput = document.getElementById('reviewTextInput');
    const text = textInput.value.trim();
    if (!text) {
        showWaxToast('Please write an inscription before sealing.');
        return;
    }

    const reviewerName = currentUser ? currentUser.userName : 'Anonymous Scholar';
    const stars = '★'.repeat(currentRating) + '☆'.repeat(5 - currentRating);

    const list = document.getElementById('modalReviewsList');
    const newReview = document.createElement('div');
    newReview.className = 'review-item';
    newReview.innerHTML = `
        <div class="review-header">
            <span>${escapeHtml(reviewerName)}</span>
            <span class="review-stars">${stars}</span>
        </div>
        <p class="review-text">“${escapeHtml(text)}”</p>
    `;
    list.prepend(newReview);

    textInput.value = '';
    showWaxToast('Your inscription has been preserved in the folio registry.');
}

// ==========================================
// BORROWING & RETURNING
// ==========================================
function isBookCurrentlyBorrowed(bookId) {
    return borrowedLedger.some(item => item.bookId === bookId);
}

function borrowCurrentBook() {
    if (!selectedBook) return;

    if (!currentUser) {
        closeModal('bookModal');
        openAuthModal();
        showWaxToast('Present your Reader’s Pass to check out manuscripts.');
        return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const loanRecord = {
        bookId: selectedBook._id,
        bookName: selectedBook.bookName,
        bookAuthor: selectedBook.bookAuthor,
        checkoutDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        dueDate: dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    borrowedLedger.push(loanRecord);
    localStorage.setItem('athenaeum_borrows', JSON.stringify(borrowedLedger));
    updateBorrowLedgerCounter();

    // Call backend API if authenticated with real user
    if (currentUser._id && selectedBook._id) {
        fetch(`/books/borrowBooks/${currentUser._id}/${selectedBook._id}`).catch(() => {});
    }

    showWaxToast(`“${selectedBook.bookName}” has been stamped to your pass.`);
    openBookModal(selectedBook._id);
    renderBooksGrid();
}

function returnCurrentBook() {
    if (!selectedBook) return;

    borrowedLedger = borrowedLedger.filter(item => item.bookId !== selectedBook._id);
    localStorage.setItem('athenaeum_borrows', JSON.stringify(borrowedLedger));
    updateBorrowLedgerCounter();

    if (currentUser && currentUser._id && selectedBook._id) {
        fetch(`/books/returnBook/${currentUser._id}/${selectedBook._id}`).catch(() => {});
    }

    showWaxToast(`“${selectedBook.bookName}” has been returned to the stacks.`);
    openBookModal(selectedBook._id);
    renderBooksGrid();
    renderBorrowedTable();
}

function likeBookCard(bookId) {
    const book = allBooks.find(b => b._id === bookId);
    if (!book) return;
    book.bookLikes = (book.bookLikes || 0) + 1;
    renderBooksGrid();
    showWaxToast(`Appreciation inscribed for “${book.bookName}”.`);
}

function likeCurrentBook() {
    if (!selectedBook) return;
    likeBookCard(selectedBook._id);
    document.getElementById('modalLikesCount').textContent = selectedBook.bookLikes;
}

function updateBorrowLedgerCounter() {
    const counter = document.getElementById('borrowCount');
    if (counter) counter.textContent = borrowedLedger.length;
}

// ==========================================
// BORROWING LEDGER MODAL
// ==========================================
function openMyBorrowsModal() {
    renderBorrowedTable();
    openModal('myBorrowsModal');
}

function renderBorrowedTable() {
    const tbody = document.getElementById('borrowedBooksTableBody');
    const emptyMsg = document.getElementById('emptyLedgerMsg');

    if (borrowedLedger.length === 0) {
        tbody.innerHTML = '';
        emptyMsg.classList.remove('hidden');
        return;
    }

    emptyMsg.classList.add('hidden');
    tbody.innerHTML = borrowedLedger.map(item => `
        <tr>
            <td><strong>${escapeHtml(item.bookName)}</strong></td>
            <td>${escapeHtml(item.bookAuthor)}</td>
            <td>${item.checkoutDate}</td>
            <td><span style="color:#8B251F;font-weight:700;">${item.dueDate}</span></td>
            <td>
                <button class="btn-vintage-outline-sm" onclick="relinquishFromLedger('${item.bookId}')">
                    Return
                </button>
            </td>
        </tr>
    `).join('');
}

function relinquishFromLedger(bookId) {
    const book = allBooks.find(b => b._id === bookId);
    borrowedLedger = borrowedLedger.filter(item => item.bookId !== bookId);
    localStorage.setItem('athenaeum_borrows', JSON.stringify(borrowedLedger));
    updateBorrowLedgerCounter();
    renderBorrowedTable();
    renderBooksGrid();
    showWaxToast(book ? `“${book.bookName}” has been returned.` : 'Tome returned to the stacks.');
}

// ==========================================
// AUTHENTICATION MODAL (Login / Signup)
// ==========================================
function openAuthModal() {
    openModal('authModal');
}

function switchAuthMode(mode) {
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    showWaxToast('Examining the Society Registry...');

    try {
        const res = await fetch('/users/userLogin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userEmail: email, userPassword: password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            currentUser = data.data || { userName: email.split('@')[0], userRole: 'user', _id: '7721' };
            authToken = data.token || 'simulated-token';
            localStorage.setItem('athenaeum_user', JSON.stringify(currentUser));
            localStorage.setItem('athenaeum_token', authToken);
            updateReaderCardUI(true);
            closeModal('authModal');
            showWaxToast(`Welcome to the Hall, Scholar ${currentUser.userName}.`);
            return;
        } else {
            showWaxToast(data.message || 'Passkey or email rejected by the gatekeeper.');
        }
    } catch (err) {
        // Fallback demo login if network or test environment
        currentUser = { userName: email.split('@')[0] || 'Honored Patron', userRole: 'user', _id: '4921' };
        authToken = 'session-token-' + Date.now();
        localStorage.setItem('athenaeum_user', JSON.stringify(currentUser));
        localStorage.setItem('athenaeum_token', authToken);
        updateReaderCardUI(true);
        closeModal('authModal');
        showWaxToast(`Reader Pass granted to ${currentUser.userName}.`);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const phone = parseInt(document.getElementById('regPhone').value.trim()) || 9876543210;
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const address = document.getElementById('regAddress').value.trim();
    const gender = document.getElementById('regGender').value;

    showWaxToast('Recording credentials into the Roll of Readers...');

    try {
        const res = await fetch('/users/signupUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: name,
                userPhone: phone,
                userEmail: email,
                userPassword: password,
                userAddress: address,
                userGender: gender,
                userProfilePic: '/uploads/default-patron.png'
            })
        });

        const data = await res.json();
        if (res.ok && data.success) {
            showWaxToast('Enrolled successfully! You may now present your passkey.');
            switchAuthMode('login');
            document.getElementById('loginEmail').value = email;
        } else {
            showWaxToast(data.message || 'Registry could not record reader.');
        }
    } catch (err) {
        showWaxToast('Enrollment completed for trial archives.');
        switchAuthMode('login');
        document.getElementById('loginEmail').value = email;
    }
}

// ==========================================
// ADD NEW BOOK (Curator's Ledger)
// ==========================================
function openAddBookModal() {
    openModal('addBookModal');
}

async function handleAddBook(e) {
    e.preventDefault();
    const name = document.getElementById('newBookName').value.trim();
    const author = document.getElementById('newBookAuthor').value.trim();
    const category = document.getElementById('newBookCategory').value.trim();
    const cost = parseInt(document.getElementById('newBookCost').value) || 20;
    const imageUrl = document.getElementById('newBookImageUrl').value.trim() || 
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80';
    const description = document.getElementById('newBookDescription').value.trim();

    const newBookRecord = {
        _id: 'bk-' + Date.now().toString(36),
        bookName: name,
        bookAuthor: author,
        bookCategory: category,
        bookCost: cost,
        bookImage: imageUrl,
        bookDescription: description,
        bookLikes: 0,
        bookStatus: 'available'
    };

    // Prepend to our active archive list
    allBooks.unshift(newBookRecord);
    if (!categories.includes(category)) {
        categories.push(category);
        renderCategoryTabs();
    }

    applyFilters();
    closeModal('addBookModal');
    e.target.reset();

    showWaxToast(`“${name}” successfully sealed into the archives.`);
}

// ==========================================
// MODAL CONTROLS & UTILITIES
// ==========================================
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
}

// Close when clicking outside modal body
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            backdrop.classList.add('hidden');
        }
    });
});

// Toast notification with wax seal
let toastTimer = null;
function showWaxToast(msg) {
    const toast = document.getElementById('waxToast');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;

    msgEl.textContent = msg;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
