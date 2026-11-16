-- =====================================================================
-- RODAR SOMENTE DEPOIS que o site novo (que usa create_appointment) estiver
-- publicado e você tiver testado um agendamento de cliente.
--
-- Fecha a porta antiga: hoje o cliente consegue gravar agendamentos direto
-- na tabela, sem passar pela checagem de conflito. Depois disto, só a função
-- create_appointment cria agendamentos.
-- Se rodar ANTES de publicar o site novo, o agendamento do site antigo para
-- de funcionar.
-- =====================================================================

drop policy if exists "Usuário pode criar seu agendamento" on public.appointments;
drop policy if exists "Usuário pode adicionar serviços ao próprio agendamento" on public.appointment_services;
