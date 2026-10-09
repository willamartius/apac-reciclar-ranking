/* ---------- COMPARTILHAMENTO WHATSAPP ---------- */
function montarMensagemTop3(mes,ano){
  const resultados = calcularResultadosMes(STATE.campanhaSelecionadaId, mes,ano);
  const top3 = resultados.filter(r=> r.pontuacao>0 || r.totalMateriais>0).slice(0,3);
  const medalhas = ['🥇 1º lugar','🥈 2º lugar','🥉 3º lugar'];
  const campanha=campanhaPorId(STATE.campanhaSelecionadaId);
  let msg = `♻️ *RANKING DA CAMPANHA*\n${campanha?campanha.nome:'Reciclar é Cuidar da Casa Comum'} · APAC de Imperatriz\n`;
  msg += `${nomeMes(mes)} de ${ano}\n\n🏆 *TOP 3*\n`;
  if(!top3.length) msg += '\nNenhum colaborador pontuou neste mês.\n';
  top3.forEach((r,i)=>{
    msg += `\n${medalhas[i]}: *${r.colaborador.nome}*\n${r.pontuacao.toFixed(0)} pontos · ${r.mediaReal.toFixed(0)}% da meta\n`;
  });
  const atingiramMeta = resultados.filter(r=>r.metaAtingida).length;
  msg += `\n📊 ${atingiramMeta} de ${resultados.length} colaboradores atingiram a meta.\n`;
  msg += `\n🌱 Obrigado a todos que contribuíram!\n\nAcompanhe o ranking: ${linkPaginaPublicaRanking()}`;
  return msg;
}
function linkPaginaPublicaRanking(){
  return window.location.origin+window.location.pathname;
}
function montarMensagemCompleta(mes,ano){
  const resultados = calcularResultadosMes(STATE.campanhaSelecionadaId, mes,ano);
  const comPosicao = resultados.filter(r=>r.posicao);
  const campanha=campanhaPorId(STATE.campanhaSelecionadaId);
  let msg = `♻️ *RANKING COMPLETO*\n${campanha?campanha.nome:'Reciclar é Cuidar da Casa Comum'} · APAC de Imperatriz\n${nomeMes(mes)} de ${ano}\n`;
  if(comPosicao.length){
    msg+='\n';
    comPosicao.forEach(r=>{ msg += `${r.posicao}º · *${r.colaborador.nome}* — ${r.pontuacao.toFixed(0)} pontos (${r.mediaReal.toFixed(0)}% da meta)\n`; });
  } else {
    msg+='\nNenhum colaborador pontuou neste mês.\n';
  }
  msg += `\n🌱 Cuidar da casa comum é responsabilidade de todos!\n\nAcompanhe o ranking: ${linkPaginaPublicaRanking()}`;
  return msg;
}
function abrirCompartilhamentoRanking(mes,ano){
  if(!exigirAdmin()) return;
  abrirPreviaCompartilhamento('top3',mes,ano);
}
function abrirPreviaCompartilhamento(formato,mes,ano){
  const texto=formato==='completo' ? montarMensagemCompleta(mes,ano) : montarMensagemTop3(mes,ano);
  abrirModal(`
    <div class="modal-head"><h3>Compartilhar ranking</h3><button class="modal-close" onclick="fecharModal()">${icon('x')}</button></div>
    <div class="field"><label for="formatoCompartilhamento">Formato</label>
      <select id="formatoCompartilhamento" onchange="atualizarPreviaCompartilhamento(this.value,${mes},${ano})">
        <option value="top3" ${formato==='top3'?'selected':''}>Resumo: Top 3</option>
        <option value="completo" ${formato==='completo'?'selected':''}>Ranking completo</option>
      </select>
    </div>
    <textarea id="textoCompartilhar" rows="14" style="font-size:13px;white-space:pre-wrap;">${escapeHtml(texto)}</textarea>
    <p class="small-note" style="margin-top:8px;">Revise o texto. O WhatsApp será aberto para você escolher a conversa e confirmar o envio.</p>
    <div class="modal-actions">
      <button class="btn btn-outline btn-block" onclick="copiarTextoCompartilhar()">Copiar texto</button>
      <button class="btn btn-primary btn-block" onclick="enviarParaWhatsapp()">Abrir no WhatsApp</button>
    </div>
  `, true);
}
function atualizarPreviaCompartilhamento(formato,mes,ano){
  const texto=document.getElementById('textoCompartilhar');
  if(texto) texto.value=formato==='completo' ? montarMensagemCompleta(mes,ano) : montarMensagemTop3(mes,ano);
}
function copiarTextoCompartilhar(){
  const campo=document.getElementById('textoCompartilhar');
  if(!campo) return;
  const texto=campo.value;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(texto)
      .then(()=>alert('Texto copiado!'))
      .catch(()=>copiarTextoManualmente(campo));
    return;
  }
  copiarTextoManualmente(campo);
}
function copiarTextoManualmente(campo){
  campo.focus();
  campo.select();
  const copiado=document.execCommand('copy');
  alert(copiado?'Texto copiado!':'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.');
}
function enviarParaWhatsapp(){
  const campo=document.getElementById('textoCompartilhar');
  if(!campo) return;
  const link=document.createElement('a');
  link.href='https://wa.me/?text='+encodeURIComponent(campo.value);
  link.target='_blank';
  link.rel='noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
window.abrirCompartilhamentoRanking=abrirCompartilhamentoRanking;
window.atualizarPreviaCompartilhamento=atualizarPreviaCompartilhamento;
window.copiarTextoCompartilhar=copiarTextoCompartilhar; window.enviarParaWhatsapp=enviarParaWhatsapp;

