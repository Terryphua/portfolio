function slideCard(cardElement) {
    if (cardElement.style.transform === 'scale(1.1)') {
        cardElement.style.transform = 'scale(1)';
    } else {
        cardElement.style.transform = 'scale(1.1)';
    }
}

//For smooth transition when is nav bar is clicked.
function smoothScroll(targetId) {
    event.preventDefault();
    const target = document.getElementById(targetId);
    target.scrollIntoView({
      behavior: 'smooth'
          });
        }