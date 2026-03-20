// components/SearchBar.tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="mb-6">
      <input 
        type="text" 
        placeholder="タイトルや内容で検索..." 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-transparent border-b-2 border-gray-300 focus:border-blue-500 outline-none text-lg transition text-black"
      />
    </div>
  );
}