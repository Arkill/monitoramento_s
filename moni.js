// Inicialização do mapa centralizado em Manaus sem os controles de zoom
var map = L.map('map', {
    zoomControl: false // Desativa os botões de zoom
}).setView([-3.119027, -60.021731], 12); // Centralizar o mapa em Manaus

// Adicionando o tile layer com estilo escuro (CartoDB Dark Matter)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

// Função para criar e mover um veículo ao longo de uma rota
function createVehicle(iconUrl, startCoords, endCoords, vehicleId, vehicleName, vehicleBrand, vehiclePlate) {
    var vehicleIcon = new L.Icon({
        iconUrl: iconUrl,
        iconSize: [60, 40],
        iconAnchor: [20, 40]
    });

    var vehicleMarker = L.marker(startCoords, { icon: vehicleIcon, id: vehicleId }).addTo(map);
    var popupContent = ` 
        <b>Marca:</b> ${vehicleBrand}<br>
        <b>Nome:</b> ${vehicleName}<br>
        <b>Placa:</b> ${vehiclePlate}<br>
        <b>Velocidade:</b> 0 km/h
    `;

    vehicleMarker.bindPopup(popupContent); // Adiciona o conteúdo ao popup

    var routeLine = L.polyline([], { color: 'blue', weight: 4 }).addTo(map); // Adiciona a linha da rota

    var routingControl = L.Routing.control({
        waypoints: [
            L.latLng(startCoords[0], startCoords[1]),
            L.latLng(endCoords[0], endCoords[1])
        ],
        createMarker: function() { return null; },
        addWaypoints: false,
        routeWhileDragging: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        show: false,
        lineOptions: { styles: [{ opacity: 0 }] } // Linha invisível
    }).addTo(map);

    // Função de Geocodificação Reversa
    function reverseGeocode(lat, lng, callback) {
        var url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.address) {
                    callback(data.address);
                } else {
                    callback(null);
                }
            })
            .catch(error => {
                console.error('Erro na geocodificação reversa:', error);
                callback(null);
            });
    }



    // Função para formatar as horas no formato hh:mm:ss
    function formatHours(hours) {
        const totalSeconds = Math.floor(hours * 3600);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Função que move o veículo ao longo da rota
    function moveVehicleOnRoute(routeCoordinates) {
        var index = 0;
        var motorHours = 0; // Contador de horas do motor
        var isStopped = false; // Flag para verificar se o veículo está parado

        function move() {
            if (index < routeCoordinates.length) {
                var coords = routeCoordinates[index];
                vehicleMarker.setLatLng(coords);
                routeLine.addLatLng(coords); // Adicionar ponto à polilinha

                // Atualizar o endereço do veículo
                updateVehicleAddress(vehicleId, coords);

                // Simula variações na velocidade e paradas
                var delay = Math.random() * 2000 + 1000; // Delay aleatório entre 1 e 3 segundos
                if (Math.random() < 0.1) { // 10% de chance de parar
                    delay += 3000; // Pausa adicional de 3 segundos
                    isStopped = true; // Marca como parado
                }

                var speed = Math.floor(Math.random() * 40 + 20); // Velocidade aleatória entre 20 e 60 km/h

                // Atualiza a velocidade e o status no popup
                vehicleMarker.setPopupContent(`
                    <b>Marca:</b> ${vehicleBrand}<br>
                    <b>Nome:</b> ${vehicleName}<br>
                    <b>Placa:</b> ${vehiclePlate}<br>
                    <b>Velocidade:</b> ${speed} km/h
                `);

                // Atualiza a velocidade na lista de veículos
                document.getElementById(vehicleId).querySelector('.vehicle-speed').textContent = speed + ' km/h';

                // Se o veículo estiver parado, conta o tempo de motor
                if (isStopped) {
                    motorHours += 0.05; // Incrementa 3 minutos por vez enquanto parado
                    document.getElementById(vehicleId).querySelector('.vehicle-engine-hours').textContent = formatHours(motorHours);
                }

                // Se o veículo está em movimento, aumenta o tempo do motor
                if (!isStopped) {
                    motorHours += 0.02; // Incrementa 1,2 minutos por vez enquanto em movimento
                    document.getElementById(vehicleId).querySelector('.vehicle-engine-hours').textContent = formatHours(motorHours);
                }

                index++;
                setTimeout(move, delay);
            }
        }
        move();
    }

    routingControl.on('routesfound', function (e) {
        var routeCoordinates = e.routes[0].coordinates;
        moveVehicleOnRoute(routeCoordinates);
    });
}

// Adicionar veículos com diferentes rotas
createVehicle('img/r15.png', [-3.098264, -59.986498], [-3.119027, -60.021731], 'moto-info', 'Yamaha R15', 'Yamaha', 'ABC-1234');
createVehicle('img/Celta.png', [-3.119027, -60.021731], [-3.072237, -60.017906], 'strada-info', 'Chevrolet Celta', 'Chevrolet', 'XYZ-5678');

// Seleciona o checkbox "Selecionar Todos"
document.getElementById('select-all').addEventListener('change', function () {
    // Pega o estado do checkbox "Selecionar Todos"
    var isChecked = this.checked;
    // Seleciona todas as checkboxes dos veículos
    var checkboxes = document.querySelectorAll('.vehicle-checkbox');
    // Define o estado de cada checkbox de acordo com "Selecionar Todos"
    checkboxes.forEach(function (checkbox) {
        checkbox.checked = isChecked;
    });
});

const toggleListButton = document.getElementById('toggle-list');
const vehicleList = document.getElementById('vehicle-list');

toggleListButton.addEventListener('click', () => {
    if (vehicleList.style.display === 'none') {
        vehicleList.style.display = 'block';
        toggleListButton.textContent = '−'; // Mostra "−" quando a lista está visível
    } else {
        vehicleList.style.display = 'none';
        toggleListButton.textContent = '＋'; // Mostra "＋" quando a lista está escondida
    }
});



const topInfo = document.getElementById('top-info');
const toggleButton = document.getElementById('toggle-info');

// Alternar estado da aba
toggleButton.addEventListener('click', () => {
    if (topInfo.classList.contains('collapsed')) {
        topInfo.classList.remove('collapsed');
        toggleButton.textContent = '↓'; // Ícone para colapsar
    } else {
        topInfo.classList.add('collapsed');
        toggleButton.textContent = '↑'; // Ícone para expandir
    }
});


const sidebar = document.getElementById('sidebar');
const toggleSidebarButton = document.getElementById('toggle-sidebar');

toggleSidebarButton.addEventListener('click', () => {
    if (sidebar.classList.contains('hidden')) {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('show-partially');
        toggleSidebarButton.innerHTML = '→';  // Reverte o botão ao mostrar
    } else if (sidebar.classList.contains('show-partially')) {
        sidebar.classList.remove('show-partially');
        sidebar.classList.add('hidden');
    } else {
        sidebar.classList.add('hidden');
    }
});




















// Atualizar a lista de veículos
// var vehicleList = document.getElementById('vehicle-list');
// vehicleList.innerHTML = `
//   <div id="strada-info" class="vehicle-info">
//       <b>Carro Monitorado</b><br>
//       Modelo: Chevrolet Celta<br>
//       Placa: XYZ-5678<br>
//       Cor: Branca<br>
//       Velocidade: <span class="vehicle-speed">0 km/h</span><br>
//       <span class="vehicle-status">
//           <span class="status-indicator" style="background-color: green;"></span> Em movimento
//       </span><br>
//       Endereço: <span class="vehicle-address">Atualizando...</span><br>
//       Horas do Motor: <span class="vehicle-engine-hours">00:00:00</span>
//   </div>
//   <div id="moto-info" class="vehicle-info">
//       <b>Moto Monitorada</b><br>
//       Modelo: Yamaha R15<br>
//       Placa: ABC-1234<br>
//       Cor: Azul<br>
//       Velocidade: <span class="vehicle-speed">0 km/h</span><br>
//       <span class="vehicle-status">
//           <span class="status-indicator" style="background-color: red;"></span> Parada
//       </span><br>
//       Endereço: <span class="vehicle-address">Atualizando...</span><br>
//       Horas do Motor: <span class="vehicle-engine-hours">00:00:00</span>
//   </div>
// `;

