## Tecnologias Utilizadas

* **HTML5**
* **CSS3** 
* **JavaScript (ES6+)**

## Pré-requisitos

* Um navegador web moderno (Chrome, Firefox, Edge).
* Extensão **Live Server** (VS Code) ou qualquer servidor HTTP local simples (Recomendado para evitar problemas de CORS).
* O **Backend API** deve estar rodando na porta `8080`.

## Instalação e Execução

Não é necessário instalar dependências (como `npm` ou `node_modules`), pois o projeto não utiliza frameworks.

1.  **Clone ou baixe** a pasta do frontend.
2.  **Abra a pasta** no seu editor de código (sugiro o Visual Studio Code).
3.  **Verifique a URL da API**:
    Abra o arquivo `script.js` e certifique-se de que a constante `API_URL` aponta para o seu backend:
    ```javascript
    const API_URL = 'http://localhost:8080';
    ```
4.  **Inicie o Servidor**:
    * Se estiver usando VS Code, clique com o botão direito em `index.html` e selecione **"Open with Live Server"**.
    * O projeto abrirá no seu navegador padrão (geralmente em `http://127.0.0.1:5500`).

## Funcionalidades

### Autenticação
* **Login/Cadastro:** Interface unificada para entrada no sistema.
* **Gestão de Sessão:** Token JWT armazenado seguramente no `localStorage`.

### Dashboard do Usuário
* Visualização apenas dos **próprios chamados**.
* Criação de novos chamados com Título, Descrição e Prioridade.
* Status dos chamados atualizados em tempo real.

### Dashboard do Suporte (Role: ROLE_SUPPORT)
* Visualização de **todos os chamados** do sistema.
* **Filtros:** Filtragem por Status (Aberto, Em Andamento, Resolvido) e Prioridade.
* **Gestão:** Permissão para Editar (alterar status) e Excluir chamados.
* **Organização:** Separação visual automática entre "Chamados Ativos" e "Chamados Resolvidos".
