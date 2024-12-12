const { ipcRenderer } = require("electron");

// Captura os elementos da interface
const timerDropdown = document.getElementById("timerDropdown");
const programButton = document.getElementById("programButton");
const cancelButton = document.getElementById("cancelButton");
const countdownDisplay = document.getElementById("countdown");

let countdownInterval;

// Função para formatar tempo em minutos e segundos
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Configura o botão Programar
programButton.addEventListener("click", () => {
  const selectedTime = parseInt(timerDropdown.value, 10) * 60; // Converter minutos para segundos

  // Enviar mensagem para o backend
  ipcRenderer.send("schedule-shutdown", selectedTime);

  // Exibir botão de cancelar
   cancelButton.style.display = "inline";
  // programButton.style.display = "none";

  // Atualizar contagem regressiva
  let timeLeft = selectedTime;
  countdownDisplay.textContent = `Tempo restante: ${formatTime(timeLeft)}`;
  countdownInterval = setInterval(() => {
    timeLeft--;
    countdownDisplay.textContent = `Tempo restante: ${formatTime(timeLeft)}`;
    if (timeLeft <= 0) clearInterval(countdownInterval);
  }, 1000);
});

// Configura o botão Cancelar
cancelButton.addEventListener("click", () => {
  ipcRenderer.send("cancel-shutdown");
  clearInterval(countdownInterval);

  countdownDisplay.textContent = "";
  programButton.style.display = "inline";
});



// Obtém a versão do aplicativo e exibe no rodapé
ipcRenderer.invoke("get-app-version").then((version) => {
  const footer = document.createElement("footer");
  footer.style.textAlign = "center"; // Centraliza o rodapé
  footer.style.marginTop = "20px";  // Adiciona espaçamento superior
  // Pega o ano atual dinamicamente
  const currentYear = new Date().getFullYear();
  footer.textContent = `Versão: ${version} | Criado por PC NO Easy | © ${currentYear} Todos os direitos reservados`;
  document.body.appendChild(footer); // Adiciona o rodapé ao final do corpo
});