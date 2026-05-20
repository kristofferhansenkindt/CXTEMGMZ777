// ============================================
// CONFIGURAÇÃO DO SUPABASE (SUAS CREDENCIAIS)
// ============================================
const SUPABASE_URL = 'https://hbpgjwezukugbtviswkw.supabase.co';
const SUPABASE_KEY = 'sb_publishable__7MjiigiJf7NgmLZPLFdxA_yRNF_cO8';

// ============================================
// GERENCIAMENTO DE SESSÃO
// ============================================
function getSessaoId() {
  let id = sessionStorage.getItem('sessao_funil');
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    sessionStorage.setItem('sessao_funil', id);
  }
  return id;
}

// ============================================
// FUNÇÃO PRINCIPAL: SALVAR ETAPA NO BANCO
// ============================================
async function salvarEtapa(etapaNome, dadosColetados = {}) {
  const sessao_id = getSessaoId();
  
  // Coleta informações da página atual
  const payload = {
    sessao_id: sessao_id,
    etapa: etapaNome,
    dados: dadosColetados,
    url: window.location.pathname,
    user_agent: navigator.userAgent.substring(0, 255) // limite pra não estourar
  };

  console.log(`📝 Salvando etapa: ${etapaNome}`, dadosColetados);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/funil_etapas`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`✅ Etapa "${etapaNome}" salva com sucesso!`);
      return true;
    } else {
      const erro = await response.text();
      console.error(`❌ Erro ${response.status}:`, erro);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro de rede:', error);
    return false;
  }
}

// ============================================
// FUNÇÃO PARA REGISTRAR ACESSO À PÁGINA
// ============================================
async function registrarAcessoPagina(nomePersonalizado = null) {
  const nomePagina = nomePersonalizado || window.location.pathname.replace(/\.html$/, '').replace('/', '');
  await salvarEtapa(`pagina_${nomePagina}`, { 
    pagina: nomePagina,
    timestamp_acesso: new Date().toISOString()
  });
}

// ============================================
// FUNÇÃO PARA CAPTURAR FORMULÁRIOS FACILMENTE
// ============================================
function capturarFormulario(seletorForm, nomeEtapa, mapeamentoCampos) {
  const form = document.querySelector(seletorForm);
  if (!form) {
    console.warn(`Formulário ${seletorForm} não encontrado`);
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Coleta os dados do formulário baseado no mapeamento
    const dados = {};
    for (const [campoId, nomeDado] of Object.entries(mapeamentoCampos)) {
      const elemento = document.getElementById(campoId);
      if (elemento) {
        dados[nomeDado] = elemento.value;
      }
    }
    
    // Salva a etapa
    await salvarEtapa(nomeEtapa, dados);
    
    // Se quiser redirecionar após salvar
    const redirectTo = form.getAttribute('data-redirect');
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  });
}