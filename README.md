# Reciclar é Cuidar da Casa Comum

Aplicativo web para acompanhar a arrecadação de materiais recicláveis dos colaboradores da APAC de Imperatriz-MA.

## Acesso e publicação

O app hospedado usa Firebase Authentication com e-mail e senha. O cliente não cria contas: um administrador cria cada conta no Firebase Authentication e atribui um papel no Firestore.

Papéis aceitos em `reciclar-apac-roles/{uid}`:

- `{"role":"admin"}`: configura campanhas, gerencia dados e usuários pelo Console, exclui registros e exporta relatórios/backups.
- `{"role":"operator"}`: consulta os dados e cadastra/edita colaboradores, entregas e transferências. Não pode excluir registros, configurar campanhas ou exportar.

Os dados são legíveis somente por contas com um desses papéis. O operador não pode excluir dados nem alterar campanhas pelas regras do Firestore.

### Preparar o Firebase existente

1. Faça um backup local dos dados atuais antes da implantação.
2. No Firebase Console do projeto `apac-reciclar`, habilite **Authentication > Sign-in method > Email/Password**, configure e aplique uma política forte (por exemplo, mínimo de 12 caracteres, com maiúsculas, minúsculas, números e símbolos) e inclua o domínio do site em **Authentication > Settings > Authorized domains**.
3. Em **Authentication > Users**, crie a conta inicial do administrador e copie o UID.
4. No Firestore Console, crie `reciclar-apac-roles/{UID}` com o campo `role` igual a `admin`. Faça isso antes de substituir as regras abertas atuais.
5. Publique o conteúdo de `firestore.rules` em **Firestore Database > Rules**. Isso remove o acesso anônimo e limita operadores.
6. Publique esta versão do app. Entre com a conta administradora; no primeiro acesso, o app copia as coleções antigas para documentos individuais, verifica a cópia e remove a senha local antiga da configuração. Os documentos legados são mantidos como cópia de segurança.
7. Para cada operador, crie uma conta em **Authentication > Users** e um documento `reciclar-apac-roles/{UID}` com `role: "operator"`.

Não deixe as regras antigas (`allow read, write: if true`) publicadas. Antes de finalizar a implantação, teste o login, a leitura com uma conta autorizada e a recusa de leitura anônima.

As credenciais e os papéis não fazem parte dos novos backups JSON. Arquivos de backup exportados por versões antigas podem conter a senha administrativa antiga; proteja-os ou apague-os após confirmar a migração. Senhas são redefinidas por e-mail pelo Firebase Authentication.

O backup atual é manual, em arquivo JSON local, e só pode ser exportado pelo administrador. Integração automática com Google Drive ainda não está implementada; ela exige configurar OAuth e definir como os arquivos serão compartilhados e protegidos.
