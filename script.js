function slideCard(cardElement) {
    if (cardElement.style.transform === 'scale(1.1)') {
        cardElement.style.transform = 'scale(1)';
    } else {
        cardElement.style.transform = 'scale(1.1)';
    }
}