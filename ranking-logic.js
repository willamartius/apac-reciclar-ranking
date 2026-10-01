(function(root){
  function filtrarEntregasValidadas(entregas,campanhaId,mes,ano){
    if(!Array.isArray(entregas)) throw new TypeError('As entregas precisam ser uma lista.');
    var chave=String(ano)+'-'+String(mes).padStart(2,'0');
    var idsVistos=Object.create(null);
    return entregas.filter(function(entrega){
      if(!entrega || entrega.campanhaId!==campanhaId
        || entrega.statusValidacao!=='validado'
        || !entrega.data || entrega.data.slice(0,7)!==chave) return false;
      if(typeof entrega.id==='string' && entrega.id){
        var idKey='$'+entrega.id;
        if(idsVistos[idKey]) return false;
        idsVistos[idKey]=true;
      }
      return true;
    });
  }

  function somarEntregasValidadas(entregas,campanhaId,mes,ano,colaboradorId,categoria,normalizarQuantidade){
    if(typeof normalizarQuantidade!=='function') throw new TypeError('É necessária uma função para normalizar as unidades.');
    return filtrarEntregasValidadas(entregas,campanhaId,mes,ano).reduce(function(total,entrega){
      if(entrega.colaboradorId!==colaboradorId || entrega.tipo!==categoria) return total;
      var quantidade=normalizarQuantidade(entrega);
      if(typeof quantidade!=='number' || !Number.isFinite(quantidade)){
        throw new TypeError('Uma entrega validada tem quantidade inválida.');
      }
      return total+quantidade;
    },0);
  }

  function resumirCategoria(quantidade,meta){
    if(typeof quantidade!=='number' || !Number.isFinite(quantidade)
      || typeof meta!=='number' || !Number.isFinite(meta)){
      throw new TypeError('A quantidade e a meta precisam ser números válidos.');
    }
    var inteiroMaisProximo=Math.round(quantidade);
    if(Math.abs(quantidade-inteiroMaisProximo)<=1e-9) quantidade=inteiroMaisProximo;
    var percentual=meta>0 ? Math.min(quantidade/meta,1)*100 : 0;
    return {
      quantidade:quantidade,
      percentual:percentual,
      atingida:meta>0 && quantidade>=meta
    };
  }

  var api={
    filtrarEntregasValidadas:filtrarEntregasValidadas,
    somarEntregasValidadas:somarEntregasValidadas,
    resumirCategoria:resumirCategoria
  };
  root.ReciclarRankingLogic=api;
  if(typeof module==='object' && module.exports) module.exports=api;
})(typeof window!=='undefined' ? window : globalThis);
