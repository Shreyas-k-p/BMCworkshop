import { ref, push, onChildAdded, query, limitToLast } from 'firebase/database';
import { db } from './config';

export interface LobbyMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderDept: string;
  text: string;
  timestamp: number;
}

export async function sendLobbyMessage(
  sessionId: string,
  senderUid: string,
  senderName: string,
  senderDept: string,
  text: string
): Promise<void> {
  const cleanText = text.trim();
  if (!cleanText) return;

  const messagesRef = ref(db, `lobbyMessages/${sessionId}`);
  await push(messagesRef, {
    senderUid,
    senderName,
    senderDept,
    text: cleanText,
    timestamp: Date.now()
  });
}

export function subscribeToLobbyMessages(
  sessionId: string,
  onMessage: (msg: LobbyMessage) => void
): () => void {
  const messagesRef = query(ref(db, `lobbyMessages/${sessionId}`), limitToLast(25));

  const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      onMessage({
        id: snapshot.key || String(Date.now()),
        senderUid: val.senderUid,
        senderName: val.senderName,
        senderDept: val.senderDept,
        text: val.text,
        timestamp: val.timestamp
      });
    }
  });

  return unsubscribe;
}
