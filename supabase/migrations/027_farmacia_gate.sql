-- ═══════════════════════════════════════════════════════════════
-- 027 — El candado de farmacia deja de ser decorativo
--
-- `pharmacy_insert_own` permitía insertar a cualquiera con sesión, sin mirar
-- si su membresía incluye coordinación de farmacia. El candado vivía solo en
-- la pantalla (y encima comprobaba "tener alguna suscripción activa", así que
-- un miembro Básica pasaba). Ahora la condición vive en la base:
-- suscripción activa + plan con includes_pharmacy_coord.
--
-- El permiso se pide por la CASILLA del plan, nunca por su nombre: los nombres
-- de plan ya cambiaron una vez y dejaron el candado apuntando a planes muertos.
-- ═══════════════════════════════════════════════════════════════
drop policy if exists "pharmacy_insert_own" on public.pharmacy_requests;

create policy "pharmacy_insert_con_derecho" on public.pharmacy_requests
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.subscriptions s
      join public.membership_plans mp on mp.id = s.plan_id
      where s.user_id = auth.uid()
        and s.status = 'active'
        and mp.includes_pharmacy_coord
    )
  );
