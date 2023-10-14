function smoothScroll(targetId) {
    event.preventDefault();
    const target = document.getElementById(targetId);
    target.scrollIntoView({
        behavior: 'smooth'
    });
}

