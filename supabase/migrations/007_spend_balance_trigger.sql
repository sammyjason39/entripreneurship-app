-- Spend should only deduct from from_team_id, not credit to_team_id

CREATE OR REPLACE FUNCTION public.update_team_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type IN ('reward', 'transfer') THEN
    UPDATE teams SET balance = balance + NEW.amount WHERE id = NEW.to_team_id;
  END IF;
  IF NEW.from_team_id IS NOT NULL AND NEW.type = 'transfer' THEN
    UPDATE teams SET balance = balance - NEW.amount WHERE id = NEW.from_team_id;
  END IF;
  IF NEW.from_team_id IS NOT NULL AND NEW.type = 'spend' THEN
    UPDATE teams SET balance = balance - NEW.amount WHERE id = NEW.from_team_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
