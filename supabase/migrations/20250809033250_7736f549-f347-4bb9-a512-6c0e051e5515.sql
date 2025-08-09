-- Create RPC to submit a payment verification securely
create or replace function public.submit_verification(
  p_user_id uuid,
  p_plan_id uuid,
  p_amount numeric,
  p_payment_proof_url text,
  p_payment_method text default 'qr_code',
  p_transaction_reference text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- Ensure the caller is the same authenticated user
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  insert into public.payment_verifications (
    user_id,
    plan_id,
    amount,
    payment_proof_url,
    payment_method,
    transaction_reference,
    status
  ) values (
    p_user_id,
    p_plan_id,
    p_amount,
    p_payment_proof_url,
    coalesce(p_payment_method, 'qr_code'),
    p_transaction_reference,
    'pending'
  ) returning id into v_id;

  return v_id;
end;
$$;

-- Lock down function and grant to authenticated users
revoke all on function public.submit_verification(uuid, uuid, numeric, text, text, text) from public;
grant execute on function public.submit_verification(uuid, uuid, numeric, text, text, text) to authenticated;