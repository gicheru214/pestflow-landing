type CallbackConsentProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  dark?: boolean;
};

export function CallbackConsent({ checked, onChange, dark = false }: CallbackConsentProps) {
  return (
    <label className={`flex items-start gap-2 text-left text-xs leading-5 ${dark ? "text-slate-300" : "text-slate-600"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 shrink-0 accent-emerald-600"
      />
      <span>
        Yes, have PestFlow call me at the number above about its software. The call may use an AI voice.
        I can opt out during the call. This is optional and is not required to submit this form.
      </span>
    </label>
  );
}
