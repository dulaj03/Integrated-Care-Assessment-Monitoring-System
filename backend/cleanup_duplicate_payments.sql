-- ============================================================
-- CLEANUP: Remove duplicate payment records per appointment
-- Keep only the best record (completed > pending, latest first)
-- ============================================================

-- Step 1: Preview what will be deleted (run this first to check)
SELECT id, appointment_id, payment_status, created_at
FROM payments
ORDER BY appointment_id, created_at DESC;

-- Step 2: Delete duplicate payment records, keeping only:
--   - The 'completed' one if it exists
--   - Otherwise the most recent 'pending' one
DELETE FROM payments
WHERE id NOT IN (
  SELECT DISTINCT ON (appointment_id) id
  FROM payments
  ORDER BY appointment_id,
    CASE payment_status
      WHEN 'completed'  THEN 1
      WHEN 'pending'    THEN 2
      WHEN 'failed'     THEN 3
      WHEN 'cancelled'  THEN 4
      ELSE 5
    END,
    created_at DESC
);

-- Step 3: Sync appointments.payment_status from the payments table
-- (fixes any appointment where notify didn't fire properly)
UPDATE appointments a
SET payment_status = p.payment_status
FROM payments p
WHERE p.appointment_id = a.id
  AND p.payment_status = 'completed';

-- Step 4: Verify - should now be exactly 1 payment per appointment
SELECT appointment_id, COUNT(*) as count, MAX(payment_status) as status
FROM payments
GROUP BY appointment_id
ORDER BY appointment_id;
