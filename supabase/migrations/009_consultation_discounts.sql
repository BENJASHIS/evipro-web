-- Ajuste de precios de consulta para miembros (descuentos por plan).
-- Base sin membresía: virtual S/. 70 · presencial S/. 100.
-- Precio mostrado = round(base * (1 - pct/100)) en planes/page.tsx y miembros/page.tsx.
--
--   Esencial : virtual S/. 30 (57%) · presencial S/. 60 (40%)
--   Express  : virtual S/. 20 (71%) · presencial S/. 30 (70%)
--   Cannabis : virtual S/. 10 (86%) · presencial S/. 20 (80%)
--   Integral : virtual S/. 10 (86%) · presencial S/. 20 (80%)

update membership_plans set discount_virtual_pct = 57, discount_presencial_pct = 40 where type = 'esencial';
update membership_plans set discount_virtual_pct = 71, discount_presencial_pct = 70 where type = 'express';
update membership_plans set discount_virtual_pct = 86, discount_presencial_pct = 80 where type = 'cannabis';
update membership_plans set discount_virtual_pct = 86, discount_presencial_pct = 80 where type = 'integral';
