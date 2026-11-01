import { CALLBACK_DISCLOSURE } from "@shared/callback";

type CallbackDisclosureProps = { dark?: boolean };

export function CallbackDisclosure({ dark = false }: CallbackDisclosureProps) {
  return (
    <p className={`text-left text-xs leading-5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
      {CALLBACK_DISCLOSURE}
    </p>
  );
}
