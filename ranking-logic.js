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
    var percentual=meta>0 ? quantidade/meta*100 : 0;
    return {
      quantidade:quantidade,
      percentual:percentual,
      atingida:meta>0 && quantidade>=meta
    };
  }

  function atribuirPosicoes(resultados){
    var posicao=0;
    return resultados.map(function(resultado){
      if(resultado.pontuacao<=0) return Object.assign({},resultado,{posicao:null});
      posicao++;
      return Object.assign({},resultado,{posicao:posicao});
    });
  }

  function quantidadeUnitariaValida(quantidade,fracionavel){
    return typeof quantidade==='number' && Number.isFinite(quantidade)
      && quantidade>=0 && (fracionavel===true || Number.isInteger(quantidade));
  }

  function todasMetasAtingidas(categorias){
    return Array.isArray(categorias) && categorias.length>0
      && categorias.every(function(categoria){
        return resumirCategoria(categoria.quantidade,categoria.meta).atingida;
      });
  }

  function resumirDetalhesCategorias(categorias){
    if(!Array.isArray(categorias)) throw new TypeError('Os detalhes das categorias precisam ser uma lista.');
    if(categorias.length===0) return {totalMateriais:0,percentualGeral:0,metaAtingida:false};
    var resumo=categorias.map(function(categoria){
      return resumirCategoria(categoria.quantidade,categoria.meta);
    });
    return {
      totalMateriais:Math.round(resumo.reduce(function(total,item){return total+item.quantidade;},0)),
      percentualGeral:resumo.reduce(function(total,item){return total+item.percentual;},0)/resumo.length,
      metaAtingida:resumo.every(function(item){return item.atingida;})
    };
  }

  function calcularSaldoMensal(creditos,carryIn,meta){
    if([creditos,carryIn,meta].some(function(valor){return typeof valor!=='number'||!Number.isFinite(valor);})
      || carryIn<0 || meta<0 || creditos+carryIn<0){
      throw new TypeError('O saldo disponível, o saldo transportado e a meta precisam ser números válidos e não negativos.');
    }
    var totalDisponivel=creditos+carryIn;
    return {
      totalDisponivel:totalDisponivel,
      leftover:Math.max(0,totalDisponivel-meta)
    };
  }

  function deveIncluirNoRankingPublico(resultado,itensTrocados){
    return !!resultado && (
      !!resultado.primeiraEntrega
      || (typeof resultado.pontuacao==='number' && resultado.pontuacao>0)
      || (typeof resultado.totalMateriais==='number' && resultado.totalMateriais>0)
      || (typeof itensTrocados==='number' && Number.isFinite(itensTrocados) && itensTrocados>0)
    );
  }

  function somarItensTrocados(trocas,campanhaId,mes,ano,colaboradorId,itensPorKit){
    if(!Array.isArray(trocas)) throw new TypeError('As trocas precisam ser uma lista.');
    if(typeof itensPorKit!=='number' || !Number.isFinite(itensPorKit) || itensPorKit<=0){
      throw new TypeError('A quantidade de itens por kit precisa ser um número válido.');
    }
    var chave=String(ano)+'-'+String(mes).padStart(2,'0');
    return trocas.reduce(function(total,troca){
      if(!troca || troca.campanhaId!==campanhaId || troca.colaboradorId!==colaboradorId
        || !troca.data || troca.data.slice(0,7)!==chave) return total;
      var quantidade=Number.isFinite(troca.cartelasEmitidas)
        ?troca.cartelasEmitidas
        :(Number(troca.quantidadeKits)||0)*itensPorKit;
      if(!Number.isFinite(quantidade) || quantidade<0){
        throw new TypeError('Uma troca do mês tem quantidade de itens inválida.');
      }
      return total+quantidade;
    },0);
  }

  function deveDestacarBotaoPublico(metaAtingida,resumoTroca){
    if(resumoTroca) return Number.isFinite(resumoTroca.quantidade) && resumoTroca.quantidade>0;
    return metaAtingida===true;
  }

  var api={
    filtrarEntregasValidadas:filtrarEntregasValidadas,
    somarEntregasValidadas:somarEntregasValidadas,
    resumirCategoria:resumirCategoria,
    atribuirPosicoes:atribuirPosicoes,
    quantidadeUnitariaValida:quantidadeUnitariaValida,
    todasMetasAtingidas:todasMetasAtingidas,
    resumirDetalhesCategorias:resumirDetalhesCategorias,
    calcularSaldoMensal:calcularSaldoMensal,
    deveIncluirNoRankingPublico:deveIncluirNoRankingPublico,
    somarItensTrocados:somarItensTrocados,
    deveDestacarBotaoPublico:deveDestacarBotaoPublico
  };
  root.ReciclarRankingLogic=api;
  if(typeof module==='object' && module.exports) module.exports=api;
})(typeof window!=='undefined' ? window : globalThis);
