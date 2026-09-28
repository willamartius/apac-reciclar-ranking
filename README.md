# Reciclapac - Reciclar é Cuidar da Casa Comum

Aplicativo web para acompanhar a arrecadação de materiais recicláveis dos colaboradores da APAC de Imperatriz-MA.

## Acesso e publicação

O app hospedado usa Firebase Authentication com e-mail e senha. O cliente não cria contas: um administrador cria cada conta no Firebase Authentication e atribui um papel no Firestore.

Papéis aceitos em `reciclar-apac-roles/{uid}`:

- `{"role":"admin"}`: configura campanhas, gerencia dados e usuários pelo Console, exclui registros e exporta relatórios/backups.
- `{"role":"operator"}`: consulta os dados e cadastra/edita colaboradores, entregas e transferências. Não pode excluir registros, configurar campanhas ou exportar.

Os dados são legíveis somente por contas com um desses papéis. O operador não pode excluir dados nem alterar campanhas pelas regras do Firestore.

Cada usuário pode salvar o próprio nome de exibição no Firebase Authentication. O papel exibido no app vem do campo `role` do documento `reciclar-apac-roles/{uid}` e não pode ser alterado pelo próprio usuário.

Registros excluídos por um administrador ficam em **Itens apagados** por até 30 dias e podem ser restaurados nesse período. A lixeira é compartilhada entre administradores, sua leitura é restrita ao papel `admin`, e itens vencidos são removidos na próxima inicialização administrativa do app. Publique as regras atualizadas do Firestore junto com esta versão.

### Ranking público

Visitantes sem login veem o ranking por campanha e período, atualizado automaticamente quando um administrador ou operador salva alterações no app. Os seletores de campanha e mês mostram somente períodos com atividade e o mês atual. A página mostra nome, posição, pontuação e um resumo mensal por material com disponibilidade (excedentes destacados em verde), meta e percentual. Somente colaboradores com entregas validadas no período aparecem no ranking. Entregas individuais, transferências, setor e demais dados cadastrais continuam protegidos por login.

O botão único **Compartilhar no WhatsApp** abre uma prévia editável, com opção de resumo do Top 3 ou ranking completo. A mensagem inclui um link para a página pública; revise o conteúdo antes de abrir o WhatsApp ou copiar o texto.

As regras dão leitura anônima apenas à coleção `reciclar-apac-public-ranking`; as coleções operacionais continuam exigindo papel autorizado. Usuários autenticados com papel de administrador ou operador atualizam o resumo público ao salvar dados. Para habilitar essa sincronização, publique as regras atualizadas do Firestore junto com o app.

### Preparar o Firebase existente

1. Faça um backup local dos dados atuais antes da implantação.
2. No Firebase Console do projeto `apac-reciclar`, habilite **Authentication > Sign-in method > Email/Password**, configure e aplique uma política forte (por exemplo, mínimo de 12 caracteres, com maiúsculas, minúsculas, números e símbolos) e inclua o domínio do site em **Authentication > Settings > Authorized domains**.
3. Em **Authentication > Users**, crie a conta inicial do administrador e copie o UID.
4. No Firestore Console, crie `reciclar-apac-roles/{UID}` com o campo `role` igual a `admin`. Faça isso antes de substituir as regras abertas atuais.
5. Publique o conteúdo de `firestore.rules` em **Firestore Database > Rules**. As coleções operacionais continuam restritas a contas autorizadas; apenas o resumo em `reciclar-apac-public-ranking` tem leitura anônima, e administradores e operadores podem atualizá-lo.
6. Publique esta versão do app. Entre com uma conta autorizada; o primeiro acesso sincroniza os rankings públicos existentes e, dali em diante, os resumos são atualizados após salvar alterações. No primeiro acesso administrativo, o app também copia as coleções antigas para documentos individuais, verifica a cópia e remove a senha local antiga da configuração. Os documentos legados são mantidos como cópia de segurança.
7. Para cada operador, crie uma conta em **Authentication > Users** e um documento `reciclar-apac-roles/{UID}` com `role: "operator"`.

Não deixe as regras antigas (`allow read, write: if true`) publicadas. Antes de finalizar a implantação, teste o login, a leitura operacional com uma conta autorizada, a recusa de leitura anônima nas coleções operacionais e a leitura pública apenas do ranking.

### Criar o primeiro acesso administrativo

O site não tem cadastro público. Se as regras restritivas já estiverem publicadas e ainda não houver administrador, crie a primeira conta pelo Firebase Console:

1. Em **Authentication > Users > Add user**, informe o e-mail e defina uma senha inicial.
2. Copie o UID da conta criada.
3. Em **Firestore Database > Data**, crie a coleção `reciclar-apac-roles`, um documento com o UID como ID e o campo string `role` com valor `admin`.
4. Entre no site com o e-mail e a senha que acabou de definir. A conta administrativa inicializa o app e migra os dados.

As regras do Firestore protegem as requisições do app; operações feitas pelo Console dependem das permissões IAM da sua conta Google no projeto. Se o Console não permitir criar o documento, peça a alguém com acesso administrativo ao projeto para fazê-lo. Depois de entrar, o administrador pode criar usuários adicionais pelo Console e atribuir a eles `admin` ou `operator` da mesma forma.

As credenciais e os papéis não fazem parte dos novos backups JSON. Arquivos de backup exportados por versões antigas podem conter a senha administrativa antiga; proteja-os ou apague-os após confirmar a migração. Senhas são redefinidas por e-mail pelo Firebase Authentication.

O backup atual é manual, em arquivo JSON local, e só pode ser exportado pelo administrador. Integração automática com Google Drive ainda não está implementada; ela exige configurar OAuth e definir como os arquivos serão compartilhados e protegidos.
