// Universal header for all pages
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const headerHTML = `
        <nav class="nav">
            <div class="nav-container">
                <div class="logo"><a href="index.html">Xavigate</a></div>
                <ul class="nav-links">
                    <li><a href="index.html" ${currentPage === 'index.html' ? 'class="active"' : ''}>Home</a></li>
                    <li><a href="books.html" ${currentPage === 'books.html' ? 'class="active"' : ''}>Books</a></li>
                    <li><a href="training.html" ${currentPage === 'training.html' ? 'class="active"' : ''}>Toolkits</a></li>
                    <li><a href="practitioners.html" ${currentPage === 'practitioners.html' ? 'class="active"' : ''}>Practitioners</a></li>
                    <li><a href="about.html" ${currentPage === 'about.html' ? 'class="active"' : ''}>About</a></li>
                </ul>
            </div>
        </nav>
    `;

    // Insert header at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
});
