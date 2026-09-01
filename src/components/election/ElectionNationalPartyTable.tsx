import { formatElectionCount } from "@/lib/election";
import { NTV_NATIONAL_PARTY_WINS } from "@/lib/election-national-data";

export function ElectionNationalPartyTable() {
  return (
    <div className="p-4 sm:p-5">
      <h3 className="mb-3 text-[11px] font-bold uppercase leading-snug tracking-wide text-ink-soft">
        Türkiye geneli kazanılan belediye sayısı (il)
      </h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wide text-ink-soft">
            <th className="pb-2 pr-2">Parti</th>
            <th className="pb-2 pr-2 text-right">Alınan oy</th>
            <th className="pb-2 text-right">Kazanılan</th>
          </tr>
        </thead>
        <tbody>
          {NTV_NATIONAL_PARTY_WINS.map((row) => (
            <tr key={row.partyName} className="border-b border-border/60 last:border-0">
              <td className="py-2.5 pr-2">
                <span className="inline-flex items-center gap-2 font-bold text-ink">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: row.partyColor }} />
                  <span className="text-xs uppercase">{row.partyName}</span>
                </span>
              </td>
              <td className="py-2.5 pr-2 text-right text-xs font-semibold tabular-nums text-ink">
                {formatElectionCount(row.votes)}
              </td>
              <td className="py-2.5 text-right text-xs font-extrabold tabular-nums text-brand">{row.provincesWon}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[10px] text-ink-soft">
        Kaynak: 2024 yerel seçim sonuçları (YSK). Düzce detayları aşağıdadır.
      </p>
    </div>
  );
}
