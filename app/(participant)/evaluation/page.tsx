import Link from 'next/link';
import { EvaluationFormEmbed } from '@/components/app/EvaluationFormEmbed';

export default function EvaluationPage() {
  return (
    <main className="space-y-4 p-4">
      <Link href="/home" className="font-display text-xs text-accent-green">
        ← HOME
      </Link>
      <div>
        <h1 className="font-display text-lg">EVALUATION FORM</h1>
        <p className="mt-1 font-body text-xs text-text-secondary">
          Wajib diisi oleh semua peserta. Isi form di bawah atau buka di tab baru jika tampilan kosong.
        </p>
      </div>
      <EvaluationFormEmbed />
    </main>
  );
}
