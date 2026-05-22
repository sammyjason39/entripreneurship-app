-- Allow authenticated inserts for EnCoin flows (previously only SELECT existed)

-- Bank desk / jury: manual reward
CREATE POLICY transactions_insert_reward_crew ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'reward'
    AND from_user_id = auth.uid()
    AND public.is_crew_or_admin()
  );

-- Bank desk: deduct (spend)
CREATE POLICY transactions_insert_spend_crew ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'spend'
    AND from_user_id = auth.uid()
    AND from_team_id IS NOT NULL
    AND public.is_crew_or_admin()
  );

-- Participant P2P transfer
CREATE POLICY transactions_insert_transfer ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'transfer'
    AND from_user_id = auth.uid()
    AND from_team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- Participant scans crew reward QR (from_user_id is crew; auth.uid() is participant)
CREATE POLICY transactions_insert_reward_qr_crew ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'reward'
    AND qr_session_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.qr_sessions qs
      WHERE qs.id = qr_session_id
        AND qs.status = 'pending'
        AND qs.initiator_role = 'crew'
    )
  );

-- Participant scans another team's payment QR
CREATE POLICY transactions_insert_transfer_qr ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'transfer'
    AND qr_session_id IS NOT NULL
    AND from_user_id = auth.uid()
    AND from_team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.qr_sessions qs
      WHERE qs.id = qr_session_id
        AND qs.status = 'pending'
        AND qs.initiator_role = 'participant'
    )
  );
