const weatherConfig = {
  0: {
    label: "Céu Limpo",
    icon: "☀️",
    color: "var(--destaque)",
    msg: "Dia perfeito! Aproveite o sol.",
  },
  1: {
    label: "Céu Aberto",
    icon: "🌤️",
    color: "var(--destaque)",
    msg: "Tempo firme. Pode sair tranquilo!",
  },
  2: {
    label: "Parcialmente Nublado",
    icon: "⛅",
    color: "var(--nublado)",
    msg: "O céu está com nuvens, mas sem chuva por enquanto.",
  },
  3: {
    label: "Nublado",
    icon: "☁️",
    color: "var(--nublado)",
    msg: "Tempo fechado, mas sem chuva por enquanto.",
  },
  45: {
    label: "Nevoeiro",
    icon: "🌫️",
    color: "var(--texto-suave)",
    msg: "Visibilidade baixa. Cuidado ao dirigir!",
  },
  51: {
    label: "Chuvisco",
    icon: "🌧️",
    color: "var(--perigo)",
    msg: "Está garoando. Melhor levar o guarda-chuva.",
  },
  61: {
    label: "Chuva Leve",
    icon: "🌧️",
    color: "var(--perigo)",
    msg: "Chuva detectada. Não esqueça a capa!",
  },
  80: {
    label: "Pancadas de Chuva",
    icon: "🌦️",
    color: "var(--perigo)",
    msg: "Chuva passageira detectada.",
  },
  95: {
    label: "Trovoada",
    icon: "⛈️",
    color: "var(--perigo)",
    msg: "Perigo: Raios e trovões!",
  },
};

// Suporte à tecla Enter
document
  .getElementById("cidadeInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      buscarClimaReal();
    }
  });

async function buscarClimaReal() {
  const input = document.getElementById("cidadeInput");
  const container = document.getElementById("notificacao-container");
  const btn = document.getElementById("btnVerificar");
  const cidade = input.value.trim();

  if (cidade === "") return alert("Digite o nome de uma cidade!");

  btn.disabled = true;
  btn.innerText = "Consultando...";
  container.innerHTML = "";

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`,
    );
    const geoData = await geoRes.json();
    if (!geoData.results) throw new Error("Cidade não encontrada!");

    const { latitude, longitude, name, admin1, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
    );
    const weatherData = await weatherRes.json();

    const data = weatherData.current_weather;
    const config = weatherConfig[data.weathercode] || {
      label: "Estável",
      icon: "🌤️",
      color: "var(--destaque)",
      msg: "Aproveite o dia!",
    };

    const card = document.createElement("div");
    card.className = "alerta-moderno";
    card.style.borderLeftColor = config.color;

    card.innerHTML = `
            <span class="weather-icon-main">${config.icon}</span>
            <h2 style="margin:0; font-size: 0.9rem; color: var(--texto-suave);">${name}, ${admin1 || ""} - ${country}</h2>
            <div class="temp-grande" style="color: ${config.color}">${data.temperature}°C</div>
            <p style="color: ${config.color}; font-weight: bold; margin: 0;">Condição: ${config.label}</p>
            <p style="margin-top: 8px; font-size: 0.85rem; color: var(--texto-suave);">Vento: ${data.windspeed} km/h</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 15px 0;">
            <p>${config.msg}</p>
        `;

    container.appendChild(card);
  } catch (erro) {
    // Verifica se o erro é de conexão ou se o navegador está offline
    if (!navigator.onLine || erro.message === "Failed to fetch") {
      container.innerHTML = `<p style="color: var(--perigo); text-align: center;">Sem conexão com a internet. Verifique seu sinal.</p>`;
    } else {
      // Para outros erros (ex: cidade não encontrada)
      container.innerHTML = `<p style="color: var(--perigo); text-align: center;">${erro.message}</p>`;
    }
  } finally {
    btn.disabled = false;
    btn.innerText = "Verificar Clima";
  }
}