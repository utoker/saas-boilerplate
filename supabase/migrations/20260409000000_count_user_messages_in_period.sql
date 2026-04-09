-- Counts a user's user-role messages within an arbitrary period in a single round-trip.
-- Replaces a two-step query in getBillingPeriodUsage that first fetched every conversation
-- id for the user and then issued an IN (...) count. Mirrors count_user_messages_this_month.

create or replace function public.count_user_messages_in_period(
  uid uuid,
  period_start timestamptz,
  period_end timestamptz
)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.messages m
  join public.conversations c on c.id = m.conversation_id
  where c.user_id = uid
    and m.role = 'user'
    and m.created_at >= period_start
    and m.created_at < period_end;
$$;

grant execute on function public.count_user_messages_in_period(uuid, timestamptz, timestamptz) to authenticated;
