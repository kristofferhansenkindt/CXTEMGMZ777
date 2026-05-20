// Configuração do seu banco (exemplo com Supabase)
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_ANON';

// Gera ou recupera ID da sessão
function getSessaoId() {
  let id = localStorage.getItem('sessao_funil');
  if (!id) {
    id = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    localStorage.setItem('sessao_funil', id);
  }
  return id;
}

// Função para salvar etapa
async function salvarEtapa(etapaNome, dadosColetados) {
  const sessao_id = getSessaoId();
  
  const payload = {
    sessao_id: sessao_id,
    etapa: etapaNome,
    dados: dadosColetados,
    url: window.location.href,
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };

  // Envia para Supabase
  const response = await fetch(`${SUPABASE_URL}/rest/v1/funil_etapas`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    console.log('Etapa salva:', etapaNome);
  } else {
    console.error('Erro:', await response.text());
  }
}

// Exemplo de uso: ao enviar formulário
// document.getElementById('meuForm').onsubmit = (e) => {
//   e.preventDefault();
//   const dados = { telefone: document.getElementById('tel').value };
//   salvarEtapa('telefone', dados);
//   // depois redireciona
// };