🌤️ Meu Clima Real - v3.0 

Um aplicativo de previsão do tempo de alta precisão e resiliência, desenvolvido com Vanilla JS. A versão 3.0 foi focada em Edge Cases (casos extremos).

🚀 Funcionalidades da Versão 3.0

Busca com Normalização: Tratamento rigoroso de strings que remove múltiplos hífens e caracteres especiais, garantindo compatibilidade total com a API.

Resolução de Homônimos: Interface inteligente que detecta cidades com nomes iguais e gera uma lista de seleção para o usuário escolher o local exato (Estado/País).

Layout Anti-Quebra: CSS configurado com word-break e overflow-wrap para suportar nomes de até 85 letras sem deformar o card.

Nuvem Inteligente: Ícone climático com posicionamento relativo e animação de flutuação, corrigido para nunca vazar do container.

🛠️ Tecnologias UtilizadasHTML5 & CSS3: Design com Glassmorphism, Variáveis CSS e Flexbox.JavaScript (ES6+): Uso intensivo de Async/Await, RegEx para limpeza de dados e manipulação dinâmica de Data-Attributes.Open-Meteo API: Geocoding e Weather API integradas com lógica de fuso horário.

📂 Estrutura do ProjetoPlaintextweather-app/

├── index.html          # Estrutura principal e container de alertas

├── style.css           # Estilização global e animações

└── script.js           # Lógica de normalização, busca, fallback e renderização

🔧 Como Rodar o Projeto
Clone este repositório:
git clone [https://github.com/SEU-USUARIO/meu-clima-v2.git](https://github.com/SEU-USUARIO/meu-clima-v2.git)

👤 Autor
Paulo Dante Coelho Neto

Economista e Analista Financeiro explorando o mundo do desenvolvimento.

[GitHub](https://github.com/dantekhann)
