'use client';

import { useEffect, useState } from 'react';
import { uuidv4 } from '@/lib/uuid';

export function SessionKeyField() {
  const [key, setKey] = useState('');

  useEffect(() => {
    let sk = localStorage.getItem('sessionKey');
    if (!sk) {
      sk = uuidv4();
      localStorage.setItem('sessionKey', sk);
    }
    setKey(sk);
  }, []);

  return <input type="hidden" name="sessionKey" value={key} />;
}
