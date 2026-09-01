import { getElectionHomeTopBarData } from "@/lib/election";
import { ElectionHomeTopBar } from "@/components/election/ElectionHomeTopBar";

export async function ElectionHomeTopBarServer() {
  const data = await getElectionHomeTopBarData();
  if (!data) return null;

  return (
    <ElectionHomeTopBar
      title={data.title}
      status={data.status}
      boxPct={data.boxPct}
      candidates={data.candidates}
      districtLeaders={data.districtLeaders}
      ntvCityId={data.ntvCityId}
      ntvDistrictId={data.ntvDistrictId}
      href={data.href}
    />
  );
}
