# Supabase Migrations

## Cómo aplicar

1. Ir a supabase.com → tu proyecto → SQL Editor
2. Ejecutar `migrations/001_schema.sql` primero
3. Ejecutar `migrations/002_seed_plans.sql` después

## Tablas creadas
- `profiles` — perfiles extendidos de usuarios
- `membership_plans` — catálogo de 9 planes
- `subscriptions` — suscripciones activas e históricas
- `payments` — historial de pagos de Culqi
- `raffles` — sorteos mensuales
- `raffle_tickets` — tickets asignados por membresía
- `content` — artículos y guías exclusivas
- `pharmacy_requests` — solicitudes de coordinación con farmacia
