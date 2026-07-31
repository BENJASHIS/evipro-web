import { permanentRedirect } from 'next/navigation'

// La consejería (video/WhatsApp) se retiró del producto; lo que de verdad vivía
// en esta página eran los aliados.
export default function ConsejeriaRedirect() {
  permanentRedirect('/aliados')
}
