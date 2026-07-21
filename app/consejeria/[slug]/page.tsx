import { permanentRedirect } from 'next/navigation'

export default async function ConsejeriaSlugRedirect(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  permanentRedirect(`/medicos/${slug}/agendar`)
}
