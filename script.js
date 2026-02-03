const API_URL = 'http://localhost:8080';
let todosChamadosCache = [];
let chamadoEditandoId = null;

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    const user = parseJwt(token);
    if (document.getElementById('user-display')) {
        document.getElementById('user-display').textContent = `Olá, ${user.nome}`;
    }
}

async function fazerLogin() {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert('Falha no login. Verifique suas credenciais.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

async function fazerCadastro() {
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        if (response.ok) {
            alert('Cadastro realizado com sucesso! Faça login.');
            alternarForm();
        } else {
            alert('Erro no cadastro. Tente outro email.');
        }
    } catch (error) {
        console.error(error);
    }
}

function alternarForm() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

async function carregarChamados() {
    const token = localStorage.getItem('token');
    const user = parseJwt(token);

    let url;
    if (user.role === 'ROLE_SUPPORT') {
        url = `${API_URL}/chamados`;
        document.getElementById('titulo-ativos').innerText = "Todos os Chamados em Aberto";
    } else {
        url = `${API_URL}/chamados/${user.id}`;
        document.getElementById('titulo-ativos').innerText = "Meus Chamados em Aberto";
    }

    try {
        const response = await fetch(url, { headers: getHeaders() });
        if (response.ok) {
            todosChamadosCache = await response.json();
            aplicarFiltros();
        }
    } catch (error) {
        console.error('Erro na requisição', error);
    }
}

function aplicarFiltros() {
    const statusFiltro = document.getElementById('filtro-status').value;
    const prioridadeFiltro = document.getElementById('filtro-prioridade').value;

    const filtrados = todosChamadosCache.filter(chamado => {
        const statusOk = statusFiltro === 'TODOS' || chamado.status === statusFiltro;
        const prioridadeOk = prioridadeFiltro === 'TODOS' || chamado.prioridade === prioridadeFiltro;
        return statusOk && prioridadeOk;
    });

    const ativos = [];
    const resolvidos = [];

    filtrados.forEach(chamado => {
        if (chamado.status === 'RESOLVIDO') {
            resolvidos.push(chamado);
        } else {
            ativos.push(chamado);
        }
    });

    renderizarListaNoContainer(ativos, 'lista-ativos');
    renderizarListaNoContainer(resolvidos, 'lista-resolvidos');
}

function renderizarListaNoContainer(lista, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="color:#777; font-style:italic">Nenhum chamado nesta lista.</p>';
        return;
    }

    const token = localStorage.getItem('token');
    const user = parseJwt(token);

    lista.forEach(chamado => {
        const card = document.createElement('div');
        card.className = `card prio-${chamado.prioridade}`;

        const infoUsuario = user.role === 'ROLE_SUPPORT'
            ? `<small><b>Usuário:</b> ${chamado.usuarioEmail}</small>`
            : '';

        let botoesHtml = '';
        if (user.role === 'ROLE_SUPPORT') {
            botoesHtml = `
                <div class="card-actions">
                    <button onclick='abrirModalEditar(${JSON.stringify(chamado)})'>Editar</button>
                    <button class="btn-danger" onclick="deletarChamado(${chamado.id})">Excluir</button>
                </div>
            `;
        }

        card.innerHTML = `
            <h3>${chamado.titulo}</h3>
            ${infoUsuario}
            <small>Status: <b>${chamado.status}</b> | Prioridade: <b>${chamado.prioridade}</b></small>
            <p>${chamado.descricao}</p>
            <small style="margin-top:10px">
                ${new Date(chamado.criadoEm).toLocaleDateString('pt-BR')} às ${new Date(chamado.criadoEm).toLocaleTimeString('pt-BR')}
            </small>
            ${botoesHtml}
        `;
        container.appendChild(card);
    });
}

function abrirModalCriar() {
    chamadoEditandoId = null;
    document.getElementById('modal-titulo').innerText = "Novo Chamado";
    document.getElementById('novo-titulo').value = "";
    document.getElementById('novo-descricao').value = "";
    document.getElementById('novo-prioridade').value = "BAIXA";

    document.getElementById('div-status').classList.add('hidden');

    document.getElementById('modal').classList.remove('hidden');
}

function abrirModalEditar(chamado) {
    chamadoEditandoId = chamado.id;
    document.getElementById('modal-titulo').innerText = "Editar Chamado";
    document.getElementById('novo-titulo').value = chamado.titulo;
    document.getElementById('novo-descricao').value = chamado.descricao;
    document.getElementById('novo-prioridade').value = chamado.prioridade;

    document.getElementById('div-status').classList.remove('hidden');
    document.getElementById('novo-status').value = chamado.status;

    document.getElementById('modal').classList.remove('hidden');
}

function fecharModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

async function salvarChamado() {
    const titulo = document.getElementById('novo-titulo').value;
    const descricao = document.getElementById('novo-descricao').value;
    const prioridade = document.getElementById('novo-prioridade').value;

    const token = localStorage.getItem('token');
    const user = parseJwt(token);

    if (chamadoEditandoId) {
        const status = document.getElementById('novo-status').value;
        const body = { titulo, descricao, prioridade, status };

        await fetch(`${API_URL}/chamados/${chamadoEditandoId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });

    } else {
        const body = { titulo, descricao, prioridade };

        await fetch(`${API_URL}/chamados/${user.id}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body)
        });
    }

    fecharModal();
    carregarChamados();
}

async function deletarChamado(id) {
    if (confirm('Tem certeza que deseja excluir este chamado?')) {
        await fetch(`${API_URL}/chamados/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        carregarChamados();
    }
}

window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        fecharModal();
    }
}