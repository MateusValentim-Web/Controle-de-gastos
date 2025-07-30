const form = document.getElementById("form");
const tabela = document.getElementById("tabela-gastos");
const resumo = document.getElementById("resumo");

function salvarGastos(gastos) {
    localStorage.setItem("gastos", JSON.stringify(gastos));
}

function carregarGastos() {
    return JSON.parse(localStorage.getItem("gastos")) || [];
}

function atualizarResumo(gastos) {
    const hoje = new Date();
    let total = 0;
    let guardado = 0;
    let totalPorDia = 0;

gastos.forEach((gasto) => {
    // Corrigido: adiciona T23:59:59 para garantir o dia correto
    const vencimento = new Date(gasto.vencimento + 'T23:59:59');
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const restante = gasto.valor - (gasto.guardado || 0);

    total += gasto.valor;
    guardado += (gasto.guardado || 0);
    if (diasRestantes > 0) {
        totalPorDia += restante / diasRestantes;
    }
    });

  const porcentagem = total === 0 ? 0 : (guardado / total * 100).toFixed(2);

resumo.innerHTML = `
    <h3>Resumo</h3>
    <p><strong>Total de Dívidas:</strong> R$ ${total.toFixed(2)}</p>
    <p><strong>Total já Guardado:</strong> R$ ${guardado.toFixed(2)}</p>
    <div class="barra-progresso"><div class="progresso" style="width:${porcentagem}%">${porcentagem}%</div></div>
    <p><strong>Falta Guardar:</strong> R$ ${(total - guardado).toFixed(2)}</p>
    <p><strong>Média Diária Recomendada:</strong> R$ ${totalPorDia.toFixed(2)}</p>
    `;
}

function atualizarTabela() {
    tabela.innerHTML = '';
    const gastos = carregarGastos();
    const hoje = new Date();

gastos.forEach((gasto, index) => {
    const vencimento = new Date(gasto.vencimento + 'T23:59:59');
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const restante = gasto.valor - (gasto.guardado || 0);
    const valorPorDia = diasRestantes > 0 ? (restante / diasRestantes).toFixed(2) : 'Vencido';

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${gasto.descricao}</td>
        <td>R$ ${gasto.valor.toFixed(2)}</td>
        <td>${vencimento.toLocaleDateString()}</td>
        <td>${diasRestantes > 0 ? diasRestantes : 'Vencido'}</td>
        <td>R$ ${valorPorDia}</td>
        <td><input class="guardar-input" type="number" value="${gasto.guardado || 0}" /></td>
        <td><button class="btn-recalcular">OK</button></td>
        <td><button class="btn-excluir">Excluir</button></td>
    `;

    tr.querySelector('.btn-excluir').addEventListener('click', () => {
        gastos.splice(index, 1);
        salvarGastos(gastos);
        atualizarTabela();
    });

    tr.querySelector('.btn-recalcular').addEventListener('click', () => {
        const novoValor = parseFloat(tr.querySelector('.guardar-input').value) || 0;
        gastos[index].guardado = novoValor;
        salvarGastos(gastos);
        atualizarTabela();
    });

    tabela.appendChild(tr);
    });

    atualizarResumo(gastos);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const vencimento = document.getElementById('vencimento').value;

    const gastos = carregarGastos();
    gastos.push({ descricao, valor, vencimento, guardado: 0 });
    salvarGastos(gastos);

    atualizarTabela();
    form.reset();
});

window.addEventListener('load', atualizarTabela);
