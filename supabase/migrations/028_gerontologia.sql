-- El módulo del Dr. Vera se sembró (migración 020) como
-- "Geriatría / adulto mayor (Dr. Vera)" y no es lo mismo: su especialidad es
-- GERONTOLOGÍA (UMSS Cochabamba, 2022), como ya decía su ficha en /medicos.
--
-- No es un matiz de diccionario: la geriatría es la especialidad médica que
-- atiende al adulto mayor enfermo, y la gerontología es el estudio
-- multidisciplinario del envejecimiento. Anunciar una especialidad que el
-- médico no tiene es el mismo problema que "Especialista en Cannabinología"
-- en la portada, y aquí encima va en la etiqueta de algo que se cobra.
--
-- La etiqueta se lee de la BD y se pinta en el configurador de /planes, así que
-- corregir el seed de la 020 no cambia nada: hace falta este update.

update plan_addons
   set name = 'Gerontología / adulto mayor (Dr. Vera)'
 where slug = 'especialista_vera';
