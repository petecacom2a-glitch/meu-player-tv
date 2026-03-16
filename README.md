# Reprodutor IPTV para Smart TV Philco (HTML5)

Este é um reprodutor de vídeo de alto desempenho desenvolvido especificamente para Smart TVs Philco (e outras com suporte a HTML5), focado em simplicidade, velocidade e compatibilidade com controle remoto.

## 🚀 Principais Recursos

- **Layout Sidebar (IPTV Style)**: Navegue pelos canais enquanto o vídeo continua sendo exibido.
- **Suporte a Listas M3U**: Importação automática de canais de listas IPTV complexas (como as do `iptv-org`).
- **Navegação Inteligente**: Otimizado para setas e botões de retorno do controle remoto.
- **Watchdog de Carregamento**: Pula automaticamente links quebrados ou lentos após 15 segundos.
- **Suporte a Formatos**: Toca `.mp4`, `.m3u8` (HLS) e `.ts` (MPEG-TS).

## 🛠️ Como Usar na sua Smart TV

1. **Hospedagem**: Este projeto está otimizado para rodar no **GitHub Pages**.
2. **Adicionar Canais**:
   - Clique no botão `+` na barra lateral.
   - Cole um link direto ou um link de lista `.m3u`.
   - O player processará a lista e adicionará os canais individualmente.
3. **Controles do Player**:
   - As setas esquerda/direita no controle remoto mudam de canal.
   - O botão central abre os controles de pausa.

## 👨‍💻 Desenvolvimento Local

Se quiser rodar localmente no seu PC para testar na rede Wi-Fi:
```bash
python server.py
```
Acesse `http://SEU-IP:9000` no navegador da TV.

---
Desenvolvido para máxima fluidez em hardware de Smart TV.
