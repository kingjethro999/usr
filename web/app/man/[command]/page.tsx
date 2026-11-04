import { notFound } from "next/navigation";
import { MAN_COMMANDS, COMMAND_LIST } from "../../../lib/man-data";
import { ManPage } from "../../../components/ManPage";
import versionInfo from "../../../version.json";

export function generateStaticParams() {
  return COMMAND_LIST.map((command) => ({
    command,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ command: string }>;
}) {
  const { command } = await params;
  const cmdData = MAN_COMMANDS[command];
  if (!cmdData) return { title: `Not Found — ${versionInfo.name}` };
  return {
    title: `${cmdData.cmd}(${cmdData.section}) — ${versionInfo.name}`,
    description: cmdData.summary,
  };
}

export default async function CommandManRoute({
  params,
}: {
  params: Promise<{ command: string }>;
}) {
  const { command } = await params;
  const cmdData = MAN_COMMANDS[command];

  if (!cmdData) {
    notFound();
  }

  return <ManPage command={cmdData} />;
}
