type InputFieldProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
};

export default function InputField({ label, value, onChange, type = "text" }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}
