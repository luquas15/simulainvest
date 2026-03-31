const LAST_UPDATED = '31 de março de 2026';
const SITE = 'SimulaInvest';
const DOMAIN = 'simulainvest.dev.br';
const EMAIL = 'contato@simulainvest.dev.br';

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {children}
      </div>
    </section>
  );
}

export default function Termos() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
          Termos de Uso
        </h1>
        <p className="text-sm text-gray-400">Última atualização: {LAST_UPDATED}</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-card dark:border-gray-800 dark:bg-gray-900">

        <Section title="1. Aceitação dos termos">
          <p>
            Ao acessar e utilizar o <strong>{SITE}</strong> ({DOMAIN}), você concorda com estes Termos de Uso.
            Caso não concorde com qualquer parte, pedimos que não utilize a plataforma.
          </p>
        </Section>

        <Section title="2. Natureza do serviço">
          <p>
            O {SITE} é uma <strong>ferramenta educacional gratuita</strong> de simulação financeira. Todas
            as projeções, gráficos e resultados exibidos têm <strong>fins exclusivamente ilustrativos e educacionais</strong>.
          </p>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/50 dark:bg-yellow-900/20">
            <p className="font-semibold text-yellow-800 dark:text-yellow-400">⚠️ Aviso importante</p>
            <p className="mt-1 text-yellow-700 dark:text-yellow-300">
              O {SITE} <strong>não é</strong> uma corretora de valores, banco, consultora de investimentos
              nem assessora financeira. As simulações não constituem recomendação de compra, venda ou
              manutenção de nenhum ativo financeiro. Rentabilidade passada não garante rentabilidade futura.
              Consulte sempre um profissional certificado (CFP, CEA, CGA) antes de tomar decisões de investimento.
            </p>
          </div>
        </Section>

        <Section title="3. Limitação de responsabilidade">
          <p>O {SITE} não se responsabiliza por:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Decisões financeiras tomadas com base nas simulações da plataforma</li>
            <li>Divergências entre os resultados simulados e os retornos reais de investimentos</li>
            <li>Imprecisões temporárias nas taxas obtidas via API do Banco Central</li>
            <li>Perdas financeiras de qualquer natureza decorrentes do uso da plataforma</li>
            <li>Interrupções temporárias do serviço por manutenção ou problemas técnicos</li>
          </ul>
          <p>
            As taxas exibidas (Selic, CDI, IPCA) são obtidas automaticamente da API pública do
            Banco Central do Brasil e podem apresentar pequeno atraso em relação aos valores oficiais.
          </p>
        </Section>

        <Section title="4. Uso permitido">
          <p>Você pode:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Usar todas as ferramentas gratuitamente para fins pessoais e educacionais</li>
            <li>Compartilhar links para as simulações nas redes sociais</li>
            <li>Baixar e compartilhar os cards de resultado gerados pela plataforma</li>
          </ul>
          <p>É <strong>proibido</strong>:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Copiar, reproduzir ou redistribuir o código-fonte sem autorização prévia</li>
            <li>Usar a plataforma para fins comerciais sem licença</li>
            <li>Tentar comprometer a segurança, disponibilidade ou integridade do serviço</li>
            <li>Realizar scraping automatizado em volumes que prejudiquem o desempenho</li>
          </ul>
        </Section>

        <Section title="5. Propriedade intelectual">
          <p>
            Todo o conteúdo original do {SITE} — incluindo textos, design, lógica das calculadoras,
            gráficos e estrutura de código — é protegido por direitos autorais e é de propriedade
            exclusiva do {SITE}.
          </p>
          <p>
            Os dados financeiros exibidos (Selic, CDI, IPCA) são de domínio público, obtidos do
            Banco Central do Brasil.
          </p>
        </Section>

        <Section title="6. Anúncios">
          <p>
            O {SITE} pode exibir anúncios via <strong>Google AdSense</strong> e/ou links de afiliados
            de instituições financeiras. Os anúncios são claramente identificados e não influenciam
            o conteúdo editorial ou os resultados das simulações.
          </p>
          <p>
            Links de afiliados podem gerar comissão para o {SITE} sem custo adicional para você.
            Recomendamos apenas produtos que consideramos relevantes para o público.
          </p>
        </Section>

        <Section title="7. Disponibilidade do serviço">
          <p>
            O {SITE} é fornecido "como está", sem garantia de disponibilidade contínua. Podemos
            realizar manutenções, atualizações ou interromper o serviço a qualquer momento sem aviso prévio.
          </p>
        </Section>

        <Section title="8. Alterações nos termos">
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações entram em
            vigor imediatamente após a publicação. O uso continuado da plataforma após as alterações
            implica aceitação dos novos termos.
          </p>
        </Section>

        <Section title="9. Lei aplicável">
          <p>
            Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida no foro
            da comarca de domicílio do usuário, conforme o Código de Defesa do Consumidor.
          </p>
        </Section>

        <Section title="10. Contato">
          <p>
            📧 <a href={`mailto:${EMAIL}`} className="text-brand hover:underline">{EMAIL}</a>
          </p>
        </Section>
      </div>
    </main>
  );
}
