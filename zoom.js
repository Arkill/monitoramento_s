// Botão de zoom in
const zoomInBtn = document.getElementById('zoom-in');
zoomInBtn.addEventListener('click', () => {
    const currentZoom = map.getZoom();
    if (currentZoom < map.getMaxZoom()) {
        map.setZoom(currentZoom + 1); // Aumenta o zoom
    }
});

// Botão de zoom out
const zoomOutBtn = document.getElementById('zoom-out');
zoomOutBtn.addEventListener('click', () => {
    const currentZoom = map.getZoom();
    if (currentZoom > map.getMinZoom()) {
        map.setZoom(currentZoom - 1); // Diminui o zoom
    }
});
