const test = require('node:test');
const assert = require('node:assert/strict');
const {
  filtrarEntregasValidadas,
  somarEntregasValidadas,
  resumirCategoria,
  atribuirPosicoes,
  quantidadeUnitariaValida,
  todasMetasAtingidas,
  resumirDetalhesCategorias,
} = require('../ranking-logic.js');

const normalizar = entrega => entrega.quantidade;
const entrega = (id, quantidade, tipo = 'latas', extras = {}) => ({
  id,
  campanhaId: 'campanha-1',
  data: '2026-09-15',
  colaboradorId: 'josilene',
  tipo,
  quantidade,
  statusValidacao: 'validado',
  ...extras,
});
const somarLatas = entregas => somarEntregasValidadas(
  entregas, 'campanha-1', 9, 2026, 'josilene', 'latas', normalizar
);

test('uses the edited ledger value instead of retaining an earlier total', () => {
  const registroEditado = {...entrega('e1', 79), quantidade: 80};
  assert.equal(somarLatas([registroEditado]), 80);
});

test('a moved delivery contributes only to its current category', () => {
  const movida = entrega('e1', 12, 'pet');
  assert.equal(somarLatas([movida]), 0);
  assert.equal(somarEntregasValidadas(
    [movida], 'campanha-1', 9, 2026, 'josilene', 'pet', normalizar
  ), 12);
});

test('a deleted delivery removed from the ledger contributes nothing', () => {
  assert.equal(somarLatas([]), 0);
});

test('pending deliveries do not count toward available units', () => {
  assert.equal(somarLatas([entrega('e1', 80, 'latas', {statusValidacao: 'pendente'})]), 0);
});

test('a repeated ledger ID is counted once', () => {
  const registro = entrega('e1', 80);
  assert.equal(somarLatas([registro, {...registro}]), 80);
});

test('only validated records in the selected campaign and month are included', () => {
  const registros = [
    entrega('ok', 1),
    entrega('pending', 1, 'latas', {statusValidacao: 'pendente'}),
    entrega('other-campaign', 1, 'latas', {campanhaId: 'campanha-2'}),
    entrega('other-month', 1, 'latas', {data: '2026-10-01'}),
  ];
  assert.deepEqual(
    filtrarEntregasValidadas(registros, 'campanha-1', 9, 2026).map(item => item.id),
    ['ok']
  );
});

test('80/80 reaches 100% and marks the category achieved', () => {
  assert.deepEqual(resumirCategoria(80, 80), {
    quantidade: 80,
    percentual: 100,
    atingida: true,
  });
});

test('achievement is based on units while percentages preserve surplus above 100%', () => {
  assert.deepEqual(resumirCategoria(79.99999999999999, 80), {
    quantidade: 80,
    percentual: 100,
    atingida: true,
  });
  assert.deepEqual(resumirCategoria(120, 80), {
    quantidade: 120,
    percentual: 150,
    atingida: true,
  });
  assert.equal(resumirCategoria(79.9, 80).atingida, false);
});

test('all categories must reach their goals for the public achievement state', () => {
  assert.equal(todasMetasAtingidas([
    {quantidade: 80, meta: 80},
    {quantidade: 120, meta: 100},
  ]), true);
  assert.equal(todasMetasAtingidas([
    {quantidade: 80, meta: 80},
    {quantidade: 99, meta: 100},
  ]), false);
  assert.equal(todasMetasAtingidas([]), false);
});

test('public summary uses available category quantities including surplus', () => {
  assert.deepEqual(resumirDetalhesCategorias([
    {quantidade: 120, meta: 80},
    {quantidade: 20, meta: 20},
  ]), {
    totalMateriais: 140,
    percentualGeral: 125,
    metaAtingida: true,
  });
  assert.deepEqual(resumirDetalhesCategorias([]), {
    totalMateriais: 0,
    percentualGeral: 0,
    metaAtingida: false,
  });
});

test('equal scorers still receive sequential positions using the existing sorted order', () => {
  const resultados = Array.from({length: 6}, (_, index) => ({
    colaborador: {nome: `Pessoa ${index + 1}`},
    pontuacao: 100,
  }));
  assert.deepEqual(
    atribuirPosicoes(resultados).map(resultado => resultado.posicao),
    [1, 2, 3, 4, 5, 6]
  );
});

test('discrete material quantities reject fractions while kilogram entries allow them', () => {
  assert.equal(quantidadeUnitariaValida(79.9, false), false);
  assert.equal(quantidadeUnitariaValida(80, false), true);
  assert.equal(quantidadeUnitariaValida(79.9, true), true);
});
