import React, { useState, useMemo, useRef, useEffect } from "react";

/* ============================================================
   ViviBot — MyBuilder · InstaPro
   Base de conhecimento extraída dos decks de onboarding/training

   PARA EXPANDIR:
   · KB_PT / KB_EN → o manual. Os blocos têm de ficar na MESMA
        ordem nos dois: as intenções procuram por posição.
        Alimenta o manual, a pesquisa local e o prompt da IA.
   · ROUTES_RAW / FIELDS_RAW / REASONS_RAW → dados com pt/en lado a lado.
   · decideRefund() + RF → regras e texto do motor de reembolso.
   · INTENTS + TX → respostas curadas; a regex é bilingue, o texto vem de TX.
   · REASON_PHRASES → como o TP descreve a razão em linguagem corrente.
   · UI → todo o texto do interface.

   PARA ACRESCENTAR UM IDIOMA:
   criar KB_XX, e as chaves "xx" em TX, RF, CHIPS, UI, QUEUES,
   ROUTES_RAW, FIELDS_RAW, REASONS_RAW. Mais nada muda.
   ============================================================ */

const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAABRElEQVR42u3cQRKCMAwFUNbegr1L738udzoeQGUIJG14nek65A06FNq/LIbRcjye62u0CaoTbAe4EsiOcCmQV4A7DfKKeIchXhkvjAgvgAgtiAgsAAgriAgqAAgpiAgoAAgniAhmcMD1dk9pLqNOGuCnmW9zxjqpgL+aOrK5rDqpgFuaOqK5rDp/AavwIs1l1dmECBBgD8A9Te1pLquOO9BPGCBAz4EFgN1XIimAndfCaYBd38aUALZ+JzjKRVX9n00LGFlRVIOWAh4BVw1ZBngGXgViCeCZeNmIAGd8DsyaAAECBDgSYCZeFiJAgAABAgQIECBAgAABNge0FgYIEODIgJ0QWx/1Aui78BiHDVt9VK/cHzPr3phhj7vOsjvLoWtH/gVPiD0BCFH0kwAyEXjwIIoBFUYrDhmcJHMR8VNCXX28AXgGX9oCC1FbAAAAAElFTkSuQmCC";

const KB_PT = [
  {
    id: "empresa",
    num: "00",
    title: "A plataforma",
    blocks: [
      {
        h: "MyBuilder · InstaPro",
        items: [
          "Fundada em 2004 — 'by a tradesman, for tradespeople'.",
          "Mais de 150.000 novos leads gerados por mês.",
          "Liga homeowners (HO) a tradespeople (TP) verificados e avaliados.",
        ],
      },
      {
        h: "Valor para o Tradesperson (TP)",
        items: [
          "Acesso a leads locais que correspondem ao ofício, área e agenda.",
          "Pay-per-shortlist: adesão gratuita, só paga quando o HO faz shortlist do perfil.",
          "Perfil com reviews genuínas que funciona como portfólio.",
          "Define a área geográfica — só recebe leads das zonas que escolhe.",
          "Filtros por tipo de trabalho: nunca vê jobs fora da sua especialidade.",
        ],
      },
      {
        h: "Valor para o Homeowner (HO)",
        items: [
          "Publicar um job é gratuito — sem taxas escondidas, sem contratos.",
          "Vê perfis verificados, portfólios e histórico de trabalhos.",
          "Lê reviews reais e não filtradas antes de decidir.",
          "Convida até 10 tradespeople por job, ou conversa com quem se candidata.",
          "Adiciona fotos e detalhes ao job e atualiza a qualquer momento na app.",
          "Os dados do HO só são partilhados com os tradespeople que ele escolhe.",
        ],
      },
    ],
  },
  {
    id: "workflow",
    num: "01",
    title: "Workflow & Queue Routing",
    blocks: [
      {
        h: "Triagem",
        items: [
          "Tudo o que entra em info@mybuilder.com cai na Support Queue e é triado a partir daí.",
          "O routing correto é feito ANTES de qualquer ação no caso.",
        ],
      },
      {
        h: "Finance Queue",
        items: [
          "Credits & invoice queries",
          "Subscription management (incluindo cancelamento de subscrição)",
          "Collections queries",
          "Payment issues",
        ],
      },
      {
        h: "Prospect Queue",
        items: ["Certificates & documentation", "New trade sign-ups", "Application follow-ups"],
      },
      {
        h: "Disputes Queue",
        items: ["Remove bad reviews (pedido do TP)", "Disputas entre HO e TP", "Casos de queixa complexos"],
      },
      {
        h: "Legal Queue",
        items: ["Correspondência legal", "Pedidos de entidades reguladoras", "Pedidos de organismos oficiais"],
      },
      {
        h: "Escalation imediata — 6 gatilhos",
        items: [
          "Legal Matter — correspondência de partes legais, organismos oficiais, ou clientes a invocar ação legal contra a InstaPro.",
          "Media / PR Risk — jornalistas, influencers, contactos de media, ameaças de exposição pública.",
          "Identity Theft — acesso fraudulento a conta, impersonation, alegações de fraude de identidade.",
          "Data Requests (GDPR) — subject access requests, pedidos de eliminação, qualquer obrigação legal sobre dados.",
          "Defamation Claims — difamação ligada a reviews publicadas de TP ou HO.",
          "External Authorities — reguladores, agências governamentais, autoridades policiais.",
        ],
      },
      {
        h: "ALWAYS DO",
        items: [
          "Ligar todas as chamadas ao caso correto.",
          "Quando o TP/HO pede uma chamada, tens de ligar.",
          "Usar gramática UK em toda a comunicação escrita.",
          "Prestar atenção às 'Important Notes' da conta.",
          "Colocar a saudação correta nos emails.",
          "Ligar o caso à conta depois da verificação do utilizador.",
          "Ler toda a case chain antes de responder.",
        ],
      },
      {
        h: "NEVER DO",
        items: [
          "Enviar o email template errado.",
          "Banir contas (sem autorização).",
          "Fechar casos sem ação tomada.",
          "Partilhar informação de conta não verificada.",
          "Saltar a case chain antes de responder.",
        ],
      },
      {
        h: "Exemplos de casos (training)",
        items: [
          "Spam/Junk — 08692443, 08693123, 08697462, 08683374 → marcar 'Not processable / Spam / Junk'.",
          "Subscription — 08697605, 08697892 → Support → Finance Queue.",
          "Standard Support — 08684813, 08644862, 08685431, 08697018 → resolver na Support Queue.",
          "Support → Disputes — 08082566, 08692807 → Disputes Queue.",
          "Sponsored Placement — 08697149 → tratar como query de sponsored placement (Support).",
          "Prospect — 08697601 → Prospect Queue.",
          "External Review — 08700317, 08711949, 08711617 → processar como aprovação de external review.",
          "⚠ Jornalista (NÃO é spam) — 08501305, 08766242 → escalar imediatamente, risco PR/Media.",
        ],
      },
    ],
  },
  {
    id: "support",
    num: "02",
    title: "Support Queue, GDPR & Contas",
    blocks: [
      {
        h: "Categorias da Support Queue",
        items: [
          "Account Details — bank details, company info, atualizações de contacto, alterações de perfil.",
          "Tradesperson Success — portfólio/fotos, estado da conta (paused/suspended), questões de reviews.",
          "Homeowner Assistance — ciclo de vida do job (publicar/fechar), validação de skills, queixas sobre TP.",
          "Queries & Refunds — reembolsos (incluindo rejeições) e sponsored placement.",
          "General Mediation — não pagamento, trabalhos incompletos, disputas de onboarding de conta.",
          "Not Processable / Spam — junk, spam e contactos irrelevantes: categorizar e fechar sem ação.",
        ],
      },
      {
        h: "Case Management — 5 standards",
        items: [
          "01 Correct Queue Routing — encaminhar para a queue certa antes de qualquer ação.",
          "02 Mandatory Case Reason — todo o caso exige Case Reason no fecho. Sem exceções.",
          "03 Standard Categorisation — pedidos válidos: Type = 'Service'. Spam/Junk: Type = 'Not processable / Spam / Junk'.",
          "04 Refund Handling — reembolsos na Support Queue resolvem-se localmente. Completar o caso antes de fechar como 'Tradespeople Refund'. NÃO mudar a queue primeiro.",
          "05 Category Matching — o campo Category tem de corresponder exatamente ao pedido do cliente. Nada de categorias genéricas.",
        ],
      },
      {
        h: "Verificação GDPR — regra base",
        items: [
          "Antes de discutir ou alterar QUALQUER detalhe da conta, o titular tem de confirmar o Nome Completo + DOIS dados pessoais.",
          "A chamada telefónica é sempre a primeira tentativa.",
          "TP: confirmar o número de telefone registado (se pedido por email) e o endereço de email completo associado à conta (por telefone).",
          "HO: confirmar o postcode do job mais recente publicado na plataforma; e os últimos 3 dígitos do postcode OU a primeira linha da morada.",
          "Se não conseguir responder: explicar que não é possível verificá-lo, NÃO partilhar nenhuma informação, e pedir que envie email a partir do endereço registado.",
        ],
      },
      {
        h: "Verificação — o que NUNCA fazer",
        items: [
          "Sem dicas nem sugestões — nunca indicar quantos dígitos são precisos nem o formato da informação. Dar dicas viola o GDPR e constitui exposição de dados.",
          "Sem informação parcial — se falhar a verificação, não partilhar nada: nem email parcial, nem telefone, nem postcode, nem nome da empresa.",
          "Nunca confirmar a cidade — dizer a cidade dá uma pista que permite adivinhar o postcode e obter acesso não autorizado.",
        ],
      },
      {
        h: "Contas — PODE atualizar (com verificação)",
        items: [
          "Número de telefone (1 por conta, alterável várias vezes)",
          "Morada",
          "Endereço de email (1 por conta, alterável várias vezes)",
          "Pessoa de contacto na conta",
          "Nome da empresa",
          "Sole Trader → Sole Trader",
        ],
      },
      {
        h: "Contas — NÃO PODE atualizar (independentemente da verificação)",
        items: [
          "Company Owner Name em conta Sole Trader — nunca pode ser alterado, em circunstância alguma.",
          "Company Owner Name em conta LTD — só se a alteração estiver refletida na Companies House com o mesmo company number.",
          "Conversão de tipo de empresa (Sole Trader ↔ LTD) — exige criar uma conta nova.",
          "⚠ Exceção: LTD → LTD com o mesmo company number — se a informação bater certo com a Companies House e a empresa estiver ativa (não dissolvida), não é preciso verificação do utilizador.",
        ],
      },
      {
        h: "Pedidos de cancelamento",
        items: [
          "Cancel Account (Delete) → Support Queue. Confirmar identidade antes de avançar.",
          "Cancel Subscription → Finance Queue. Não processar na Support.",
          "Cancel Sponsored Placement → Support. Tentar sempre 1 chamada primeiro; sem resposta, cancelar e enviar email de confirmação.",
          "Cancel Charge / Invoice → Support. Cancelamento de charges de job lead ou disputas de fatura.",
          "Cancel Expressed Interest → Support. O TP pode pedir para retirar o interesse num lead.",
        ],
      },
    ],
  },
  {
    id: "refunds",
    num: "03",
    title: "Refund Queue",
    blocks: [
      {
        h: "Requisitos do pedido",
        items: [
          "Obrigatório: um Job ID incluído no pedido.",
          "Obrigatório: a razão do reembolso claramente indicada.",
          "Se faltar algo: pedir ao TP que responda ao email com os detalhes em falta e fechar o caso depois de enviar. Não processar um pedido incompleto.",
          "Múltiplos reembolsos num só caso: processar individualmente e enviar o email 'refund pushback' (máximo duas vezes). Se insistir, processar como exceção única.",
        ],
      },
      {
        h: "Critérios de avaliação",
        items: [
          "Days ATI (Able to Interact) — há quanto tempo o TP está ativo na plataforma.",
          "Total Shortlists — número total de vezes que o TP foi shortlisted até hoje.",
          "Refund Ratio — rácio de reembolsos aprovados sobre shortlists nos últimos 12 meses.",
          "Job Lead Value — valor monetário do lead em causa.",
          "Dishonesty Notes — Important Notes que sinalizem pedidos desonestos anteriores.",
          "Request Timing — quando o pedido foi submetido e quantos dias depois do shortlist.",
        ],
      },
      {
        h: "ALWAYS VALID (aprovar mesmo acima de 30% de rácio)",
        items: [
          "Job contact details incorrect (ex.: número não atribuído)",
          "Shortlists em anúncios duplicados",
          "HO andava à procura de emprego / posição de trabalho",
          "HO fraud detection",
        ],
      },
      {
        h: "SOMETIMES ACCEPTED (caso a caso)",
        items: [
          "Job fora da working area do TP",
          "Job fora das activities do TP",
          "Rejection when shortlisted",
          "Wrong job description",
          "HO só queria um orçamento",
          "HO incontactável (7+ dias após o shortlist)",
          "HO já não precisa do serviço",
          "Other — requer aprovação de supervisor",
        ],
      },
      {
        h: "ALWAYS REJECTED",
        items: ["O TP não ganhou o job", "Qualquer razão que não conste em Always Valid ou Sometimes Accepted"],
      },
      {
        h: "Janelas temporais",
        items: [
          "Dia 0 — data do shortlist.",
          "Dia 7+ — abre a janela para a categoria 'HO Unreachable'.",
          "Dia 42 — prazo máximo para razões aceitáveis (Sometimes Accepted).",
          "Dia 70 — prazo alargado, só para razões Always Valid.",
          "New TP: ≤100 dias ATI OU <16 shortlists → o rácio não é considerado.",
          "Old TP: >100 dias ATI E ≥16 shortlists → o rácio aplica-se integralmente.",
          "Circunstâncias excecionais ou recurso de uma rejeição inicial → escalar ao Team Lead.",
        ],
      },
      {
        h: "Gatilhos de Hold & Check",
        items: [
          "£35+ — qualquer pedido de valor igual ou superior a £35, incluindo de TPs novos.",
          "20–30% — TPs estabelecidos com rácio entre 20% e 30%: Hold & Check em todos os pedidos.",
          "12 meses — se existir Important Note de pedidos desonestos, todos os pedidos passam por Hold & Check durante 1 ano.",
          "4+ — pedidos de 4 ou mais reembolsos em simultâneo com a mesma razão.",
        ],
      },
      {
        h: "Hold & Check — processo de 4 fases",
        items: [
          "Fase 1 · Visual Verification — correr visual checks à razão do reembolso na plataforma. TP elegível: aprovar → email automático → fechar. TP não elegível: rejeitar → email automático → fechar. Não consegue verificar: passar à Fase 2.",
          "Fase 2 · Homeowner Contact — ligar ao HO para verificar a razão do TP. HO concorda: aprovar → email → fechar. HO discorda: rejeitar → email → fechar. Sem atendimento: voicemail + email + follow-up a 24h.",
          "Fase 3 · 24-Hour Follow-Up — verificar resposta por email do HO. Se houver resposta: voltar atrás para verificar. Sem resposta: o caso reabre, nova tentativa de chamada (sem deixar segundo voicemail) + follow-up a 24h.",
          "Fase 4 · Closure — sem email E sem atendimento: selecionar Approved. Definir 'Temporarily Reject' no separador refund. Registar sempre um post com a razão do Hold & Check.",
        ],
      },
      {
        h: "Regras de rácio",
        items: [
          "20–29% — todas as razões são consideradas, mas o Hold & Check é obrigatório em todos os pedidos.",
          "30%+ — só para Old TPs: apenas Always Valid Reasons são aceites (Fraud, Duplicates, Job Search, Incorrect Contact Details).",
        ],
      },
      {
        h: "Verificação telefónica obrigatória",
        items: [
          "Number Not Working — ligar sempre ao HO. O Natterbox mostra 'Number unallocated' e desliga automaticamente se estiver inativo.",
          "Number Belongs to Someone Else — ligar e esperar atendimento. Verificar se reconhecem o nome da conta e se se registaram no MyBuilder.",
          "Account Deletion Advice — avisar sempre quem atende de que a conta será eliminada se confirmar que nunca a criou.",
        ],
      },
      {
        h: "Visual Checks — 4 passos",
        items: [
          "1 Run Visual Checks — em ambos: Instapro (via Impersonate) e Salesforce (separador Job Info Search).",
          "2 Assess Evidence — se os checks confirmam a razão, aprovar imediatamente. Se houver dúvida, ligar ao HO primeiro.",
          "3 Associate Job ID — associar sempre o Job ID no separador Job Info Search, sobretudo antes de transferir o caso para outra queue. É obrigatório.",
          "4 Confirm Conversation — se a conversa HO–TP confirma a razão, não é necessário Hold & Check, independentemente de valor, dias ou rácio.",
        ],
      },
    ],
  },
  {
    id: "dip",
    num: "04",
    title: "Dip Checks",
    blocks: [
      {
        h: "O que é",
        items: [
          "Spot checks aleatórios a 10% dos casos de reembolso concluídos — os que foram resolvidos fora do processo de Hold & Check.",
          "Objetivo: verificar se as razões dadas pelo TP eram genuínas ou desonestas.",
          "Impacto: a decisão original não muda. TPs desonestos: warning + possível ban.",
        ],
      },
      {
        h: "Procedimento de 3 dias",
        items: [
          "Dia 1 · Initial Contact — ligar ao HO. Sem atendimento: deixar voicemail → enviar email → criar tarefa de follow-up a 24h.",
          "Dia 2 · Follow-Up Call — segunda chamada se não houve resposta por email. NÃO deixar um segundo voicemail. Novo follow-up a 24h.",
          "Dia 3 · Case Closure — verificar respostas por email. Fechar imediatamente se não houve contacto. Categorizar como 'Unknown'.",
        ],
      },
      {
        h: "Onde encontrar a informação",
        items: [
          "1 Localizar o Job ID original do reembolso no fundo do caso.",
          "2 Clicar no link do TP no caso para abrir a conta.",
          "3 Ir ao separador Instapro → clicar em Refund.",
          "4 Procurar pelo job ID e confirmar o nome do homeowner.",
          "5 Impersonate do TP — correr visual checks caso o agente se tenha esquecido de marcar a caixa 'H&C' no caso de reembolso original.",
        ],
      },
      {
        h: "Resultados",
        items: [
          "MATCH ✓ — a razão dada pelo TP corresponde à evidência. Survey: 'Match'. Status: Closed Won. Sem ação adicional.",
          "MISMATCH ✕ — o HO diz que a razão do TP é incorreta ou desonesta. Survey: 'Mismatch'. Adicionar às Important Notes o texto exato 'TP warned for mismatch refund request' (o texto tem de ser exato, para consistência de reporting) + email de warning.",
          "UNKNOWN ? — o HO não foi contactado, ou não se lembra, ou prefere não dizer. Survey: 'Unknown'. Status: Closed Lost.",
        ],
      },
    ],
  },
  {
    id: "reviews",
    num: "05",
    title: "External Reviews",
    blocks: [
      {
        h: "Limites",
        items: ["Máximo de 5 external reviews publicadas por tradesperson.", "1 external review permitida por homeowner (por TP)."],
      },
      {
        h: "Processo de 4 passos",
        items: [
          "1 Review Received — o caso é criado automaticamente no Salesforce: 'External Review Approval from [HO name] to [TP name]'.",
          "2 First Contact — se for a primeira external review, ou se não houve chamada bem-sucedida anterior: uma tentativa de chamada para pedir a fatura, seguida de email.",
          "3 Invoice Verification — a fatura tem de conter: nome do TP/empresa, nome do HO, descrição do trabalho e valor do trabalho. Aceitam-se todos os formatos: PDF, Excel, Word, etc.",
          "4 Publish or Decline — fatura recebida e verificada → publicar. Não recebida → a review NÃO é publicada.",
        ],
      },
      {
        h: "Decline imediato",
        items: [
          "O mesmo HO já avaliou este TP.",
          "Rating de 1 a 4 (avaliação baixa).",
          "Comentários rudes, abusivos ou discriminatórios.",
          "Nome do reviewer não corresponde aos registos do TP.",
          "O TP enviou a sua própria review.",
          "Conta banida ou anonimizada.",
          "Conteúdo da review não corresponde à categoria do job.",
          "Secção de comentário em branco.",
        ],
      },
    ],
  },
  {
    id: "acquisition",
    num: "06",
    title: "Acquisition Campaign",
    blocks: [
      { h: "Objetivo", items: ["A ATI Conversion: transformar prospects curiosos em tradespeople ativos na plataforma."] },
      {
        h: "Quem é o candidato",
        items: [
          "Pessoas ativamente à procura de novas oportunidades de trabalho.",
          "Pessoas que se sentaram especificamente para preencher uma candidatura.",
          "Candidatos que iniciaram o processo de sign-up de propósito.",
          "Utilizadores que começaram a candidatura mas não a completaram.",
        ],
      },
      {
        h: "Porquê — intenção e estratégia",
        items: [
          "As ações deles provam que já precisam de uma solução.",
          "Começaram a candidatura por uma razão específica e lógica.",
          "O nosso trabalho é perceber essa razão — não fazer hard-sell.",
          "O sucesso vem de mostrar como a plataforma encaixa nas necessidades concretas deles.",
          "Estão a explorar soluções ativamente, não só a espreitar.",
          "Estão abertos a mudar, mas ainda a avaliar o encaixe.",
          "Querem perceber depressa 'o que é que isto significa para mim'.",
          "Falhar o 'porquê' leva a mensagens genéricas, que reduzem relevância e confiança.",
        ],
      },
      {
        h: "Motivações centrais",
        items: [
          "Mais dinheiro — trabalho consistente ou rendimentos mais altos.",
          "Mais controlo — escolher quando e como trabalham.",
          "Segurança — reduzir lacunas de trabalho e incerteza financeira.",
          "Flexibilidade — encaixar o trabalho na vida pessoal.",
          "Orgulho — construir reputação e estatuto profissional.",
          "Plano B — evitar depender de uma única fonte de rendimento.",
        ],
      },
      {
        h: "Perfis de motivação",
        items: [
          "Financeiro / volume de trabalho — rendimento extra, sazonalidade, custos mais altos, plano de reserva, recém-independente.",
          "Carreira e crescimento — novo no ofício, mudança de zona, visibilidade e reputação, reviews, recém-qualificado.",
          "Controlo e flexibilidade — escolher os jobs, preferir certos tipos de trabalho, só trabalho local, variedade entre ofícios.",
          "Prova social — ouviu falar de um colega, vê outros a ter sucesso, acredita que também pode resultar.",
        ],
      },
      {
        h: "Estrutura da chamada — 6 passos",
        items: [
          "1 Greet Confidently — apresentar-se e cumprimentar o TP pelo primeiro nome.",
          "2 State the Reason — explicar claramente porque está a ligar: eles iniciaram uma candidatura.",
          "3 Inform of Recording — avisar que a chamada está a ser gravada para efeitos de formação e qualidade.",
          "4 Open Question — perguntar porque se candidataram; perceber a situação e a motivação. Ouvir ativamente.",
          "5 Identify the Gap — dizer que parte da candidatura está incompleta ou em falta.",
          "6 Set Next Steps — informar que vão receber um email com link para completar a candidatura e uma chamada de follow-up.",
        ],
      },
      {
        h: "Objeções — pontos de valor",
        items: [
          "Immediate Access — leads que correspondem ao ofício e localização, quando precisam.",
          "Complete Control — escolhem exatamente os jobs que querem seguir.",
          "Full Transparency — veem os detalhes completos do job e o preço do lead antes de responder.",
          "Pay When You Connect — só pagam quando ambos, TP e HO, querem ligar-se.",
          "Pay As You Go — sem subscrição, sem compromisso de gasto.",
          "Não aderir = leads perdidos, mais tempo em marketing, custos de subscrição mais altos noutro sítio.",
        ],
      },
      {
        h: "Wrap-up codes",
        items: [
          "Regra global: Topic Category = 'acquisition/subscriptions' em TODAS as chamadas, sem exceção.",
          "Contacted & Speech Delivered — Wrap-up: 'contacted'. Call Topic: 'proposal made'. Salesforce: Closed (reabre em 7 dias se não ATI).",
          "Unreached / Voicemail — deixar voicemail na 1.ª chamada se possível. Wrap-up: 'voicemail/no answer'. Salesforce: Closed (reabre em 3 dias se não ATI).",
          "Reached — Speech Not Delivered — cenários: desligou, ocupado, pediu callback. Wrap-up: 'partial contacted'. Reabre à hora combinada ou pela regra padrão de 3 dias.",
          "Not Interested / Unqualified — Wrap-up: 'partial contacted'. Salesforce: 'TP Not Interested' ou 'TP Unqualified'. Ops Campaign stage → 'Closed Lost'.",
          "Wrong Number — Wrap-up: 'Wrong Contact' ou 'Incorrect Number'. Salesforce: 'TP Unqualified'. Atualizar o número; abrir caso novo se derem um número novo.",
        ],
      },
      {
        h: "Quando fechar como Closed Lost",
        items: [
          "NOT INTERESTED: já tem trabalho suficiente; acha que há demasiada concorrência; não há jobs interessantes que cheguem; não está interessado agora, talvez mais tarde; não quer mais lidar connosco; não tem receita suficiente vinda dos leads.",
          "UNQUALIFIED: número de telefone/morada incorretos; não tem qualificação válida no ofício; a empresa não é da área de home services; menor de idade; não fala a língua local; conta na blacklist; qualquer outra razão de Closed Lost não listada.",
        ],
      },
    ],
  },
  {
    id: "reminders", num: "07", title: "Process Reminders",
    blocks: [
      { h: "Escalações legais e de alto risco", items: [
        "Serious Legal Cases — nunca fechar uma queixa legal ativa sem resposta ou nota. Passar imediatamente para escalations.",
        "System Checks First — ler as notas internas do caso e as guidelines do Confluence na íntegra antes de transferir um ticket, para não o mandar para a queue errada." ] },
      { h: "Routing Support vs Finance", items: [
        "Simple Balance Queries — explicar diretamente ao utilizador como pagar o saldo. NÃO transferir pedidos de suporte padrão para a Finance.",
        "Sponsored Placement Process — seguir todos os passos do Confluence antes de iniciar qualquer transferência entre equipas." ] },
      { h: "Disputas vs referrals", items: [
        "Passar TODAS as disputas diretamente para a Disputes — independentemente de a conta do homeowner (HO) estar ligada ou não.",
        "Nunca responder a uma disputa de HO com o template 'email not found'. Isso desvaloriza a preocupação dele e prejudica o serviço.",
        "Encaminhar diretamente para a Disputes se o TP tiver número de telefone inválido, empresa dissolvida ou conta banida." ] },
      { h: "Restrições de Finance e pagamentos", items: [
        "Ofertas de reembolso de agências de insolvência vão diretamente para a Finance para revisão. NUNCA marcar como spam.",
        "Não passar casos que pedem planos de pagamento. Lembrar ao cliente, com firmeza, que não oferecemos planos de pagamento." ] },
      { h: "Inspeções visuais e flags de fraude", items: [
        "Thorough Visual Inspections — rever anexos de texto e registos de email para confirmar a verdadeira razão por trás do pedido de reembolso.",
        "Dishonest Refund Flags — verificar as warning notes. Qualquer TP marcado por reembolsos desonestos fica em 'Hold & Check' estrito." ] },
      { h: "Correções de routing de disputas", items: [
        "Contact Details Update — se o caso só exigir ligar ao Homeowner para adicionar um número de telefone novo, atualizar diretamente. NÃO é um caso de disputa." ] },
      { h: "Standards de documentação", items: [
        "Notas completas são obrigatórias sempre que se rejeita um reembolso.",
        "Incluir sempre o rácio, a razão da rejeição, o valor e a justificação de H&C." ] },
      { h: "Acquisition — lembrete", items: [
        "Não esquecer de perguntar o 'Porquê?'." ] },
      { h: "Must Remember", items: [
        "Rever sempre os anexos, verificar as flags, e resolver as atualizações simples diretamente em vez de passar o ticket adiante.",
        "Um momento extra a consultar o Confluence ou a rever anexos protege as nossas métricas e evita riscos legais enormes." ] },
    ],
  },
];

/* ---------- English mirror. Blocks must stay in the same order
   as KB_PT: intent lookups resolve by position. ---------- */
const KB_EN = [
  {
    id: "empresa", num: "00", title: "The platform",
    blocks: [
      { h: "MyBuilder · InstaPro", items: [
        "Founded in 2004 — 'by a tradesman, for tradespeople'.",
        "Over 150,000 new leads generated every month.",
        "Connects homeowners (HO) with verified, reviewed tradespeople (TP)." ] },
      { h: "Value for the Tradesperson (TP)", items: [
        "Access to local leads matched to their trade, area and availability.",
        "Pay-per-shortlist: joining is free, they only pay when a HO shortlists their profile.",
        "A profile of genuine reviews that doubles as a portfolio.",
        "They set their own geographic area — they only receive leads from the zones they choose.",
        "Filters by job type: they never see jobs outside their specialism." ] },
      { h: "Value for the Homeowner (HO)", items: [
        "Posting a job is free — no hidden fees, no contracts.",
        "They see verified profiles, portfolios and work history.",
        "They read real, unfiltered reviews before deciding.",
        "They invite up to 10 tradespeople per job, or talk to whoever applies.",
        "They add photos and details to the job and update it any time in the app.",
        "HO details are only shared with the tradespeople they choose." ] },
    ],
  },
  {
    id: "workflow", num: "01", title: "Workflow & Queue Routing",
    blocks: [
      { h: "Triage", items: [
        "Everything arriving at info@mybuilder.com lands in the Support Queue and is triaged from there.",
        "Correct routing happens BEFORE any action is taken on the case." ] },
      { h: "Finance Queue", items: [
        "Credits & invoice queries",
        "Subscription management (including subscription cancellation)",
        "Collections queries",
        "Payment issues" ] },
      { h: "Prospect Queue", items: ["Certificates & documentation", "New trade sign-ups", "Application follow-ups"] },
      { h: "Disputes Queue", items: ["Remove bad reviews (TP request)", "Disputes between HO and TP", "Complex complaint cases"] },
      { h: "Legal Queue", items: ["Legal correspondence", "Regulatory body enquiries", "Official body requests"] },
      { h: "Immediate escalation — 6 triggers", items: [
        "Legal Matter — correspondence from legal parties, official bodies, or customers invoking legal action against InstaPro.",
        "Media / PR Risk — journalists, influencers, media contacts, threats of public exposure.",
        "Identity Theft — fraudulent account access, impersonation, identity fraud allegations.",
        "Data Requests (GDPR) — subject access requests, deletion requests, any legal obligation regarding data.",
        "Defamation Claims — defamation tied to published TP or HO reviews.",
        "External Authorities — regulators, government agencies, law enforcement." ] },
      { h: "ALWAYS DO", items: [
        "Link every call to the correct case.",
        "When the TP/HO asks for a call, you must call.",
        "Use UK grammar in all written communication.",
        "Pay attention to the account's Important Notes.",
        "Use the correct greeting in emails.",
        "Link the case to the account after verifying the user.",
        "Read the whole case chain before replying." ] },
      { h: "NEVER DO", items: [
        "Send the wrong email template.",
        "Ban accounts (without authorisation).",
        "Close cases with no action taken.",
        "Share unverified account information.",
        "Skip the case chain before replying." ] },
      { h: "Case examples (training)", items: [
        "Spam/Junk — 08692443, 08693123, 08697462, 08683374 → mark as 'Not processable / Spam / Junk'.",
        "Subscription — 08697605, 08697892 → Support → Finance Queue.",
        "Standard Support — 08684813, 08644862, 08685431, 08697018 → resolve in the Support Queue.",
        "Support → Disputes — 08082566, 08692807 → Disputes Queue.",
        "Sponsored Placement — 08697149 → handle as a sponsored placement query (Support).",
        "Prospect — 08697601 → Prospect Queue.",
        "External Review — 08700317, 08711949, 08711617 → process as an external review approval.",
        "⚠ Journalist (NOT spam) — 08501305, 08766242 → escalate immediately, PR/Media risk." ] },
    ],
  },
  {
    id: "support", num: "02", title: "Support Queue, GDPR & Accounts",
    blocks: [
      { h: "Support Queue categories", items: [
        "Account Details — bank details, company info, contact updates, profile changes.",
        "Tradesperson Success — portfolio/photos, account status (paused/suspended), review queries.",
        "Homeowner Assistance — job lifecycle (posting/closing), skill validation, complaints about a TP.",
        "Queries & Refunds — refunds (including rejections) and sponsored placement.",
        "General Mediation — non-payment, incomplete work, account onboarding disputes.",
        "Not Processable / Spam — junk, spam and irrelevant contacts: categorise and close with no action." ] },
      { h: "Case Management — 5 standards", items: [
        "01 Correct Queue Routing — route to the right queue before taking any action.",
        "02 Mandatory Case Reason — every case requires a Case Reason on closure. No exceptions.",
        "03 Standard Categorisation — valid requests: Type = 'Service'. Spam/Junk: Type = 'Not processable / Spam / Junk'.",
        "04 Refund Handling — refunds in the Support Queue are resolved locally. Complete the case before closing it as 'Tradespeople Refund'. Do NOT change the queue first.",
        "05 Category Matching — the Category field must match the customer's request exactly. No generic categories." ] },
      { h: "GDPR verification — base rule", items: [
        "Before discussing or changing ANY account detail, the account holder must confirm their Full Name + TWO personal details.",
        "A phone call is always the first attempt.",
        "TP: confirm the registered phone number (if asked by email) and the full email address linked to the account (by phone).",
        "HO: confirm the postcode of the most recent job posted on the platform; and the last 3 digits of the postcode OR the first line of the address.",
        "If they cannot answer: explain that you are unable to verify them, share NO information, and ask them to email from the registered address." ] },
      { h: "Verification — what to NEVER do", items: [
        "No hints or prompts — never say how many digits are needed or what format the information takes. Giving hints breaches GDPR and constitutes data exposure.",
        "No partial information — if verification fails, share nothing: no partial email, no phone number, no postcode, no company name.",
        "Never confirm the city — naming the city is a hint that allows the postcode to be guessed and unauthorised access gained." ] },
      { h: "Accounts — CAN be updated (with verification)", items: [
        "Phone number (1 per account, can be changed multiple times)",
        "Address",
        "Email address (1 per account, can be changed multiple times)",
        "Account contact person",
        "Company name",
        "Sole Trader → Sole Trader" ] },
      { h: "Accounts — CANNOT be updated (regardless of verification)", items: [
        "Company Owner Name on a Sole Trader account — can never be changed, under any circumstances.",
        "Company Owner Name on an LTD account — only if the change is reflected at Companies House under the same company number.",
        "Company type conversion (Sole Trader ↔ LTD) — requires creating a new account.",
        "⚠ Exception: LTD → LTD under the same company number — if the information matches Companies House and the company is active (not dissolved), no user verification is required." ] },
      { h: "Cancellation requests", items: [
        "Cancel Account (Delete) → Support Queue. Confirm identity before proceeding.",
        "Cancel Subscription → Finance Queue. Do not process in Support.",
        "Cancel Sponsored Placement → Support. Always attempt 1 call first; if no answer, cancel and send a confirmation email.",
        "Cancel Charge / Invoice → Support. Cancellation of job lead charges or invoice disputes.",
        "Cancel Expressed Interest → Support. The TP can ask to withdraw interest in a lead." ] },
    ],
  },
  {
    id: "refunds", num: "03", title: "Refund Queue",
    blocks: [
      { h: "Request requirements", items: [
        "Mandatory: a Job ID included in the request.",
        "Mandatory: the refund reason clearly stated.",
        "If anything is missing: ask the TP to reply to the email with the missing details and close the case once sent. Do not process an incomplete request.",
        "Multiple refunds in a single case: process them individually and send the 'refund pushback' email (maximum twice). If they insist, process as a one-off exception." ] },
      { h: "Assessment criteria", items: [
        "Days ATI (Able to Interact) — how long the TP has been active on the platform.",
        "Total Shortlists — how many times the TP has been shortlisted to date.",
        "Refund Ratio — approved refunds over shortlists across the last 12 months.",
        "Job Lead Value — the monetary value of the lead in question.",
        "Dishonesty Notes — Important Notes flagging previous dishonest requests.",
        "Request Timing — when the request was submitted and how many days after the shortlist." ] },
      { h: "ALWAYS VALID (approve even above a 30% ratio)", items: [
        "Job contact details incorrect (e.g. unallocated number)",
        "Shortlists on duplicated listings",
        "HO was looking for a job / employment position",
        "HO fraud detection" ] },
      { h: "SOMETIMES ACCEPTED (case by case)", items: [
        "Job outside the TP's working area",
        "Job outside the TP's activities",
        "Rejection when shortlisted",
        "Wrong job description",
        "HO only wanted a quote",
        "HO unreachable (7+ days after the shortlist)",
        "HO no longer needs the service",
        "Other — requires supervisor approval" ] },
      { h: "ALWAYS REJECTED", items: [
        "The TP did not win the job",
        "Any reason not listed under Always Valid or Sometimes Accepted" ] },
      { h: "Time windows", items: [
        "Day 0 — the shortlist date.",
        "Day 7+ — the window opens for the 'HO Unreachable' category.",
        "Day 42 — deadline for acceptable reasons (Sometimes Accepted).",
        "Day 70 — extended deadline, Always Valid reasons only.",
        "New TP: ≤100 days ATI OR <16 shortlists → the ratio is not considered.",
        "Old TP: >100 days ATI AND ≥16 shortlists → the ratio applies in full.",
        "Exceptional circumstances or an appeal against an initial rejection → escalate to the Team Lead." ] },
      { h: "Hold & Check triggers", items: [
        "£35+ — any request worth £35 or more, including from new TPs.",
        "20–30% — established TPs with a ratio between 20% and 30%: Hold & Check on every request.",
        "12 months — if an Important Note flags dishonest requests, every request goes through Hold & Check for 1 year.",
        "4+ — requests for 4 or more simultaneous refunds under the same reason." ] },
      { h: "Hold & Check — 4-phase process", items: [
        "Phase 1 · Visual Verification — run visual checks on the refund reason in the platform. TP eligible: approve → automatic email → close. TP not eligible: reject → automatic email → close. Unable to verify: move to Phase 2.",
        "Phase 2 · Homeowner Contact — call the HO to verify the TP's reason. HO agrees: approve → email → close. HO disagrees: reject → email → close. No answer: voicemail + email + 24h follow-up.",
        "Phase 3 · 24-Hour Follow-Up — check for an email reply from the HO. If there is one: go back and verify. If not: the case reopens, attempt another call (do not leave a second voicemail) + 24h follow-up.",
        "Phase 4 · Closure — no email AND no answer: select Approved. Set 'Temporarily Reject' on the refund tab. Always log a post with the Hold & Check reason." ] },
      { h: "Ratio rules", items: [
        "20–29% — all reasons are considered, but Hold & Check is mandatory on every request.",
        "30%+ — Old TPs only: only Always Valid Reasons are accepted (Fraud, Duplicates, Job Search, Incorrect Contact Details)." ] },
      { h: "Mandatory phone verification", items: [
        "Number Not Working — always call the HO. Natterbox displays 'Number unallocated' and hangs up automatically if the line is inactive.",
        "Number Belongs to Someone Else — call and wait for an answer. Check whether they recognise the account name and whether they signed up to MyBuilder.",
        "Account Deletion Advice — always warn whoever answers that the account will be deleted if they confirm they never created it." ] },
      { h: "Visual Checks — 4 steps", items: [
        "1 Run Visual Checks — in both: Instapro (via Impersonate) and Salesforce (Job Info Search tab).",
        "2 Assess Evidence — if the checks confirm the reason, approve immediately. If in doubt, call the HO first.",
        "3 Associate Job ID — always associate the Job ID on the Job Info Search tab, especially before transferring the case to another queue. This is mandatory.",
        "4 Confirm Conversation — if the HO–TP conversation confirms the reason, no Hold & Check is needed, regardless of value, days or ratio." ] },
    ],
  },
  {
    id: "dip", num: "04", title: "Dip Checks",
    blocks: [
      { h: "What it is", items: [
        "Random spot checks on 10% of completed refund cases — those resolved outside the Hold & Check process.",
        "Purpose: verify whether the reasons given by the TP were genuine or dishonest.",
        "Impact: the original decision does not change. Dishonest TPs: warning + possible ban." ] },
      { h: "3-day procedure", items: [
        "Day 1 · Initial Contact — call the HO. No answer: leave a voicemail → send an email → create a 24h follow-up task.",
        "Day 2 · Follow-Up Call — second call if there was no email reply. Do NOT leave a second voicemail. New 24h follow-up.",
        "Day 3 · Case Closure — check for email replies. Close immediately if there was no contact. Categorise as 'Unknown'." ] },
      { h: "Where to find the information", items: [
        "1 Locate the original refund Job ID at the bottom of the case.",
        "2 Click the TP link in the case to open the account.",
        "3 Go to the Instapro tab → click Refund.",
        "4 Search for the job ID and confirm the homeowner's name.",
        "5 Impersonate the TP — run visual checks in case the agent forgot to tick the 'H&C' box on the original refund case." ] },
      { h: "Outcomes", items: [
        "MATCH ✓ — the reason given by the TP matches the evidence. Survey: 'Match'. Status: Closed Won. No further action.",
        "MISMATCH ✕ — the HO says the TP's reason is incorrect or dishonest. Survey: 'Mismatch'. Add the exact text 'TP warned for mismatch refund request' to Important Notes (the wording must be exact, for reporting consistency) + warning email.",
        "UNKNOWN ? — the HO was not reached, or does not remember, or prefers not to say. Survey: 'Unknown'. Status: Closed Lost." ] },
    ],
  },
  {
    id: "reviews", num: "05", title: "External Reviews",
    blocks: [
      { h: "Limits", items: ["Maximum of 5 published external reviews per tradesperson.", "1 external review allowed per homeowner (per TP)."] },
      { h: "4-step process", items: [
        "1 Review Received — the case is created automatically in Salesforce: 'External Review Approval from [HO name] to [TP name]'.",
        "2 First Contact — if it is the first external review, or if there was no previous successful call: one call attempt to request the invoice, followed by an email.",
        "3 Invoice Verification — the invoice must contain: TP/company name, HO name, work description and work value. All formats accepted: PDF, Excel, Word, etc.",
        "4 Publish or Decline — invoice received and verified → publish. Not received → the review is NOT published." ] },
      { h: "Immediate decline", items: [
        "The same HO has already reviewed this TP.",
        "Rating of 1 to 4 (low rating).",
        "Rude, abusive or discriminatory comments.",
        "Reviewer name does not match the TP's records.",
        "The TP submitted their own review.",
        "Banned or anonymised account.",
        "Review content does not match the job category.",
        "Blank comment section." ] },
    ],
  },
  {
    id: "acquisition", num: "06", title: "Acquisition Campaign",
    blocks: [
      { h: "Objective", items: ["A ATI Conversion: turn curious prospects into active tradespeople on the platform."] },
      { h: "Who the candidate is", items: [
        "People actively looking for new work opportunities.",
        "People who sat down specifically to fill in an application.",
        "Candidates who started the sign-up process on purpose.",
        "Users who began the application but did not complete it." ] },
      { h: "Why — intent and strategy", items: [
        "Their actions prove they already need a solution.",
        "They started the application for a specific, logical reason.",
        "Our job is to understand that reason — not to hard-sell.",
        "Success comes from showing how the platform fits their concrete needs.",
        "They are actively exploring solutions, not just browsing.",
        "They are open to switching, but still assessing the fit.",
        "They want to understand quickly 'what this means for me'.",
        "Missing the 'why' leads to generic messaging, which reduces relevance and trust." ] },
      { h: "Core motivations", items: [
        "More money — consistent work or higher earnings.",
        "More control — choosing when and how they work.",
        "Security — reducing work gaps and financial uncertainty.",
        "Flexibility — fitting work around personal life.",
        "Pride — building reputation and professional standing.",
        "Plan B — avoiding dependence on a single income source." ] },
      { h: "Motivation profiles", items: [
        "Financial / work volume — extra income, seasonality, higher costs, backup plan, newly self-employed.",
        "Career and growth — new to the trade, moved area, visibility and reputation, reviews, newly qualified.",
        "Control and flexibility — picking the jobs, preferring certain work types, local work only, variety across trades.",
        "Social proof — heard about it from a peer, sees others succeeding, believes it can work for them too." ] },
      { h: "Call structure — 6 steps", items: [
        "1 Greet Confidently — introduce yourself and greet the TP by first name.",
        "2 State the Reason — explain clearly why you are calling: they started an application.",
        "3 Inform of Recording — advise that the call is being recorded for training and quality purposes.",
        "4 Open Question — ask why they applied; understand the situation and the motivation. Listen actively.",
        "5 Identify the Gap — tell them which part of the application is incomplete or missing.",
        "6 Set Next Steps — tell them they will receive an email with a link to complete the application and a follow-up call." ] },
      { h: "Objections — value points", items: [
        "Immediate Access — leads matched to their trade and location, when they need them.",
        "Complete Control — they choose exactly which jobs to pursue.",
        "Full Transparency — they see the full job details and the lead price before responding.",
        "Pay When You Connect — they only pay when both TP and HO want to connect.",
        "Pay As You Go — no subscription, no spend commitment.",
        "Not joining = lost leads, more time spent on marketing, higher subscription costs elsewhere." ] },
      { h: "Wrap-up codes", items: [
        "Global rule: Topic Category = 'acquisition/subscriptions' on EVERY call, without exception.",
        "Contacted & Speech Delivered — Wrap-up: 'contacted'. Call Topic: 'proposal made'. Salesforce: Closed (reopens in 7 days if not ATI).",
        "Unreached / Voicemail — leave a voicemail on the 1st call if possible. Wrap-up: 'voicemail/no answer'. Salesforce: Closed (reopens in 3 days if not ATI).",
        "Reached — Speech Not Delivered — scenarios: hung up, busy, asked for a callback. Wrap-up: 'partial contacted'. Reopens at the agreed time or by the standard 3-day rule.",
        "Not Interested / Unqualified — Wrap-up: 'partial contacted'. Salesforce: 'TP Not Interested' or 'TP Unqualified'. Ops Campaign stage → 'Closed Lost'.",
        "Wrong Number — Wrap-up: 'Wrong Contact' or 'Incorrect Number'. Salesforce: 'TP Unqualified'. Update the number; open a new case if they provide a new one." ] },
      { h: "When to close as Closed Lost", items: [
        "NOT INTERESTED: already has enough work; thinks there is too much competition; not enough interesting jobs; not interested now, maybe later; does not want to deal with us any more; not enough revenue coming from the leads.",
        "UNQUALIFIED: incorrect phone number/address; no valid trade qualification; the company is not in home services; underage; does not speak the local language; blacklisted account; any other Closed Lost reason not listed." ] },
    ],
  },
  {
    id: "reminders", num: "07", title: "Process Reminders",
    blocks: [
      { h: "Legal & High-Risk Escalations", items: [
        "Serious Legal Cases — never close an active legal complaint without a reply or note. Pass it immediately to escalations.",
        "System Checks First — read internal case notes and Confluence guidelines fully before transferring a ticket, to avoid sending it to the wrong queue." ] },
      { h: "Support vs Finance Routing", items: [
        "Simple Balance Queries — advise users directly on how to pay their balance. Do NOT transfer standard support requests to Finance.",
        "Sponsored Placement Process — follow all Confluence step-by-step actions before initiating any team transfers." ] },
      { h: "Disputes vs Referrals", items: [
        "Pass ALL disputes straight to Disputes — regardless of whether the homeowner (HO) account is linked or not.",
        "Never reply to a HO dispute with an 'email not found' template; this dismisses their concerns and damages customer service.",
        "Route directly to Disputes if the TP has an invalid phone number, a dissolved company, or a banned account." ] },
      { h: "Finance & Payment Restrictions", items: [
        "Repayment offers from insolvency agencies must be sent directly to Finance for review. NEVER mark them as spam.",
        "Do not pass cases requesting payment plans. Remind customers firmly that we do not offer payment plans." ] },
      { h: "Visual inspections and fraud flags", items: [
        "Thorough Visual Inspections — review text attachments and email records to verify the true reason behind a refund request.",
        "Dishonest Refund Flags — check for warning notes. Any TP marked for dishonest refunds must be placed on strict 'Hold & Check'." ] },
      { h: "Dispute Routing Corrections", items: [
        "Contact Details Update — if a case only requires calling a Homeowner to add a new phone number, update it directly. It is NOT a dispute case." ] },
      { h: "Documentation Standards", items: [
        "Comprehensive notes are mandatory whenever a refund is rejected.",
        "Always include the ratio, the rejection reason, the amount, and the H&C justification." ] },
      { h: "Acquisition — reminder", items: [
        "Do not forget to ask the 'Why?'." ] },
      { h: "Must Remember", items: [
        "Always review the attachments, check for flags, and handle simple updates directly instead of passing the ticket on.",
        "Taking an extra moment to check Confluence or review attachments protects our metrics and prevents massive legal risks." ] },
    ],
  },
];

const KB = (lang) => (lang === "en" ? KB_EN : KB_PT);

const MANUAL_ = (lang) => KB(lang).map(
  (s) => `## ${s.num} — ${s.title}\n` + s.blocks.map((b) => `### ${b.h}\n` + b.items.map((i) => `- ${i}`).join("\n")).join("\n")
).join("\n\n");

/* ---------- Routing (bilingue) ---------- */
const QUEUES = {
  support: { pt: "Support", en: "Support", tone: "plum" },
  finance: { pt: "Finance", en: "Finance", tone: "hold" },
  prospect: { pt: "Prospect", en: "Prospect", tone: "escalate" },
  disputes: { pt: "Disputes", en: "Disputes", tone: "reject" },
  escalate: { pt: "Escalar", en: "Escalate", tone: "reject" },
  close: { pt: "Fechar", en: "Close", tone: "muted" },
};

const ROUTES_RAW = [
  { q: "support", k: "refund reembolso",
    pt: ["Pedido de reembolso de um TP", "Resolver localmente na Support Queue. Completar o caso e fechar como 'Tradespeople Refund'. Não mudar a queue primeiro."],
    en: ["Refund request from a TP", "Resolve locally in the Support Queue. Complete the case and close it as 'Tradespeople Refund'. Do not change the queue first."] },
  { q: "finance", k: "subscription subscricao cancelar cancel",
    pt: ["Cancelar subscrição", "Encaminhar para a Finance Queue. Não processar na Support."],
    en: ["Cancel subscription", "Route to the Finance Queue. Do not process in Support."] },
  { q: "finance", k: "credits invoice fatura credito",
    pt: ["Questão sobre créditos ou fatura", "Finance Queue — credits & invoice queries."],
    en: ["Credits or invoice query", "Finance Queue — credits & invoice queries."] },
  { q: "finance", k: "payment collections pagamento cobranca",
    pt: ["Problema de pagamento / collections", "Finance Queue — payment issues e collections."],
    en: ["Payment issue / collections", "Finance Queue — payment issues and collections."] },
  { q: "prospect", k: "signup registo novo new trade",
    pt: ["Novo sign-up de tradesperson", "Prospect Queue — new trade sign-ups."],
    en: ["New tradesperson sign-up", "Prospect Queue — new trade sign-ups."] },
  { q: "prospect", k: "certificate certificado documento documentation",
    pt: ["Certificados e documentação", "Prospect Queue — certificates & documentation."],
    en: ["Certificates and documentation", "Prospect Queue — certificates & documentation."] },
  { q: "prospect", k: "application candidatura follow",
    pt: ["Follow-up de candidatura", "Prospect Queue — application follow-ups."],
    en: ["Application follow-up", "Prospect Queue — application follow-ups."] },
  { q: "disputes", k: "review negativa remover bad remove",
    pt: ["TP pede remoção de uma review negativa", "Disputes Queue — remove bad reviews (pedido do TP)."],
    en: ["TP asks to remove a bad review", "Disputes Queue — remove bad reviews (TP request)."] },
  { q: "disputes", k: "dispute disputa conflito",
    pt: ["Disputa entre homeowner e tradesperson", "Disputes Queue — disputas HO ↔ TP."],
    en: ["Dispute between homeowner and tradesperson", "Disputes Queue — HO ↔ TP disputes."] },
  { q: "disputes", k: "complaint queixa complexa complex",
    pt: ["Queixa complexa", "Disputes Queue — complex complaint cases."],
    en: ["Complex complaint", "Disputes Queue — complex complaint cases."] },
  { q: "escalate", k: "legal advogado regulador autoridade policia lawyer authority",
    pt: ["Correspondência legal / regulador / autoridade", "Legal Queue e escalação imediata. Não responder por iniciativa própria."],
    en: ["Legal correspondence / regulator / authority", "Legal Queue and immediate escalation. Do not reply on your own initiative."] },
  { q: "escalate", k: "jornalista journalist media imprensa pr influencer",
    pt: ["Jornalista, influencer ou ameaça de exposição pública", "Escalar imediatamente — risco PR/Media. Nunca marcar como spam."],
    en: ["Journalist, influencer or threat of public exposure", "Escalate immediately — PR/Media risk. Never mark as spam."] },
  { q: "escalate", k: "identidade identity fraude impersonation theft",
    pt: ["Roubo de identidade / acesso fraudulento", "Escalar imediatamente — identity theft."],
    en: ["Identity theft / fraudulent access", "Escalate immediately — identity theft."] },
  { q: "escalate", k: "gdpr dados data deletion eliminar subject access",
    pt: ["Pedido de dados GDPR (acesso ou eliminação)", "Escalar imediatamente — data subject request."],
    en: ["GDPR data request (access or deletion)", "Escalate immediately — data subject request."] },
  { q: "escalate", k: "difamacao defamation",
    pt: ["Alegação de difamação ligada a uma review", "Escalar imediatamente — defamation claim."],
    en: ["Defamation claim tied to a review", "Escalate immediately — defamation claim."] },
  { q: "support", k: "delete apagar eliminar conta account",
    pt: ["Eliminar conta", "Support Queue. Confirmar identidade antes de avançar."],
    en: ["Delete account", "Support Queue. Confirm identity before proceeding."] },
  { q: "support", k: "sponsored placement patrocinado",
    pt: ["Cancelar sponsored placement", "Support Queue. Tentar sempre 1 chamada primeiro; sem resposta, cancelar e enviar email de confirmação."],
    en: ["Cancel sponsored placement", "Support Queue. Always attempt 1 call first; if no answer, cancel and send a confirmation email."] },
  { q: "support", k: "charge cobranca lead invoice fatura",
    pt: ["Cancelar charge / disputa de fatura de lead", "Support Queue — cancelamento de charge de job lead."],
    en: ["Cancel charge / lead invoice dispute", "Support Queue — job lead charge cancellation."] },
  { q: "support", k: "interest interesse retirar withdraw expressed",
    pt: ["TP quer retirar o interesse num lead", "Support Queue — cancel expressed interest."],
    en: ["TP wants to withdraw interest in a lead", "Support Queue — cancel expressed interest."] },
  { q: "support", k: "external review avaliacao approval",
    pt: ["Aprovação de external review", "Support Queue — processar como external review approval (fatura obrigatória)."],
    en: ["External review approval", "Support Queue — process as an external review approval (invoice mandatory)."] },
  { q: "support", k: "atualizar update telefone email morada address phone",
    pt: ["Atualizar dados de conta (telefone, email, morada)", "Support Queue, depois de verificação GDPR completa."],
    en: ["Update account details (phone, email, address)", "Support Queue, after full GDPR verification."] },
  { q: "support", k: "portfolio fotos paused pausa photos status",
    pt: ["Ajuda com portfólio, fotos ou estado da conta", "Support Queue — Tradesperson Success."],
    en: ["Help with portfolio, photos or account status", "Support Queue — Tradesperson Success."] },
  { q: "support", k: "job publicar fechar skill posting closing",
    pt: ["Publicar ou fechar um job / validação de skills", "Support Queue — Homeowner Assistance."],
    en: ["Post or close a job / skill validation", "Support Queue — Homeowner Assistance."] },
  { q: "support", k: "pagamento mediacao incompleto payment mediation",
    pt: ["Não pagamento, trabalho incompleto, onboarding", "Support Queue — General Mediation."],
    en: ["Non-payment, incomplete work, onboarding", "Support Queue — General Mediation."] },
  { q: "support", k: "novo numero homeowner contact details update new phone number nao e disputa not a dispute",
    pt: ["HO só precisa de adicionar um número de telefone novo", "Support Queue. Ligar ao HO e atualizar diretamente. NÃO é um caso de disputa."],
    en: ["HO just needs a new phone number added", "Support Queue. Call the HO and update it directly. This is NOT a dispute case."] },
  { q: "support", k: "saldo balance como pagar how to pay simple balance query",
    pt: ["Consulta simples de saldo / como pagar", "Support Queue. Explicar diretamente como pagar. NÃO transferir pedidos de suporte padrão para a Finance."],
    en: ["Simple balance query / how to pay", "Support Queue. Advise directly on how to pay. Do NOT transfer standard support requests to Finance."] },
  { q: "support", k: "plano de pagamento payment plan prestacoes instalments",
    pt: ["Pedido de plano de pagamento", "Support Queue. Não passar o caso. Lembrar ao cliente, com firmeza, que não oferecemos planos de pagamento."],
    en: ["Payment plan request", "Support Queue. Do not pass the case on. Remind the customer firmly that we do not offer payment plans."] },
  { q: "finance", k: "insolvencia insolvency agency repayment offer nunca spam never spam",
    pt: ["Oferta de reembolso de agência de insolvência", "Finance Queue para revisão. NUNCA marcar como spam."],
    en: ["Repayment offer from an insolvency agency", "Finance Queue for review. NEVER mark as spam."] },
  { q: "disputes", k: "numero invalido empresa dissolvida conta banida invalid phone dissolved company banned account",
    pt: ["TP com número inválido, empresa dissolvida ou conta banida", "Disputes Queue diretamente."],
    en: ["TP with an invalid number, dissolved company or banned account", "Straight to the Disputes Queue."] },
  { q: "disputes", k: "conta ho nao ligada not linked email not found template disputa",
    pt: ["Disputa de HO, mesmo com conta não ligada", "Disputes Queue. Passar TODAS as disputas, ligada ou não. Nunca responder com o template 'email not found'."],
    en: ["HO dispute, even with an unlinked account", "Disputes Queue. Pass ALL disputes, linked or not. Never reply with the 'email not found' template."] },
  { q: "escalate", k: "queixa legal ativa active legal complaint fechar close",
    pt: ["Queixa legal ativa", "Nunca fechar sem resposta ou nota. Passar imediatamente para escalations."],
    en: ["Active legal complaint", "Never close it without a reply or note. Pass it immediately to escalations."] },
  { q: "close", k: "spam junk lixo irrelevante",
    pt: ["Spam / junk / contacto irrelevante", "Type = 'Not processable / Spam / Junk'. Categorizar e fechar sem ação. Atenção: jornalistas NÃO são spam."],
    en: ["Spam / junk / irrelevant contact", "Type = 'Not processable / Spam / Junk'. Categorise and close with no action. Note: journalists are NOT spam."] },
];
const routes = (lang) => ROUTES_RAW.map((r) => ({ q: QUEUES[r.q][lang], tone: QUEUES[r.q].tone, k: r.k, t: r[lang][0], a: r[lang][1] }));

const FIELDS_RAW = [
  { ok: true, pt: ["Número de telefone", "1 por conta. Pode ser alterado várias vezes, com verificação."], en: ["Phone number", "1 per account. Can be changed multiple times, with verification."] },
  { ok: true, pt: ["Endereço de email", "1 por conta. Pode ser alterado várias vezes, com verificação."], en: ["Email address", "1 per account. Can be changed multiple times, with verification."] },
  { ok: true, pt: ["Morada", "Alterável com verificação."], en: ["Address", "Can be changed with verification."] },
  { ok: true, pt: ["Pessoa de contacto na conta", "Alterável com verificação."], en: ["Account contact person", "Can be changed with verification."] },
  { ok: true, pt: ["Nome da empresa", "Alterável com verificação."], en: ["Company name", "Can be changed with verification."] },
  { ok: true, pt: ["Sole Trader → Sole Trader", "Permitido com verificação."], en: ["Sole Trader → Sole Trader", "Allowed with verification."] },
  { ok: false, pt: ["Company Owner Name — Sole Trader", "Nunca pode ser alterado. Nenhuma verificação desbloqueia isto."], en: ["Company Owner Name — Sole Trader", "Can never be changed. No verification unlocks this."] },
  { ok: false, pt: ["Company Owner Name — LTD", "Só se a alteração estiver refletida na Companies House com o mesmo company number. LTD→LTD com o mesmo número e empresa ativa: não é preciso verificação."], en: ["Company Owner Name — LTD", "Only if the change is reflected at Companies House under the same company number. LTD→LTD under the same number with an active company: no verification needed."] },
  { ok: false, pt: ["Sole Trader ↔ LTD (tipo de empresa)", "Não é conversível. Exige criar uma conta nova."], en: ["Sole Trader ↔ LTD (company type)", "Not convertible. Requires creating a new account."] },
];
const fields = (lang) => FIELDS_RAW.map((x) => ({ ok: x.ok, f: x[lang][0], n: x[lang][1] }));

const REASONS_RAW = [
  { v: "contact_incorrect", c: "always", pt: "Contactos do job incorretos (nº não atribuído)", en: "Job contact details incorrect (unallocated number)" },
  { v: "duplicate", c: "always", pt: "Shortlists em anúncio duplicado", en: "Shortlists on a duplicated listing" },
  { v: "job_search", c: "always", pt: "HO andava à procura de emprego", en: "HO was looking for employment" },
  { v: "fraud", c: "always", pt: "HO fraud detection", en: "HO fraud detection" },
  { v: "out_area", c: "sometimes", pt: "Job fora da working area", en: "Job outside the working area" },
  { v: "out_activity", c: "sometimes", pt: "Job fora das activities do TP", en: "Job outside the TP's activities" },
  { v: "rejection", c: "sometimes", pt: "Rejection when shortlisted", en: "Rejection when shortlisted" },
  { v: "wrong_desc", c: "sometimes", pt: "Wrong job description", en: "Wrong job description" },
  { v: "quote_only", c: "sometimes", pt: "HO só queria um orçamento", en: "HO only wanted a quote" },
  { v: "unreachable", c: "sometimes", pt: "HO incontactável (7+ dias)", en: "HO unreachable (7+ days)" },
  { v: "no_longer", c: "sometimes", pt: "HO já não precisa do serviço", en: "HO no longer needs the service" },
  { v: "other", c: "supervisor", pt: "Other (razão não listada)", en: "Other (reason not listed)" },
  { v: "not_won", c: "never", pt: "O TP não ganhou o job", en: "The TP did not win the job" },
];
const reasons = (lang) => REASONS_RAW.map((r) => ({ v: r.v, c: r.c, l: r[lang] }));
const reasonOf = (v) => REASONS_RAW.find((r) => r.v === v);

/* ============================================================
   MOTOR LOCAL — respostas sem API, 100% no browser.
   Índice construído por idioma; intenções curadas partilham
   uma regex bilingue e um dicionário de texto (TX).
   ============================================================ */

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9£%&\s]/g, " ").replace(/\s+/g, " ").trim();

const STOP = new Set(
  ("a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sob e ou que qual quais quando como onde " +
    "se ao aos e nao sim isto isso aquilo meu minha seu sua tem ter fazer devo posso pode deve preciso quero " +
    "quem quanto quantos quantas porque entao assim aqui ali tudo nada hoje ontem agora muito mais menos " +
    "sobre entre ate ja tambem apenas todo toda todos todas cada outro outra outros outras bem esta este " +
    "estes estas essa esse qualquer algum alguma sempre nunca depois antes ainda " +
    "the of to in on for and or is are was were what how when where do does did i we you my an at be it this that " +
    "with from by as if then than there here now just also only about into out up down can could should would " +
    "have has had will shall may might must been being get got make made need want").split(" ")
);

const SYN = {
  reembolso: "refund", reembolsos: "refund", devolucao: "refund", estorno: "refund",
  fila: "queue", filas: "queue", encaminhar: "queue routing", encaminho: "queue routing", rotear: "queue routing", transferir: "queue routing",
  verificar: "verification gdpr identidade", verificacao: "verification gdpr", identidade: "verification gdpr identity",
  jornalista: "media pr escalar journalist", imprensa: "media pr escalar", influencer: "media pr escalar",
  advogado: "legal escalar lawyer", tribunal: "legal escalar court", rgpd: "gdpr escalar",
  fraude: "fraud identity escalar", difamacao: "defamation escalar",
  avaliacao: "review", avaliacoes: "review", critica: "review",
  fatura: "invoice", faturas: "invoice", recibo: "invoice",
  chamada: "call telefone", ligar: "call telefone", telefonar: "call telefone", atende: "call telefone",
  subscricao: "subscription finance", assinatura: "subscription finance",
  conta: "account", contas: "account", perfil: "account profile",
  prazo: "days window deadline dias", prazos: "days window deadline", janela: "window days",
  racio: "ratio", percentagem: "ratio", percentual: "ratio",
  cancelar: "cancel cancelamento", apagar: "delete cancel account", eliminar: "delete cancel account",
  morada: "address", telemovel: "phone numero", numero: "phone number",
  empresa: "company", proprietario: "owner name", dono: "owner name",
  candidatura: "application acquisition", candidato: "acquisition", lixo: "spam junk",
  fecho: "close closed", fechar: "close closed",
  deadline: "days window prazo", window: "days prazo janela", ratio: "racio",
  journalist: "media pr escalate", lawyer: "legal escalate", press: "media pr escalate",
  verification: "gdpr verificacao identity", refund: "reembolso", queue: "fila routing",
  invoice: "fatura", subscription: "finance", account: "conta", owner: "proprietario name",
};

const stem = (w) => {
  const s = w.replace(/(coes|cao|mente|ing|ies|es|s)$/, "");
  return s.length > 3 ? s : w;
};

function terms(q) {
  const base = norm(q).split(" ").filter((w) => w.length > 1 && !STOP.has(w));
  const out = [];
  base.forEach((w) => {
    out.push(w);
    if (SYN[w]) out.push(...SYN[w].split(" "));
    const st = stem(w);
    if (st !== w) out.push(st);
  });
  return [...new Set(out)];
}

/* ---------- Índice por idioma ---------- */
const IDX = {};
function idx(lang) {
  if (IDX[lang]) return IDX[lang];
  const CH = [];
  const secOf = (s) => `${s.num} — ${s.title}`;
  KB(lang).forEach((s) => s.blocks.forEach((b) => CH.push({ sec: secOf(s), h: b.h, items: b.items })));
  const rSec = `${KB(lang)[1].num} — ${KB(lang)[1].title}`;
  const aSec = `${KB(lang)[2].num} — ${KB(lang)[2].title}`;
  routes(lang).forEach((r) => CH.push({ sec: rSec, h: `Routing · ${r.t}`, items: [`${r.q}. ${r.a}`], extra: r.k }));
  fields(lang).forEach((x) => CH.push({ sec: aSec, h: `Account · ${x.f}`, items: [x.n], extra: x.ok ? "pode can allowed" : "nao cannot blocked" }));
  CH.forEach((c) => {
    c.head = norm(c.h);
    const body = norm(c.h + " " + c.items.join(" ") + " " + (c.extra || ""));
    c.tf = {};
    const toks = body.split(" ");
    toks.forEach((w) => {
      c.tf[w] = (c.tf[w] || 0) + 1;
      const st = stem(w);
      if (st !== w) c.tf[st] = (c.tf[st] || 0) + 1;
    });
    c.len = toks.length;
  });
  const DF = {};
  CH.forEach((c) => Object.keys(c.tf).forEach((w) => (DF[w] = (DF[w] || 0) + 1)));
  const DOMAIN = new Set();
  CH.forEach((c) => c.head.split(" ").forEach((w) => { if (w.length > 3 && !STOP.has(w)) { DOMAIN.add(w); DOMAIN.add(stem(w)); } }));
  Object.entries(SYN).forEach(([k, v]) => { DOMAIN.add(k); v.split(" ").forEach((w) => DOMAIN.add(w)); });
  ("caso casos case cases tp ho job jobs lead leads queue email conta account agente agent cliente customer salesforce " +
    "instapro mybuilder shortlist shortlists post nota notas note notes template escalar escalate escalation spam junk " +
    "dispute finance prospect support legal tradesperson homeowner reembolso refund review invoice fatura acquisition " +
    "wrap dip check hold ratio racio ati verification verificacao").split(" ").forEach((w) => DOMAIN.add(w));
  const VOCAB = [...DOMAIN].filter((w) => w.length > 4);
  return (IDX[lang] = { CH, DF, N: CH.length, DOMAIN, VOCAB });
}

function search(q, lang, k = 3) {
  const { CH, DF, N } = idx(lang);
  const ts = terms(q);
  if (!ts.length) return [];
  return CH.map((c) => {
    let s = 0, hit = 0;
    ts.forEach((t) => {
      const tf = c.tf[t] || 0;
      if (tf) { hit++; s += (1 + Math.log(tf)) * Math.log(1 + N / (DF[t] || 1)); }
      if (c.head.includes(t)) s += 2.2;
    });
    return { c, s: (s / Math.sqrt(c.len || 1)) * 6 + (hit / ts.length) * 2.5, hit };
  }).filter((x) => x.hit > 0).sort((a, b) => b.s - a.s).slice(0, k);
}

function pickItems(items, ts, max = 7) {
  if (items.length <= max) return items;
  const sc = items.map((it, i) => ({ it, i, s: ts.reduce((a, t) => a + (norm(it).includes(t) ? 1 : 0), 0) }));
  const top = sc.filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, max);
  return (top.length ? top : sc.slice(0, max)).sort((a, b) => a.i - b.i).map((x) => x.it);
}

/* Bloco do KB pela posição: a chave é sempre o título em PT. */
const B = (lang, secId, ptHeading) => {
  const sp = KB_PT.find((x) => x.id === secId);
  const k = sp.blocks.findIndex((x) => x.h === ptHeading);
  const s = KB(lang).find((x) => x.id === secId);
  const b = s.blocks[k] || sp.blocks[k];
  return { sec: `${s.num} — ${s.title}`, h: b.h, items: b.items };
};

function compose(lang, lead, blocks, tail) {
  let out = lead + "\n\n";
  blocks.forEach((b) => {
    out += "# " + b.h + "\n";
    b.items.forEach((it, i) => (out += i + 1 + ". " + it + "\n"));
    out += "\n";
  });
  if (tail) out += tail;
  return out.trimEnd();
}

function lev(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > 1) return 9;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

function fixTypos(q, lang) {
  const { DOMAIN, VOCAB } = idx(lang);
  return q.split(/(\s+)/).map((tok) => {
    const w = norm(tok);
    if (w.length < 4 || DOMAIN.has(w) || DOMAIN.has(stem(w))) return tok;
    for (const v of VOCAB) if (Math.abs(v.length - w.length) <= 1 && lev(w, v) === 1) return v;
    return tok;
  }).join("");
}

/* ---------- Razões em linguagem corrente (PT + EN) ---------- */
const REASON_PHRASES = [
  { v: "unreachable", re: /nao atende|incontactavel|nao responde|nao consigo contactar|nao consegue contactar|unreachable|sem resposta d[oa]|(doesn t|does not|didn t|did not|won t|will not) (answer|reply|pick up)|no answer|never (answers|replies)|cannot reach|can t reach|unresponsive/ },
  { v: "contact_incorrect", re: /numero[^.]{0,30}(nao existe|errado|invalido|incorreto|desligado|nao atribuido|unallocated)|(nao existe|errado|invalido|incorreto)[^.]{0,20}numero|contactos?[^.]{0,20}(errado|incorreto|invalido)|telefone[^.]{0,30}(errado|invalido|nao existe)|unallocated|(number|phone|line)[^.]{0,30}(wrong|invalid|incorrect|not (in use|working|allocated|valid)|does not exist|doesn t exist|do not exist|don t exist|disconnected|dead|unassigned)|wrong (number|contact details)|(number|phone)[^.]{0,20}(is|was) (wrong|invalid|dead)/ },
  { v: "duplicate", re: /duplicad|repetid|mesmo (job|anuncio)|duplicate|same (job|listing) twice|posted twice/ },
  { v: "job_search", re: /(procura|procurava|queria|andava a procura)[^.]{0,25}(emprego|vaga|contratar alguem)|oferta de emprego|job search|queria contratar|looking for (a job|work|employment)|wanted a job|job seeker|hiring/ },
  { v: "fraud", re: /fraud|burla|scam|golpe|falso homeowner|fake (homeowner|customer)/ },
  { v: "out_area", re: /fora da (sua )?(area|zona)|nao trabalha[^.]{0,25}(zona|area)|working area|muito longe|noutra cidade|outra cidade|outside (his|her|their|the) (working )?area|too far|wrong area|different city/ },
  { v: "out_activity", re: /fora das activities|nao faz esse tipo|nao e[^.]{0,20}especialidade|outro oficio|nao e do (oficio|ramo)|activities|outside (his|her|their) (activities|trade)|doesn t do that (kind|type)|not (his|her|their) (trade|specialism)/ },
  { v: "rejection", re: /rejection when|foi rejeitado|recusado depois|rejeitado apos|rejeitaram.o|was rejected (after|when)|rejected when shortlisted/ },
  { v: "wrong_desc", re: /descricao[^.]{0,20}(errada|diferente|nao batia)|trabalho[^.]{0,15}diferente|nao era o que (dizia|estava)|wrong job description|anuncio enganador|(description|listing)[^.]{0,25}(wrong|inaccurate|misleading|different)|not what (it|the ad) said/ },
  { v: "quote_only", re: /so queria[^.]{0,20}(orcamento|preco|estimativa)|apenas[^.]{0,15}orcamento|so um orcamento|so para (ter|saber) (o )?preco|only wants? a quote|just wanted a (quote|price|estimate)|price check/ },
  { v: "no_longer", re: /ja nao precisa|desistiu|ja resolveu|ja arranjou|cancelou o (trabalho|job|servico)|nao precisa mais|no longer needs|(doesn t|does not|do not|don t) need|changed (his|her|their) mind|already (found|hired) someone|cancelled the job/ },
  { v: "not_won", re: /nao ganhou|nao venceu|perdeu o (job|trabalho)|did not win|didn t win|nao foi escolhido|escolheram outro|lost the job|wasn t chosen|someone else got/ },
  { v: "other", re: /outra razao|outro motivo|razao diferente|another reason|some other reason/ },
];

function matchReason(n, lang) {
  for (const r of REASON_PHRASES) if (r.re.test(n)) return r.v;
  for (const r of REASONS_RAW) {
    if (n.includes(norm(r.pt).slice(0, 18)) || n.includes(norm(r.en).slice(0, 18))) return r.v;
  }
  return null;
}

function extract(q, lang) {
  const n = norm(q);
  const e = {};
  let m;
  if ((m = n.match(/\b(?:dias?|days?)\s*(\d{1,3})/)) || (m = n.match(/(\d{1,3})\s*(?:dias?|days?)/))) e.days = +m[1];
  if ((m = n.match(/£\s*(\d+(?:[.,]\d+)?)/)) || (m = n.match(/(\d+(?:[.,]\d+)?)\s*(?:libras|gbp|pounds|quid)/))) e.value = parseFloat(m[1].replace(",", "."));
  if ((m = n.match(/(\d{1,3})\s*%/)) || (m = n.match(/(?:racio|ratio)\s*(?:de|of)?\s*(\d{1,3})/))) e.ratio = +m[1];
  if ((m = n.match(/(\d{1,4})\s*shortlist/))) e.shortlists = +m[1];
  if ((m = n.match(/ati\s*(?:de|of)?\s*(\d{1,4})/))) e.ati = +m[1];
  if (/tp novo|novo tp|new tp|recem|acabou de (entrar|comecar)|primeiro mes|brand new|just joined|newly signed/.test(n)) { e.ati = 30; e.shortlists = 5; e.tpClass = "new"; }
  if (/tp antigo|old tp|estabelecid|ha (muito|anos)|veterano|antigo na plataforma|established|long.standing|been (here|around) for/.test(n)) { e.ati = 200; e.shortlists = 40; e.tpClass = "old"; }
  if (/desonest|mentiu|ja mentiu|falso|important note|dishonest|lied|previous warning/.test(n)) e.dishonesty = true;
  if (/(4|quatro|four|varios|muitos|several|multiple) (pedidos|reembolsos|refunds|requests)|em bloco|bulk|at once/.test(n)) e.bulk = true;
  if (/conversa.*confirm|confirma.*conversa|chat confirma|no chat da plataforma|conversation confirms|chat (shows|confirms)|messages confirm/.test(n)) e.convoConfirms = true;
  if (/recurso|apelou|apela|excecional|excepcional|insiste apos rejeicao|appeal|appealing|exceptional/.test(n)) e.appeal = true;
  if (/sem job id|nao (tem|inclui|mandou) o? ?job id|falta o job id|no job id|missing (the )?job id|didn t (send|include) (a|the) job id/.test(n)) e.hasJobId = false;
  if (/sem razao|nao (diz|disse) porque|nao indicou a razao|nao explica|no reason|didn t (say|state) why|reason missing/.test(n)) e.hasReason = false;
  const r = matchReason(n, lang);
  if (r) e.reason = r;
  return e;
}

/* ============================================================
   Texto do motor, por idioma
   ============================================================ */
const TX = {
  pt: {
    notFound: "Não encontrei isto no manual.\n\n1. Confirma com o Team Lead antes de agires.\n2. Regista um post no caso com o que ficou decidido.\n\nSe calhar é só uma questão de palavras — tenta com os termos do manual: queue, refund, Hold & Check, verification, dip check, external review, acquisition.",
    leads: ["Isto é o que o manual diz:", "Encontrei isto no manual:", "O manual cobre isto assim:", "Aqui está a parte que se aplica:"],
    hi: "Olá! Descreve-me o caso como o contarias a um colega — a razão que o TP deu, quantos dias passaram, o valor do lead. Também respondo a perguntas soltas sobre o manual.",
    hiChips: ["Quais são os gatilhos de escalação?", "Como verifico um homeowner?", "Passo a passo do Hold & Check"],
    thanks: "De nada. Se aparecer outro caso, é só dizer.",
    about: "Trabalho só a partir do manual de onboarding do MyBuilder · InstaPro. O que consigo fazer:\n\n1. Decidir um caso de reembolso contigo — dás-me a razão e os dias, eu pergunto o que faltar e dou o veredito com os passos.\n2. Dizer para que queue vai um pedido e quando é que se escala em vez de responder.\n3. Explicar a verificação GDPR, o Hold & Check, os dip checks, as external reviews e a campanha de acquisition.\n4. Dizer que campos de conta podem ou não ser alterados.\n\nQuando não está no manual, digo-te isso em vez de inventar.",
    aboutChips: ["Tenho um caso de reembolso", "Para onde vai um pedido de subscrição?", "O que nunca posso fazer?"],
    reset: "Feito, esqueci o caso anterior. Conta-me o novo.",
    askReason: "Vamos por partes. Que razão é que o TP deu para o reembolso?\n\nDiz por palavras tuas — eu encaixo na categoria certa do manual.",
    askReasonAgain: "Não consegui encaixar isso numa categoria do manual. Escolhe a que estiver mais perto:",
    reasonChips: ["O número do homeowner não existe", "O job estava duplicado", "O homeowner não atende há mais de 7 dias", "O job era fora da área dele"],
    askDays: "Certo. Quantos dias depois do shortlist é que ele fez o pedido?",
    daysChips: ["15 dias", "50 dias", "80 dias"],
    hSteps: "Passos", hWhy: "Porquê", hChange: "O que ainda pode mudar isto",
    readAs: "Razão lida como",
    ifValue: "Se o lead for £35 ou mais",
    ifRatio2030: "Se for TP estabelecido com rácio entre 20% e 30%",
    ifRatio30: "Se for TP estabelecido com rácio de 30% ou mais",
    ifDishonest: "Se houver Important Note de desonestidade",
    ifConvo: "Se a conversa HO–TP já confirmar a razão",
    caseChips: ["E se o lead for £40?", "E se o rácio for 25%?", "E se for um TP estabelecido?", "Recomeçar"],
    parked: "\n\nO caso de reembolso fica em espera — diz-me a razão ou os dias quando quiseres retomar.",
    resume: "Retomar o caso de reembolso",
    escLead: "ESCALAR IMEDIATAMENTE. Isto cai num dos seis gatilhos de escalação — não respondas nem resolvas o caso sozinho.",
    escTail: "Confirma qual dos seis gatilhos se aplica, escala ao Team Lead antes de qualquer resposta ao cliente, e regista um post no caso com o que recebeste. Atenção: contactos de jornalistas NUNCA são marcados como spam.",
    escChips: ["Para onde encaminho depois?", "O que registo no caso?"],
    verLead: "Antes de discutires ou alterares o que quer que seja, tens de verificar o titular. Nome completo + dois dados pessoais, e a chamada é sempre a primeira tentativa.",
    verTail: "Se passar: liga o caso à conta e avança. Se falhar: não partilhes nada e pede que envie email do endereço registado.",
    hcLead: "O Hold & Check corre em quatro fases. Só entras nele se um dos gatilhos disparar.",
    hcTail: "Se a conversa HO–TP já confirmar a razão, não é preciso Hold & Check, independentemente de valor, dias ou rácio.",
    dipLead: "Dip check: spot check aleatório a 10% dos reembolsos fechados fora do Hold & Check.",
    dipTail: "No caso de Mismatch, o texto nas Important Notes tem de ser exatamente 'TP warned for mismatch refund request'.",
    revLead: "External review: sem fatura verificada, não se publica.",
    winLead: "As janelas de reembolso contam a partir da data do shortlist.",
    winTail: "Para o veredito completo com rácio, valor e gatilhos, usa o separador Reembolso.",
    win70: (d) => `Dia ${d}: fora de qualquer janela. O limite absoluto é o dia 70 — rejeitar, e escalar ao Team Lead só se houver circunstâncias excecionais.`,
    win42: (d) => `Dia ${d}: entre 42 e 70 só passam razões Always Valid. Qualquer razão Sometimes Accepted é rejeitada por prazo.`,
    win7: (d) => `Dia ${d}: dentro da janela padrão de 42 dias, mas atenção — a categoria 'HO Unreachable' só abre ao dia 7.`,
    winOk: (d) => `Dia ${d}: dentro da janela padrão de 42 dias, todas as razões aceitáveis são consideradas.`,
    decLead: "A decisão sai do cruzamento entre a razão, o prazo, o rácio e o valor do lead.",
    decTail: "Preenche os factos no separador Reembolso para teres o veredito e a cadeia de regras.",
    ratLead: "O rácio só se aplica a TPs estabelecidos (>100 dias ATI E ≥16 shortlists).",
    accLead: "Depende do campo — e a verificação não desbloqueia tudo.",
    accBlocked: "Cuidado: isto cai na lista bloqueada. Nenhuma verificação desbloqueia estes campos.",
    accTail: "A tabela completa está no separador Routing, em baixo.",
    canLead: "Nem todos os cancelamentos ficam na Support Queue.",
    rouLead: "Pelo que descreves, o destino é este:",
    rouNone: "Tudo entra pela Support Queue e é triado a partir daí. Estes são os destinos possíveis:",
    rouTail: "O routing correto faz-se antes de qualquer ação no caso.",
    rouDest: "Destino",
    acqLead: "Campanha de acquisition: a estrutura da chamada e o código de fecho.",
    acqTail: "Regra global: Topic Category = 'acquisition/subscriptions' em todas as chamadas, sem exceção.",
    spmLead: "Spam e junk fecham-se sem ação — mas confirma primeiro que não é um contacto de media.",
    spmTail: "Type = 'Not processable / Spam / Junk'. Jornalistas e influencers NÃO são spam: escalam.",
    stdLead: "Os hábitos que a equipa espera em todos os casos:",
    payLead: "Isto fica na Support. Não passes o caso adiante.",
    insLead: "Estas vão diretamente para a Finance, para revisão — e nunca para spam.",
    payTail: "Não oferecemos planos de pagamento — dizer isso com firmeza faz parte da resposta.",
    dspLead: "Regra corrigida: TODAS as disputas vão para a Disputes, esteja a conta do HO ligada ou não.",
    notDspLead: "Isto NÃO é um caso de disputa. Liga ao Homeowner e atualiza o número diretamente.",
    dspTail: "Se for só adicionar um número de telefone novo ao HO, isso NÃO é disputa — atualiza diretamente.",
    docLead: "Rejeitar sem notas completas é uma falha de processo.",
    docTail: "As notas têm de incluir os quatro elementos: rácio, razão da rejeição, valor e justificação de H&C.",
    conLead: "Antes de transferir seja o que for, lê tudo.",
  },
  en: {
    notFound: "I couldn't find this in the manual.\n\n1. Check with your Team Lead before acting.\n2. Log a post on the case with whatever gets decided.\n\nIt may just be wording — try again using the manual's terms: queue, refund, Hold & Check, verification, dip check, external review, acquisition.",
    leads: ["Here's what the manual says:", "I found this in the manual:", "The manual covers it like this:", "Here's the part that applies:"],
    hi: "Hi! Describe the case the way you'd tell a colleague — the reason the TP gave, how many days have passed, the lead value. I also answer one-off questions about the manual.",
    hiChips: ["What are the escalation triggers?", "How do I verify a homeowner?", "Walk me through Hold & Check"],
    thanks: "Any time. Shout if another case comes in.",
    about: "I work only from the MyBuilder · InstaPro onboarding manual. What I can do:\n\n1. Decide a refund case with you — give me the reason and the days, I'll ask for what's missing and return the verdict with the steps.\n2. Tell you which queue a request belongs to, and when to escalate instead of replying.\n3. Explain GDPR verification, Hold & Check, dip checks, external reviews and the acquisition campaign.\n4. Tell you which account fields can and cannot be changed.\n\nWhen something isn't in the manual, I'll say so rather than invent it.",
    aboutChips: ["I have a refund case", "Where does a subscription request go?", "What must I never do?"],
    reset: "Done, I've dropped the previous case. Tell me the new one.",
    askReason: "Let's take it step by step. What reason did the TP give for the refund?\n\nSay it in your own words — I'll map it to the right category in the manual.",
    askReasonAgain: "I couldn't map that to a category in the manual. Pick the closest one:",
    reasonChips: ["The homeowner's number doesn't exist", "The job was a duplicate listing", "The homeowner hasn't answered in over 7 days", "The job was outside his working area"],
    askDays: "Got it. How many days after the shortlist did he request it?",
    daysChips: ["15 days", "50 days", "80 days"],
    hSteps: "Steps", hWhy: "Why", hChange: "What could still change this",
    readAs: "Reason read as",
    ifValue: "If the lead is £35 or more",
    ifRatio2030: "If it's an established TP with a ratio between 20% and 30%",
    ifRatio30: "If it's an established TP with a ratio of 30% or more",
    ifDishonest: "If there's an Important Note flagging dishonesty",
    ifConvo: "If the HO–TP conversation already confirms the reason",
    caseChips: ["What if the lead is £40?", "What if the ratio is 25%?", "What if it's an established TP?", "Start over"],
    parked: "\n\nThe refund case is on hold — give me the reason or the days whenever you want to pick it back up.",
    resume: "Resume the refund case",
    escLead: "ESCALATE IMMEDIATELY. This hits one of the six escalation triggers — do not reply or resolve the case yourself.",
    escTail: "Confirm which of the six triggers applies, escalate to the Team Lead before any reply to the customer, and log a post on the case with what you received. Note: journalist contacts are NEVER marked as spam.",
    escChips: ["Where do I route it afterwards?", "What do I log on the case?"],
    verLead: "Before discussing or changing anything, you have to verify the account holder. Full name + two personal details, and a call is always the first attempt.",
    verTail: "If they pass: link the case to the account and proceed. If they fail: share nothing and ask them to email from the registered address.",
    hcLead: "Hold & Check runs in four phases. You only enter it if one of the triggers fires.",
    hcTail: "If the HO–TP conversation already confirms the reason, no Hold & Check is needed, regardless of value, days or ratio.",
    dipLead: "Dip check: a random spot check on 10% of refunds closed outside Hold & Check.",
    dipTail: "On a Mismatch, the Important Notes text must be exactly 'TP warned for mismatch refund request'.",
    revLead: "External review: without a verified invoice, it doesn't get published.",
    winLead: "Refund windows count from the shortlist date.",
    winTail: "For the full verdict with ratio, value and triggers, use the Refund tab.",
    win70: (d) => `Day ${d}: outside every window. The absolute limit is day 70 — reject, and escalate to the Team Lead only if there are exceptional circumstances.`,
    win42: (d) => `Day ${d}: between 42 and 70 only Always Valid reasons get through. Any Sometimes Accepted reason is rejected on timing.`,
    win7: (d) => `Day ${d}: inside the standard 42-day window, but note — the 'HO Unreachable' category only opens on day 7.`,
    winOk: (d) => `Day ${d}: inside the standard 42-day window, all acceptable reasons are considered.`,
    decLead: "The decision comes from the cross of reason, timing, ratio and lead value.",
    decTail: "Fill in the facts on the Refund tab to get the verdict and the rule chain.",
    ratLead: "The ratio only applies to established TPs (>100 days ATI AND ≥16 shortlists).",
    accLead: "It depends on the field — and verification doesn't unlock everything.",
    accBlocked: "Careful: this falls in the blocked list. No verification unlocks these fields.",
    accTail: "The full table is on the Routing tab, further down.",
    canLead: "Not every cancellation stays in the Support Queue.",
    rouLead: "From what you describe, this is the destination:",
    rouNone: "Everything comes in through the Support Queue and is triaged from there. These are the possible destinations:",
    rouTail: "Correct routing happens before any action on the case.",
    rouDest: "Destination",
    acqLead: "Acquisition campaign: the call structure and the closing code.",
    acqTail: "Global rule: Topic Category = 'acquisition/subscriptions' on every call, without exception.",
    spmLead: "Spam and junk close with no action — but confirm first that it isn't a media contact.",
    spmTail: "Type = 'Not processable / Spam / Junk'. Journalists and influencers are NOT spam: they escalate.",
    stdLead: "The habits the team expects on every case:",
    payLead: "This stays in Support. Don't pass the case on.",
    insLead: "These go straight to Finance for review — and never to spam.",
    payTail: "We don't offer payment plans — saying so firmly is part of the answer.",
    dspLead: "Corrected rule: ALL disputes go to Disputes, whether the HO account is linked or not.",
    notDspLead: "This is NOT a dispute case. Call the Homeowner and update the number directly.",
    dspTail: "If it's only adding a new phone number for the HO, that is NOT a dispute — update it directly.",
    docLead: "Rejecting without full notes is a process failure.",
    docTail: "The notes must contain all four elements: ratio, rejection reason, amount and H&C justification.",
    conLead: "Before transferring anything, read everything.",
  },
};
const T = (lang) => TX[lang] || TX.pt;

/* ---------- Conversa social ---------- */
const SMALL = [
  { re: /^\s*(ola|olá|oi|bom dia|boa tarde|boa noite|hey|hi|hello|good morning|good afternoon)\b/i, k: "hi", c: "hiChips" },
  { re: /^\s*(obrigad|thanks|thank you|valeu|fixe|boa|top|perfeito|cheers|nice one)\b/i, k: "thanks" },
  { re: /(o que (sabes|podes) fazer|o que fazes|para que serves|como funcionas|quem es tu|quem és tu|ajuda|\bhelp\b|what can you do|who are you|how do you work)/i, k: "about", c: "aboutChips" },
  { re: /(recomecar|recomeçar|limpar|novo caso|começar de novo|comecar de novo|start over|reset|new case)/i, k: "reset", reset: true },
];

/* ---------- Fluxo de reembolso ---------- */
function refundFlow(slots, tries, lang) {
  const t = T(lang);
  if (!slots.reason)
    return {
      content: tries > 0 ? t.askReasonAgain : t.askReason,
      chips: tries > 0 ? reasons(lang).map((r) => r.l).slice(0, 4) : t.reasonChips,
      pending: "refund",
    };
  if (slots.days == null) return { content: t.askDays, chips: t.daysChips, pending: "refund" };

  const full = {
    reason: slots.reason,
    days: slots.days,
    ati: slots.ati != null ? slots.ati : 30,
    shortlists: slots.shortlists != null ? slots.shortlists : 5,
    ratio: slots.ratio != null ? slots.ratio : 0,
    value: slots.value != null ? slots.value : 0,
    hasJobId: slots.hasJobId !== false,
    hasReason: slots.hasReason !== false,
    dishonesty: !!slots.dishonesty,
    bulk: !!slots.bulk,
    convoConfirms: !!slots.convoConfirms,
    appeal: !!slots.appeal,
  };
  const d = decideRefund(full, lang);

  const alt = [];
  const test = (patch, label) => {
    const v = decideRefund({ ...full, ...patch }, lang).verdict;
    if (v !== d.verdict) alt.push(`${label} → ${v}`);
  };
  if (slots.value == null) test({ value: 35 }, t.ifValue);
  if (slots.tpClass !== "new" && slots.ratio == null) {
    test({ ati: 200, shortlists: 40, ratio: 25 }, t.ifRatio2030);
    test({ ati: 200, shortlists: 40, ratio: 35 }, t.ifRatio30);
  }
  if (!slots.dishonesty) test({ dishonesty: true }, t.ifDishonest);
  if (!slots.convoConfirms) test({ convoConfirms: true }, t.ifConvo);

  const rn = reasons(lang).find((r) => r.v === slots.reason);
  let out = `${d.verdict.toUpperCase()} — ${d.lead}\n\n# ${t.hSteps}\n`;
  d.steps.forEach((x, i) => (out += i + 1 + ". " + x + "\n"));
  out += `\n# ${t.hWhy}\n`;
  d.trace.forEach((x, i) => (out += i + 1 + ". " + x + "\n"));
  if (alt.length) {
    out += `\n# ${t.hChange}\n`;
    alt.forEach((x, i) => (out += i + 1 + ". " + x + "\n"));
  }
  out += `\n${t.readAs}: ${rn.l}.`;
  return { content: out, chips: t.caseChips, pending: null };
}

/* ---------- Intenções curadas ---------- */
const INTENTS = [
  { id: "escalate",
    re: /jornalis|imprensa|\bmedia\b|influencer|advogad|tribunal|acao legal|ação legal|legal action|queixa legal|legal complaint|active complaint|rgpd|gdpr|subject access|roubo de identidade|identity theft|impersonat|difamac|defamation|policia|police|autoridade|authorit|regulador|regulator|entidade oficial|official body|journalist|lawyer|solicitor|court|sue us|suing/i,
    run: (q, ts, lang) => compose(lang, T(lang).escLead, [B(lang, "workflow", "Escalation imediata — 6 gatilhos")], T(lang).escTail) },
  { id: "verify",
    re: /verific|identidade|identity check|gdpr check|confirmar dados|quem esta a falar|dois dados|data protection|verify|verification|confirm (their|his|her) (identity|details)/i,
    run: (q, ts, lang) => compose(lang, T(lang).verLead, [B(lang, "support", "Verificação GDPR — regra base"), B(lang, "support", "Verificação — o que NUNCA fazer")], T(lang).verTail) },
  { id: "payments",
    re: /plano de pagamento|payment plan|prestac|instal?ments|saldo|balance|como (pago|pagar)|how (do i |to )?pay|insolvenc|insolvency|repayment offer/i,
    run: (q, ts, lang) => {
      const ins = /insolvenc|insolvência|repayment offer/i.test(q);
      return compose(lang, ins ? T(lang).insLead : T(lang).payLead,
        [B(lang, "reminders", "Restrições de Finance e pagamentos"), B(lang, "reminders", "Routing Support vs Finance")],
        ins ? null : T(lang).payTail);
    } },
  { id: "disputes2",
    re: /email not found|conta[^.]{0,18}(nao|não)[^.]{0,12}(ligada|linked)|not linked|unlinked|dissolved company|empresa dissolvida|conta banida|banned account|numero invalido|número inválido|invalid phone|disputas vs|disputes vs|contact details update|(adicionar|add)[^.]{0,22}(numero|número|number)|novo numero|novo número|new phone number/i,
    run: (q, ts, lang) => {
      const upd = /(adicionar|add|novo|new|nova)[^.]{0,22}(numero|número|number|contacto|contact)|contact details update/i.test(q) && !/disput/i.test(q);
      const dsp = B(lang, "reminders", "Disputas vs referrals");
      const cor = B(lang, "reminders", "Correções de routing de disputas");
      return upd
        ? compose(lang, T(lang).notDspLead, [cor, dsp])
        : compose(lang, T(lang).dspLead, [dsp, cor], T(lang).dspTail);
    } },
  { id: "docs",
    re: /(notas|notes)[^.]{0,25}(rejei|reject|reembolso|refund)|documentation standards|standards de documentac|justificac(ao|ão)[^.]{0,10}h&c|h&c justification|comprehensive notes|o que (escrevo|registo) (nas |na )?nota/i,
    run: (q, ts, lang) => compose(lang, T(lang).docLead, [B(lang, "reminders", "Standards de documentação")], T(lang).docTail) },
  { id: "confluence",
    re: /confluence|notas internas|internal (case )?notes|antes de transferir|before transferring|system checks/i,
    run: (q, ts, lang) => compose(lang, T(lang).conLead, [B(lang, "reminders", "Escalações legais e de alto risco"), B(lang, "reminders", "Must Remember")]) },
  { id: "holdcheck",
    re: /hold ?& ?check|hold and check|\bh&c\b|hold check/i,
    run: (q, ts, lang) => compose(lang, T(lang).hcLead, [B(lang, "refunds", "Gatilhos de Hold & Check"), B(lang, "refunds", "Hold & Check — processo de 4 fases")], T(lang).hcTail) },
  { id: "dip",
    re: /dip.?check|spot.?check|10%/i,
    run: (q, ts, lang) => compose(lang, T(lang).dipLead, [B(lang, "dip", "O que é"), B(lang, "dip", "Procedimento de 3 dias"), B(lang, "dip", "Resultados")], T(lang).dipTail) },
  { id: "extreview",
    re: /external review|review externa|avaliacao externa|publicar.*(review|avaliac)|publish.*review/i,
    run: (q, ts, lang) => compose(lang, T(lang).revLead, [B(lang, "reviews", "Limites"), B(lang, "reviews", "Processo de 4 passos"), B(lang, "reviews", "Decline imediato")]) },
  { id: "window",
    re: /\d+\s*(dias?|days?)|(dias?|days?)\s*\d+|quantos dias|how many days|quanto tempo|how long|ate quando|até quando|prazo|janela|deadline|time window|\b42\b|\b70\b|fora de tempo|tarde demais|too late|depois do shortlist|after the shortlist/i,
    run: (q, ts, lang) => {
      const n = norm(q);
      const t = T(lang);
      const m = n.match(/\b(?:dias?|days?)\s*(\d{1,3})/) || n.match(/(\d{1,3})\s*(?:dias?|days?)/);
      let head = t.winLead;
      if (m) {
        const d = parseInt(m[1], 10);
        head = d > 70 ? t.win70(d) : d > 42 ? t.win42(d) : d < 7 ? t.win7(d) : t.winOk(d);
      }
      return compose(lang, head, [B(lang, "refunds", "Janelas temporais")], t.winTail);
    } },
  { id: "refunddecide",
    re: /aprovo|aprovar|rejeitar|rejeito|razao valida|razão válida|always valid|sometimes accepted|always rejected|nao ganhou|não ganhou|did not win|didn t win|perdeu o job|approve|reject|valid reason|decis(ao|ão).*reembolso|reembolso.*(aprov|rejeit)/i,
    run: (q, ts, lang) => compose(lang, T(lang).decLead, [B(lang, "refunds", "ALWAYS VALID (aprovar mesmo acima de 30% de rácio)"), B(lang, "refunds", "SOMETIMES ACCEPTED (caso a caso)"), B(lang, "refunds", "ALWAYS REJECTED")], T(lang).decTail) },
  { id: "ratio",
    re: /racio|rácio|ratio|percentagem|20%|30%|old tp|new tp|established tp/i,
    run: (q, ts, lang) => compose(lang, T(lang).ratLead, [B(lang, "refunds", "Regras de rácio"), B(lang, "refunds", "Gatilhos de Hold & Check")]) },
  { id: "account",
    re: /(mudar|alterar|atualizar|trocar|change|update|edit).*(nome|email|telefone|morada|empresa|conta|name|phone|address|company|account)|sole trader|\bltd\b|companies house|owner name|proprietario|proprietário/i,
    run: (q, ts, lang) => {
      const blocked = /owner|proprietario|proprietário|dono|sole trader|\bltd\b|companies house|tipo de empresa|company type/i.test(q);
      const yes = B(lang, "support", "Contas — PODE atualizar (com verificação)");
      const no = B(lang, "support", "Contas — NÃO PODE atualizar (independentemente da verificação)");
      return compose(lang, blocked ? T(lang).accBlocked : T(lang).accLead, blocked ? [no, yes] : [yes, no], T(lang).accTail);
    } },
  { id: "cancel",
    re: /cancel|apagar conta|eliminar conta|delete account|expressed interest|sponsored placement/i,
    run: (q, ts, lang) => compose(lang, T(lang).canLead, [B(lang, "support", "Pedidos de cancelamento")]) },
  { id: "routing",
    re: /para onde|que fila|qual queue|qual a queue|encaminh|rotear|transferir|routing|route it|which queue|where does .* go|finance queue|prospect queue|disputes/i,
    run: (q, ts, lang) => {
      const t = T(lang);
      const hits = routes(lang)
        .map((r) => ({ r, s: ts.reduce((a, x) => a + (norm(r.t + " " + r.a + " " + r.k + " " + r.q).includes(x) ? 1 : 0), 0) }))
        .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5);
      if (!hits.length)
        return compose(lang, t.rouNone, [B(lang, "workflow", "Finance Queue"), B(lang, "workflow", "Prospect Queue"), B(lang, "workflow", "Disputes Queue"), B(lang, "workflow", "Legal Queue")]);
      const sec = `${KB(lang)[1].num} — ${KB(lang)[1].title}`;
      return compose(lang, t.rouLead, [{ sec, h: t.rouDest, items: hits.map((x) => `${x.r.q} — ${x.r.t}. ${x.r.a}`) }], t.rouTail);
    } },
  { id: "acquisition",
    re: /acquisition|wrap.?up|voicemail|closed lost|\bati\b|candidatura|nao atende|ninguem atende|no answer|proposal made|application/i,
    run: (q, ts, lang) => compose(lang, T(lang).acqLead, [B(lang, "acquisition", "Estrutura da chamada — 6 passos"), B(lang, "acquisition", "Wrap-up codes")], T(lang).acqTail) },
  { id: "spam",
    re: /spam|junk|not processable|irrelevante|irrelevant/i,
    run: (q, ts, lang) => compose(lang, T(lang).spmLead, [B(lang, "support", "Case Management — 5 standards")], T(lang).spmTail) },
  { id: "standards",
    re: /always do|never do|regras basicas|boas praticas|best practice|o que nunca|must never|case chain|important notes/i,
    run: (q, ts, lang) => compose(lang, T(lang).stdLead, [B(lang, "workflow", "ALWAYS DO"), B(lang, "workflow", "NEVER DO")]) },
];

const CHIPS = {
  pt: {
    verify: ["E se ele falhar a verificação?", "O que posso alterar depois de verificar?"],
    holdcheck: ["Quais são os gatilhos?", "E se o HO não atender?"],
    dip: ["O que escrevo nas Important Notes?", "E se for Unknown?"],
    extreview: ["O que tem de ter a fatura?", "Quando é decline imediato?"],
    window: ["Tenho um caso de reembolso", "Quais são as razões Always Valid?"],
    refunddecide: ["Tenho um caso de reembolso", "Como funciona o rácio?"],
    ratio: ["Quais são os gatilhos de Hold & Check?", "Tenho um caso de reembolso"],
    account: ["Como faço a verificação GDPR?", "E os pedidos de cancelamento?"],
    cancel: ["Para onde vai um pedido de subscrição?", "Como elimino uma conta?"],
    routing: ["Quando é que escalo em vez de encaminhar?", "O que é a Support Queue?"],
    acquisition: ["Quando fecho como Closed Lost?", "Como lido com objeções?"],
    spam: ["Quais são os gatilhos de escalação?", "Que Case Reason uso?"],
    standards: ["Como verifico um utilizador?", "Que Case Reason uso?"],
    payments: ["Para onde vai um pedido de insolvência?", "Consulta de saldo é Support ou Finance?"],
    disputes2: ["E se o TP tiver a conta banida?", "Quando é que NÃO é disputa?"],
    docs: ["Tenho um caso de reembolso", "Quais são os gatilhos de Hold & Check?"],
    confluence: ["Quais são os gatilhos de escalação?", "O que nunca posso fazer?"],
    fallback: ["O que sabes fazer?", "Quais são os gatilhos de escalação?"],
  },
  en: {
    verify: ["What if they fail verification?", "What can I change once verified?"],
    holdcheck: ["What are the triggers?", "What if the HO doesn't answer?"],
    dip: ["What do I write in Important Notes?", "What if it's Unknown?"],
    extreview: ["What must the invoice contain?", "When is it an immediate decline?"],
    window: ["I have a refund case", "What are the Always Valid reasons?"],
    refunddecide: ["I have a refund case", "How does the ratio work?"],
    ratio: ["What are the Hold & Check triggers?", "I have a refund case"],
    account: ["How do I run GDPR verification?", "What about cancellation requests?"],
    cancel: ["Where does a subscription request go?", "How do I delete an account?"],
    routing: ["When do I escalate instead of routing?", "What is the Support Queue?"],
    acquisition: ["When do I close as Closed Lost?", "How do I handle objections?"],
    spam: ["What are the escalation triggers?", "Which Case Reason do I use?"],
    standards: ["How do I verify a user?", "Which Case Reason do I use?"],
    payments: ["Where does an insolvency request go?", "Is a balance query Support or Finance?"],
    disputes2: ["What if the TP account is banned?", "When is it NOT a dispute?"],
    docs: ["I have a refund case", "What are the Hold & Check triggers?"],
    confluence: ["What are the escalation triggers?", "What must I never do?"],
    fallback: ["What can you do?", "What are the escalation triggers?"],
  },
};

/* ---------- Um turno de conversa ---------- */
function processTurn(raw, ctx0, lang) {
  const ctx = ctx0 || { slots: {}, pending: null, topic: null };
  const t = T(lang);
  const q = fixTypos(raw, lang);
  const n = norm(q);
  const ts = terms(q);
  const { DOMAIN } = idx(lang);
  const probe = q + " ⋄ " + n;

  for (const sm of SMALL)
    if (sm.re.test(q) || sm.re.test(n))
      return { content: t[sm.k], chips: sm.c ? t[sm.c] : [], ctx: sm.reset ? { slots: {}, pending: null, topic: null } : ctx };

  if (INTENTS[0].re.test(probe))
    return { content: INTENTS[0].run(q, ts, lang), chips: t.escChips, ctx: { slots: {}, pending: null, topic: "escalate" } };

  const e = extract(q, lang);
  const hasData = Object.keys(e).length > 0;
  const isRuleQ = /quais|quantos|quantas|lista|explica|o que sao|o que e|o que é|como funciona|quando e que|quando é que|regras|what are|how many|how long|list the|explain|how does/.test(n);
  const saysRefund = /reembolso|refund|devolver o dinheiro|estorno|money back/.test(n);

  if (/retomar|voltar ao caso|continuar o caso|resume|pick (it |the case )?back up/.test(n) && ctx.slots && Object.keys(ctx.slots).length) {
    const r = refundFlow(ctx.slots, 0, lang);
    return { content: r.content, chips: r.chips, ctx: { ...ctx, pending: r.pending, topic: "refund", tries: 0 } };
  }

  const escapeIntent = INTENTS.find((i) => i.re.test(probe) && !["window", "refunddecide", "ratio"].includes(i.id));
  const continuing = ctx.pending === "refund" && !escapeIntent;
  const startsCase = saysRefund && hasData && !isRuleQ;
  const followUp = ctx.topic === "refund" && hasData && /^(e se|e com|e quando|e para|e caso|e um|e o|what if|and if|and what)/.test(n);

  if (continuing || startsCase || followUp) {
    const slots = { ...(ctx.slots || {}), ...e };
    const tries = (ctx.tries || 0) + (continuing && !hasData ? 1 : 0);
    const r = refundFlow(slots, tries, lang);
    return { content: r.content, chips: r.chips, ctx: { slots, pending: r.pending, topic: "refund", tries: r.pending ? tries : 0 } };
  }

  const opensCase = /(tenho|i have|ive got|i have got|got)\s+(um|uma|a|an)?\s*(caso|case|refund|reembolso)|novo caso|new case|pedido novo|ajuda com (um )?(reembolso|caso)|help with a (refund|case)/.test(n);
  if (saysRefund && !hasData && opensCase) {
    const r = refundFlow({}, 0, lang);
    return { content: r.content, chips: r.chips, ctx: { slots: {}, pending: "refund", topic: "refund" } };
  }

  const fired = INTENTS.filter((i) => i.re.test(probe)).slice(0, 2);
  if (fired.length) {
    const body = fired.map((i) => i.run(q, ts, lang)).join("\n\n———\n\n");
    const parked = ctx.pending === "refund";
    return {
      content: body + (parked ? t.parked : ""),
      chips: parked ? [t.resume, ...(CHIPS[lang][fired[0].id] || []).slice(0, 1)] : CHIPS[lang][fired[0].id] || [],
      ctx: { ...ctx, topic: parked ? "refund" : fired[0].id },
    };
  }

  const hits = search(q, lang, 3);
  const onTopic = ts.some((x) => DOMAIN.has(x));
  if (!onTopic || !hits.length || hits[0].s < 2.5)
    return { content: t.notFound, chips: CHIPS[lang].fallback, ctx: { ...ctx } };

  const lead = t.leads[Math.abs(n.length * 7 + ts.length) % t.leads.length];
  return {
    content: compose(lang, lead, hits.map((h) => ({ sec: h.c.sec, h: h.c.h, items: pickItems(h.c.items, ts) }))),
    chips: hits.slice(1).map((h) => h.c.h.replace(/^(Routing|Account) · /, "")).slice(0, 2),
    ctx: { ...ctx, topic: ctx.pending === "refund" ? "refund" : null },
  };
}

/* ============================================================
   Motor de decisão de reembolso
   ============================================================ */
const RF = {
  pt: {
    vIncomplete: "Falta informação", vApprove: "Aprovar", vHold: "Hold & Check", vReject: "Rejeitar", vEscalate: "Escalar",
    incLead: "Ainda não dá para processar este pedido.",
    incJobId: "Pedir ao TP que responda ao email com o Job ID.",
    incReason: "Pedir ao TP que indique claramente a razão do reembolso.",
    incClose: "Fechar o caso depois de enviar o pedido.",
    incTrace: "Todo o pedido exige um Job ID e uma razão explícita.",
    trOk: "Job ID e razão presentes — pedido processável.",
    trNew: (a, s) => `TP novo (${a} dias ATI ≤100 ou ${s} shortlists <16) — o rácio não é considerado.`,
    trOld: (a, s) => `TP estabelecido (${a} dias ATI >100 e ${s} shortlists ≥16) — o rácio aplica-se.`,
    apLead: "Recurso a uma rejeição inicial, ou circunstâncias excecionais.",
    apSteps: ["Escalar ao Team Lead.", "Não decidir o caso sozinho.", "Registar um post com o contexto do recurso."],
    apTrace: "Recurso/exceção marcado — decisão sai do âmbito do agente.",
    nvLead: "Razão sempre rejeitada.",
    nvSteps: ["Rejeitar o reembolso.", "Enviar o email automático de rejeição.", "Fechar o caso com o Case Reason correto."],
    nvTrace: "'O TP não ganhou o job' não é razão válida de reembolso.",
    unLead: (d) => `A janela de 'HO Unreachable' só abre ao dia 7. Estamos no dia ${d}.`,
    unSteps: ["Rejeitar por agora.", "Explicar ao TP que só pode pedir a partir do 7.º dia após o shortlist."],
    unTrace: "Dia 7+ é o mínimo para a categoria HO Unreachable.",
    l70Lead: (d) => `Dia ${d}: fora de qualquer janela. O limite absoluto é o dia 70.`,
    l70Steps: ["Rejeitar por prazo.", "Se o TP alegar circunstâncias excecionais, escalar ao Team Lead em vez de decidir."],
    l70Trace: "Dia 70 é o prazo alargado, só para razões Always Valid.",
    l42Lead: (d) => `Dia ${d}: entre 42 e 70 só se aceitam razões Always Valid.`,
    l42Steps: ["Rejeitar por prazo.", "Se houver circunstâncias excecionais, escalar ao Team Lead."],
    l42Trace: "A janela de 42 dias cobre as razões Sometimes Accepted; esta razão não é Always Valid.",
    tr70: (d) => `Dia ${d}: dentro da janela alargada de 70 dias e a razão é Always Valid.`,
    tr42: (d) => `Dia ${d}: dentro da janela padrão de 42 dias.`,
    svLead: "Razão 'Other' — precisa de aprovação de supervisor.",
    svSteps: ["Levar o caso ao supervisor antes de qualquer decisão.", "Registar um post com a razão apresentada pelo TP."],
    svTrace: "'Other' está listada como Sometimes Accepted mas exige aprovação de supervisor.",
    r30Lead: (r) => `Rácio de ${r}% num TP estabelecido: só Always Valid Reasons são aceites.`,
    r30Steps: ["Rejeitar.", "Enviar o email automático de rejeição.", "Registar o rácio no caso."],
    r30Trace: "Acima de 30%, só Fraud, Duplicates, Job Search e Incorrect Contact Details passam.",
    trR30: (r) => `Rácio de ${r}% — mas a razão é Always Valid, por isso aprova-se mesmo acima de 30%.`,
    hcValue: (v) => `Valor do lead £${v} ≥ £35`,
    hcRatio: (r) => `Rácio de ${r}% está entre 20% e 30%`,
    hcDish: "Important Note de pedidos desonestos nos últimos 12 meses",
    hcBulk: "4+ reembolsos em simultâneo com a mesma razão",
    hcTrace: (x) => `Gatilho de Hold & Check: ${x}.`,
    cvTrace: "A conversa HO–TP confirma a razão — dispensa Hold & Check independentemente de valor, dias ou rácio.",
    cvLead: "Aprovar. A conversa na plataforma confirma a razão do TP.",
    cvSteps: ["Marcar o visual check como feito.", "Aprovar o reembolso — o email automático segue.", "Associar o Job ID no separador Job Info Search.", "Fechar o caso com o Case Reason correto."],
    hdLead: "Não aprovar diretamente. Entra em Hold & Check.",
    hdSteps: [
      "Fase 1 — Visual checks no Instapro (Impersonate) e no Salesforce (Job Info Search). TP elegível: aprovar e fechar. Não elegível: rejeitar e fechar.",
      "Fase 2 — Se não conseguir verificar, ligar ao HO. Concorda: aprovar. Discorda: rejeitar. Sem atendimento: voicemail + email + follow-up a 24h.",
      "Fase 3 — Às 24h, verificar resposta por email. Sem resposta: reabrir e ligar de novo, sem deixar segundo voicemail.",
      "Fase 4 — Sem email e sem atendimento: selecionar Approved e marcar 'Temporarily Reject' no separador refund.",
      "Registar sempre um post com a razão do Hold & Check.",
    ],
    okAlways: "Aprovar. Razão Always Valid, dentro do prazo.",
    okNormal: "Aprovar. Razão aceitável, dentro do prazo e sem gatilhos.",
    okSteps: ["Correr os visual checks no Instapro e no Salesforce.", "Aprovar o reembolso — o email automático segue.", "Associar o Job ID no separador Job Info Search.", "Fechar o caso com o Case Reason correto."],
    okTrace: "Sem gatilhos de Hold & Check (valor <£35, rácio fora de 20–30%, sem notas de desonestidade, sem pedido em bloco).",
    docNote: "Registar notas completas da rejeição: rácio, razão da rejeição, valor e justificação de H&C. É obrigatório.",
  },
  en: {
    vIncomplete: "Missing information", vApprove: "Approve", vHold: "Hold & Check", vReject: "Reject", vEscalate: "Escalate",
    incLead: "This request can't be processed yet.",
    incJobId: "Ask the TP to reply to the email with the Job ID.",
    incReason: "Ask the TP to state the refund reason clearly.",
    incClose: "Close the case once the request has been sent.",
    incTrace: "Every request requires a Job ID and an explicit reason.",
    trOk: "Job ID and reason present — request is processable.",
    trNew: (a, s) => `New TP (${a} days ATI ≤100 or ${s} shortlists <16) — the ratio is not considered.`,
    trOld: (a, s) => `Established TP (${a} days ATI >100 and ${s} shortlists ≥16) — the ratio applies.`,
    apLead: "Appeal against an initial rejection, or exceptional circumstances.",
    apSteps: ["Escalate to the Team Lead.", "Do not decide the case yourself.", "Log a post with the context of the appeal."],
    apTrace: "Appeal/exception flagged — the decision is outside the agent's scope.",
    nvLead: "Always rejected reason.",
    nvSteps: ["Reject the refund.", "Send the automatic rejection email.", "Close the case with the correct Case Reason."],
    nvTrace: "'The TP did not win the job' is not a valid refund reason.",
    unLead: (d) => `The 'HO Unreachable' window only opens on day 7. We're on day ${d}.`,
    unSteps: ["Reject for now.", "Explain to the TP that they can only request from the 7th day after the shortlist."],
    unTrace: "Day 7+ is the minimum for the HO Unreachable category.",
    l70Lead: (d) => `Day ${d}: outside every window. The absolute limit is day 70.`,
    l70Steps: ["Reject on timing.", "If the TP claims exceptional circumstances, escalate to the Team Lead rather than deciding."],
    l70Trace: "Day 70 is the extended deadline, Always Valid reasons only.",
    l42Lead: (d) => `Day ${d}: between 42 and 70 only Always Valid reasons are accepted.`,
    l42Steps: ["Reject on timing.", "If there are exceptional circumstances, escalate to the Team Lead."],
    l42Trace: "The 42-day window covers Sometimes Accepted reasons; this reason is not Always Valid.",
    tr70: (d) => `Day ${d}: inside the extended 70-day window and the reason is Always Valid.`,
    tr42: (d) => `Day ${d}: inside the standard 42-day window.`,
    svLead: "'Other' reason — requires supervisor approval.",
    svSteps: ["Take the case to a supervisor before any decision.", "Log a post with the reason the TP gave."],
    svTrace: "'Other' is listed as Sometimes Accepted but requires supervisor approval.",
    r30Lead: (r) => `A ${r}% ratio on an established TP: only Always Valid Reasons are accepted.`,
    r30Steps: ["Reject.", "Send the automatic rejection email.", "Log the ratio on the case."],
    r30Trace: "Above 30%, only Fraud, Duplicates, Job Search and Incorrect Contact Details get through.",
    trR30: (r) => `Ratio of ${r}% — but the reason is Always Valid, so it's approved even above 30%.`,
    hcValue: (v) => `Lead value £${v} ≥ £35`,
    hcRatio: (r) => `Ratio of ${r}% sits between 20% and 30%`,
    hcDish: "Important Note flagging dishonest requests in the last 12 months",
    hcBulk: "4+ simultaneous refunds under the same reason",
    hcTrace: (x) => `Hold & Check trigger: ${x}.`,
    cvTrace: "The HO–TP conversation confirms the reason — no Hold & Check needed, regardless of value, days or ratio.",
    cvLead: "Approve. The conversation on the platform confirms the TP's reason.",
    cvSteps: ["Mark the visual check as done.", "Approve the refund — the automatic email follows.", "Associate the Job ID on the Job Info Search tab.", "Close the case with the correct Case Reason."],
    hdLead: "Do not approve directly. This goes to Hold & Check.",
    hdSteps: [
      "Phase 1 — Visual checks in Instapro (Impersonate) and Salesforce (Job Info Search). TP eligible: approve and close. Not eligible: reject and close.",
      "Phase 2 — If you can't verify, call the HO. Agrees: approve. Disagrees: reject. No answer: voicemail + email + 24h follow-up.",
      "Phase 3 — At 24h, check for an email reply. No reply: reopen and call again, without leaving a second voicemail.",
      "Phase 4 — No email and no answer: select Approved and set 'Temporarily Reject' on the refund tab.",
      "Always log a post with the Hold & Check reason.",
    ],
    okAlways: "Approve. Always Valid reason, within the deadline.",
    okNormal: "Approve. Acceptable reason, within the deadline and with no triggers.",
    okSteps: ["Run the visual checks in Instapro and Salesforce.", "Approve the refund — the automatic email follows.", "Associate the Job ID on the Job Info Search tab.", "Close the case with the correct Case Reason."],
    okTrace: "No Hold & Check triggers (value <£35, ratio outside 20–30%, no dishonesty notes, no bulk request).",
    docNote: "Log comprehensive rejection notes: ratio, rejection reason, amount and H&C justification. This is mandatory.",
  },
};

function decideRefund(s, lang) {
  const f = RF[lang] || RF.pt;
  const rej = (lead, steps, trace) => ({ verdict: f.vReject, icon: "✕", tone: "reject", lead, steps: [...steps, f.docNote], trace });
  const trace = [];
  const r = reasonOf(s.reason);
  const days = Number(s.days) || 0;
  const ati = Number(s.ati) || 0;
  const shortlists = Number(s.shortlists) || 0;
  const ratio = Number(s.ratio) || 0;
  const value = Number(s.value) || 0;

  if (!s.hasJobId || !s.hasReason)
    return {
      verdict: f.vIncomplete, icon: "✎", tone: "muted", lead: f.incLead,
      steps: [!s.hasJobId && f.incJobId, !s.hasReason && f.incReason, f.incClose].filter(Boolean),
      trace: [f.incTrace],
    };
  trace.push(f.trOk);

  const isNew = ati <= 100 || shortlists < 16;
  trace.push(isNew ? f.trNew(ati, shortlists) : f.trOld(ati, shortlists));

  if (s.appeal) return { verdict: f.vEscalate, icon: "↑", tone: "escalate", lead: f.apLead, steps: f.apSteps, trace: [...trace, f.apTrace] };
  if (r.c === "never") return rej(f.nvLead, f.nvSteps, [...trace, f.nvTrace]);
  if (r.v === "unreachable" && days < 7) return rej(f.unLead(days), f.unSteps, [...trace, f.unTrace]);
  if (days > 70) return rej(f.l70Lead(days), f.l70Steps, [...trace, f.l70Trace]);

  if (days > 42) {
    if (r.c !== "always") return rej(f.l42Lead(days), f.l42Steps, [...trace, f.l42Trace]);
    trace.push(f.tr70(days));
  } else trace.push(f.tr42(days));

  if (r.c === "supervisor") return { verdict: f.vEscalate, icon: "↑", tone: "escalate", lead: f.svLead, steps: f.svSteps, trace: [...trace, f.svTrace] };

  if (!isNew && ratio >= 30 && r.c !== "always")
    return rej(f.r30Lead(ratio), f.r30Steps, [...trace, f.r30Trace]);
  if (!isNew && ratio >= 30 && r.c === "always") trace.push(f.trR30(ratio));

  const hc = [];
  if (value >= 35) hc.push(f.hcValue(value));
  if (!isNew && ratio >= 20 && ratio < 30) hc.push(f.hcRatio(ratio));
  if (s.dishonesty) hc.push(f.hcDish);
  if (s.bulk) hc.push(f.hcBulk);

  if (s.convoConfirms && hc.length) {
    trace.push(f.cvTrace);
    return { verdict: f.vApprove, icon: "✓", tone: "approve", lead: f.cvLead, steps: f.cvSteps, trace };
  }
  if (hc.length) return { verdict: f.vHold, icon: "⏸", tone: "hold", lead: f.hdLead, steps: f.hdSteps, trace: [...trace, ...hc.map(f.hcTrace)] };

  return {
    verdict: f.vApprove, icon: "✓", tone: "approve",
    lead: r.c === "always" ? f.okAlways : f.okNormal,
    steps: f.okSteps, trace: [...trace, f.okTrace],
  };
}

/* ============================================================
   Design tokens — tirados do logótipo
   ============================================================ */
const TONE = {
  approve: { fg: "#12820A", bg: "#E4FCDE", br: "#B6F2A8" },
  hold: { fg: "#9A5B00", bg: "#FFF1DA", br: "#FBDCA8" },
  reject: { fg: "#C0325B", bg: "#FFE8EE", br: "#FBC4D3" },
  escalate: { fg: "#6C3BB8", bg: "#F1E9FF", br: "#DCC9F7" },
  muted: { fg: "#6B5578", bg: "#F3EEF6", br: "#E2D7E9" },
  plum: { fg: "#210A2C", bg: "#F3EEF6", br: "#E2D7E9" },
};

/* ============================================================
   Texto do interface, por idioma
   ============================================================ */
const UI = {
  pt: {
    name: "ViviBot", internal: "Interno",
    tabs: ["Perguntar", "Reembolso", "Routing", "Manual"],
    greet: "Olá! Sou a ViviBot.",
    blurb: "Escreve a situação por palavras tuas. Procuro no manual de onboarding e devolvo os passos, sem inventar nada.",
    tryThese: "Experimenta uma destas",
    suggestions: [
      "Um TP pediu reembolso 50 dias depois do shortlist. O que faço?",
      "Como verifico a identidade de um homeowner ao telefone?",
      "Recebi um email de um jornalista. Qual é o procedimento?",
      "O TP quer mudar o nome do proprietário numa conta Sole Trader.",
      "Passo a passo do Hold & Check.",
      "O que registo no Salesforce quando ninguém atende a chamada de acquisition?",
    ],
    placeholder: "Escreve a situação…", send: "Enviar",
    mLocal: "Local", mAI: "IA",
    dLocal: "responde offline, só a partir do manual",
    dAI: "usa a API da Anthropic, entende melhor o contexto",
    viaLocal: "motor local · sem ligação", viaAI: "modo IA",
    apiErr: "O modo IA não respondeu — aqui fica a resposta do motor local.",
    rEyebrow: "Secção 03 · Refund Queue", rTitle: "Aprovo ou não?",
    rBlurb: "Preenche os factos do caso. A decisão e a cadeia de regras atualizam sozinhas.",
    rFacts: "Factos do caso", rReason: "Razão indicada pelo TP",
    rDays: "Dias após shortlist", rValue: "Valor do lead (£)", rAti: "Dias ATI",
    rShort: "Total shortlists", rRatio: "Refund ratio (%)",
    rSw: ["Job ID incluído no pedido", "Razão claramente indicada", "A conversa HO–TP confirma a razão", "Important Note de desonestidade (12 meses)", "4+ reembolsos em simultâneo, mesma razão", "Recurso a rejeição, ou caso excecional"],
    rSteps: "Passos", rWhy: "Porquê — cadeia de regras",
    grp: ["Always valid", "Sometimes accepted", "Supervisor", "Always rejected"],
    qEyebrow: "Secção 01–02 · Routing & Data Protection", qTitle: "Para onde vai este caso?",
    qFilter: "Filtrar por tipo de pedido…",
    qNone: "Nada corresponde. Vai ao separador Perguntar e descreve o caso por palavras tuas.",
    vEyebrow: "Verificação GDPR", vTitle: "Antes de dizer o que quer que seja",
    vBlurb1: "Nome completo + ", vBlurbBold: "dois", vBlurb2: " dados pessoais. A chamada é sempre a primeira tentativa.",
    vTP: "Tradesperson", vHO: "Homeowner",
    vItemsTP: ["Nome completo", "Número de telefone registado (se pedido por email)", "Endereço de email completo da conta (por telefone)"],
    vItemsHO: ["Nome completo", "Postcode do job mais recente publicado", "Últimos 3 dígitos do postcode OU primeira linha da morada"],
    vPass: "Verificado! Podes discutir e atualizar os dados da conta. Não te esqueças de ligar o caso à conta.",
    vFail: "Ainda não verificado. Não partilhes nada — nem email parcial, nem telefone, nem postcode, nem nome da empresa, nem a cidade. Pede que envie email do endereço registado.",
    vHint: "Nunca dês dicas sobre quantos dígitos são precisos ou o formato da resposta. Dar dicas é exposição de dados.",
    aEyebrow: "Account Management", aTitle: "Isto pode ser alterado?",
    mEyebrow: "Onboarding · Customer Service", mTitle: "Manual completo",
    mSearch: "Procurar no manual…", mNone: (f) => `Sem resultados para "${f}".`,
  },
  en: {
    name: "ViviBot", internal: "Internal",
    tabs: ["Ask", "Refund", "Routing", "Manual"],
    greet: "Hi! I'm ViviBot.",
    blurb: "Describe the situation in your own words. I search the onboarding manual and give you the steps, without making anything up.",
    tryThese: "Try one of these",
    suggestions: [
      "A TP requested a refund 50 days after the shortlist. What do I do?",
      "How do I verify a homeowner's identity over the phone?",
      "I received an email from a journalist. What's the procedure?",
      "The TP wants to change the owner name on a Sole Trader account.",
      "Walk me through Hold & Check.",
      "What do I log in Salesforce when nobody answers an acquisition call?",
    ],
    placeholder: "Describe the situation…", send: "Send",
    mLocal: "Local", mAI: "AI",
    dLocal: "answers offline, from the manual only",
    dAI: "uses the Anthropic API, better at context",
    viaLocal: "local engine · offline", viaAI: "AI mode",
    apiErr: "AI mode didn't respond — here's the local engine's answer instead.",
    rEyebrow: "Section 03 · Refund Queue", rTitle: "Approve or not?",
    rBlurb: "Fill in the facts of the case. The decision and the rule chain update as you go.",
    rFacts: "Case facts", rReason: "Reason given by the TP",
    rDays: "Days after shortlist", rValue: "Lead value (£)", rAti: "Days ATI",
    rShort: "Total shortlists", rRatio: "Refund ratio (%)",
    rSw: ["Job ID included in the request", "Reason clearly stated", "HO–TP conversation confirms the reason", "Important Note flagging dishonesty (12 months)", "4+ simultaneous refunds, same reason", "Appeal against rejection, or exceptional case"],
    rSteps: "Steps", rWhy: "Why — rule chain",
    grp: ["Always valid", "Sometimes accepted", "Supervisor", "Always rejected"],
    qEyebrow: "Section 01–02 · Routing & Data Protection", qTitle: "Where does this case go?",
    qFilter: "Filter by request type…",
    qNone: "Nothing matches. Go to the Ask tab and describe the case in your own words.",
    vEyebrow: "GDPR verification", vTitle: "Before you say anything at all",
    vBlurb1: "Full name + ", vBlurbBold: "two", vBlurb2: " personal details. A call is always the first attempt.",
    vTP: "Tradesperson", vHO: "Homeowner",
    vItemsTP: ["Full name", "Registered phone number (if asked by email)", "Full account email address (by phone)"],
    vItemsHO: ["Full name", "Postcode of the most recent job posted", "Last 3 digits of the postcode OR first line of the address"],
    vPass: "Verified! You can discuss and update the account details. Don't forget to link the case to the account.",
    vFail: "Not verified yet. Share nothing — no partial email, no phone number, no postcode, no company name, not even the city. Ask them to email from the registered address.",
    vHint: "Never hint at how many digits are needed or what format the answer takes. Giving hints is data exposure.",
    aEyebrow: "Account Management", aTitle: "Can this be changed?",
    mEyebrow: "Onboarding · Customer Service", mTitle: "Full manual",
    mSearch: "Search the manual…", mNone: (f) => `No results for "${f}".`,
  },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
.mb{--plum:#210A2C;--lime:#34F821;--limeInk:#12820A;--milk:#FBF8FD;--mist:#EDE4F2;--grape:#6B5578;
  background:var(--milk);color:var(--plum);font-family:'Nunito',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.mb *{box-sizing:border-box}
.disp{font-family:'Fredoka','Nunito',sans-serif;font-weight:600;letter-spacing:-.01em}
.mono{font-family:'DM Mono',ui-monospace,Menlo,monospace}
.eyebrow{font-family:'Fredoka',sans-serif;font-weight:600;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--grape)}
.card{background:#fff;border:2px solid var(--mist);border-radius:22px;box-shadow:0 3px 0 var(--mist)}
.soft{background:#fff;border:2px solid var(--mist);border-radius:18px}
.btn{font-family:'Fredoka',sans-serif;font-weight:600;font-size:14px;border:2px solid var(--plum);background:var(--lime);color:var(--plum);
  padding:10px 18px;border-radius:999px;cursor:pointer;box-shadow:0 3px 0 var(--plum);transition:transform .12s,box-shadow .12s}
.btn:hover{transform:translateY(1px);box-shadow:0 2px 0 var(--plum)}
.btn:active{transform:translateY(3px);box-shadow:0 0 0 var(--plum)}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:0 3px 0 var(--plum)}
.btn-soft{background:#fff;border-color:var(--mist);box-shadow:0 3px 0 var(--mist);color:var(--grape)}
.btn-soft:hover{border-color:var(--plum);color:var(--plum);box-shadow:0 2px 0 var(--mist)}
.chip{font-family:'Nunito',sans-serif;font-weight:600;font-size:13px;text-align:left;line-height:1.4;
  border:2px solid var(--mist);background:#fff;color:var(--plum);padding:11px 14px;border-radius:16px;cursor:pointer;transition:all .14s}
.chip:hover{border-color:var(--lime);background:#F7FFF4;transform:translateY(-2px)}
.tabs{display:flex;gap:4px;background:var(--mist);padding:4px;border-radius:999px}
.tab{flex:1;font-family:'Fredoka',sans-serif;font-weight:600;font-size:13px;padding:8px 6px;border:none;border-radius:999px;
  background:transparent;color:var(--grape);cursor:pointer;transition:all .16s;white-space:nowrap}
.tab[data-on="1"]{background:#fff;color:var(--plum);box-shadow:0 2px 5px rgba(33,10,44,.10)}
.lang{display:flex;gap:2px;background:var(--mist);padding:3px;border-radius:999px;flex:none}
.lang button{font-family:'DM Mono',monospace;font-weight:500;font-size:10.5px;letter-spacing:.06em;padding:4px 9px;border:none;
  border-radius:999px;background:transparent;color:var(--grape);cursor:pointer;transition:all .16s}
.lang button[data-on="1"]{background:var(--plum);color:var(--lime)}
input[type=text],input[type=number],select{font-family:'Nunito',sans-serif;font-weight:600;font-size:14px;border:2px solid var(--mist);
  background:#fff;color:var(--plum);padding:10px 14px;width:100%;outline:none;border-radius:14px;transition:border-color .14s}
input:focus,select:focus{border-color:var(--lime)}
input::placeholder{color:#B6A5BF;font-weight:400}
.lbl{font-family:'Fredoka',sans-serif;font-weight:500;font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--grape);display:block;margin-bottom:6px}
.sw{display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:13.5px;line-height:1.45;color:var(--plum);font-weight:600;
  padding:7px 10px;border-radius:12px;transition:background .14s}
.sw:hover{background:#F7FFF4}
.sw input{margin:1px 0 0;width:18px;height:18px;accent-color:#34F821;flex:none;cursor:pointer}
.badge{display:inline-flex;align-items:center;gap:9px;font-family:'Fredoka',sans-serif;font-weight:600;font-size:22px;
  padding:11px 22px 11px 15px;border-radius:999px;border:2px solid currentColor;animation:pop .34s cubic-bezier(.34,1.7,.5,1)}
.badge .dot{width:32px;height:32px;border-radius:999px;display:grid;place-items:center;font-size:17px;background:currentColor}
@keyframes pop{0%{transform:scale(.6) rotate(-8deg);opacity:0}65%{transform:scale(1.06) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@media (prefers-reduced-motion:reduce){.badge{animation:none}.chip:hover{transform:none}}
.num{width:22px;height:22px;border-radius:999px;background:#EFFCEB;color:var(--limeInk);font-family:'Fredoka',sans-serif;
  font-weight:600;font-size:11.5px;display:grid;place-items:center;flex:none;margin-top:1px}
.pill{font-family:'Fredoka',sans-serif;font-weight:600;font-size:11.5px;padding:5px 12px;border-radius:999px;border:2px solid;flex:none;min-width:86px;text-align:center}
.dots span{display:inline-block;width:7px;height:7px;border-radius:999px;background:var(--lime);margin-right:4px;animation:bo .9s ease-in-out infinite}
.dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}
@keyframes bo{0%,100%{transform:translateY(0);opacity:.45}50%{transform:translateY(-5px);opacity:1}}
.scroll::-webkit-scrollbar{width:10px}
.scroll::-webkit-scrollbar-thumb{background:var(--mist);border-radius:999px}
.chev{transition:transform .2s}
.vb{animation:vbIn .62s cubic-bezier(.34,1.7,.5,1) both}
.vb-body{transform-origin:60px 100px;animation:vbBob 2.4s ease-in-out .7s infinite}
.vb-arm{transform-origin:0 0;transform:rotate(-24deg);animation:vbWave .42s ease-in-out .5s 6 alternate both}
.vb-arc{transform-origin:100px 46px;animation:vbArc .42s ease-in-out .5s 6 alternate both}
.vb-eyes{transform-origin:61px 37px;animation:vbBlink 4.2s ease-in-out 1.6s infinite}
@keyframes vbIn{0%{transform:scale(.55) rotate(-10deg);opacity:0}70%{transform:scale(1.05) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@keyframes vbBob{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-2.5px) scaleY(1.015)}}
@keyframes vbWave{from{transform:rotate(-24deg)}to{transform:rotate(-72deg)}}
@keyframes vbArc{from{opacity:.15;transform:scale(.8)}to{opacity:.65;transform:scale(1)}}
@keyframes vbBlink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}
@media (prefers-reduced-motion:reduce){.vb,.vb-body,.vb-arm,.vb-arc,.vb-eyes{animation:none}.vb-arm{transform:rotate(-48deg)}}
`;

/* ============================================================
   Peças
   ============================================================ */
function Field({ label, children }) {
  return (<div><span className="lbl">{label}</span>{children}</div>);
}

function Switch({ on, set, children }) {
  return (
    <label className="sw">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

function renderInline(t) {
  return t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith("**")) return <b key={i} style={{ fontWeight: 800 }}>{p.slice(2, -2)}</b>;
    if (p.startsWith("`"))
      return <code key={i} className="mono" style={{ background: "#F3EEF6", padding: "2px 7px", borderRadius: 7, fontSize: "0.9em" }}>{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
}

function Answer({ text }) {
  const lines = text.split("\n");
  const out = [];
  let list = [];
  const flush = (k) => {
    if (list.length) {
      out.push(
        <ol key={"l" + k} style={{ margin: "10px 0", padding: 0, listStyle: "none" }}>
          {list.map((it, i) => (
            <li key={i} style={{ display: "flex", gap: 11, marginBottom: 9 }}>
              <span className="num">{i + 1}</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.6 }}>{renderInline(it)}</span>
            </li>
          ))}
        </ol>
      );
      list = [];
    }
  };
  lines.forEach((raw, idx) => {
    const l = raw.trim();
    if (/^(\d+[.)]|[-•*])\s+/.test(l)) { list.push(l.replace(/^(\d+[.)]|[-•*])\s+/, "")); return; }
    flush(idx);
    if (!l) return;
    if (/^#{1,4}\s/.test(l)) out.push(<div key={idx} className="eyebrow" style={{ marginTop: 14, marginBottom: 6 }}>{l.replace(/^#{1,4}\s/, "")}</div>);
    else out.push(<p key={idx} style={{ fontSize: 14.5, lineHeight: 1.65, margin: "0 0 10px" }}>{renderInline(l)}</p>);
  });
  flush("end");
  return <div>{out}</div>;
}

/* ============================================================
   Mascote — martelo chibi a acenar
   ============================================================ */
const PLUM = "#210A2C", LIME = "#34F821";

function Chibi({ size = 96, onReplay }) {
  return (
    <svg viewBox="0 0 120 122" width={size} height={(size * 122) / 120} className="vb" role="img"
      aria-label="ViviBot" onClick={onReplay} style={{ cursor: "pointer", flex: "none" }}>
      <circle cx="60" cy="62" r="54" fill={LIME} />
      <ellipse cx="60" cy="112" rx="30" ry="5" fill={PLUM} opacity=".13" />

      <g className="vb-arc" stroke={PLUM} strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".55">
        <path d="M92 42 Q98 46 97 54" />
        <path d="M98 36 Q107 43 106 54" />
      </g>

      <g className="vb-body">
        <ellipse cx="53" cy="97" rx="8.5" ry="5.5" fill={PLUM} />
        <ellipse cx="70" cy="97" rx="8.5" ry="5.5" fill={PLUM} />

        <g transform="rotate(22 52 71)">
          <rect x="38" y="66.75" width="15" height="8.5" rx="4.25" fill={PLUM} />
          <circle cx="38" cy="71" r="4.25" fill={PLUM} />
        </g>

        <rect x="52" y="52" width="18" height="41" rx="9" fill={PLUM} />

        <rect x="46" y="23" width="42" height="30" rx="10" fill={PLUM} />
        <path d="M50 24 C38 23 27 31 22 43 L30 47 C33 37 40 33 50 33 Z" fill={PLUM} />
        <path d="M22 43 L30 47 L26.5 38.5 Z" fill={LIME} />
        <rect x="80" y="26" width="8" height="24" rx="4" fill="#3E2050" />

        <ellipse cx="43.5" cy="45" rx="4.6" ry="2.9" fill={LIME} opacity=".4" />
        <ellipse cx="78" cy="45" rx="4.6" ry="2.9" fill={LIME} opacity=".4" />
        <g className="vb-eyes">
          <circle cx="52" cy="37" r="4.8" fill={LIME} />
          <circle cx="70" cy="37" r="4.8" fill={LIME} />
          <circle cx="53.7" cy="35.3" r="1.6" fill="#FBF8FD" />
          <circle cx="71.7" cy="35.3" r="1.6" fill="#FBF8FD" />
        </g>
        <path d="M56 44 Q61 49 66 44" stroke={LIME} strokeWidth="2.7" strokeLinecap="round" fill="none" />

        <g transform="translate(70 64)">
          <g className="vb-arm">
            <rect x="0" y="-4.25" width="16" height="8.5" rx="4.25" fill={PLUM} />
            <circle cx="19" cy="0" r="7" fill={PLUM} />
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ============================================================
   Perguntar
   ============================================================ */
const SYSTEM = (lang) =>
  lang === "en"
    ? "You are ViviBot, the copilot for the MyBuilder · InstaPro Customer Service team. You answer agents who are mid-case and need to know what to do next.\n\nRULES\n1. Answer EXCLUSIVELY from the manual below. If the answer isn't there, say so plainly and tell them to check with their Team Lead. Never invent numbers, deadlines, field names or templates.\n2. Answer in the language of the question. Always keep operational terms in English: queue names, Salesforce fields, wrap-up codes, Case Reason, Hold & Check, Important Notes.\n3. Format: one verdict sentence first (what to do), then a numbered list of concrete, actionable steps. One action per step. No preamble.\n4. If the scenario is one of the escalation triggers (legal, media/PR, identity theft, GDPR, defamation, external authorities), open with \"ESCALATE IMMEDIATELY\" before anything else.\n5. If information is missing to decide (days since shortlist, ratio, lead value, whether the TP is new or established), say what each step depends on rather than assuming.\n6. Be brief and friendly. The agent is reading this with a customer on the line.\n\nMANUAL\n" + MANUAL_("en")
    : "És a ViviBot, a assistente da equipa de Customer Service do MyBuilder · InstaPro. Respondes a agentes que estão a meio de um caso e precisam de saber o que fazer a seguir.\n\nREGRAS\n1. Responde EXCLUSIVAMENTE com base no manual abaixo. Se a resposta não estiver lá, diz claramente que o manual não cobre esse ponto e manda falar com o Team Lead. Nunca inventes números, prazos, nomes de campos ou templates.\n2. Responde na língua da pergunta. Mantém sempre em inglês os termos operacionais: nomes de queues, campos de Salesforce, wrap-up codes, Case Reason, Hold & Check, Important Notes.\n3. Formato: uma frase de veredito primeiro (o que fazer), depois uma lista numerada de passos concretos e acionáveis. Cada passo diz uma ação. Sem preâmbulos.\n4. Se o cenário for um dos gatilhos de escalação (legal, media/PR, roubo de identidade, GDPR, difamação, autoridades externas), começa a resposta por \"ESCALAR IMEDIATAMENTE\" antes de qualquer outra coisa.\n5. Se faltar informação para decidir (dias desde o shortlist, rácio, valor do lead, se o TP é novo ou estabelecido), diz que passo depende de quê, em vez de assumires.\n6. Sê breve e simpático. Um agente lê isto com um cliente em linha.\n\nMANUAL\n" + MANUAL_("pt");

function Ask({ lang }) {
  const u = UI[lang];
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [mode, setMode] = useState("local");
  const [wave, setWave] = useState(0);
  const ctx = useRef({ slots: {}, pending: null, topic: null });
  const end = useRef(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  async function send(text) {
    const t = (text ?? q).trim();
    if (!t || busy) return;
    const next = [...msgs, { role: "user", content: t }];
    setMsgs(next); setQ(""); setBusy(true); setErr(null);

    if (mode === "local") {
      const r = processTurn(t, ctx.current, lang);
      ctx.current = r.ctx;
      setTimeout(() => {
        setMsgs([...next, { role: "assistant", content: r.content, chips: r.chips, via: "local" }]);
        setBusy(false);
      }, 240);
      return;
    }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000, system: SYSTEM(lang),
          messages: next.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const out = (data.content || []).map((c) => (c.type === "text" ? c.text : "")).filter(Boolean).join("\n");
      if (!out) throw new Error("empty");
      setMsgs([...next, { role: "assistant", content: out, via: "ia" }]);
    } catch (e) {
      setErr(u.apiErr);
      const r = processTurn(t, ctx.current, lang);
      ctx.current = r.ctx;
      setMsgs([...next, { role: "assistant", content: r.content, chips: r.chips, via: "local" }]);
    } finally { setBusy(false); }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "22px 18px 10px" }}>
        {msgs.length === 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <Chibi key={wave} size={92} onReplay={() => setWave((w) => w + 1)} />
              <div className="disp" style={{ fontSize: 25, lineHeight: 1.15 }}>{u.greet}</div>
            </div>
            <p style={{ fontSize: 14, color: "#6B5578", lineHeight: 1.65, margin: "0 0 22px", maxWidth: 540, fontWeight: 600 }}>{u.blurb}</p>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{u.tryThese}</div>
            <div style={{ display: "grid", gap: 9, gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
              {u.suggestions.map((sg) => (<button key={sg} className="chip" onClick={() => send(sg)}>{sg}</button>))}
            </div>
          </div>
        )}

        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} style={{ display: "flex", justifyContent: "flex-end", margin: "18px 0 14px" }}>
              <div className="disp" style={{ background: "#210A2C", color: "#fff", fontSize: 15.5, lineHeight: 1.45, padding: "11px 18px", borderRadius: "20px 20px 6px 20px", maxWidth: "82%" }}>
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "flex-start" }}>
              <img src={LOGO} alt="" width="30" height="30" style={{ borderRadius: 10, flex: "none", marginTop: 3 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="card" style={{ padding: "15px 18px", borderRadius: "20px 20px 20px 6px" }}>
                  <Answer text={m.content} />
                  <div className="mono" style={{ fontSize: 10, color: "#A793B0", marginTop: 10, letterSpacing: ".05em" }}>
                    {m.via === "ia" ? u.viaAI : u.viaLocal}
                  </div>
                </div>
                {i === msgs.length - 1 && m.chips && m.chips.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 9 }}>
                    {m.chips.map((c) => (
                      <button key={c} className="chip" style={{ fontSize: 12.5, padding: "8px 13px", borderRadius: 999 }} onClick={() => send(c)}>{c}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {busy && (
          <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "flex-start" }}>
            <img src={LOGO} alt="" width="30" height="30" style={{ borderRadius: 10, flex: "none", marginTop: 3 }} />
            <div className="card" style={{ padding: "17px 20px", borderRadius: "20px 20px 20px 6px" }}>
              <span className="dots"><span /><span /><span /></span>
            </div>
          </div>
        )}
        {err && (
          <div className="soft" style={{ padding: "12px 16px", borderColor: TONE.reject.br, background: TONE.reject.bg, color: TONE.reject.fg, fontSize: 13.5, fontWeight: 700, marginBottom: 16 }}>
            {err}
          </div>
        )}
        <div ref={end} />
      </div>

      <div style={{ borderTop: "2px solid #EDE4F2", background: "#fff", padding: "10px 12px 12px" }}>
        <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 9, flexWrap: "wrap" }}>
          <div className="tabs" style={{ padding: 3, flex: "none" }}>
            {[["local", u.mLocal], ["ia", u.mAI]].map(([id, l]) => (
              <button key={id} className="tab" style={{ fontSize: 12, padding: "5px 14px" }} data-on={mode === id ? "1" : "0"} onClick={() => setMode(id)}>{l}</button>
            ))}
          </div>
          <span style={{ fontSize: 11.5, color: "#6B5578", fontWeight: 700 }}>{mode === "local" ? u.dLocal : u.dAI}</span>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <input type="text" value={q} placeholder={u.placeholder} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <button className="btn" onClick={() => send()} disabled={busy || !q.trim()}>{u.send}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Reembolso
   ============================================================ */
function RefundTool({ lang }) {
  const u = UI[lang];
  const R = reasons(lang);
  const [s, setS] = useState({
    reason: "out_area", days: 12, ati: 200, shortlists: 40, ratio: 12, value: 22,
    hasJobId: true, hasReason: true, dishonesty: false, bulk: false, convoConfirms: false, appeal: false,
  });
  const up = (k) => (v) => setS((p) => ({ ...p, [k]: v }));
  const d = useMemo(() => decideRefund(s, lang), [s, lang]);
  const c = TONE[d.tone];
  const grp = (cat, label) => (
    <optgroup label={label}>{R.filter((r) => r.c === cat).map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</optgroup>
  );

  return (
    <div className="scroll" style={{ overflowY: "auto", height: "100%", padding: "22px 18px 44px" }}>
      <div className="eyebrow">{u.rEyebrow}</div>
      <h2 className="disp" style={{ fontSize: 28, margin: "4px 0 6px", lineHeight: 1.1 }}>{u.rTitle}</h2>
      <p style={{ fontSize: 14, color: "#6B5578", margin: "0 0 22px", maxWidth: 560, lineHeight: 1.6, fontWeight: 600 }}>{u.rBlurb}</p>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))" }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>{u.rFacts}</div>
          <div style={{ display: "grid", gap: 13 }}>
            <Field label={u.rReason}>
              <select value={s.reason} onChange={(e) => up("reason")(e.target.value)}>
                {grp("always", u.grp[0])}{grp("sometimes", u.grp[1])}{grp("supervisor", u.grp[2])}{grp("never", u.grp[3])}
              </select>
            </Field>
            <div style={{ display: "grid", gap: 11, gridTemplateColumns: "1fr 1fr" }}>
              <Field label={u.rDays}><input type="number" value={s.days} onChange={(e) => up("days")(e.target.value)} /></Field>
              <Field label={u.rValue}><input type="number" value={s.value} onChange={(e) => up("value")(e.target.value)} /></Field>
              <Field label={u.rAti}><input type="number" value={s.ati} onChange={(e) => up("ati")(e.target.value)} /></Field>
              <Field label={u.rShort}><input type="number" value={s.shortlists} onChange={(e) => up("shortlists")(e.target.value)} /></Field>
              <Field label={u.rRatio}><input type="number" value={s.ratio} onChange={(e) => up("ratio")(e.target.value)} /></Field>
            </div>
            <div style={{ display: "grid", gap: 2, marginTop: 4, borderTop: "2px solid #EDE4F2", paddingTop: 12 }}>
              <Switch on={s.hasJobId} set={up("hasJobId")}>{u.rSw[0]}</Switch>
              <Switch on={s.hasReason} set={up("hasReason")}>{u.rSw[1]}</Switch>
              <Switch on={s.convoConfirms} set={up("convoConfirms")}>{u.rSw[2]}</Switch>
              <Switch on={s.dishonesty} set={up("dishonesty")}>{u.rSw[3]}</Switch>
              <Switch on={s.bulk} set={up("bulk")}>{u.rSw[4]}</Switch>
              <Switch on={s.appeal} set={up("appeal")}>{u.rSw[5]}</Switch>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 20, background: c.bg, borderColor: c.br, boxShadow: `0 3px 0 ${c.br}` }}>
            <div style={{ color: c.fg, marginBottom: 14 }}>
              <span className="badge" key={d.verdict}>
                <span className="dot" style={{ color: c.bg }}>{d.icon}</span>{d.verdict}
              </span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.55, margin: "0 0 16px", fontWeight: 700 }}>{d.lead}</p>
            <div className="eyebrow" style={{ marginBottom: 9 }}>{u.rSteps}</div>
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {d.steps.map((st, i) => (
                <li key={i} style={{ display: "flex", gap: 11, marginBottom: 10 }}>
                  <span className="num" style={{ background: "#fff", color: c.fg }}>{i + 1}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.55, fontWeight: 600 }}>{st}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="card" style={{ padding: 18, marginTop: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>{u.rWhy}</div>
            {d.trace.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
                <span style={{ color: "#34F821", fontSize: 15, lineHeight: 1.2, flex: "none" }}>•</span>
                <span className="mono" style={{ fontSize: 12, lineHeight: 1.6, color: "#6B5578" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Routing
   ============================================================ */
function Routing({ lang }) {
  const u = UI[lang];
  const [f, setF] = useState("");
  const [who, setWho] = useState("TP");
  const [ck, setCk] = useState({});
  const all = routes(lang);
  const list = useMemo(() => {
    const t = f.toLowerCase().trim();
    if (!t) return all;
    return all.filter((r) => (r.t + " " + r.q + " " + r.a + " " + r.k).toLowerCase().includes(t));
  }, [f, lang]);

  const vItems = who === "TP" ? u.vItemsTP : u.vItemsHO;
  const pass = vItems.every((_, i) => ck[who + i]);
  const vc = pass ? TONE.approve : TONE.reject;

  return (
    <div className="scroll" style={{ overflowY: "auto", height: "100%", padding: "22px 18px 44px" }}>
      <div className="eyebrow">{u.qEyebrow}</div>
      <h2 className="disp" style={{ fontSize: 28, margin: "4px 0 20px", lineHeight: 1.1 }}>{u.qTitle}</h2>

      <input type="text" placeholder={u.qFilter} value={f} onChange={(e) => setF(e.target.value)} style={{ marginBottom: 16, maxWidth: 460 }} />

      <div style={{ display: "grid", gap: 9, marginBottom: 28 }}>
        {list.map((r) => {
          const c = TONE[r.tone];
          return (
            <div key={r.t} className="soft" style={{ padding: "13px 16px", display: "flex", gap: 13, alignItems: "flex-start" }}>
              <span className="pill" style={{ color: c.fg, background: c.bg, borderColor: c.br }}>{r.q}</span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 2 }}>{r.t}</div>
                <div style={{ fontSize: 13, color: "#6B5578", lineHeight: 1.55, fontWeight: 600 }}>{r.a}</div>
              </div>
            </div>
          );
        })}
        {!list.length && <div className="soft" style={{ padding: 18, fontSize: 13.5, color: "#6B5578", fontWeight: 600 }}>{u.qNone}</div>}
      </div>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))" }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 5 }}>{u.vEyebrow}</div>
          <h3 className="disp" style={{ fontSize: 19, margin: "0 0 7px" }}>{u.vTitle}</h3>
          <p style={{ fontSize: 13.5, color: "#6B5578", lineHeight: 1.6, margin: "0 0 14px", fontWeight: 600 }}>
            {u.vBlurb1}<b style={{ color: "#210A2C" }}>{u.vBlurbBold}</b>{u.vBlurb2}
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[["TP", u.vTP], ["HO", u.vHO]].map(([w, l]) => (
              <button key={w} className={"btn " + (who === w ? "" : "btn-soft")} style={{ flex: 1 }} onClick={() => setWho(w)}>{l}</button>
            ))}
          </div>
          <div style={{ display: "grid", gap: 2 }}>
            {vItems.map((it, i) => (
              <Switch key={i} on={!!ck[who + i]} set={(v) => setCk((p) => ({ ...p, [who + i]: v }))}>{it}</Switch>
            ))}
          </div>
          <div className="soft" style={{ marginTop: 14, padding: "13px 16px", borderColor: vc.br, background: vc.bg, color: vc.fg, fontSize: 13.5, lineHeight: 1.55, fontWeight: 700 }}>
            {pass ? u.vPass : u.vFail}
          </div>
          <div style={{ marginTop: 12, fontSize: 12.5, color: "#6B5578", lineHeight: 1.55, fontWeight: 600 }}>{u.vHint}</div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow" style={{ marginBottom: 5 }}>{u.aEyebrow}</div>
          <h3 className="disp" style={{ fontSize: 19, margin: "0 0 14px" }}>{u.aTitle}</h3>
          <div style={{ display: "grid", gap: 11 }}>
            {fields(lang).map((x) => {
              const c = x.ok ? TONE.approve : TONE.reject;
              return (
                <div key={x.f} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: c.bg, color: c.fg, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, flex: "none", marginTop: 1 }}>
                    {x.ok ? "✓" : "✕"}
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{x.f}</div>
                    <div style={{ fontSize: 12.5, color: "#6B5578", lineHeight: 1.55, fontWeight: 600 }}>{x.n}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Manual
   ============================================================ */
function Manual({ lang }) {
  const u = UI[lang];
  const [f, setF] = useState("");
  const [open, setOpen] = useState("workflow");
  const t = f.toLowerCase().trim();

  const filtered = useMemo(() => {
    const src = KB(lang);
    if (!t) return src;
    return src.map((s) => ({
      ...s,
      blocks: s.blocks.map((b) => ({ ...b, items: b.items.filter((i) => i.toLowerCase().includes(t) || b.h.toLowerCase().includes(t)) })).filter((b) => b.items.length),
    })).filter((s) => s.blocks.length);
  }, [t, lang]);

  return (
    <div className="scroll" style={{ overflowY: "auto", height: "100%", padding: "22px 18px 44px" }}>
      <div className="eyebrow">{u.mEyebrow}</div>
      <h2 className="disp" style={{ fontSize: 28, margin: "4px 0 18px", lineHeight: 1.1 }}>{u.mTitle}</h2>
      <input type="text" placeholder={u.mSearch} value={f} onChange={(e) => setF(e.target.value)} style={{ marginBottom: 18, maxWidth: 460 }} />

      {filtered.map((s) => {
        const isOpen = t ? true : open === s.id;
        return (
          <div key={s.id} className="card" style={{ marginBottom: 11, overflow: "hidden" }}>
            <button onClick={() => setOpen(open === s.id ? null : s.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "15px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              <span className="mono" style={{ fontSize: 12, color: "#12820A", background: "#EFFCEB", padding: "4px 9px", borderRadius: 999, flex: "none", fontWeight: 500 }}>{s.num}</span>
              <span className="disp" style={{ fontSize: 19, flex: 1 }}>{s.title}</span>
              <span className="chev" style={{ fontSize: 15, color: "#6B5578", transform: isOpen ? "rotate(180deg)" : "none" }}>⌄</span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 18px 18px" }}>
                {s.blocks.map((b) => (
                  <div key={b.h} style={{ marginTop: 15 }}>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>{b.h}</div>
                    {b.items.map((i, k) => (
                      <div key={k} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
                        <span style={{ color: "#34F821", flex: "none", fontSize: 15, lineHeight: 1.3 }}>•</span>
                        <span style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 600 }}>{i}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {!filtered.length && <div className="soft" style={{ padding: 18, fontSize: 13.5, color: "#6B5578", fontWeight: 600 }}>{u.mNone(f)}</div>}
    </div>
  );
}

/* ============================================================
   Shell
   ============================================================ */
const TABS = [Ask, RefundTool, Routing, Manual];

export default function App() {
  const [tab, setTab] = useState(0);
  const [lang, setLang] = useState("pt");
  const u = UI[lang];
  const Active = TABS[tab];

  return (
    <div className="mb" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>

      <header style={{ borderBottom: "2px solid #EDE4F2", background: "#fff", padding: "12px 16px 13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
          <img src={LOGO} alt="ViviBot" width="38" height="38" style={{ borderRadius: 13 }} />
          <div>
            <div className="disp" style={{ fontSize: 17, lineHeight: 1.1 }}>{u.name}</div>
            <div style={{ fontSize: 11.5, color: "#6B5578", fontWeight: 700 }}>MyBuilder · InstaPro</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <div className="lang">
              {[["pt", "PT"], ["en", "EN"]].map(([id, l]) => (
                <button key={id} data-on={lang === id ? "1" : "0"} onClick={() => setLang(id)} aria-label={l}>{l}</button>
              ))}
            </div>
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#6B5578", background: "#F3EEF6", padding: "5px 11px", borderRadius: 999 }}>
              {u.internal}
            </span>
          </div>
        </div>
        <div className="tabs" style={{ maxWidth: 480 }}>
          {u.tabs.map((l, i) => (
            <button key={i} className="tab" data-on={tab === i ? "1" : "0"} onClick={() => setTab(i)}>{l}</button>
          ))}
        </div>
      </header>

      <main style={{ flex: 1, minHeight: 0 }}>
        <Active lang={lang} />
      </main>
    </div>
  );
}
