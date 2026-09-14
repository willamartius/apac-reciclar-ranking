# Reciclar é Cuidar da Casa Comum — Ranking APAC Imperatriz

Aplicativo web para acompanhar a arrecadação de materiais recicláveis dos
colaboradores da APAC de Imperatriz (MA), gerar um ranking mensal de
participação e compartilhar os resultados no WhatsApp.

Site publicado: `https://SEU-USUARIO.github.io/NOME-DO-REPO/`

## O que o app faz

- Cadastro de colaboradores, individual ou por importação de planilha CSV.
- Registro de entregas por tipo de material, com validação e confirmação
  das três assinaturas previstas no regulamento (coleta, colaborador e
  encarregada financeira).
- Cálculo automático da pontuação de cada colaborador nas seis categorias
  oficiais da campanha, com ranking mensal, pódio e critério de desempate.
- Histórico mensal, sem apagar dados de meses anteriores mesmo quando as
  metas mudam.
- Exportação de relatórios em CSV (ranking, entregas, colaboradores).
- Compartilhamento no WhatsApp: mensagem de texto pronta para revisão e
  envio, e geração de um card de imagem (PNG) com o resultado do mês.
- Área administrativa protegida por senha para cadastro, validação e
  exclusão de registros.

## Como os dados são salvos

Os dados ficam em um banco de dados Firebase (Firestore), configurado
diretamente no código do site (variável `FIREBASE_CONFIG`, no início do
bloco `<script>` de `index.html`). Isso é o que permite que qualquer
pessoa que abra o link veja o mesmo ranking, atualizado em tempo real
entre os cadastros.

As regras do Firestore usadas neste projeto liberam leitura e escrita para
qualquer visitante do site, já que o controle de quem pode editar é feito
pela senha de administrador do próprio app, não por autenticação do
Firebase. Isso é intencional para manter a configuração simples, mas vale
saber que não é uma proteção forte contra alguém que descubra as chaves do
projeto.

Se este arquivo for aberto dentro do Claude (como artefato), ele usa
automaticamente o armazenamento interno do Claude em vez do Firebase.

## Publicar ou atualizar o site

1. Baixe o arquivo `index.html` deste repositório (ou o gerado mais
   recente).
2. Envie o arquivo para a raiz do repositório no GitHub, substituindo o
   anterior quando for uma atualização.
3. Em **Settings → Pages**, confirme que a publicação está ativa a partir
   da branch `main`, pasta raiz. O repositório precisa ser público para
   usar o GitHub Pages gratuitamente.
4. Acesse o link do GitHub Pages depois de alguns minutos para conferir.

## Configurar o Firebase (necessário uma única vez por projeto)

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com).
2. Ative **Firestore Database** em modo de teste, em uma região próxima
   do Brasil.
3. Em **Project Settings → Your apps**, adicione um app do tipo Web e
   copie o objeto `firebaseConfig`.
4. Cole esses valores na constante `FIREBASE_CONFIG` no início do
   `<script>` de `index.html`.
5. Em **Firestore Database → Rules**, publique:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /reciclar-apac/{doc} {
         allow read, write: if true;
       }
     }
   }
   ```

## Primeiro acesso

- O app abre com colaboradores e entregas fictícios, claramente marcados
  como dados de teste. Apague-os em **Configurações** quando começar a
  usar dados reais.
- A senha padrão do administrador é `1234`. Troque-a em **Configurações**
  assim que possível, no menu lateral (ou em "Mais", no celular).
- Depois de entrar como administrador, o app lembra disso enquanto o
  navegador continuar aberto, sem pedir a senha de novo a cada
  atualização de página.

## Planilha de coleta manual

O arquivo `planilha-coleta-manual-reciclagem.xlsx` é um modelo para
preenchimento em papel no momento da coleta, com colunas para as três
assinaturas exigidas pelo regulamento. Os dados anotados nela devem ser
depois transcritos no app, em **Entregas → Nova entrega**.

## Regulamento

As metas, materiais aceitos e regras de premiação seguem o documento
oficial da campanha, fornecido pela APAC de Imperatriz. Alterações de
meta feitas em **Configurações** valem só para os meses seguintes; os
meses já registrados mantêm a meta que estava em vigor na época.
