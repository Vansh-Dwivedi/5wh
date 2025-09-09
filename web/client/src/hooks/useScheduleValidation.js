// Reusable hook for scheduling validation across create/edit forms
// Tip: Centralizes future/past time checks & returns helper functions.
import { useCallback } from 'react';

export function useScheduleValidation() {
  const validate = useCallback((status, scheduledAt) => {
    if (status !== 'scheduled') return { valid: true };
    if (!scheduledAt) return { valid: false, message: 'Scheduled time is required' };
    const when = new Date(scheduledAt);
    if (isNaN(when.getTime())) return { valid: false, message: 'Invalid date/time' };
    if (when <= new Date()) return { valid: false, message: 'Scheduled time must be in the future' };
    return { valid: true };
  }, []);

  // Utility to normalize datetime-local value (strip seconds for inputs)
  const toInputValue = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,16);
  };

  return { validateSchedule: validate, toInputValue };
}

export default useScheduleValidation;
