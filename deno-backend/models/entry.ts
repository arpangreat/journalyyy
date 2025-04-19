export interface JournalEntry {
  _id?: { $oid: string };
  userId: { $oid: string };
  title?: string;
  content: string;
  imageUrl?: string;
  moodScore?: number;
  aiAdvice?: string;
  createdAt: Date;
}
