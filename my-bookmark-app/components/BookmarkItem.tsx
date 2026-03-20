// components/BookmarkItem.tsx
interface BookmarkItemProps {
  item: any;
  onDelete: (id: number) => void;
}

export default function BookmarkItem({ item, onDelete }: BookmarkItemProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition border-l-4 border-blue-500 flex justify-between items-start">
      <div className="flex-1 pr-4">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-lg font-bold text-blue-600 hover:underline block leading-snug"
        >
          {item.title}
        </a>
        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-gray-400 text-xs">
            📅 {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <button
        onClick={() => onDelete(item.id)}
        className="text-red-400 hover:text-red-600 p-1 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}