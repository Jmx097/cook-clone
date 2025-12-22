'use client';

import { useState } from 'react';
import { uuidv4 } from '@/lib/uuid';

export function SessionKeyField() {
  const [key] = useState(() => {
    if (typeof window === 'undefined') return '';
    let sk = localStorage.getItem('sessionKey');
    if (!sk) {
      sk = uuidv4();
      localStorage.setItem('sessionKey', sk);
    }
    return sk;
  });

  return <input type="hidden" name="sessionKey" value={key} />;
}
