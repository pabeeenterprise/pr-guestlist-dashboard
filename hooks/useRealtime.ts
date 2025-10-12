import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';

export const useRealtimeGuestlist = (eventId: string, callback?: () => void) => {
  useEffect(() => {
    const channel = supabase
      .channel(`guestlist-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guestlist',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('Guestlist change received!', payload);
          callback && callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, callback]);
};

export const useRealtimeCollectorAssignments = (prId: string, callback?: () => void) => {
  useEffect(() => {
    const channel = supabase
      .channel(`assignments-${prId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collector_assignments',
          filter: `pr_id=eq.${prId}`,
        },
        (payload) => {
          console.log('Assignment change received!', payload);
          callback && callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [prId, callback]);
};
