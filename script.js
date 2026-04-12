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

  // 1. Pegamos o valor bruto do input
  const cidadeRaw = input.value.trim();

  // 2. LIMPEZA TOTAL (O hífen DEVE ser o último antes do ] no Regex)
  // Permite letras (A-Z), acentos (à-ú), espaços (\s) e hífens (-)
  // Remove emojis, números e símbolos como @, #, !
  let cidade = cidadeRaw.replace(/[^a-zA-Zà-úÀ-Ú\s-]/g, "");

  // 3. REMOVE HÍFENS "SOLTOS"
  // Se o usuário digitar "-Paris-" por erro, isso limpa as pontas
  cidade = cidade.replace(/^-+|-+$/g, "").trim();

  // 4. VALIDAÇÃO DE ENTRADA
  if (cidade.length < 2) {
    container.innerHTML = `<p style="color: var(--perigo); text-align: center;">Por favor, digite um nome de cidade válido.</p>`;
    return;
  }

  // CONFIGURAÇÃO DO TIMEOUT (V3)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  btn.disabled = true;
  btn.innerText = "Consultando...";
  container.innerHTML = "";

  try {
    // BUSCA 1: Geocodificação
    // DICA: Substituímos o hífen por espaço no nome da busca para ajudar a API a encontrar melhor
    const cidadeParaBusca = cidade.replace(/-/g, " ");

    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidadeParaBusca)}&count=1&language=pt&format=json`,
      { signal: controller.signal },
    );

    const geoData = await geoRes.json();

    // Validação: Se a API não encontrar nada
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("Local não encontrado. Verifique a ortografia!");
    }

    const { latitude, longitude, name, admin1, country } = geoData.results[0];

    // BUSCA 2: Clima em Tempo Real
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
      { signal: controller.signal },
    );
    const weatherData = await weatherRes.json();

    // SUCESSO: Desliga o cronômetro de 10s
    clearTimeout(timeoutId);

    const data = weatherData.current_weather;

    // Fallback: Caso o código de clima não esteja no seu weatherConfig
    const config = weatherConfig[data.weathercode] || {
      label: "Estável",
      icon: "🌤️",
      color: "var(--destaque)",
      msg: "Aproveite o dia!",
    };

    // Renderização do Card
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
    // Tratamento de Erros
    if (erro.name === "AbortError") {
      container.innerHTML = `<p style="color: var(--perigo); text-align: center;">A conexão demorou muito. Tente novamente.</p>`;
    } else if (!navigator.onLine || erro.message === "Failed to fetch") {
      container.innerHTML = `<p style="color: var(--perigo); text-align: center;">Sem internet! Verifique sua rede.</p>`;
    } else {
      container.innerHTML = `<p style="color: var(--perigo); text-align: center;">${erro.message}</p>`;
    }
  } finally {
    // Garante que o botão volte ao normal
    btn.disabled = false;
    btn.innerText = "Verificar Clima";
  }
}
