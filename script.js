const weatherConfig = {
    0: { label: "Céu Limpo", icon: "☀️", color: "#00d2ff", msg: "Dia perfeito para sair!" },
    1: { label: "Principalmente Limpo", icon: "🌤️", color: "#00d2ff", msg: "O sol está brilhando." },
    2: { label: "Parcialmente Nublado", icon: "⛅", color: "#00d2ff", msg: "Algumas nuvens no céu." },
    3: { label: "Nublado", icon: "☁️", color: "#00d2ff", msg: "Tempo fechado por enquanto." },
    45: { label: "Névoa", icon: "🌫️", color: "#a8a8b3", msg: "Visibilidade reduzida." }
};

async function buscarClimaReal() {
    const input = document.getElementById("cidadeInput");
    const container = document.getElementById("notificacao-container");
    const btn = document.getElementById("btnVerificar");

    const busca = input.value.trim();
    if (busca.length < 1) return;

    btn.disabled = true;
    btn.innerText = "Buscando...";
    container.innerHTML = "";

    try {
        // BUSCA 1: Geocodificação (Sem travar o idioma para aceitar caracteres especiais)
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(busca)}&count=1&format=json`;
        
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            // Tenta uma segunda vez trocando hífen por espaço (ajuda em nomes como Chamonix-Mont-Blanc)
            const buscaAlt = busca.replace(/-/g, " ");
            const geoResAlt = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(buscaAlt)}&count=1&format=json`);
            const geoDataAlt = await geoResAlt.json();
            
            if (!geoDataAlt.results) throw new Error("Local não encontrado.");
            renderizar(geoDataAlt.results[0]);
        } else {
            renderizar(geoData.results[0]);
        }

    } catch (erro) {
        container.innerHTML = `<p style="color: #ff5555; text-align: center; margin-bottom: 20px;">${erro.message}</p>`;
        container.innerHTML = `<div class="skeleton"></div>`;
    } finally {
        btn.disabled = false;
        btn.innerText = "Verificar Clima";
    }

    async function renderizar(local) {
        const { latitude, longitude, name, admin1, country } = local;
        // BUSCA 2: Clima (Aqui usamos as coordenadas, que não falham nunca)
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const clm = await res.json();
        const data = clm.current_weather;
        const config = weatherConfig[data.weathercode] || { label: "Estável", icon: "🌤️", color: "#00d2ff", msg: "Aproveite o dia!" };

        container.innerHTML = `
            <div class="alerta-moderno" style="border-left-color: ${config.color}">
                <span class="weather-icon-main">${config.icon}</span>
                <h2>${name}, ${admin1 || ""} - ${country}</h2>
                <div class="temp-grande" style="color: ${config.color}">${data.temperature}°C</div>
                <p style="color: ${config.color}; font-weight: bold;">Condição: ${config.label}</p>
                <p style="font-size: 0.8rem; color: #a8a8b3;">Vento: ${data.windspeed} km/h</p>
                <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">
                <p>${config.msg}</p>
            </div>
        `;
    }
}

// Escutador do Enter
document.getElementById("cidadeInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarClimaReal();
});