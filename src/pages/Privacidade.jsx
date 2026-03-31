const LAST_UPDATED = '31 de março de 2026';
const SITE = 'SimulaInvest';
const DOMAIN = 'simulainvest.com.br';
const EMAIL = 'contato@simulainvest.com.br';

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

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
          Política de Privacidade
        </h1>
        <p className="text-sm text-gray-400">Última atualização: {LAST_UPDATED}</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-card dark:border-gray-800 dark:bg-gray-900">

        <Section title="1. Quem somos">
          <p>
            O <strong>{SITE}</strong> ({DOMAIN}) é uma plataforma gratuita de simulação financeira e educação
            sobre investimentos. Não somos corretora, banco ou consultora de investimentos. Todas as
            simulações têm fins exclusivamente educacionais.
          </p>
          <p>
            Em caso de dúvidas sobre esta política, entre em contato pelo e-mail: <strong>{EMAIL}</strong>
          </p>
        </Section>

        <Section title="2. Quais dados coletamos">
          <p>O {SITE} foi desenvolvido com foco em privacidade. <strong>Não coletamos dados pessoais
          identificáveis</strong> sem o seu consentimento explícito.</p>

          <p><strong>Dados armazenados localmente (no seu dispositivo):</strong></p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Preferência de tema (claro/escuro) — via <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">localStorage</code></li>
            <li>Cache das taxas financeiras (Selic, CDI, IPCA) — expira em 6 horas</li>
            <li>Preferência de exibição do modal de cadastro</li>
          </ul>

          <p><strong>Dados coletados voluntariamente:</strong></p>
          <ul className="ml-4 list-disc space-y-1">
            <li>E-mail — somente se você preencher o formulário de captura (opcional)</li>
          </ul>

          <p>
            Todos os cálculos de simulação são processados <strong>inteiramente no seu navegador</strong>.
            Os valores que você insere (capital, aportes, taxas) nunca são enviados para nenhum servidor.
          </p>
        </Section>

        <Section title="3. Cookies e tecnologias de rastreamento">
          <p>
            Utilizamos ou podemos utilizar as seguintes tecnologias:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['Tecnologia', 'Finalidade', 'Dados coletados'].map(h => (
                    <th key={h} className="py-2 pr-4 text-left font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {[
                  ['localStorage', 'Salvar preferências locais', 'Apenas no seu dispositivo'],
                  ['Google AdSense', 'Exibir anúncios relevantes', 'Comportamento de navegação (cookies de terceiros)'],
                  ['Google Analytics', 'Medir audiência e melhorar o site', 'Páginas visitadas, duração, dispositivo (anonimizado)'],
                  ['API Banco Central', 'Buscar taxas financeiras em tempo real', 'Nenhum — requisição pública sem autenticação'],
                ].map(([tech, fin, data]) => (
                  <tr key={tech}>
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">{tech}</td>
                    <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{fin}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            O Google AdSense pode usar cookies para exibir anúncios com base nas suas visitas anteriores
            a este e outros sites. Você pode optar por não receber anúncios personalizados acessando
            as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
            className="text-brand hover:underline">configurações de anúncios do Google</a>.
          </p>
        </Section>

        <Section title="4. Como usamos os dados">
          <ul className="ml-4 list-disc space-y-1">
            <li>Melhorar a experiência de uso da plataforma</li>
            <li>Enviar conteúdo educacional por e-mail (somente se você se cadastrar)</li>
            <li>Analisar métricas de uso de forma agregada e anônima</li>
            <li>Exibir anúncios relevantes via Google AdSense</li>
          </ul>
          <p>
            <strong>Nunca</strong> vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros
            para fins comerciais.
          </p>
        </Section>

        <Section title="5. Seus direitos (LGPD)">
          <p>
            Em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>,
            você tem direito a:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Confirmar se tratamos seus dados pessoais</li>
            <li>Acessar seus dados</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, entre em contato: <strong>{EMAIL}</strong>
          </p>
        </Section>

        <Section title="6. Retenção de dados">
          <p>
            Dados de e-mail coletados voluntariamente são retidos enquanto você mantiver interesse em
            receber comunicações. Você pode cancelar o recebimento a qualquer momento clicando em
            "descadastrar" nos e-mails ou entrando em contato conosco.
          </p>
          <p>
            Dados armazenados em <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">localStorage</code> ficam
            no seu dispositivo e podem ser removidos a qualquer momento limpando os dados do navegador.
          </p>
        </Section>

        <Section title="7. Segurança">
          <p>
            O site é servido exclusivamente via <strong>HTTPS</strong>. Por processar todos os cálculos
            localmente, reduzimos ao mínimo a superfície de exposição de dados dos usuários.
          </p>
        </Section>

        <Section title="8. Alterações nesta política">
          <p>
            Podemos atualizar esta política periodicamente. Em caso de mudanças relevantes, publicaremos
            um aviso no site. O uso continuado após a publicação constitui aceite das alterações.
          </p>
        </Section>

        <Section title="9. Contato">
          <p>
            Dúvidas, solicitações ou reclamações relacionadas à privacidade:
          </p>
          <p>
            📧 <a href={`mailto:${EMAIL}`} className="text-brand hover:underline">{EMAIL}</a>
          </p>
        </Section>
      </div>
    </main>
  );
}
